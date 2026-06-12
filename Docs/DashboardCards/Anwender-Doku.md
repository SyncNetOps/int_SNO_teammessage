# 📘 SNO TeamMessage: Anwender- & Installationsanleitung (V2.0)

Willkommen zur SNO TeamMessage Integration für das Home Assistant Dashboard. Diese Custom Cards ermöglichen dir den komfortablen Versand von SMS/Voice-Nachrichten, die Überwachung deines Guthabens und das Einsehen von Sendeprotokollen – verpackt in einem modernen, hochgradig anpassbaren Design.

---

## 🛠️ 1. Installation

Damit die Karten in deinem Home Assistant (HA) zur Verfügung stehen, musst du die JavaScript-Datei im System hinterlegen und als Ressource registrieren.

**Schritt 1: Datei ablegen**
1. Öffne das Dateisystem deines Home Assistant (z. B. über das Add-on "File editor" oder "Studio Code Server").
2. Navigiere in den Ordner `/config/www/`. *(Falls der Ordner `www` nicht existiert, erstelle ihn).*
3. Erstelle eine neue Datei namens `sno-teammessage-cards.js`.
4. Füge den kompletten, fehlerfreien JavaScript-Code aus Version 2.0 in diese Datei ein und speichere ab.

**Schritt 2: Ressource im Dashboard hinzufügen**
1. Gehe in Home Assistant auf **Einstellungen** ➡️ **Dashboards**.
2. Klicke oben rechts auf die drei Punkte (`...`) und wähle **Ressourcen**.
3. Klicke unten rechts auf **Ressource hinzufügen**.
4. Trage bei URL ein: `/local/sno-teammessage-cards.js`
5. Wähle als Ressourcentyp: **JavaScript-Modul**
6. Klicke auf **Erstellen**.

**Schritt 3: Cache leeren**
Lade dein Dashboard neu und leere den Browser-Cache (z. B. `STRG` + `F5` am PC), damit die neue Datei sauber geladen wird.

---

## 🧩 2. Integration ins Dashboard

Nach der erfolgreichen Installation kannst du die Karten ganz normal über die grafische Oberfläche (UI) von Home Assistant hinzufügen:

1. Navigiere zu deinem gewünschten Dashboard.
2. Klicke oben rechts auf den **Stift (Dashboard bearbeiten)**.
3. Klicke auf **Karte hinzufügen**.
4. Scrolle nach unten zu den benutzerdefinierten Karten oder suche in der Leiste nach `TeamMessage`.
5. Wähle die gewünschte Karte aus. Es öffnet sich der grafische Editor.

---

## ⚙️ 3. Das Hybride Einstellungs-System (Neu in V2.0)

Die Karten verfügen über ein intelligentes Zwei-Ebenen-System für Einstellungen:

*   **Globale Einstellungen (Admin-Vorgabe):**
    Wenn du die Karte über den normalen HA-Editor hinzufügst, definierst du den Standard für *alle* Nutzer im Haus. (z. B. Team-ID, Standard-Theming, Aktualisierungsintervall).
*   **Persönliche Einstellungen (Zahnrad-Symbol):**
    Jede Karte besitzt oben rechts ein Zahnrad. Klickt ein Nutzer darauf, kann er das Design (z. B. Glass-Mode oder Dark-Mode) **nur für sein aktuelles Endgerät** ändern. Diese persönlichen Vorlieben werden im Browser (`localStorage`) gespeichert und überschreiben die globale Vorgabe. Mit dem Button *"Auf globalen Standard zurücksetzen"* kann jederzeit zur Admin-Vorgabe zurückgekehrt werden.

---

## 📱 4. Die Karten im Detail

### 📨 1. TeamMessage Senden (Send Card)
Das Herzstück der Integration. Hierüber versendest du Nachrichten.
*   **Funktionen:** 
    *   Dropdown-Menü für gespeicherte Teamlisten (werden im Editor als kommagetrennte E-Mails hinterlegt).
    *   Direkteingabe von Mobilnummern mit automatischer Rufnummern-Formatierung (z. B. `0171...` wird zu `+49171...`).
    *   Echtzeit-Feedback bei fehlerhaften Eingaben oder erfolgreichem Versand.

### 💳 2. TeamMessage Guthaben (Credit Card)
Behalte deine Kosten im Blick.
*   **Funktionen:**
    *   Visualisiert dein aktuell verfügbares SMS-Guthaben in einem modernen Ring-Design.
    *   Zeigt die Gesamtzahl aller bisher gesendeten Nachrichten.
    *   Automatische Aktualisierung im Hintergrund (Intervall frei wählbar, z. B. alle 30 Sekunden).

### 📊 3. TeamMessage Statistik (Stats Card)
Die Minimalismus-Lösung für Dashboards mit wenig Platz.
*   **Funktionen:**
    *   Reduzierte Anzeige, die sich ausschließlich auf den reinen SMS-Verbrauch konzentriert.
    *   Perfekt geeignet für schmale Spalten oder Übersicht-Dashboards.

### 📜 4. TeamMessage Logs (Log Card)
Ein interaktives Protokoll deiner letzten Kommunikationen.
*   **Funktionen:**
    *   Listet die letzten N-Nachrichten auf (Menge im Editor definierbar, z. B. die letzten 5).
    *   Zeigt sofort den Status per Icon (Zugestellt, Wird gesendet, Fehler).
    *   **Interaktiv:** Ein Klick auf einen Eintrag klappt ein Detail-Fenster auf. Dort siehst du das genutzte Handynetz (z. B. Telekom, Vodafone), exakte Zeitstempel und den Nachrichtentext.

---

## 🎨 5. Design-Möglichkeiten (Theming)
Alle Karten unterstützen 5 integrierte Design-Modi, um sich perfekt in dein Home Assistant Setup einzufügen:
*   `Classic`: Nutzt strikt die Standard-Farben deines HA-Themes.
*   `Minimal`: Entfernt Schatten und Hintergründe für einen flachen, sauberen Look.
*   `Glass`: Ein moderner "Glassmorphism"-Effekt (leicht transparent, verschwommener Hintergrund).
*   `Dark`: Ein tiefschwarzer Modus mit hohem Kontrast.
*   `Neon`: Ein auffälliger Cyberpunk-Stil mit leuchtenden Rändern (perfekt für Wand-Tablets).