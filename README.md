\# SNO - TeamMessage Integration für Home Assistant



\[!\[GitHub Release](https://img.shields.io/github/v/release/SyncNetOps/int\_SNO\_teammessage?style=for-the-badge)](https://github.com/SyncNetOps/int\_SNO\_teammessage/releases)

\[!\[hacs\_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)

\[!\[License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)



Eine vollumfängliche, fehlertolerante Home Assistant Integration für den professionellen Multikanal-Nachrichtendienst \*\*\[TeamMessage.de](https://www.teammessage.de)\*\*. 



Diese Integration ermöglicht dir den hochzuverlässigen Versand von Nachrichten über SMS, Voice-Anrufe (Text-to-Speech) und Push-Benachrichtigungen direkt aus deinem Smart Home heraus. Sie nutzt die moderne REST-API (v1.1.0) des Anbieters mit Bearer-Token-Authentifizierung und bietet ein atemberaubendes Frontend zur Verwaltung.



\*\*Entwickler:\*\* \[SyncNetOps](https://github.com/SyncNetOps)  

\*\*Offizielle FAQ \& Dokumentation:\*\* \[SNO TeamMessage Doku](https://sno.mb222.de/faq-tm/)



\## ✨ Highlights \& Features

\* 🎨 \*\*Modernes Glassmorphism-Panel:\*\* Eine reaktionsschnelle Single Page Application (SPA) direkt in deiner Home Assistant Seitenleiste.

\* 👥 \*\*Vollwertiges Kontakt-Management:\*\* Synchronisiere, erstelle und bearbeite deine TeamMessage-Kontakte und Teamlisten, ohne HA verlassen zu müssen.

\* 🛡 \*\*Smart Fallbacks \& Auto-Korrektur:\*\* Falsch formatierte Handynummern (`0170...` statt `+49170...`)? Die Integration korrigiert Nummern in Echtzeit und füllt fehlende Daten aus deinen globalen Einstellungen auf.

\* 📊 \*\*Dashboard Custom Cards:\*\* Wunderschöne, per UI konfigurierbare Lovelace-Karten für Guthaben, Logbuch und Schnellversand.

\* 🔍 \*\*Echtzeit-Logbuch:\*\* Detailliertes, durchsuchbares Protokoll mit Auto-Refresh-Funktion, Fehlercodes und Zustellberichten.



\## 🚀 Schnellstart



1\. Erstelle einen Account auf \[teammessage.eu/registrieren](https://teammessage.eu/registrieren) (inkl. 20 Frei-SMS).

2\. Generiere im TeamMessage Portal einen \*\*API-Token (Bearer Token)\*\*.

3\. Installiere diese Integration über \*\*HACS\*\* (Benutzerdefiniertes Repository).

4\. Gehe in Home Assistant zu \*\*Einstellungen -> Geräte \& Dienste\*\*, füge `SNO - TeamMessage` hinzu und gib deine Team-ID sowie den Token ein.



\## 📚 Dokumentation

Alle weiteren Informationen, detaillierte YAML-Beispiele und Hilfe bei der Einrichtung findest du in unseren beiliegenden Dokumenten:

\* \[Installationsanleitung](https://github.com/SyncNetOps/int\_SNO\_teammessage/blob/main/Docs/V1.1.0/Installationsanleitung.md)

\* \[Benutzerhandbuch](https://github.com/SyncNetOps/int\_SNO\_teammessage/blob/main/Docs/V1.1.0/Benutzerhandbuch.md)

\* \[FAQ (Häufig gestellte Fragen)](https://github.com/SyncNetOps/int\_SNO\_teammessage/blob/main/Docs/V1.1.0/FAQ.md)

\* \[Entwickler-Dokumentation](https://github.com/SyncNetOps/int\_SNO\_teammessage/blob/main/Docs/V1.1.0/Entwickler-Dokumentation.md)



\---

\*Hinweis: Dies ist eine Drittanbieter-Integration zur Nutzung eines API-Dienstes. Für den reellen Versand von SMS und Sprachanrufen fallen entsprechende Nutzungsgebühren beim Dienstanbieter TeamMessage.de an.\*



