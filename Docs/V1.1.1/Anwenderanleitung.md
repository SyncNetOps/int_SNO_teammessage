# Anwenderanleitung.md

# SNO - TeamMessage | Umfassendes Anwender-Handbuch (v1.1.1)

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration) 
[![HA Integration](https://img.shields.io/badge/Home%20Assistant-Integration-blue.svg?style=for-the-badge&logo=home-assistant)](https://www.home-assistant.io/)

Willkommen zur detaillierten Anleitung für die SNO TeamMessage Integration. Diese Dokumentation führt dich Schritt für Schritt von der Vorbereitung beim Anbieter über die Installation und Einrichtung bis hin zur Erstellung komplexer Automatisierungen und eigener Dashboard-Karten.

---

## Inhaltsverzeichnis
1. [Vorbereitungen (TeamMessage.de)](#1-vorbereitungen-teammessagede)
2. [Installation (HACS & Manuell)](#2-installation-hacs--manuell)
3. [Einrichtung in Home Assistant](#3-einrichtung-in-home-assistant)
4. [Das TeamMessage Panel im Detail](#4-das-teammessage-panel-im-detail)
5. [Dashboard-Karten & Sensoren hinzufügen](#5-dashboard-karten--sensoren-hinzufügen)
6. [Nutzung in Automatisierungen (Der Dienst)](#6-nutzung-in-automatisierungen-der-dienst)
7. [Praktische Beispiele für Automatisierungen](#7-praktische-beispiele-für-automatisierungen)
8. [Fehlerbehebung & FAQ](#8-fehlerbehebung--faq)

---

## 1. Vorbereitungen (TeamMessage.de)

Bevor du die Integration in Home Assistant nutzen kannst, benötigst du einen Account beim Anbieter und die entsprechenden Zugangsdaten für die API.

1. **Registrierung:** Gehe auf [teammessage.eu/registrieren](https://teammessage.eu/registrieren) und erstelle dir einen kostenlosen Account (du erhältst zum Start kostenlose Test-SMS).
2. **Team-ID ermitteln:** Sobald du eingeloggt bist, findest du deine **Team-ID** (oft auch Kundennummer genannt) in deinem Profil oder Dashboard. Notiere dir diese Nummer.
3. **API-Token generieren:**
   * Navigiere im TeamMessage-Portal zu den **Einstellungen** -> **Schnittstellen / API**.
   * Erstelle dort einen neuen **API-Token (Bearer Token)**.
   * Kopiere diesen Token. **Achtung:** Er wird dir aus Sicherheitsgründen nur einmal vollständig angezeigt!

---

## 2. Installation (HACS & Manuell)

Du kannst die Integration auf zwei Wegen in Home Assistant installieren: bequem über den Community Store (HACS) oder manuell.

### Option A: Installation über HACS (Empfohlen)
Da es sich um ein Custom Repository handelt, musst du es HACS zunächst bekannt machen:
1. Öffne **HACS** in der Seitenleiste deines Home Assistant.
2. Klicke auf **Integrationen**.
3. Klicke oben rechts auf das Menü (die drei Punkte) und wähle **Benutzerdefinierte Repositorys**.
4. Trage im Feld *Repository* die URL ein: `https://github.com/SyncNetOps/int_SNO_teammessage`
5. Wähle im Dropdown-Menü *Kategorie* den Eintrag **Integration** aus und klicke auf *Hinzufügen*.
6. Suche nun in HACS nach `SNO - TeamMessage`, öffne die Integration und klicke unten rechts auf **Herunterladen**.
7. **Wichtig:** Starte Home Assistant nach dem Herunterladen zwingend neu!

### Option B: Manuelle Installation
1. Gehe auf die [GitHub-Seite des Repositories](https://github.com/SyncNetOps/int_SNO_teammessage).
2. Lade dir den Code über den grünen Button *Code* -> *Download ZIP* herunter.
3. Entpacke die ZIP-Datei lokal auf deinem Rechner.
4. Navigiere auf deinem Home Assistant System (z.B. per Samba Share, SSH oder File Editor Add-on) in den Ordner `config/custom_components/`. *(Falls der Ordner `custom_components` nicht existiert, erstelle ihn).*
5. Kopiere den gesamten Ordner `sno_teammessage` aus der entpackten ZIP-Datei in das Verzeichnis `custom_components`.
6. **Wichtig:** Starte Home Assistant zwingend neu!

---

## 3. Einrichtung in Home Assistant

Nach dem Neustart kannst du die Integration über die Benutzeroberfläche hinzufügen. Klicke auf folgenden Button, um direkt zur Einrichtungsseite in deinem HA zu springen:

[![Integration hinzufügen](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=sno_teammessage)

*Alternativer Weg:* Gehe in der Seitenleiste auf `Einstellungen` -> `Geräte & Dienste` -> `Integration hinzufügen` -> Suche nach `TeamMessage`.

### 3.1 Konfigurationsdialog
Im ersten Fenster wirst du nach deinen Zugangsdaten gefragt:
* **Team-ID:** Trage hier die zuvor notierte Nummer ein (z.B. `12345`).
* **API Bearer Token:** Füge hier den langen Token ein, den du im Portal generiert hast.

Klicke auf *Senden*. Die Integration prüft nun live im Hintergrund, ob die Zugangsdaten korrekt sind. Ist alles grün, bist du verbunden!

### 3.2 Smarte Fallbacks (Optionen)
Nach der Installation kannst du über den Button **Konfigurieren** (in der Integrations-Übersicht unter Einstellungen -> Geräte & Dienste) die sogenannten *Smarten Fallbacks* festlegen. 

| Einstellungsfeld | Beschreibung | Praxis-Beispiel |
| :--- | :--- | :--- |
| **Standard Teamliste** | ID oder E-Mail deiner primären Liste. Wird genutzt, wenn im Dienst das Feld `teamlist_email` leer bleibt. | *Du baust ein Alarmsystem für die Familie. Trage hier die Listen-ID "Familie" ein. In deinen YAML-Codes musst du die Liste ab sofort nie wieder abtippen.* |
| **Standard Absender-E-Mail** | Deine Autorisations-E-Mail. Zwingend nötig für "Geschlossene Gruppen". | *Trage hier z.B. `vater@haus.de` ein. So autorisiert sich Home Assistant bei geschlossenen Listen immer automatisch.* |
| **Standard Keyword** | Das Passwort für geschlossene Listen. | *Trage hier `AlarmPW123` ein. Du musst dieses Passwort nun nicht mehr in jede einzelne Automatisierung schreiben.* |

---

## 4. Das TeamMessage Panel im Detail

Die Integration fügt deinem Home Assistant in der linken Seitenleiste ein neues Menü namens **TeamMessage** hinzu. Dieses hochmoderne "Glassmorphism"-Panel ist in mehrere Tabs unterteilt:

### 4.1 Dashboard
Hier siehst du auf einen Blick den Status deines Accounts.
* **Funktionen:** Anzeige von Guthaben (Prepaid), historisch gesendeten Nachrichten und deinem Tarifmodell.
* **Praxis-Beispiel:** Bevor du in den Urlaub fährst, wirfst du einen Blick auf das Dashboard. Steht das Guthaben auf "3", weißt du, dass du dein Prepaid-Konto beim Anbieter aufladen musst, damit Alarme zugestellt werden können.

### 4.2 Senden
Dieser Tab ist ideal, um Nachrichten manuell zu testen, ohne erst eine Automatisierung schreiben zu müssen.
* **Funktionen:** Formular für Direkt- oder Gruppenversand inklusive Kanal-Auswahl (SMS/Voice).
* **Praxis-Beispiel:** Du bist auf der Arbeit und merkst, dass du deinen Haustürschlüssel vergessen hast. Du öffnest die HA-App, gehst ins Panel und schickst manuell einen "Voice Call" an die Teamliste "Nachbarn", damit jemand nach dem Rechten sieht.

### 4.3 Logbuch
Das Herzstück der Fehleranalyse. Hier siehst du live, was mit deinen Nachrichten passiert ist.
* **Funktionen:** Live-Anzeige von Zustellstatus (Haken, Sanduhr, Fehler), Filterfunktion und Auto-Refresh.
* **Praxis-Beispiel:** Deine Automatisierung hat nachts ausgelöst, aber dein Partner hat keine SMS bekommen. Im Logbuch filterst du nach seiner Handynummer. Klickst du auf den Eintrag, siehst du den Fehlercode `-6` (ungültige Handynummer) und erkennst, dass du in den Kontakten einen Zahlendreher hast.

### 4.4 Kontakte
Hier verwaltest du die Mitglieder deiner Teamlisten direkt aus Home Assistant heraus!
* **Funktionen:** Kontakte laden, erstellen, bearbeiten und löschen.
* **Praxis-Beispiel:** Dein Nachbar hat eine neue Handynummer. Anstatt dich am PC ins TeamMessage-Portal einzuloggen, öffnest du am Smartphone die HA-App, gehst auf "Kontakte", wählst die Liste "Nachbarn" aus, klickst beim Nachbarn auf "Edit" und aktualisierst die Nummer.

### 4.5 Einstellungen
Hier kannst du die *Smarten Fallbacks* (siehe Punkt 3.2) bequem über die grafische Oberfläche ändern und speichern, ohne in die Integrationen-Einstellungen von Home Assistant wechseln zu müssen.

---

## 5. Dashboard-Karten & Sensoren hinzufügen

Die Integration stellt dir out-of-the-box Sensoren zur Verfügung, die du auf jedem Dashboard visualisieren kannst (`credit`, `used`, `tariff`). Zusätzlich bringt die Integration maßgeschneiderte **Dashboard-Karten (Custom Cards)** mit.

### 5.1 Custom Cards (Ressourcen) registrieren

**Schritt 1: So machst du die Karten sichtbar**
1. Gehe in Home Assistant in der Seitenleiste zu **Einstellungen** -> **Dashboards**.
2. Klicke oben rechts auf die drei Punkte (`...`) und wähle **Ressourcen**. *(Hinweis: Aktiviere vorher den "Erweiterten Modus" in deinem Benutzerprofil).*
3. Klicke unten rechts auf **Ressource hinzufügen**.
4. Trage exakt folgende URL ein: `/local/sno-teammessage/teammessage-cards.js?v=1`
5. Wähle als Ressourcentyp **JavaScript Modul** und klicke auf **Erstellen**.

> **💡 Profitipp (Cache leeren):** Wenn es ein Update der Karten gibt, ändere in der URL einfach die Endung auf `?v=2` oder `?v=3`. Das zwingt den Browser auf allen Handys und Tablets, die neue Version sofort zu laden!

### 5.2 Karten auf dem Dashboard platzieren (Lovelace)
1. Gehe auf dein gewünschtes Dashboard und klicke oben rechts auf das Stift-Symbol (Dashboard bearbeiten).
2. Klicke auf **Karte hinzufügen** und scrolle ganz nach unten. Dort findest du vier neue, grafische Karten:
   * **TeamMessage Guthaben:** Optischer Ring mit Statistik.
   * **TeamMessage Senden:** Schnellversand-Formular für dein Haupt-Dashboard.
   * **TeamMessage Logs:** Interaktives Logbuch für Admin-Dashboards.
   * **TeamMessage Statistik:** Minimalistische Anzeige.
3. Wähle eine Karte aus. Trage im visuellen Editor zwingend deine Team-ID (`tm`) ein.

---

## 6. Nutzung in Automatisierungen (Der Dienst)

Der Hauptzweck dieser Integration ist es, dich automatisch über Ereignisse in deinem Smart Home zu informieren. Dies geschieht über den Dienst `sno_teammessage.send_message`.



### Vollständige Tabelle aller Eingabefelder (Parameter)

Die folgende Tabelle beschreibt alle verfügbaren Konfigurationsmöglichkeiten des Dienstes.

| Parameter (`Feldname`) | Typ | Erforderlich | Beschreibung & Erklärung | Praxis-Beispiel |
| :--- | :--- | :--- | :--- | :--- |
| **Versandart** (`target_type`) | Auswahl | **Ja** | Bestimmt die Routing-Logik der API. `direct` für eine einzelne Handynummer, `list` für eine Gruppe. | *Wähle `list`, wenn du den Rauchalarm an die gesamte Familie senden willst.* |
| **Nachricht** (`message`) | Text | **Ja** | Der Inhalt deiner Nachricht (max. 1600 Zeichen). Unterstützt HA-Templates. | *`ALARM! Wohnzimmerfenster wurde geöffnet.`* |
| **Zielrufnummer** (`to_mobile`) | Text | Bei `direct` | Die Handynummer des Empfängers im internationalen Format (z.B. +49...). | *Trage `+491701234567` ein, wenn dein Partner direkt informiert werden soll.* |
| **Teamliste** (`teamlist_email`) | Text | Bei `list` | Die ID (oder E-Mail) deiner Gruppe. Bleibt das Feld leer, greift der Smarte Fallback. | *Trage `108975` ein, um die Nachricht an die IT-Abteilung zu senden.* |
| **Bevorzugter Kanal** (`channel`) | Auswahl | Nein | Gilt nur für `direct`. Wähle `sms` (Text) oder `voice` (Sprachanruf). | *Wähle `voice` für einen kritischen Nacht-Alarm. Das Telefon klingelt durch!* |
| **Keyword** (`keyword`) | Text | Bedingt | Passwort für die Teamliste, falls diese im Webportal als "Geschlossene Gruppe" definiert ist. | *Trage `Geheim123` ein, damit die API die Nachricht nicht wegen fehlender Rechte abweist.* |
| **Absender E-Mail** (`sender_email`) | Text | Bedingt | E-Mail-Adresse für die Authentifizierung bei "Geschlossenen Gruppen". | *Trage `admin@smarthome.de` ein. Muss einem Mitglied der Liste gehören.* |
| **Absenderkennung** (`from_mobile`) | Text | Nein | Überschreibt den SMS-Absender auf dem Handydisplay (max. 11 Zeichen, alphanumerisch). | *Trage `SmartHome` ein. Auf dem Handy erscheint dann "SmartHome" statt einer Nummer.* |
| **Datum** (`date`) | Text | Nein | Erlaubt den geplanten Versand in der Zukunft (Format: YYYY-MM-DD). | *Trage `2026-12-24` ein, um Weihnachtsgrüße an alle Mitarbeiter vorzuplanen.* |
| **Uhrzeit** (`time`) | Text | Nein | Sende-Uhrzeit für den geplanten Versand (Format: HH:MM). | *Trage `08:00` ein, damit die Nachtschicht-Statistik erst morgens ankommt.* |
| **Flash-Nachricht** (`flash`) | Boolean | Nein | Aktiviert (`true`), poppt die SMS direkt auf dem Display des Empfängers auf und speichert sich nicht im Posteingang. | *Nutze `true` für simple Infos wie "Waschmaschine ist fertig", um den Speicher nicht zu zumüllen.* |
| **Test-Modus** (`test`) | Boolean | Nein | Aktiviert (`true`), durchläuft die API alle Validierungen, sendet die Nachricht aber nicht echt ab (Guthaben wird gespart). | *Nutze `true` während du neue HA-Automatisierungen baust und testest.* |
| **UCS2 Encoding** (`ucs2`) | Boolean | Nein | Erzwingt Unicode. Nötig für Emojis oder spezielle Sonderzeichen. | *Nutze `true`, wenn du Emojis wie 🚨 oder ❄️ in deiner Nachricht verwendest.* |

---

## 7. Praktische Beispiele für Automatisierungen

Hier sind fertige YAML-Codeschnipsel für typische Szenarien. Du kannst diese im visuellen Editor von Home Assistant unter "Automatisierungen" per Klick auf "YAML bearbeiten" einfügen.

### Beispiel 1: Direkte SMS bei Wasseralarm
Wenn der Wassersensor Feuchtigkeit meldet, schickt HA sofort eine SMS an den Hausbesitzer. Der Absendername wird auf "HomeAssist" geändert.

```yaml
alias: "Alarm: Wasserschaden SMS"
trigger:
  - platform: state
    entity_id: binary_sensor.wassersensor_keller
    to: "on"
action:
  - action: sno_teammessage.send_message
    data:
      target_type: "direct"
      to_mobile: "+491701234567"
      channel: "sms"
      message: "🚨 ALARM: Der Wassersensor im Keller hat Wasser registriert!"
      from_mobile: "HomeAssist"
      ucs2: true # Aktiviert für das Sirenen-Emoji
```

### Beispiel 2: Einbruchalarm als Sprachanruf (Voice)
Nachts überhört man schnell eine SMS. Ein echter Anruf auf dem Handy weckt jeden auf. Der eingegebene Text wird dem Angerufenen von einer Computerstimme am Telefon vorgelesen!

```yaml
alias: "Alarm: Einbruch Voice Call"
trigger:
  - platform: state
    entity_id: binary_sensor.haustur_kontakt
    to: "on"
condition:
  - condition: time
    after: "23:00:00"
    before: "06:00:00"
action:
  - action: sno_teammessage.send_message
    data:
      target_type: "direct"
      to_mobile: "+491609876543"
      channel: "voice"
      message: "Achtung. Kritische Systemwarnung. Die Haustür wurde soeben geöffnet."
```

### Beispiel 3: Information an das gesamte Team (Geschlossene Gruppe)
Der Server ist offline. Alle Personen auf deiner Teamliste (ID 108975) sollen parallel informiert werden. Die Liste ist aus Sicherheitsgründen "geschlossen", benötigt also Auth-Daten.

```yaml
alias: "Info: System offline an Team"
trigger:
  - platform: state
    entity_id: binary_sensor.server_status
    to: "off"
    for:
      minutes: 5
action:
  - action: sno_teammessage.send_message
    data:
      target_type: "list"
      teamlist_email: "108975"
      message: "SERVER OFFLINE: Der Hauptserver ist seit 5 Minuten nicht erreichbar."
      keyword: "IT-Sicherheit123"
      sender_email: "admin@meinnetzwerk.de"
```

### Beispiel 4: Geplanter Versand mit Flash-SMS
Die Waschmaschine ist fertig. Du möchtest die Info als Flash-SMS (poppt sofort über allen Apps auf) senden, aber erst um 16:00 Uhr, wenn du Feierabend hast.

```yaml
alias: "Info: Waschmaschine (Planung)"
trigger:
  - platform: state
    entity_id: sensor.waschmaschine_status
    to: "Fertig"
action:
  - action: sno_teammessage.send_message
    data:
      target_type: "direct"
      to_mobile: "+491701234567"
      message: "Die Waschmaschine ist fertig und kann ausgeräumt werden."
      flash: true
      time: "16:00"
```

---

## 8. Fehlerbehebung & FAQ

Die Integration ist stark fehlertolerant aufgebaut, dennoch kann es bei falschen Eingaben zu Rückmeldungen der API kommen. Hier sind die häufigsten Lösungen:

**Fehler: `invalid_to_mobile`**
* **Ursache:** Die API fordert zwingend eine Handynummer, es wurde aber keine gesendet.
* **Lösung:** Prüfe, ob du im Dienst die Versandart (`target_type`) auf `Direkt an Handynummer` gestellt hast und das Feld `to_mobile` mit einer korrekten Nummer (inklusive Ländervorwahl, z.B. `+49...`) gefüllt ist.

**Fehler: `closed_group_auth`**
* **Ursache:** Du versuchst an eine Teamliste zu senden, die vom Anbieter im Portal als "Geschlossene Gruppe" gesichert ist. Die Integration hat sich beim Senden nicht korrekt ausgewiesen.
* **Lösung:** Wähle im Dienst als Versandart `An Gruppe / Teamliste` und fülle zwingend die Felder `Keyword` und `Absender E-Mail` aus. Die verwendete E-Mail muss einem echten Mitglied dieser Liste gehören.

**Fehler: `Fehler beim Auflösen der Listenmitglieder`**
* **Ursache:** Die Integration versucht vor dem Gruppenversand, die Nummern deiner Teammitglieder asynchron von der API abzufragen. Dies schlägt fehl, wenn die Listen-ID (`teamlist_email`) nicht existiert oder in dieser Liste niemand den Kanaltyp SMS oder Voice zugeordnet hat.
* **Lösung:** Gehe ins TeamMessage Panel -> Tab "Kontakte" und überprüfe, ob die Mitglieder korrekt angelegt sind und im Dropdown "Zustellkanal" auf "SMS" oder "Voice" stehen. E-Mail-Kontakte werden hierbei ignoriert.

**Verbindungsfehler oder Timeouts**
* **Ursache:** Home Assistant kann den Server von TeamMessage nicht erreichen.
* **Lösung:** Stelle sicher, dass dein Home Assistant-Host über eine aktive Internetverbindung verfügt und DNS-Anfragen an `api.teammessage.de` nicht durch lokale Adblocker (wie Pi-Hole oder AdGuard Home) blockiert werden.

**Wo finde ich noch mehr Hilfe?**
Besuche unsere ausführliche Online-Doku und FAQ unter: [sno.mb222.de/faq-tm/](https://sno.mb222.de/faq-tm/) oder erstelle ein technisches Issue in unserem [GitHub Repository](https://github.com/SyncNetOps/int_SNO_teammessage/issues).
