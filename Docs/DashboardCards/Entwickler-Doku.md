# 🛠️ SNO TeamMessage: Technische Entwickler-Dokumentation (V2.0)

Diese Dokumentation richtet sich an Frontend-Entwickler, die eigene Dashboard-Karten (Custom Lovelace Cards) für die **SNO TeamMessage** Home Assistant Integration entwickeln oder bestehende Karten modifizieren möchten[cite: 1]. Sie beschreibt die Architektur, Schnittstellen, das State-Management und Best Practices[cite: 1].

---

## 1. Architektur & Sicherheitskonzept

Um höchste Sicherheitsstandards einzuhalten und CORS-Probleme (Cross-Origin Resource Sharing) im Browser zu vermeiden, dürfen Dashboard-Karten **niemals direkt** mit der externen API (`teammessage.de`) kommunizieren[cite: 1]. 

Die Architektur basiert auf einer strikten Trennung:
*   **Schreiben / Aktionen:** Erfolgen ausschließlich über das Home Assistant Dienst-System (Service-Interface)[cite: 1].
*   **Lesen / Datenabruf:** Erfolgen über den in der Integration implementierten Reverse-Proxy (`/proxy`), der serverseitig die Authentifizierung sicher abwickelt[cite: 1].

---

## 2. Das Hybride State-Management (V2.0 Core Feature)

Die V2.0 der Karten führt ein hybrides Einstellungs-System ein. Als Entwickler musst du sicherstellen, dass deine Karte Konfigurationen aus zwei Quellen korrekt zusammenführt (`State Merging`).

1.  **Globale Konfiguration (`this.config`):** Das von Home Assistant übergebene Objekt aus der YAML (definiert vom Admin).
2.  **Lokaler Override (`localStorage`):** Benutzerspezifische Einstellungen (z. B. Dark-Mode), die im Browser gespeichert werden.

### Implementierungs-Beispiel für `setConfig`
Nutze einen eindeutigen Key für den `localStorage`, um Konflikte zwischen verschiedenen Karten zu vermeiden:

```javascript
function getCardKey(config) {
    const safeTitle = (config.title || 'default').replace(/[^a-zA-Z0-9]/g, '_');
    return `sno_tm_v2_${config.type}_${safeTitle}`;
}

setConfig(config) {
    this.config = config;
    this.cardKey = getCardKey(this.config);
    
    // 1. Lade lokale Nutzerdaten
    let local = {};
    try { local = JSON.parse(localStorage.getItem(this.cardKey)) || {}; } catch(e){}

    // 2. State Merging: Local > Config > Fallback
    this.state = {
        theme: local.theme ?? this.config.theme ?? 'classic',
        interval: local.interval ?? this.config.interval ?? 30000,
    };
}
```

---

## 3. Kommunikation: Senden von Nachrichten (Service-Schnittstelle)

Um Nachrichten zu versenden, nutzt deine Custom Card die Dienst-Schnittstelle `sno_teammessage.send_message`[cite: 1].

### Parameter (Payload)
*   `message` *(string, Pflicht)*: Der Nachrichtentext (max. 1600 Zeichen)[cite: 1].
*   `to_mobile` *(string, optional)*: Empfänger-Telefonnummer(n), kommagetrennt[cite: 1].
*   `teamlist_email` *(string, optional)*: Teamlisten-Adresse (z.B. 'meinteam@tmsg.de')[cite: 1].
*   `tl` *(integer, optional)*: Teamlisten-ID (Alternative zu teamlist_email)[cite: 1].
*   `keyword` *(string, optional)*: Authentifizierungs-Keyword[cite: 1].
*   `sender_email` *(string, optional)*: Absender-E-Mail zur Authentifizierung (Pflicht bei geschlossenen Gruppen)[cite: 1].

### Beispiel-Aufruf im JavaScript
```javascript
async sendAlert() {
    const payload = {
        message: "Achtung: Wassersensor hat ausgelöst!",
        teamlist_email: "notfall@tmsg.de"
    };

    try {
        await this._hass.callService('sno_teammessage', 'send_message', payload);
        console.log("Nachricht erfolgreich gesendet");
    } catch (error) {
        console.error("Fehler beim Senden:", error.message);
    }
}
```

---

## 4. Kommunikation: Daten abrufen (API-Proxy)

Für Leseoperationen (Logs, Guthaben) nutzt du die Proxy-Schnittstelle über `hass.callApi`[cite: 1].

### Die `fetchTMApi` Hilfsfunktion
Diese Funktion kapselt den Proxy-Call und fängt Fehler sauber ab:

```javascript
async function fetchTMApi(hass, endpoint) {
    try {
        const data = await hass.callApi('GET', `sno_teammessage/proxy?endpoint=${encodeURIComponent(endpoint)}`);
        return { data };
    } catch (e) {
        return { error: `Proxy HTTP ${e.status_code || 'Unbekannt'} (${e.message})` };
    }
}
```

### Relevante Endpunkte & Datenpunkte
Die Integration unterstützt standardmäßig folgende Endpunkte, die zwingend die Team-ID (`tm`) als Parameter benötigen:

*   **/teamlist/credit/**[cite: 1]
    *   *Rückgabe:* `{ "sms_credit": 1500, "sms_sum": 250 }`
    *   *Nutzung:* Zeigt das Restguthaben in Einheiten (`sms_credit`) und die Gesamtzahl der bisher versendeten SMS (`sms_sum`) an[cite: 1].
*   **/logging/sms/**[cite: 1]
    *   *Parameter:* Unterstützt Paginierung (`start`, `quantity`)[cite: 1].
    *   *Rückgabe:* Array von Log-Objekten mit Zustellstatuscode (`status`)[cite: 1].
    *   *Statuscodes:* `0` = Zugestellt, `1` = Zwischengespeichert, `2` = Fehler[cite: 1].
*   **/teamlist/members/**[cite: 1]
    *   *Parameter:* Erfordert `tm` (Team-ID) und `tl` (Listen-ID)[cite: 1].
    *   *Rückgabe:* Enthält Mitgliederdaten wie den Anzeigenamen (`mb_name`)[cite: 1].
*   **/teamlist/lists/**[cite: 1]
    *   *Parameter:* Erfordert `tm` (Team-ID)[cite: 1].

---

## 5. Blueprint für eine neue Custom Card

Wenn du eine völlig neue Karte entwickelst, nutze folgendes Vanilla-JS Boilerplate (ohne Lit-Abhängigkeiten, für maximale HA-Kompatibilität):

```javascript
class SNOTeamMessageCustomCard extends HTMLElement {
    
    // 1. Verknüpfe den visuellen HA-Editor
    static getConfigElement() { 
        return document.createElement("sno-teammessage-data-editor"); 
    }
    
    // 2. Setze Initialwerte bei Neuerstellung
    static getStubConfig() { 
        return { type: "custom:sno-teammessage-custom-card", title: "Meine Karte", tm: "" }; 
    }

    // 3. Konfiguration & State Merging
    setConfig(config) {
        if (!config.tm) throw new Error("Team-ID (tm) ist erforderlich!");
        this.config = config;
        // Implementiere hier die getCardKey() und localStorage Logik (siehe Kap. 2)
    }

    // 4. HA-Objekt Injektion & Rendering
    set hass(hass) {
        this._hass = hass;
        if (!this.querySelector('ha-card')) {
            this.innerHTML = `
                <style>
                    ha-card { padding: 16px; border-radius: var(--ha-card-border-radius, 12px); }
                    .title { color: var(--primary-text-color); font-weight: bold; }
                    button { background: var(--primary-color); color: white; border: none; padding: 8px; border-radius: 4px; }
                </style>
                <ha-card>
                    <div class="title">${this.config.title}</div>
                    <div id="content">Lade Daten...</div>
                    <button id="action-btn">Aktion ausführen</button>
                </ha-card>
            `;
            this.setupInteractions();
        }
        // Zyklische Updates oder Theme-Änderungen anwenden
    }

    setupInteractions() {
        this.querySelector('#action-btn').addEventListener('click', () => {
            // Führe hier hass.callService aus
        });
    }

    // 5. Lovelace Kartengröße (1 Unit = 50px)
    getCardSize() { return 3; }
}
customElements.define('sno-teammessage-custom-card', SNOTeamMessageCustomCard);
```

---

## 6. Guidelines & Best Practices

1.  **Design-Konstanten nutzen:** Verwende zwingend Home Assistant Variablen wie `var(--primary-color)` oder `var(--card-background-color)`, damit deine Karte sich nahtlos in das Theme des Nutzers einfügt[cite: 1]. Hardcodiere niemals statische Hex-Werte für Kern-UI-Elemente.
2.  **Caching:** Nutze `hass.callApi` nur bei expliziter Nutzerinteraktion oder in angemessen kurzen Intervallen (z.B. alle 60 Sek für Log-Updates)[cite: 1].
3.  **Error Handling:** Jede API-Antwort sollte auf den HTTP-Statuscode geprüft werden[cite: 1]. Die `openapi_17.json` definiert klare Fehler-Schemata, die du im UI ansprechend anzeigen solltest[cite: 1].
4.  **Lebenszyklus:** Vergiss nicht, Timer in der `disconnectedCallback()` Methode zu beenden (z. B. `clearInterval(this.timer)`), um Memory Leaks beim Verlassen des Dashboards zu vermeiden.