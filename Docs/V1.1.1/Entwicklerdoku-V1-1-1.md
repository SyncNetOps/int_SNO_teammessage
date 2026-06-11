# Entwicklerdoku-V1-1-1.md

# SNO - TeamMessage: Entwickler- & Architektur-Dokumentation (v1.1.1)

Diese Dokumentation richtet sich an Backend- und Frontend-Entwickler, die die Home Assistant Integration `sno_teammessage` warten, forken oder eigene Dashboard-Karten (Custom Lovelace Cards) dafür entwickeln möchten. 

Die Integration implementiert eine **Hub-Architektur** mit Cloud-Polling (`iot_class: cloud_polling`), Webhooks für Inbound-Nachrichten und einer sicheren Proxy-Schicht für das Glassmorphism-Frontend.

---

## 1. Systemarchitektur & Datenfluss

Die Integration kommuniziert primär mit der TeamMessage.de REST-API (v1.1.0). Um CORS-Probleme im Frontend zu umgehen und API-Keys nicht im Browser offenzulegen, läuft die gesamte Kommunikation über das Python-Backend von Home Assistant.

### Kern-Komponenten:
1. **`api.py` (API Client):** Asynchroner HTTP-Wrapper (`aiohttp`). Verwaltet die Bearer-Token Authentifizierung und fängt API-Rate-Limits ab. Beinhaltet den *Auto-Heal-Mechanismus* für unvollständige PUT-Anfragen.
2. **`services.py` (Service Layer):** Beinhaltet die Geschäftslogik für den `send_message`-Dienst. Hier arbeitet der *Smart Group Resolver*, der asynchrone API-Abfragen verknüpft, um Listen-IDs in Rufnummern aufzulösen.
3. **`views.py` (Security Proxy):** Ein Home Assistant `HomeAssistantView`. Fängt HTTP-Requests aus dem Custom Panel ab, injiziert serverseitig die Team-ID und den Token und leitet den Request an die `api.py` weiter.
4. **`coordinator.py` (Data Update Coordinator):** Pollt zyklisch (alle 5 Minuten) die API nach aktuellem Guthaben, Tarif-Infos und den letzten Log-Einträgen. Versorgt die Sensor-Plattform.
5. **`webhook.py` (Inbound Listener):** Nimmt asynchrone POST-Requests von TeamMessage entgegen und feuert Home Assistant Events (`sno_teammessage_incoming`).

---

## 2. API-Handling & Payload-Manipulation (api.py)

Die TeamMessage API verwendet Pydantic für strikte Request-Validierungen. Die `api.py` manipuliert Payloads dynamisch, um 422 (Unprocessable Entity) Fehler abzufangen.

### 2.1 Der "Auto-Heal" Mechanismus bei PUT-Requests
Beim Aktualisieren von Kontakten (`PUT /teamlist/member/`) verlangt die API zwingend ein vollständig strukturiertes `data`-Objekt, das das Feld `mb` (die ID oder Nummer) enthält, selbst wenn sich dieses nicht ändert. 

Fehlt dieses Feld, pausiert der HTTP-Client den PUT-Vorgang und führt einen transparenten GET-Request durch:

```python
if method.upper() == "PUT" and "/contacts/" in url:
    if "data" not in payload:
        payload["data"] = {}
    try:
        # Extrahiere die ID aus der URL
        contact_id = payload["data"].get("id", url.split("/")[-1])
        # GET Request im Hintergrund
        existing = await self._request("GET", f"/contacts/{contact_id}")
        if existing and "data" in existing:
            # Fülle fehlende Felder auf
            for key in ["mb", "name", "channel"]:
                if key not in payload["data"] or payload["data"][key] in [None, ""]:
                    if key in existing["data"] and existing["data"][key]:
                        payload["data"][key] = existing["data"][key]
    except Exception as e:
        _LOGGER.warning(f"Auto-heal failed for contact {url}: {e}")
```

### 2.2 Dynamisches URL-Routing (`get_teamlist_members`)
Um hardcodierte URLs zu vermeiden, leitet die API-Klasse Endpunkte aus der `const.py` ab. Beim Auflösen von Gruppen wird der SMS-Endpunkt dynamisch zum Members-Endpunkt umgeschrieben:

```python
async def get_teamlist_members(self, list_target: Any) -> Dict[str, Any]:
    # Transformation: /sms/send/ -> /teamlist/members/
    url = ENDPOINT_SMS_SEND.replace("sms/send/", "teamlist/members/")
    # ... Parameter Handling
```

---

## 3. Der Smart Group Resolver (`services.py`)

Die externe REST-API unterstützt nativ keinen "Blind-Broadcast" an Listen auf dem SMS-Endpunkt. Sie verlangt **immer** kommagetrennte Nummern in `to_mobile`.

Um für den Anwender die Logik aus der Legacy-Version beizubehalten, übernimmt `services.py` das Mapping. 

**Der Ablauf (`target_type == "list"`):**
1. Der Nutzer übergibt in HA eine `teamlist_email` (z.B. ID `108975`).
2. Der Service ruft `await client.get_teamlist_members(list_target)` auf.
3. Das Array wird iteriert. Es werden **nur** Kontakte akzeptiert, deren `mb_contacttype` auf `sms` oder `voice` steht. E-Mail-Kontakte werden ignoriert.
4. Jede Nummer durchläuft `format_phone_number()`, um fehlende Plus-Zeichen (`+49`) zu ergänzen und Nullen zu entfernen.
5. Die Liste wird via `",".join(mobile_numbers)` verkettet und als `to_mobile` an die API gesendet.

*(Siehe hierzu die Implementierung von `async_send_message` in der `services.py` ab Zeile 130).*

---

## 4. Frontend Proxy & Security (`views.py`)

Das JavaScript (`teammessage-panel.js`) besitzt **keinen** Zugriff auf den Bearer Token des Nutzers. Es kommuniziert ausschließlich mit dem HA-Proxy.

**Beispiel-Aufruf im JS:**
```javascript
// URL im Frontend:
const data = await this.apiCall('GET', '/teamlist/members/', null, { tl: 108975 });
```

**Was im HA Backend (`views.py`) passiert:**
1. HA prüft die Session des Nutzers (`requires_auth = True`).
2. Der Proxy extrahiert den Parameter `endpoint` (hier `/teamlist/members/`).
3. Er holt den API-Client aus dem HA-Speicher (`self.hass.data[DOMAIN]`).
4. Er leitet die Parameter weiter. Die `api.py` hängt vor dem Senden automatisch `Authorization: Bearer <token>` und `team_id: <id>` als Header und Query-Params an.
5. Das JSON-Response wird 1:1 an das Frontend zurückgegeben.

---

## 5. Eigene Custom Cards (Lovelace) entwickeln

Entwickler können die Integration problemlos in eigene Dashboard-Karten integrieren. Die Interaktion erfolgt ausschließlich über den Home Assistant WebSocket Bus (Service Call).

### 5.1 Service-Schema (`sno_teammessage.send_message`)

| Parameter | Typ | Erforderlich | Beschreibung |
| :--- | :--- | :--- | :--- |
| `target_type` | `string` | **Ja** | `direct` oder `list`. Bestimmt die interne Routing-Logik. |
| `message` | `string` | **Ja** | Der Payload-Text (max. 1600 Chars). |
| `to_mobile` | `string` | Bei `direct` | Zielnummer (z.B. `+4917012345`). |
| `teamlist_email`| `string` | Bei `list` | ID oder E-Mail der Teamliste. |
| `channel` | `string` | Nein | `sms` oder `voice`. Default ist `sms`. |
| `keyword` | `string` | Bedingt | Passwort für die Teamliste (falls geschlossen). |
| `sender_email` | `string` | Bedingt | Autorisations-E-Mail (falls geschlossen). |

### 5.2 JavaScript / TypeScript Implementierung
Um den Dienst aus einer `LitElement` oder Vanilla-JS Karte aufzurufen, nutze die `hass.callService` Methode.

**Beispiel: Eine SOS-Button Custom Card**

```javascript
import { LitElement, html, css } from "lit";

class SNOTeamMessageSosCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object }
    };
  }

  setConfig(config) {
    if (!config.teamlist) {
      throw new Error("Du musst eine 'teamlist' in der YAML definieren.");
    }
    this.config = config;
  }

  async _sendSOS() {
    if (!this.hass) return;
    
    const payload = {
      target_type: "list",
      teamlist_email: this.config.teamlist,
      message: "🆘 Manueller SOS-Alarm über das Dashboard ausgelöst!",
      keyword: this.config.keyword || "",
      sender_email: this.config.sender_email || ""
    };

    try {
      await this.hass.callService("sno_teammessage", "send_message", payload);
      console.log("SOS erfolgreich gesendet.");
    } catch (err) {
      console.error("SOS Senden fehlgeschlagen:", err);
    }
  }

  render() {
    return html`
      <ha-card header="Notfall Alarm">
        <div class="card-content">
          <button @click="${this._sendSOS}" style="background: red; color: white; padding: 15px; width: 100%;">
            ALARM AUSLÖSEN
          </button>
        </div>
      </ha-card>
    `;
  }
}
customElements.define("sno-sos-card", SNOTeamMessageSosCard);
```

---

## 6. Event-Bus & Webhooks (Inbound)

Die Integration unterstützt den Empfang von Zustellberichten oder Inbound-Nachrichten (sofern von TeamMessage an HA gepusht) über einen eindeutigen Webhook.

* **Webhook-ID Format:** `sno_teammessage_<team_id>` (z.B. `sno_teammessage_12345`).
* **URL (Beispiel):** `https://<deine-ha-url>/api/webhook/sno_teammessage_12345`

### Event Handling
Schlägt ein Request auf dem Webhook auf (`webhook.py`), feuert Home Assistant das Event `sno_teammessage_incoming` auf dem internen Event-Bus.

**Beispiel für eine Event-basierte Automatisierung (YAML):**
Dieses Setup fängt asynchrone Payload-Pushes von der TeamMessage API ab und benachrichtigt dich per lokaler HA-Pushnachricht.

```yaml
trigger:
  - platform: event
    event_type: sno_teammessage_incoming
action:
  - action: notify.mobile_app_iphone
    data:
      title: "TeamMessage Update"
      message: "Webhook empfangen! Daten: {{ trigger.event.data.payload }}"
```

---

## 7. Error Handling (API Map)

Die externe REST API liefert im JSON-Response negative Integer-Codes bei Fehlern. Die Integration (`const.py`) mappt diese auf standardisierte String-Schlüssel, um lokalisierte Fehlermeldungen in der `strings.json` aufzulösen.

* `-1` -> `invalid_team_id`
* `-2` -> `invalid_teamlist_email`
* `-5` -> `invalid_message`
* `-6` -> `invalid_to_mobile` (Wird vom Smart Group Resolver abgefangen)
* `-10` -> `account_not_found`
* `-13` -> `rate_limit_exceeded` (Drosselt intern das Polling in der `coordinator.py`)
* `-14` -> `closed_group_auth`

Diese Strings werden beim Config Flow oder Service Call als Exceptions `TeamMessageAPIError(error_key)` geworfen und vom Home Assistant Core sauber an die UI (`toast` oder Exception-Modal) weitergereicht.