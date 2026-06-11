# Anwenderanleitung.md

# SNO - TeamMessage | Umfassendes Anwender-Handbuch (v1.1.1)

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration) 
[![HA Integration](https://img.shields.io/badge/Home%20Assistant-Integration-blue.svg?style=for-the-badge&logo=home-assistant)](https://www.home-assistant.io/)

Willkommen zur detaillierten Anleitung für die SNO TeamMessage Integration. Diese Dokumentation führt dich Schritt für Schritt von der Vorbereitung beim Anbieter über die Installation und Einrichtung bis hin zur Erstellung komplexer Automatisierungen und eigener Dashboard-Karten.

---

## Inhaltsverzeichnis
1. [Vorbereitungen (TeamMessage.de)](#1-vorbereitungen-teammessagede)
2. [Installation (HACS & Manuell)](#2-installation)
3. [Einrichtung in Home Assistant](#3-einrichtung-in-home-assistant)
4. [Das TeamMessage Panel (Seitenleiste) im Detail](#4-das-teammessage-panel-seitenleiste-im-detail)
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
   * Kopiere diesen Token. **Achtung:** Er wird dir meist nur einmal vollständig angezeigt!

---

## 2. Installation

Du kannst die Integration auf zwei Wegen in Home Assistant installieren: über den Community Store (HACS) oder manuell.

### Option A: Installation über HACS (Empfohlen)
Da es sich um ein Custom Repository handelt, musst du es HACS zunächst bekannt machen:
1. Öffne **HACS** in der Seitenleiste deines Home Assistant.
2. Klicke auf **Integrationen**.
3. Klicke oben rechts auf das Menü (die drei Punkte) und wähle **Benutzerdefinierte Repositorys**.
4. Trage im Feld *Repository* die URL ein: `https://github.com/SyncNetOps/int_SNO_teammessage`
5. Wähle im Dropdown-Menü *Kategorie* den Eintrag **Integration** aus und klicke auf *Hinzufügen*.
6. Suche nun in HACS nach `SNO - TeamMessage`, klicke auf die Integration und unten rechts auf **Herunterladen**.
7. **Wichtig:** Starte Home Assistant nach dem Herunterladen neu!

### Option B: Manuelle Installation
1. Gehe auf die [GitHub-Seite des Repositories](https://github.com/SyncNetOps/int_SNO_teammessage).
2. Lade dir den Code über den grünen Button *Code* -> *Download ZIP* herunter.
3. Entpacke die ZIP-Datei.
4. Navigiere auf deinem Home Assistant Gerät (z.B. per Samba Share oder File Editor) in den Ordner `config/custom_components/`. *(Falls der Ordner nicht existiert, erstelle ihn).*
5. Kopiere den gesamten Ordner `sno_teammessage` aus der entpackten ZIP-Datei in das Verzeichnis `custom_components`.
6. **Wichtig:** Starte Home Assistant neu!

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
Nach der Installation kannst du über den Button **Konfigurieren** (in der Integrations-Übersicht) die sogenannten *Smarten Fallbacks* festlegen. Diese Werte werden immer dann genutzt, wenn du in einer Automatisierung vergisst, sie explizit anzugeben.
* **Standard Teamliste:** Wähle hier die ID (z.B. `108975`) oder E-Mail deiner primären Liste.
* **Standard Absender-E-Mail:** Trage hier deine E-Mail ein. Dies ist zwingend nötig, wenn du an "Geschlossene Gruppen" sendest.
* **Standard Keyword:** Wenn deine Teamliste passwortgeschützt ist, trage es hier ein.

---

## 4. Das TeamMessage Panel (Seitenleiste) im Detail

Die Integration fügt deinem Home Assistant in der linken Seitenleiste ein neues Menü namens **TeamMessage** hinzu. Dieses hochmoderne "Glassmorphism"-Panel ist in mehrere Tabs unterteilt:

### 4.1 Dashboard
Hier siehst du auf einen Blick den Status deines Accounts:
* **Verfügbares Guthaben:** Deine noch verbleibenden SMS (bei Prepaid/EASY-Tarifen).
* **Gesendet Gesamt:** Wie viele Nachrichten historisch über deinen Account liefen.
* **Aktiver Tarif:** Zeigt dir, ob du z.B. einen `EASY` oder `PROFI`-Tarif nutzt.

### 4.2 Senden
Dieser Tab ist ideal, um Nachrichten manuell zu testen, ohne erst eine Automatisierung schreiben zu müssen.
* **Typ:** Wähle zwischen `An Teamliste / Gruppe` oder `Direkt an Handynummer`.
* **Ziel:** Wählst du eine Gruppe, erscheint ein Dropdown mit all deinen im Portal angelegten Listen. Wählst du Direkt, erscheint ein Textfeld für die Handynummer.
* **Zusätzliche Listen-Authentifizierung:** (Erscheint nur bei der Auswahl "Listen"). Hier kannst du temporär das Keyword und die E-Mail eingeben, falls die Gruppe geschlossen ist.
* **Bevorzugter Kanal:** Gilt nur für den Direktversand! Wähle, ob der Empfänger eine `SMS Textnachricht` oder einen automatisierten `Sprachanruf (Voice)` erhalten soll.
* **Nachricht:** Dein gewünschter Alarm- oder Infotext.

### 4.3 Logbuch
Das Herzstück der Fehleranalyse. Hier siehst du live, was mit deinen Nachrichten passiert ist.
* **Status-Icons:** Ein grüner Haken bedeutet "Zugestellt". Eine orange Sanduhr bedeutet "Wird verarbeitet". Ein rotes Ausrufezeichen bedeutet "Fehler".
* **Akkordeon-Klick:** Klicke auf einen beliebigen Eintrag, um alle Details auszuklappen. Du siehst dann den genauen Statuscode (z.B. `-6` für ungültige Handynummer) und das verwendete Mobilfunknetz (Telekom, Vodafone etc.).
* **Einstellungen (Zahnrad):** Oben rechts im Logbuch kannst du einstellen, dass sich das Logbuch automatisch (z.B. alle 30 Sekunden) aktualisiert.

### 4.4 Kontakte
Hier verwaltest du die Mitglieder deiner Teamlisten direkt aus Home Assistant heraus, ohne dich ins Webportal einloggen zu müssen!
* Wähle oben im Dropdown eine deiner Teamlisten und klicke auf **Laden**.
* Du siehst alle aktuellen Mitglieder. Du kannst sie über den Button **Edit** bearbeiten oder über **+ Neu** jemanden hinzufügen.
* **Zustellkanal:** Du kannst für jede Person einzeln festlegen, ob sie primär per SMS, Voice oder E-Mail benachrichtigt werden soll.

### 4.5 Einstellungen
Hier kannst du die *Smarten Fallbacks* (siehe Punkt 3.2) bequem über die grafische Oberfläche ändern und speichern.

---

## 5. Dashboard-Karten & Sensoren hinzufügen

Die Integration stellt dir out-of-the-box drei Sensoren zur Verfügung, die du auf jedem Home Assistant Dashboard visualisieren kannst (`credit`, `used` und `tariff`).

Zusätzlich bringt die Integration eigene, maßgeschneiderte Dashboard-Karten (Custom Cards) mit, die bei der Installation automatisch mit heruntergeladen wurden. Bevor du diese auf deinem Dashboard nutzen kannst, musst du sie in Home Assistant als Ressource registrieren.

### 5.1 Custom Cards (Ressourcen) registrieren

**Schritt 1: So machst du die Karten sichtbar**
1. Gehe in Home Assistant in der Seitenleiste zu **Einstellungen** -> **Dashboards**.
2. Klicke oben rechts auf die drei Punkte (`...`) und wähle **Ressourcen**.
   *(Hinweis: Falls du den Punkt "Ressourcen" nicht siehst, musst du unter deinem Benutzerprofil den "Erweiterten Modus" aktivieren).*
3. Klicke unten rechts auf den Button **Ressource hinzufügen**.
4. Trage in das Feld URL exakt folgende Zeile ein: 
   `/local/sno-teammessage/teammessage-cards.js?v=1`
5. Wähle als Ressourcentyp **JavaScript Modul** und klicke auf **Erstellen**.

💡 **Profitipp (Cache leeren):** Wenn die Entwickler ein Update der Karten herausbringen, ändere in der Ressourcen-Verwaltung einfach die Endung auf `?v=2` oder `?v=3`, um den Browser-Cache zum sofortigen Neuladen der neuen Version zu zwingen!

### 5.2 Karten zum Dashboard hinzufügen (Lovelace)

Sobald die Ressource registriert ist, kannst du die Karten in dein Dashboard einbauen.
1. Gehe auf dein gewünschtes Dashboard.
2. Klicke oben rechts auf das Stift-Symbol (Dashboard bearbeiten).
3. Klicke auf **Karte hinzufügen**.
4. Wenn du die Custom Card des Entwicklers nutzt, suche in der Liste nach der spezifischen TeamMessage-Karte oder nutze die reguläre Entitäten-Karte.

**YAML-Code für eine schöne, reguläre Status-Karte:**
Wenn du den Code-Editor (YAML) im Dashboard bevorzugst, kannst du diesen Block nutzen, um deine Account-Sensoren formschön darzustellen *(Ersetze `12345` durch deine eigene Team-ID)*:

```yaml
type: entities
title: TeamMessage Status
entities:
  - entity: sensor.sno_teammessage_12345_credit
    name: SMS Guthaben
    icon: mdi:message-badge
  - entity: sensor.sno_teammessage_12345_used
    name: Gesendet (Gesamt)
    icon: mdi:message-arrow-right
  - entity: sensor.sno_teammessage_12345_tariff
    name: Aktueller Tarif
    icon: mdi:card-account-details