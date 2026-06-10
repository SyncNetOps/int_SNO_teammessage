# Benutzerhandbuch: TeamMessage für Home Assistant

Willkommen zur TeamMessage-Integration! Dieses Handbuch führt dich Schritt für Schritt durch die Einrichtung und Nutzung aller Funktionen.

## 1. Vorbereitungen bei TeamMessage
Um die Integration zu nutzen, benötigst du ein Konto bei [TeamMessage.de](https://www.teammessage.de).
1. Logge dich in dein Portal ein.
2. Notiere dir deine **Team-ID** (6-stellige Kundennummer)[cite: 1, 2].
3. Erstelle im Bereich API/Sicherheit ein neues **API-Token** (Bearer Token)[cite: 1].
4. (Optional) Lege eine Teamliste an (z.B. `alarme@tmsg.de`) und füge Mitglieder hinzu.

## 2. Einrichtung in Home Assistant
1. Gehe zu **Einstellungen -> Geräte & Dienste**.
2. Klicke auf **Integration hinzufügen**, suche nach **TeamMessage**.
3. Gib deine Team-ID und das API-Token ein.
4. Home Assistant erstellt nun automatisch Sensoren für dein Guthaben und den API-Status. Zudem erscheint ein neues "TeamMessage" Panel in der Seitenleiste.

## 3. Der Sende-Dienst (`sno_teammessage.send_message`)
Der Kern dieser Integration ist der Dienst zum Versenden von Nachrichten. Du kannst ihn in deinen Automatisierungen oder Skripten verwenden.

### Verfügbare Parameter
* **`message`** *(Pflichtfeld)*: Der Text deiner Nachricht (max. 1600 Zeichen)[cite: 1].
* **`teamlist_email`** *(Pflichtfeld zur Abrechnung)*: Die E-Mail deiner Teamliste (z.B. `meinteam@tmsg.de`) oder die Listen-ID (`tl`). Nutzt du eine Direkt-SMS, übernimmt die Integration automatisch deine Haupt-Team-ID als Fallback.
* **`to_mobile`** *(Optional)*: Handynummer für direkte SMS (im Format `+491701234567`)[cite: 1, 2].
* **`sender_email`** *(Optional)*: Nötig für "Geschlossene Gruppen". Muss die E-Mail eines berechtigten Mitglieds sein[cite: 1, 2].
* **`keyword`** *(Optional)*: Das Geheim-Passwort für die Teamliste. Wird vom System sicher übertragen (`ky` Parameter)[cite: 1, 2].
* **`from_mobile`** *(Optional)*: Alphanumerischer Absender (max. 11 Zeichen, z.B. "HA-ALARM")[cite: 1, 2].
* **`flash`** *(Optional)*: Sendet eine Flash-SMS direkt auf das Display.
* **`ucs2`** *(Optional)*: Für Emojis oder spezielle Sonderzeichen[cite: 1].

## 4. Praktische Beispiele für Automatisierungen

### Beispiel 1: Direkt-SMS an dich selbst
Sendet eine SMS an eine einzelne Nummer. Das System nutzt im Hintergrund automatisch deine Team-ID als `tl` für die Abrechnung.

```yaml

action: sno_teammessage.send_message
data:
  message: "Wassermelder im Keller hat ausgelöst!"
  to_mobile: "+491712345678"
  from_mobile: "SMARTHOME"

```
  ### Beispiel 2: Alarm an eine offene Teamliste

Sendet eine Nachricht an alle Mitglieder der Teamliste it-notfall@---xx.de.

```yaml

action: sno_teammessage.send_message
data:
  message: "Serverraum Temperatur kritisch!"
  teamlist_email: "it-notfall@---xx.de"
```

  ### Beispiel 3: Alarm an eine "Geschlossene Gruppe" (Maximale Sicherheit)
  Wenn deine Liste als "Geschlossene Gruppe" konfiguriert ist, darf nicht jeder senden. Du musst dich authentifizieren.

  ```yaml
action: sno_teammessage.send_message
data:
  message: "Einbruchalarm ausgelöst!"
  teamlist_email: "sicherheit@--xxx.de"
  sender_email: "deine-mail@example.com"
  keyword: "Geheim123"
  flash: true

```

    ### Beispiel 4: Sprachanruf auslösen (Voice)
    Wenn ein Kontakt in deiner Teamliste als Kanal "Voice" hinterlegt hat, wandelt TeamMessage den Text via Text-to-Speech in einen Sprachanruf um. Sende einfach Text an die entsprechende Liste:

```yaml
action: sno_teammessage.send_message
data:
  message: "Dies ist ein automatischer Sprachanruf. Der Rauchmelder meldet Feuer."
  teamlist_email: "voice-alarm@tmsg.de"
```

# 5. Das TeamMessage Panel

In der linken Seitenleiste findest du das TeamMessage Panel. Hier siehst du die letzten SMS-Protokolle (Zustellstatus, Zeitstempel, Fehlercodes) live aus deinem Konto, ideal zur Fehlerbehebung.