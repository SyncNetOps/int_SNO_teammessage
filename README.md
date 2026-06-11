# SNO - TeamMessage für Home Assistant



[![GitHub Release](https://img.shields.io/github/v/release/SyncNetOps/int_SNO_teammessage?style=for-the-badge)](https://github.com/SyncNetOps/int_SNO_teammessage/releases)
[![HACS Default](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![Home Assistant Integration](https://img.shields.io/badge/Home%20Assistant-Integration-blue.svg?style=for-the-badge&logo=home-assistant)](https://www.home-assistant.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Maintainer](https://img.shields.io/badge/Maintainer-%40SyncNetOps-green?style=for-the-badge)](https://github.com/SyncNetOps)

Eine vollumfängliche, smarte und fehlertolerante Home Assistant Integration für den professionellen Multi-Channel-Nachrichtendienst [TeamMessage.de](https://www.teammessage.de). Sende zuverlässige **SMS-Textnachrichten** und **Sprachanrufe (Voice)** direkt aus deinen Home Assistant Automatisierungen an Einzelpersonen oder ganze Teamlisten.

---

## ✨ Features (v1.1.1)

* **UI-Konfiguration (Config Flow):** Keine Einrichtung über die `configuration.yaml` nötig. Alles bequem über die Home Assistant Benutzeroberfläche.
* **Interaktives Dashboard-Panel:** Eigenes Seiten-Panel in Home Assistant zur Verwaltung von Kontakten, Einsicht in Echtzeit-Logbücher und Abfrage des Restguthabens.
* **Smart Group Resolver:** Sende Nachrichten an komplette Gruppen/Teamlisten. Die Integration löst die Kontakte über die API automatisch auf und adressiert alle Mitglieder synchron.
* **Smarte Fallbacks:** Hinterlege Standard-Listen oder -Keywords, um deine YAML-Automatisierungen schlank zu halten.
* **Sensoren inklusive:** Überwache dein aktuelles SMS-Guthaben, den aktiven Tarif und die gesendeten Nachrichten bequem als Sensor in deinen eigenen Dashboards.
* **Fehlertolerant & Sicher:** Unterstützt die moderne REST-API v1.1.0 via Bearer Token Authentifizierung inklusive Auto-Heal-Mechanismen für Payloads.

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
Lade den `main`-Branch herunter und kopiere den Ordner `custom_components/sno_teammessage` in das `custom_components`-Verzeichnis deiner Home Assistant Installation. Starte HA danach neu.

---

## ⚙️ Konfiguration

Füge die Integration über die Benutzeroberfläche hinzu:

[![Integration hinzufügen](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=sno_teammessage)

1. Gehe zu **Einstellungen** -> **Geräte & Dienste**.
2. Klicke auf **Integration hinzufügen** und suche nach `TeamMessage`.
3. Gib deine **Team-ID** und den **API-Token** ein.
4. Fertig! Ab sofort stehen dir das Panel, die Sensoren und der Sende-Dienst zur Verfügung.

---

## 🛠️ Nutzung & Automatisierungen

Nachrichten werden über den Dienst `sno_teammessage.send_message` verschickt. Der Dienst unterscheidet sauber zwischen Direktversand (`target_type: direct`) und Gruppenversand (`target_type: list`).

[![Dienst aufrufen](https://my.home-assistant.io/badges/developer_call_service.svg)](https://my.home-assistant.io/redirect/developer_call_service/)

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

### 📊 Sensoren

Die Integration erstellt automatisch nützliche Entitäten, die zyklisch (alle 5 Minuten) aktualisiert werden:

* **sensor.sno_teammessage_<team_id>_credit: Aktuell verfügbares SMS/Voice Guthaben.
* **sensor.sno_teammessage_<team_id>_used: Summe der bisher gesendeten Nachrichten.
* **sensor.sno_teammessage_<team_id>_tariff: Aktueller Tarif-Status (z.B. EASY, PAUSCHAL).
*

### 🐛 Fehlerbehebung / Support

Sollten Probleme auftreten (z. B. invalid_to_mobile oder closed_group_auth), prüfe bitte Folgendes:

Kontrolliere das Logbuch-Tab direkt im TeamMessage-Panel deines Home Assistant.

Stelle sicher, dass die Rufnummern in den Teamlisten das internationale Format aufweisen (+49...).

Für ausführliche Hilfestellungen besuche unsere Offizielle FAQ & Dokumentation (https://sno.mb222.de/faq-tm/).

Wenn du einen Bug gefunden hast, erstelle gerne ein Issue:
👉 Issue auf GitHub melden (https://github.com/SyncNetOps/int_SNO_teammessage/issues)
=======
# SNO - TeamMessage Integration für Home Assistant
>>>>>>> 7ca8d46a4ea8878e083d90979e32a588c8a87a75

[![GitHub Release](https://img.shields.io/github/v/release/SyncNetOps/int_SNO_teammessage?style=for-the-badge)](https://github.com/SyncNetOps/int_SNO_teammessage/releases)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<<<<<<< HEAD
## 📚 Umfassende Dokumentation (Release v1.1.1)

Für tiefergehende Informationen zu Updates, technischen Hintergründen, API-Spezifikationen und detaillierten Nutzungsszenarien stehen im Repository umfangreiche Dokumentationen zur Verfügung. 

Auf der Seite des Entwicklers (https://sno.mb222.de/faq-tm/)

Diese befinden sich im Ordner `/Docs/V1.1.1/`:

*   📄 **[Changelog (v1.1.1)](Docs/V1.1.1/changelog.md)**  
    Übersicht aller neuen Features, Anpassungen und Bugfixes dieses Releases.
*   🐛 **[Technischer Bugfix Report](Docs/V1.1.1/BugfixBeschreibung.md)**  
    Detaillierte Analyse und Beschreibung der gelösten Pydantic-Payload- und API-Routing-Fehler.
*   💻 **[Entwickler- & Architektur-Dokumentation](Docs/V1.1.1/Entwicklerdoku-V1-1-1.md)**  
    Tiefe Einblicke in die Hub-Architektur, Endpunkte und Service-Calls – ideal für Entwickler von Custom Lovelace Cards.
*   📖 **[Ausführliche Anwenderanleitung](Docs/V1.1.1/Anwenderanleitung.md)**  
    Ein kompletter Schritt-für-Schritt-Guide für Installation, Einrichtung, das Panel und fortgeschrittene Automatisierungen.
=======
Eine vollumfängliche, fehlertolerante Home Assistant Integration für den professionellen Multikanal-Nachrichtendienst **[TeamMessage.de](https://www.teammessage.de)**. 

Diese Integration ermöglicht dir den hochzuverlässigen Versand von Nachrichten über SMS, Voice-Anrufe (Text-to-Speech) und Push-Benachrichtigungen direkt aus deinem Smart Home heraus. Sie nutzt die moderne REST-API (v1.1.0) des Anbieters mit Bearer-Token-Authentifizierung und bietet ein atemberaubendes Frontend zur Verwaltung.

**Entwickler:** [SyncNetOps](https://github.com/SyncNetOps)  
**Offizielle FAQ & Dokumentation:** [SNO TeamMessage Doku](https://sno.mb222.de/faq-tm/)

## ✨ Highlights & Features
* 🎨 **Modernes Glassmorphism-Panel:** Eine reaktionsschnelle Single Page Application (SPA) direkt in deiner Home Assistant Seitenleiste.
* 👥 **Vollwertiges Kontakt-Management:** Synchronisiere, erstelle und bearbeite deine TeamMessage-Kontakte und Teamlisten, ohne HA verlassen zu müssen.
* 🛡 **Smart Fallbacks & Auto-Korrektur:** Falsch formatierte Handynummern (`0170...` statt `+49170...`)? Die Integration korrigiert Nummern in Echtzeit und füllt fehlende Daten aus deinen globalen Einstellungen auf.
* 📊 **Dashboard Custom Cards:** Wunderschöne, per UI konfigurierbare Lovelace-Karten für Guthaben, Logbuch und Schnellversand.
* 🔍 **Echtzeit-Logbuch:** Detailliertes, durchsuchbares Protokoll mit Auto-Refresh-Funktion, Fehlercodes und Zustellberichten.

## 🚀 Schnellstart

1. Erstelle einen Account auf [teammessage.eu/registrieren](https://teammessage.eu/registrieren) (inkl. 20 Frei-SMS).
2. Generiere im TeamMessage Portal einen **API-Token (Bearer Token)**.
3. Installiere diese Integration über **HACS** (Benutzerdefiniertes Repository).
4. Gehe in Home Assistant zu **Einstellungen -> Geräte & Dienste**, füge `SNO - TeamMessage` hinzu und gib deine Team-ID sowie den Token ein.

## 📚 Dokumentation
Alle weiteren Informationen, detaillierte YAML-Beispiele und Hilfe bei der Einrichtung findest du in unseren beiliegenden Dokumenten:
* [Installationsanleitung](https://github.com/SyncNetOps/int_SNO_teammessage/blob/main/Docs/V1.1.0/Installationsanleitung.md)
* [Benutzerhandbuch](https://github.com/SyncNetOps/int_SNO_teammessage/blob/main/Docs/V1.1.0/Benutzerhandbuch.md)
* [FAQ (Häufig gestellte Fragen)](https://github.com/SyncNetOps/int_SNO_teammessage/blob/main/Docs/V1.1.0/FAQ.md)
* [Entwickler-Dokumentation](https://github.com/SyncNetOps/int_SNO_teammessage/blob/main/Docs/V1.1.0/Entwickler-Dokumentation.md)

---
*Hinweis: Dies ist eine Drittanbieter-Integration zur Nutzung eines API-Dienstes. Für den reellen Versand von SMS und Sprachanrufen fallen entsprechende Nutzungsgebühren beim Dienstanbieter TeamMessage.de an.*
>>>>>>> 7ca8d46a4ea8878e083d90979e32a588c8a87a75
