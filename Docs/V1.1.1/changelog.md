# changelog.md

## [1.1.1] - 2026-06-11
### Hinzugefügt
- **Smarte Dienst-Parameter (`services.yaml`)**: Neuer Parameter `target_type` hinzugefügt, um den Dienst (`sno_teammessage.send_message`) visuell und logisch in "Direkt an Handynummer" und "An Gruppe / Teamliste" zu unterteilen.
- **Smart Group Resolver (`services.py`)**: Implementierung einer intelligenten Auto-Resolve Funktion. Bei der Auswahl einer Gruppe/Teamliste ruft das Backend nun im Hintergrund vollautomatisch alle zugehörigen Listenmitglieder ab, extrahiert die Rufnummern (SMS/Voice-Kanäle) und transformiert diese in das von der TeamMessage REST-API geforderte, kommagetrennte Format (`to_mobile`).
- **Erweiterte UI Felder (`teammessage-panel.js`)**: Im Frontend-Panel wurden dedizierte Eingabefelder für `Keyword` und `Absender E-Mail` beim Gruppenversand integriert, um die Authentifizierung in geschlossenen Gruppen zu gewährleisten.
- **Auto-Heal Payload (`api.py`)**: Automatisiertes Füllen fehlender Felder via `GET`-Fallback-Anfrage beim Aktualisieren von Kontakten implementiert.
- **Sicheres URL-Routing (`api.py`)**: Funktion `get_teamlist_members` hinzugefügt, welche Endpunkte relativ und absolut fehlerfrei aus der Basis-Konstante (`API_BASE_URL`) generiert.

### Behoben
- **Fehler HTTP 422 (`mb is missing`) beim Editieren von Kontakten**: Die TeamMessage API (Pydantic) erwartete die Daten verschachtelt in einem `data`-Objekt. Der JSON-Payload in `views.py` und dem JS-Frontend wurde entsprechend umgebaut.
- **Fehler `invalid_to_mobile` beim Gruppenversand**: Die API lehnte Listen-IDs auf dem SMS-Endpunkt ab, da zwingend physische Handynummern im Feld `to_mobile` gefordert werden. Gelöst durch den neuen *Smart Group Resolver*.
- **Fehler `closed_group_auth`**: Wurde behoben, indem das Frontend nun die benötigten Auth-Felder (`keyword` und `sender_email`) fehlerfrei durch die `views.py` Proxy-Schicht transportiert.
- **Verbindungsfehler (`/teamlist/members/`)**: Behoben durch das sichere, dynamische Zusammensetzen absoluter URLs innerhalb der `api.py`-Klasse, anstatt unvollständiger Pfade.