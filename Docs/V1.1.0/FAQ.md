\### 5. `FAQ.md`

```markdown

\# ❓ Häufig gestellte Fragen (FAQ) - SNO TeamMessage



Hier findest du genau 39 Antworten auf die häufigsten Fragen rund um die SNO TeamMessage Integration.



\### Allgemeines \& Kosten

\*\*1. Was ist SNO TeamMessage?\*\*

Eine Home Assistant Integration, um SMS, Sprachanrufe und Push-Benachrichtigungen über TeamMessage.de zu versenden.



\*\*2. Ist die Nutzung kostenlos?\*\*

Die HA-Integration ist kostenlos. Für den Versand fallen Gebühren beim Dienstanbieter an.



\*\*3. Gibt es Test-Guthaben?\*\*

Ja! Wenn du dich auf teammessage.eu registrierst, erhältst du automatisch 20 Frei-SMS.



\*\*4. Welche Tarifpakete gibt es beim Anbieter?\*\*

Es gibt Prepaid (EASY), Monats-Flatrates (PAUSCHAL) und Postpaid auf Rechnung (PROFI).



\*\*5. Kann ich Nachrichten auch empfangen?\*\*

Ja, TeamMessage bietet Dienste wie `sms2team` und `sms2mail` an, um Antworten auf SMS zu empfangen.



\### Installation \& Einrichtung

\*\*6. Wie installiere ich die Integration am besten?\*\*

Über HACS (Home Assistant Community Store) als "Benutzerdefiniertes Repository".



\*\*7. Wie richte ich die Integration ein?\*\*

Gehe in HA zu \*Einstellungen -> Geräte \& Dienste -> Integration hinzufügen\*.



\*\*8. Wo finde ich meine Team-ID?\*\*

In deinem TeamMessage-Portal. Es ist deine numerische Kundennummer\[cite: 1, 2].



\*\*9. Wo generiere ich den API-Token?\*\*

Im TeamMessage-Portal unter \*Einstellungen -> API-Zugang / Tokens\*. Wähle "REST-API"\[cite: 1, 2].



\*\*10. Mein Token wird abgelehnt, warum?\*\*

Stelle sicher, dass du den Token komplett kopiert hast. Er wird dir nur ein einziges Mal vollständig angezeigt!



\### Panel \& UI Bedienung

\*\*11. Wo finde ich das SNO Panel?\*\*

In der linken Seitenleiste deines Home Assistant Dashboards unter "TeamMessage".



\*\*12. Das Panel bleibt schwarz (weißer Bildschirm), was tun?\*\*

Leere den Cache deines Browsers (Strg + F5).



\*\*13. Funktioniert das Panel auch auf dem Smartphone?\*\*

Ja, das Panel ist vollständig responsive gestaltet.



\*\*14. Was sind "Smarte Fallbacks" im Tab Einstellungen?\*\*

Hier definierst du Standard-Werte (z.B. deine Haupt-Teamliste). Fehlt diese Angabe in Automatisierungen, springt das Fallback ein.



\*\*15. Wie kann ich Kontakte löschen oder bearbeiten?\*\*

Im Tab "Kontakte". Lade eine Liste, klicke beim Mitglied auf "Edit" oder das rote "X".



\### Nachrichten Senden \& Funktionen

\*\*16. Kann ich eine SMS auch vorlesen lassen (Voice)?\*\*

Ja. Wähle im Sende-Panel "Sprachanruf (Voice)" oder setze in der Automatisierung `channel: "voice"`\[cite: 1, 2].



\*\*17. Wie formatiere ich Telefonnummern korrekt?\*\*

Am besten international (`+49170123...`). Die Integration erkennt und korrigiert Formate wie `0170...` automatisch\[cite: 1, 2].



\*\*18. Wie lang darf eine SMS sein?\*\*

Bis zu 1600 Zeichen (dies wird als verkettete Multi-SMS abgerechnet)\[cite: 1, 2].



\*\*19. Darf ich Emojis (🚨) verwenden?\*\*

Ja. Emojis zwingen die SMS in den Unicode-Modus (UCS-2), wodurch die Zeichengrenze von 160 auf 70 Zeichen pro SMS sinkt\[cite: 1, 2].



\*\*20. Was bewirkt der Parameter `from\_mobile`?\*\*

Damit änderst du den Absender auf dem Handydisplay (z.B. "SmartHome"). Max. 11 alphanumerische Zeichen\[cite: 1, 2].



\*\*21. Kann ich direkt an Handynummern senden?\*\*

Ja. Trage die Nummer im Feld `to\_mobile` ein\[cite: 1, 2].



\*\*22. Was ist eine "Geschlossene Gruppe"?\*\*

Eine Teamliste, die aus Sicherheitsgründen nur Nachrichten von vorab autorisierten Absendern zulässt.



\*\*23. Wofür brauche ich das Keyword-Feld?\*\*

Bei geschlossenen Gruppen musst du dich beim API-Aufruf autorisieren\[cite: 1, 2].



\*\*24. Kann ich den Versand simulieren?\*\*

Ja. Setze in deiner YAML-Aktion `test: true`\[cite: 1, 2].



\*\*25. Kann ich eine Nachricht terminieren?\*\*

Ja, übergebe die Parameter `date: "YYYY-MM-DD"` und `time: "HH:MM"`\[cite: 1, 2].



\### Automatisierungen (YAML)

\*\*26. Wie heißt der Dienst zum Senden?\*\*

Der Dienst in HA heißt `sno\_teammessage.send\_message`.



\*\*27. Muss ich in jeder Aktion die `teamlist\_email` angeben?\*\*

Nein, nicht wenn du unter "Einstellungen" eine Standard-Liste hinterlegt hast.



\*\*28. Was passiert, wenn ich `to\_mobile` und `teamlist\_email` weglasse?\*\*

Die Aktion schlägt fehl, sofern kein Fallback definiert ist.



\### Fehlercodes \& Problembehebung

\*\*29. Fehler "API Kommunikationsfehler" beim Panel-Start?\*\*

Dein HA-System hat keine Internetverbindung oder dein API-Token ist gesperrt/gelöscht.



\*\*30. Im Logbuch steht Fehler "2" oder "1002"?\*\*

Die Nachricht konnte nicht zugestellt werden (z.B. Rufnummer existiert nicht, Handy aus).



\*\*31. Was bedeutet API Fehlercode "-1"?\*\*

Die übergebene Team-ID fehlt oder ist ungültig\[cite: 1, 2].



\*\*32. Was bedeutet API Fehlercode "-2"?\*\*

Die E-Mail-Adresse der Teamliste fehlt oder das Listen-Format ist falsch\[cite: 1, 2].



\*\*33. Was bedeutet API Fehlercode "-5"?\*\*

Die Nachricht fehlt oder ist mit über 1600 Zeichen zu lang\[cite: 1, 2].



\*\*34. Was bedeutet API Fehlercode "-6"?\*\*

Die Zielrufnummer (`to\_mobile`) ist völlig ungültig und konnte auch durch die Auto-Korrektur nicht gerettet werden\[cite: 1, 2].



\*\*35. Was bedeutet API Fehlercode "-10"?\*\*

Account not found. Überprüfe die Teamlisten-Adresse und das Keyword\[cite: 1, 2].



\*\*36. Was bedeutet API Fehlercode "-12"?\*\*

IP-Adresse nicht in der Whitelist. Prüfe deine Einstellungen im Portal.



\*\*37. Was bedeutet API Fehlercode "-13"?\*\*

Rate-Limit überschritten. Du hast in zu kurzer Zeit zu viele API-Anfragen gesendet (Max. 60/Min)\[cite: 1, 2].



\*\*38. Was bedeutet API Fehlercode "-14"?\*\*

Unautorisierter Sendeversuch. Du sendest an eine geschlossene Gruppe, hast aber keine berechtigte `sender\_email` angegeben.



\### Dashboard \& Custom Cards

\*\*39. Wie aktiviere ich die Dashboard-Karten?\*\*

Gehe zu \*Einstellungen -> Dashboards -> Ressourcen\* und füge `/local/sno-teammessage/teammessage-cards.js?v=17` als "JavaScript Modul" hinzu. Erhöhe die `v=` Nummer bei jedem Update!

