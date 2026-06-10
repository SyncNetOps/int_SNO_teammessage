### 3. Technische Entwickler-Informationen (`Entwicklerdokumentation.md`)

```markdown
# Technische Entwickler-Informationen (v1.0.0)

Diese Dokumentation richtet sich an Entwickler, die die `sno_teammessage` Integration pflegen, debuggen oder erweitern möchten.

## 1. Architektur & Ordnerstruktur
Die Integration folgt den Best Practices für moderne Home Assistant Custom Components (asynchron, Config Flow, DataUpdateCoordinator).

* `__init__.py`: Setup der Integration, Initialisierung von API-Client und Coordinator. Registriert das Custom Panel.
* `config_flow.py`: Handhabt die UI-Einrichtung (Eingabe von Team-ID und Token).
* `api.py`: Der asynchrone REST-Client (`TeamMessageApiClient`). Wickelt die gesamte Netzwerkkommunikation mit `aiohttp` ab.
* `services.py`: Definiert und registriert den Dienst `sno_teammessage.send_message`. Übernimmt das kritische Parsing und Datenaufbereitung (Routing).
* `sensor.py`: Definiert die Entitäten (`sms_credit`, `sms_sum`, `api_health`).
* `coordinator.py`: Der `DataUpdateCoordinator`, der periodisch (z.B. alle 5 Minuten) `/api/v1/teamlist/credit/` pollt.
* `panel.py` / `views.py`: Bereitstellung des Custom Panels und des API-Proxys für Log-Abfragen im Frontend.

## 2. API Besonderheiten & Fallstricke (WICHTIG!)
Die TeamMessage REST-API (FastAPI/Pydantic basiert)[cite: 1] weist historisch gewachsene Besonderheiten auf. Diese müssen bei jeder Weiterentwicklung strikt beachtet werden, sonst antwortet der Server mit HTTP 422 (Unprocessable Entity) oder HTTP 400.

### A) Strikte JSON-Struktur
Der POST-Endpunkt `/api/v1/sms/send/` erwartet `application/json`[cite: 1].
* **Keine leeren Strings bei Datentypen:** Ein leeres Feld `"tl": ""` führt zu einem Pydantic `int_parsing` Error. Wenn ein Parameter nicht genutzt wird, darf der Key **nicht** im Payload gesendet werden. `services.py` generiert daher das JSON dynamisch.
* **Key-Namen:** Die API erwartet das Feld `message` (früher `msg`). Wir senden in `services.py` sicherheitshalber beide.

### B) Das Routing-Problem (`tl` vs `teamlist_email`)
Jede Nachricht – auch direkte SMS (`to_mobile`) – benötigt im Backend einen Abrechnungs-Kontext[cite: 1, 2].
* Wenn der Nutzer eine Teamliste angibt: Ist es eine Zahl, mappen wir auf `tl`. Ist es ein String, mappen wir auf `teamlist_email`.
* **Fallback-Logik:** Lässt der Nutzer das Listenfeld leer (weil er z.B. nur eine Direkt-SMS senden will), schlägt die API mit *"-1: team_id missing / -2: teamlist missing"* fehl. Daher injiziert `services.py` in diesem Fall automatisch die generelle `team_id` der HA-Konfiguration in den Parameter `tl`.

### C) Authentifizierung geschlossener Gruppen (Das Keyword-Problem)
Für geschlossene Gruppen benötigt die API `sender_email` und das Keyword.
* Bei Legacy-Schnittstellen (E-Mail) wurde das Keyword in den Betreff (`subject`) geschrieben.
* Bei der REST-API muss es **als separater Key** gesendet werden. Die API verlangt hierfür das Feld `ky` (und teilweise `keyword`)[cite: 1]. Die Integration schickt in `services.py` das vom Nutzer eingegebene "keyword" aktiv als `ky` und `keyword` im JSON-Root mit, um einen "UNAUTHORISIERTER SENDEVERSUCH" (Error -14) zu verhindern.

## 3. Endpunkte[cite: 1]
* **Senden:** `POST /api/v1/sms/send/` -> Liefert Code +1 bei Erfolg.
* **Guthaben:** `GET /api/v1/teamlist/credit/` -> Liefert `sms_credit`, `sms_sum`.
* **Logs:** `GET /api/v1/logging/sms/` -> Liefert die neuesten Statusberichte (Code 0 = Zugestellt).
* **Gesundheit:** `GET /api/v1/health/` -> Nutzt die Integration beim Setup zur Verbindungskontrolle.

## 4. Zukünftig: (Roadmap)
* **Optionen-Flow:** Hinzufügen eines `OptionsFlow` in `config_flow.py`, damit der Nutzer einen globalen Standard-Absender (`sender_email`) und ein Standard-Keyword definieren kann.
* **Webhook-Integration:** Implementierung eines lokalen HA-Webhooks, um DLR (Delivery Receipts) von TeamMessage in Echtzeit zu empfangen, anstatt sie zu pollen.
