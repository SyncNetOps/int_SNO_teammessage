# **Changelog \- SNO TeamMessage Integration**

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

## **\[1.1.0\] \- 2026-06-08**

### **🚀 Neue Funktionen & Features**

* **Glassmorphism SPA-Panel:** Vollständiges Redesign der Integrationsoberfläche. Das Panel ist nun eine Single Page Application (SPA) mit modernen Web Components, reaktionsschnellen Tabs und einem responsiven Grid-Layout.  
* **Kontakt-Manager (CRUD):** Komplette Kontaktverwaltung integriert. Mitglieder können über die REST-API Endpunkte /teamlist/member/ direkt im Home Assistant Panel angelegt, bearbeitet (inkl. Kanalwechsel auf SMS, Voice, E-Mail, Fax) und gelöscht werden.  
* **Smart Fallbacks (Globale Einstellungen):** Im neuen Einstellungs-Tab können Standard-Werte für teamlist\_email, sender\_email und keyword hinterlegt werden. Diese greifen automatisch, wenn Parameter in Automatisierungen weggelassen werden.  
* **Intelligentes Logbuch:** Live-Suche nach Status, Nummer und Nachrichtentext. Das Logbuch nutzt nun ein modernes Akkordeon-Design für detaillierte Zustellberichte. Ein Einstellungs-Modal erlaubt die Konfiguration von Auto-Refresh, Intervall und Abruflimit.  
* **Dashboard Custom Cards:** Ein Set an Lovelace-Karten (Senden, Guthaben, Statistik, Logbuch) wurde hinzugefügt, konfigurierbar über einen visuellen UI-Editor.  
* **Hilfe / Doku Tab:** Ein grafisch hochwertiger Hilfe-Bereich mit Schnellzugriff auf Dokumentation, Support und Tarifinformationen wurde ins Panel integriert.

### **🛠 Fehlerbehebungen (Bugfixes) & Optimierungen**

* **Serverseitige Rufnummern-Fehlertoleranz:** Der Dienst sno\_teammessage.send\_message validiert und formatiert eingehende Rufnummern nun automatisch ins internationale Format (z.B. 0170 123 \-\> \+49170123). Dies verhindert strikte API-Abbrüche (Fehlercode \-6).  
* **URL-Routing Bug (404):** Kritischen HTTP 404 Fehler im internen HA-Proxy (views.py) behoben. Endpunkte und URL-Parameter (request.query) werden nun absolut fehlerfrei getrennt, was PUT/DELETE-Requests bei Kontakten ermöglicht.  
* **Tuple-Slicing Fehler:** SyntaxWarning in der String-Verkettung des Proxys entfernt.  
* **Promise.all Absturzsicherung:** Das Frontend (teammessage-panel.js) fängt API-Ausfälle nun sauber über Toast-Meldungen ab, anstatt mit einem schwarzen Bildschirm (White Screen of Death) abzustürzen.  
* **Service-Routing im Panel:** Der manuelle Sende-Button im Panel nutzt nun nativ den HA-Service, wodurch die Rufnummern-Fehlertoleranz und die Smart Fallbacks auch bei manuellen Eingaben greifen.

## **\[1.0.0\] \- Erstveröffentlichung**

* Initiales Release der Integration.  
* Grundlegender SMS-Versand über die TeamMessage REST-API v1.  
* Sensoren für Guthaben (sms\_credit) und Verbrauch (sms\_sum).  
* Einfaches Logging-Panel.