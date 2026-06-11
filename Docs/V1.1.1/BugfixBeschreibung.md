# BugfixBeschreibung.md

# Technischer Bugfix Report - V1.1.1

Dieses Dokument beschreibt die Ursachen und Lösungen der kritischen Payload- und Validierungs-Fehler, die nach dem Architektur-Update auf die TeamMessage REST-API v1.1.0 aufgetreten sind. Die strikte Typisierung durch die neue externe API erforderte einen Umbau der asynchronen Dienstlogik innerhalb der Home Assistant Integration.

## 1. HTTP 422: Missing Field `mb` beim Speichern von Kontakten
**Symptom:** Beim Versuch, einen bestehenden Kontakt über das Custom Panel in Home Assistant zu ändern, wurde ein Validierungsfehler (HTTP 422) geworfen: `{'type': 'missing', 'loc': ['body', 'data', 'mb'], 'msg': 'Field required'}`.
**Ursache:** Das JS-Frontend schickte die Daten als flache Hierarchie (`{"mb_name": "...", "mb_contact": "..."}`). Die neue API erwartete diese jedoch zwingend verschachtelt im JSON-Objekt `data`.
**Fix:** Der JSON-Payload-Builder in `teammessage-panel.js` (`saveContact()`) wurde umgeschrieben. Die `api.py` wurde zudem mit einem "Auto-Heal"-Mechanismus ausgestattet: Fehlen Pflichtfelder in der PUT-Anfrage, pausiert die Methode, lädt den bestehenden Datensatz per HTTP-GET nach, füllt die Lücken auf und sendet erst dann den bereinigten Payload.

## 2. API Fehler: `invalid_to_mobile` beim Senden an Gruppen
**Symptom:** Sowohl über den HA-Dienst (`send_message`) als auch über das Panel schlug der Versand an Listen (Team-IDs) mit dem Fehler "invalid_to_mobile - to_mobile (phone number) is missing" fehl.
**Ursache:** Die TeamMessage REST-API verarbeitet den Endpunkt `/sms/send/` strikt. Sie erwartet bei SMS und Voice immer kommagetrennte Handynummern im Parameter `to_mobile`. Das reine Übergeben einer Listen-ID (`tl`) triggert bei der externen API keinen automatischen Broadcast an die Listenmitglieder.
**Fix:** Implementierung des **Smart Group Resolver** in der `services.py`.
- Sobald das Attribut `target_type: "list"` erkannt wird, ruft die Integration via `api.get_teamlist_members()` asynchron alle Mitglieder der Teamliste ab.
- Das JSON-Response wird geparst, nach `mb_contacttype` (sms, voice) gefiltert und bereinigt.
- Die Integration baut daraus den geforderten kommagetrennten String (z.B. `+491701...,+491602...`) und übergibt diesen transparent an den SMS-Endpunkt.

## 3. API Fehler: `closed_group_auth`
**Symptom:** Beim Senden an geschlossene Gruppen lehnte die API die Anfrage aufgrund fehlender Authentifizierung ab.
**Ursache:** Das Custom Panel bot keine Eingabefelder für `keyword` und `sender_email` (Absender E-Mail) und verschluckte diese bei der Payload-Generierung.
**Fix:** Dynamische UI-Erweiterung (`teammessage-panel.js`). Wird "An Teamliste" ausgewählt, klappen dedizierte Auth-Felder aus. Diese werden vom JavaScript direkt an den HA Websocket-Bus und anschließend an den API-Client weitergeleitet.

## 4. Unklare Dienst-Aufrufe (UI/UX Fehler)
**Symptom:** Die Dienst-Maske in HA (`services.yaml`) erlaubte es, "Liste" und "Direkt" vermischt zu konfigurieren, was zu Routing-Abstürzen führte.
**Fix:** Einführung des Dropdowns `target_type`. Die Maske zwingt den Nutzer nun zu einer klaren Unterscheidung zwischen Direktversand und Listenversand, wodurch fehlgeleitete Parameter (`channel: sms` in Verbindung mit Listen-IDs) ausgeschlossen werden.