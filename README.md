# SNO - TeamMessage für Home Assistant

[![GitHub Release](https://img.shields.io/github/v/release/SyncNetOps/int_SNO_teammessage?style=for-the-badge)](https://github.com/SyncNetOps/int_SNO_teammessage/releases)
[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![Home Assistant Integration](https://img.shields.io/badge/Home%20Assistant-Integration-blue.svg?style=for-the-badge&logo=home-assistant)](https://www.home-assistant.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Maintainer](https://img.shields.io/badge/Maintainer-%40SyncNetOps-green?style=for-the-badge)](https://github.com/SyncNetOps)

Eine vollumfängliche, smarte und fehlertolerante Home Assistant Integration für den professionellen Multi-Channel-Nachrichtendienst **[TeamMessage.de](https://www.teammessage.de)**. 

Sende zuverlässige **SMS-Textnachrichten**, **Sprachanrufe (Voice)** und Push-Benachrichtigungen hochzuverlässig direkt aus deinen Home Assistant Automatisierungen an Einzelpersonen oder ganze Teamlisten. Die Integration nutzt die moderne REST-API (v1.1.0) des Anbieters mit Bearer-Token-Authentifizierung.

**Entwickler:** [SyncNetOps](https://github.com/SyncNetOps)  

---

## ✨ Features & Highlights (v1.1.1)

* 🎨 **Modernes Glassmorphism-Panel:** Eine reaktionsschnelle Single Page Application (SPA) direkt in deiner Home Assistant Seitenleiste zur Verwaltung von Kontakten und Logs.
* 👥 **Smart Group Resolver:** Sende Nachrichten an komplette Gruppen/Teamlisten. Die Integration löst die Kontakte über die API automatisch auf und adressiert alle Mitglieder synchron.
* 🛡 **Smart Fallbacks & Auto-Korrektur:** Hinterlege Standard-Listen oder -Keywords, um deine YAML-Automatisierungen schlank zu halten. Falsch formatierte Handynummern werden in Echtzeit korrigiert.
* 📊 **Dashboard Custom Cards:** Wunderschöne, per UI konfigurierbare Lovelace-Karten für Guthaben, Logbuch und Schnellversand.
* 🔌 **UI-Konfiguration (Config Flow):** Keine umständliche Einrichtung über die `configuration.yaml` nötig. Alles bequem über die Home Assistant Benutzeroberfläche.
* 🔍 **Echtzeit-Logbuch:** Detailliertes, durchsuchbares Protokoll mit Auto-Refresh-Funktion, Fehlercodes und Zustellberichten direkt im Panel.

---

## 📋 Voraussetzungen

1. Ein Account bei [TeamMessage.de](https://teammessage.eu/registrieren) (Kostenlose Test-SMS bei Anmeldung).
2. Deine **Team-ID** (Kundennummer).
3. Ein generierter **API-Token (Bearer Token)** aus dem Einstellungsbereich des TeamMessage-Portals.

---

## 🚀 Installation

### Option 1: HACS (Empfohlen)
Diese Integration kann problemlos über [HACS](https://hacs.xyz/) (Home Assistant Community Store) als benutzerdefiniertes Repository hinzugefügt werden.

1. Öffne HACS in Home Assistant.
2. Gehe zu **Integrationen**.
3. Klicke auf die 3 Punkte oben rechts und wähle **Benutzerdefinierte Repositorys**.
4. Trage die Repository-URL ein: `https://github.com/SyncNetOps/int_SNO_teammessage`
5. Wähle als Kategorie **Integration**.
6. Klicke auf "Hinzufügen" und lade die Integration herunter.
7. Starte Home Assistant neu.

### Option 2: Manuelle Installation
Lade den `main`-Branch herunter und kopiere den Ordner `custom_components/sno_teammessage` in das `custom_components`-Verzeichnis deiner Home Assistant Installation. Starte Home Assistant danach neu.

---

## ⚙️ Konfiguration

Füge die Integration über die Benutzeroberfläche hinzu:

[![Integration hinzufügen](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=sno_teammessage)

1. Gehe zu **Einstellungen** -> **Geräte & Dienste**.
2. Klicke auf **Integration hinzufügen** und suche nach `TeamMessage`.
3. Gib deine **Team-ID** und den **API-Token** ein.
4. Fertig! Ab sofort stehen dir das Panel, die Sensoren und der Sende-Dienst zur Verfügung.

---

## 🎨 Dashboard-Karten (Custom Lovelace Cards)

Zusätzlich zum Seitenleisten-Panel bringt die Integration wunderschöne Karten für dein normales Lovelace-Dashboard mit. Die Skript-Datei liegt im Ordner `www/sno-teammessage/teammessage-cards.js`.

### Schritt 1: So machst du die Karten sichtbar
1. Gehe in Home Assistant zu **Einstellungen** -> **Dashboards**.
2. Klicke oben rechts auf die drei Punkte (`...`) und wähle **Ressourcen**.
   *(Hinweis: Falls du den Punkt "Ressourcen" nicht siehst, musst du unter deinem Benutzerprofil den "Erweiterten Modus" aktivieren).*
3. Klicke unten rechts auf **Ressource hinzufügen**.
4. Trage folgende URL ein: `/local/sno-teammessage/teammessage-cards.js?v=1`
5. Wähle als Ressourcentyp **JavaScript Modul** und klicke auf **Erstellen**.

> **💡 Profitipp (Cache leeren):** Wenn die Entwickler ein Update der Karten herausbringen, ändere in der Ressourcen-Verwaltung einfach die Endung auf `?v=2` oder `?v=3`, um den Browser-Cache zum Neuladen zu zwingen!

### Schritt 2: Karten auf dem Dashboard platzieren
Gehe auf dein gewünschtes Dashboard (z.B. Übersicht) und klicke oben rechts auf das Stift-Symbol (Dashboard bearbeiten). Klicke auf **Karte hinzufügen** und scrolle ganz nach unten. Dort findest du vier neue Karten:

* **TeamMessage Guthaben:** Optischer Ring mit Statistik.
* **TeamMessage Senden:** Schnellversand-Formular.
* **TeamMessage Logs:** Interaktives Logbuch mit Akkordeon.
* **TeamMessage Statistik:** Minimalistische Anzeige.

Wähle eine Karte aus. Im visuellen Editor kannst du nun den Titel anpassen und (zwingend erforderlich) deine Team-ID / Kundennummer (`tm`) eintragen.

---

## 🛠️ Nutzung & Automatisierungen

Nachrichten werden über den Dienst `sno_teammessage.send_message` verschickt. Der Dienst unterscheidet sauber zwischen Direktversand (`target_type: direct`) und Gruppenversand (`target_type: list`).



### Beispiel: Direktnachricht (SMS) bei Alarm
Sendet eine direkte SMS an eine spezifische Handynummer.

```yaml
action: sno_teammessage.send_message
data:
  target_type: direct
  to_mobile: "+491701234567"
  message: "🚨 ALARM: Der Wassersensor im Waschkeller hat ausgelöst!"
  channel: sms
```

### Beispiel: Sprachanruf (Voice)
Ein Sprachanruf ist besonders nachts hilfreich, da er Personen verlässlicher weckt als ein SMS-Ton.

```yaml
action: sno_teammessage.send_message
data:
  target_type: direct
  to_mobile: "+491609876543"
  message: "Achtung! Kritische Systemwarnung. Die Haustür wurde geöffnet."
  channel: voice
```

### Beispiel: Gruppenversand (Teamliste)
Dieser Aufruf sendet die Nachricht parallel an alle hinterlegten SMS/Voice-Empfänger der Teamliste. Die Auflösung der Kontakte übernimmt die Integration für dich.

```yaml
action: sno_teammessage.send_message
data:
  target_type: list
  teamlist_email: "108975"
  message: "SERVER OFFLINE: Der Home Assistant Server reagiert nicht mehr."
  # Nur bei geschlossenen Gruppen nötig:
  keyword: "SicherheitsPW"
  sender_email: "admin@deinedomain.de"
```

---

## 📊 Sensoren

Die Integration erstellt automatisch nützliche Entitäten, die zyklisch (alle 5 Minuten) aktualisiert werden:

* `sensor.sno_teammessage_<team_id>_credit`: Aktuell verfügbares SMS/Voice Guthaben.
* `sensor.sno_teammessage_<team_id>_used`: Summe der bisher gesendeten Nachrichten.
* `sensor.sno_teammessage_<team_id>_tariff`: Aktueller Tarif-Status (z.B. EASY, PAUSCHAL).

---

## 📚 Umfassende Dokumentation (Release v1.1.1)

Für tiefergehende Informationen zu Updates, technischen Hintergründen, API-Spezifikationen und detaillierten Nutzungsszenarien stehen im Repository umfangreiche Dokumentationen zur Verfügung:
### Integration & Panel
* 📖 **[Ausführliche Anwenderanleitung](https://github.com/SyncNetOps/int_SNO_teammessage/blob/main/Docs%2FV1.1.1%2FAnwenderanleitung.md)**  
  Ein kompletter Schritt-für-Schritt-Guide für Installation, Einrichtung, das Panel, Dashboard-Karten und fortgeschrittene Automatisierungen.
* 💻 **[Entwickler- & Architektur-Dokumentation](https://github.com/SyncNetOps/int_SNO_teammessage/blob/main/Docs%2FV1.1.1%2FEntwicklerdoku-V1-1-1.md)**  
  Tiefe Einblicke in die Hub-Architektur, Endpunkte und Service-Calls – ideal für Entwickler von Custom Lovelace Cards.
* 📄 **[Changelog (v1.1.1)](https://github.com/SyncNetOps/int_SNO_teammessage/blob/main/Docs%2FV1.1.1%2Fchangelog.md)**  
  Übersicht aller neuen Features, Anpassungen und Bugfixes dieses Releases.
* 🐛 **[Technischer Bugfix Report](https://github.com/SyncNetOps/int_SNO_teammessage/blob/main/Docs%2FV1.1.1%2FBugfixBeschreibung.md)**  
  Detaillierte Analyse und Beschreibung der gelösten Pydantic-Payload- und API-Routing-Fehler.
* 🌍 **[Entwickler Website & FAQ](http://sno.mb222.de/faq-tm/)**  
  Offizielle Wissensdatenbank, häufig gestellte Fragen und weiterführender Support direkt vom Entwickler.
  
### Dashboard-Karten
* 📖 **[Dashboard-Karten Anwenderanleitung]([https://github.com/SyncNetOps/int_SNO_teammessage/blob/main/Docs%2FV1.1.1%2FAnwenderanleitung.md](https://github.com/SyncNetOps/int_SNO_teammessage/blob/main/Docs/DashboardCards/Anwender-Doku.md)**  
  Ein kompletter Schritt-für-Schritt-Guide für Installation & Einrichtung der Dashboard-Karten.
  * 💻 **[Dashboard-Karten Entwicklerdokumentation]([https://github.com/SyncNetOps/int_SNO_teammessage/blob/main/Docs%2FV1.1.1%2FEntwicklerdoku-V1-1-1.md](https://github.com/SyncNetOps/int_SNO_teammessage/blob/main/Docs/DashboardCards/Entwickler-Doku.md)**  
  Für Dashboard-Karten Entwickler.
---

## 🐛 Fehlerbehebung / Support

Sollten Probleme auftreten (z. B. `invalid_to_mobile` oder `closed_group_auth`), prüfe bitte Folgendes:
* Kontrolliere das Logbuch-Tab direkt im TeamMessage-Panel deines Home Assistant.
* Stelle sicher, dass die Rufnummern in den Teamlisten das internationale Format aufweisen (`+49...`).

Für ausführliche Hilfestellungen besuche unsere **[Offizielle FAQ & Dokumentation](http://sno.mb222.de/faq-tm/)**.

Wenn du einen Bug gefunden hast, erstelle gerne ein Issue:  
👉 **[Issue auf GitHub melden](https://github.com/SyncNetOps/int_SNO_teammessage/issues)**

---
*Hinweis: Dies ist eine Drittanbieter-Integration zur Nutzung eines API-Dienstes. Für den reellen Versand von SMS und Sprachanrufen fallen entsprechende Nutzungsgebühren beim Dienstanbieter TeamMessage.de an.*
