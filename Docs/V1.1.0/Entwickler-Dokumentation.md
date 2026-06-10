# **💻 Entwickler-Dokumentation: SNO \- TeamMessage**

Diese Dokumentation richtet sich an Python- und Frontend-Entwickler, die die Architektur der sno\_teammessage Integration verstehen, warten oder durch eigene Dashboard-Karten erweitern möchten.

## **1\. Systemarchitektur & Philosophie**

Die Integration verbindet Home Assistant mit der TeamMessage.de REST API v1.1.0 (OAS3 Spezifikation). Sie ist darauf ausgelegt, maximale Fehlertoleranz zu bieten und sensible Daten (wie den Bearer Token) strikt vom Browser-Frontend fernzuhalten.  
Die Architektur ist in zwei Layer geteilt:

1. **Python Backend (custom\_components/sno\_teammessage)**: Handhabt den API-Client (aiohttp), den Config-Flow, die State-Sensoren und stellt einen HTTP Reverse-Proxy bereit.  
2. **JavaScript Frontend (frontend/teammessage-panel.js)**: Eine vollwertige Single Page Application (SPA), realisiert als Native Web Component.

## **2\. Dateistruktur & Komponenten-Analyse**

### **2.1 Backend / Core**

* \_\_init\_\_.py: Der Bootstrap-Loader. Initialisiert den TeamMessageApiClient, registriert den ha\_webhook für eingehende Nachrichten (DLR-Receipts) und bindet den Custom Panel Pfad ein.  
* api.py: Der asynchrone HTTP-Wrapper. Fügt den Authorization: Bearer \<token\> Header an jeden Request an. Wandelt JSON-Responses in Python Dicts um und übersetzt negative API-Return-Codes in spezifische Exceptions (TeamMessageAPIError).  
* coordinator.py & sensor.py: Implementieren das DataUpdateCoordinator-Pattern. Sie rufen /teamlist/credit/ in festen Intervallen ab und aktualisieren die HA-Sensoren (sms\_credit, sms\_sum), ohne die API zu überlasten.

### **2.2 Der Service-Layer (services.py)**

Registriert den Dienst sno\_teammessage.send\_message. **Besonderheit (Fehlertoleranz):** Beinhaltet die Funktion format\_phone\_number(). Da die TeamMessage API extrem strikt ist (Fehlercode \-6 bei falsch formatierten Nummern), parst diese Funktion Strings per Regex (re.sub). Nullen werden in Ländercodes übersetzt (0170 \-\> \+49170) und Whitespaces entfernt, *bevor* der Payload an die API geht. Zudem greift hier die **Smart Fallbacks** Logik: Fehlen im Service-Call Parameter wie keyword oder teamlist\_email, werden diese aus entry.options (dem UI-Einstellungs-Speicher) injiziert.

### **2.3 Der Proxy-Layer (views.py)**

Dies ist das Herzstück der Frontend-Backend-Kommunikation. Klasse: TeamMessageApiView (erbt von HomeAssistantView).

* **Zweck 1 (CORS & Security):** Das JS-Panel sendet Requests an /api/sno\_teammessage/proxy?endpoint=.... Die View injiziert den Token und leitet den Request an teammessage.de weiter. Das Frontend sieht den Token nie.  
* **Zweck 2 (Options Routing):** Ist der Parameter endpoint gleich options, leitet der Proxy den Request nicht ins Internet, sondern liest/schreibt nativ in die Home Assistant entry.options (für die Smart Fallbacks).

### **2.4 Frontend (teammessage-panel.js)**

Eine Vanilla-JS Klasse TeamMessagePanel (erweitert HTMLElement).

* **Design:** Verzichtet auf ein Shadow-DOM, damit CSS-Variablen von Home Assistant (Themes, var(--primary-color)) problemlos durchgreifen. Nutzt Glassmorphism-Effekte.  
* **Event-Handling:** Nutzt Promise.all für paralleles Initial-Laden. Bietet ein dynamisches Akkordeon für das Logbuch und Modals für die CRUD-Operationen der Kontaktverwaltung.

## **3\. API Besonderheiten & Workarounds**

* **GET vs. PUT/DELETE Parameter:** Die API verlangt für Endpunkte wie /teamlist/member/ bei GET-Requests Query-Parameter (?tl=123). Bei PUT (Update) und DELETE verlangt sie diese Query-Parameter *zusätzlich* zur JSON-Body-Payload. Der Proxy in views.py ist so gebaut, dass er request.query extrahiert und in aiohttp explizit als params=query\_params durchschleift.  
* **Negative Statuscodes:** Die API v1.1.0 gibt Validierungsfehler nicht primär über HTTP 400 zurück, sondern über HTTP 200 mit einem JSON-Body, der {"code": \-14, "message": "..."} enthält. Die api.py fängt Werte \< 0 ab und wirft sie als Fehler, damit das Frontend sie rot als Toast anzeigen kann.

## **4\. Leitfaden für Dashboard Custom Cards Entwickler**

Wenn du eigene Lovelace-Karten für diese Integration schreibst, beachte folgendes:

### **4.1 Kommunikation (Daten lesen)**

Sende niemals Fetch-Requests direkt an teammessage.de. Nutze die HA-Funktion hass.callApi und route durch den Proxy:  
``const res = await hass.callApi('GET', `sno_teammessage/proxy?endpoint=${encodeURIComponent('/teamlist/credit/')}`);``  
`console.log(res.sms_credit);`

### **4.2 Aktionen (Nachrichten senden)**

Verwende für den Versand **immer** den Home Assistant Service. Nur so profitierst du von der in Python geschriebenen Rufnummern-Korrektur und den Smart Fallbacks\!  
`hass.callService('sno_teammessage', 'send_message', {`  
    `message: "Test von der Custom Card",`  
    `to_mobile: this.querySelector('#input-num').value // Auch wenn "0170..." eingegeben wird, das Backend fixt es!`  
`});`  
