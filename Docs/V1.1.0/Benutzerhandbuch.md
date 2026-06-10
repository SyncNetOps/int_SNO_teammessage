# **📖 Benutzerhandbuch: SNO \- TeamMessage (v1.1.0)**

Willkommen beim umfassenden Benutzerhandbuch für die SNO TeamMessage Integration. Dieses Dokument erklärt dir Schritt für Schritt, wie du die Integration bedienst, Nachrichten versendest und Automatisierungen erstellst.

## **1\. Vorbereitungen beim Dienstanbieter (TeamMessage.de)**

TeamMessage ist ein professioneller Dienst für den Versand von Multi-Channel-Nachrichten. Um ihn in Home Assistant zu nutzen, benötigst du ein Konto.

### **1.1 Registrierung**

1. Besuche [teammessage.eu/registrieren](https://teammessage.eu/registrieren).  
2. Fülle das Formular aus. Du erhältst zum Testen sofort 20 Frei-SMS.  
3. Logge dich nach der Bestätigung in das Web-Portal ein.

### **1.2 Team-ID und API-Token generieren**

Damit Home Assistant mit TeamMessage kommunizieren darf, brauchst du zwei Werte:

1. **Team-ID (Kundennummer):** Diese numerische ID (z.B. 102345\) findest du im Portal meist direkt oben rechts oder unter deinen Kontodaten.  
2. **API-Token (Bearer Token):** \* Gehe im Portal auf **Einstellungen** \-\> **API-Zugang / Tokens**.  
   * Erstelle einen neuen Token für die "REST-API".  
   * **WICHTIG:** Kopiere diesen langen Zeichencode. Er wird dir nur ein einziges Mal vollständig angezeigt\!

## **2\. Einrichtung in Home Assistant**

*(Für die genaue Ordner-/HACS-Installation siehe die installationsanleitung.md)*

1. Navigiere in Home Assistant zu **Einstellungen \-\> Geräte & Dienste**.  
2. Klicke unten rechts auf **Integration hinzufügen**.  
3. Suche nach SNO \- TeamMessage und wähle es aus.  
4. Ein Fenster öffnet sich:  
   * **Team-ID:** Trage deine numerische ID ein.  
   * **Bearer Token:** Füge den kopierten API-Schlüssel ein.  
5. Klicke auf "Absenden". Die Integration prüft nun die Verbindung. War alles korrekt, erscheint das SNO TeamMessage Panel in deiner linken Seitenleiste.

## **3\. Das SNO Panel bedienen**

Das Panel ist deine Kommandozentrale. Klicke in der linken Seitenleiste auf "TeamMessage". Es bietet 6 Tabs:

### **Tab 1: Dashboard**

Hier siehst du auf einen Blick dein **verfügbares SMS-Guthaben**, die Anzahl der insgesamt gesendeten Nachrichten und deinen aktiven Tarif.

### **Tab 2: Senden (Manueller Versand)**

Perfekt zum Testen oder für schnelle Durchsagen.

* **Typ:** Wähle, ob du an eine einzelne "Handynummer" oder an eine gespeicherte "Teamliste (Gruppe)" senden willst.  
* **Ziel:** Das Eingabefeld passt sich an. Bei Gruppen erscheint ein bequemes Dropdown-Menü deiner Listen. Bei Direktnummern (z.B. 0170 1234567\) formatiert die Integration die Nummer automatisch ins korrekte internationale Format (+491701234567).  
* **Kanal:** Wähle zwischen SMS oder Voice (die Nachricht wird dem Empfänger als echter Telefonanruf vorgelesen\!).

### **Tab 3: Logbuch**

Hier siehst du, ob Nachrichten angekommen sind.

* **Akkordeon-Design:** Klicke auf einen Eintrag, um Details aufzuklappen (Genauer Fehlercode, verwendetes Handynetz, Absenderkennung).  
* **Zahnrad-Symbol (Einstellungen):** Hier kannst du ein automatisches Neuladen aktivieren (z.B. alle 10 Sekunden) und bestimmen, wie viele Einträge (max. 1000\) geladen werden sollen.  
* **Filter:** Tippe eine Nummer oder einen Fehlercode in das Suchfeld, um das Logbuch in Echtzeit zu filtern.

### **Tab 4: Kontakte**

Verwalte deine Adressbücher direkt in HA\!

1. Wähle im Dropdown eine Teamliste aus und klicke auf "Laden".  
2. Du siehst nun alle Mitglieder.  
3. Klicke auf **"+ Neu"** oder auf **"Edit"** bei einem bestehenden Kontakt.  
4. Du kannst Name, Nummer und den bevorzugten **Zustellkanal** (SMS, Voice, E-Mail, Pushover, Fax) festlegen.

### **Tab 5: Einstellungen (Smarte Fallbacks)**

**Ein extrem wichtiges Feature\!** Hier definierst du globale Standard-Werte:

* **Standard Teamliste:** Wird als Abrechnungskonto für Direkt-SMS genutzt, wenn du in Automatisierungen keine Liste angibst.  
* **Standard Keyword & Absender-E-Mail:** Zwingend notwendig, wenn du an "geschlossene Gruppen" sendest.  
* *Tipp:* Füllst du diese Felder aus, bleiben deine YAML-Automatisierungen super kurz\!

## **4\. Automatisierungen erstellen (Der Dienst)**

Um Nachrichten automatisch zu versenden, nutzt du in deinen Skripten und Automatisierungen den Dienst: sno\_teammessage.send\_message

### **Beispiel 1: Einfache SMS (Nutzt Smart Fallbacks)**

Wenn du im Panel unter "Einstellungen" eine Standard-Teamliste definiert hast, reicht dieser winzige Code aus:  
action:  
  \- service: sno\_teammessage.send\_message  
    data:  
      message: "🚨 ALARM\! Der Wassersensor im Keller hat ausgelöst\!"

### **Beispiel 2: Direkt-Versand als Sprachanruf (Voice)**

Du willst nachts bei einem Feueralarm lieber aus dem Bett geklingelt werden?  
action:  
  \- service: sno\_teammessage.send\_message  
    data:  
      message: "Achtung\! Rauchentwicklung im Flur detektiert. Bitte sofort prüfen."  
      to\_mobile: "+491712345678"  
      channel: "voice"

*(Hinweis: Auch wenn du die Nummer versehentlich als 0171-2345678 schreibst, die Integration korrigiert sie für dich\!)*

### **Beispiel 3: Explizite Gruppen-Nachricht mit Absenderkennung**

action:  
  \- service: sno\_teammessage.send\_message  
    data:  
      message: "Die Heizung ist ausgefallen. Temperatur fällt."  
      teamlist\_email: "hausverwaltung@tmsg.de"  
      from\_mobile: "SmartHome" \# Der Empfänger sieht "SmartHome" statt einer Nummer

## **5\. Fehlerbehebung (Troubleshooting)**

Wenn etwas nicht klappt, schau ins **Logbuch (Tab 3\)** oder auf die Toast-Meldungen (unten rechts).

* **"API Kommunikationsfehler" beim Öffnen des Panels:** Home Assistant hat keine Internetverbindung oder dein API-Token ist ungültig/abgelaufen.  
* **Nachricht kommt nicht an (Fehlercode 2 / 1002):** Die Nummer existiert nicht oder das Handy ist dauerhaft ausgeschaltet.  
* **Fehlercode \-14 ("Geschlossene Gruppe"):** Die Teamliste, an die du sendest, akzeptiert nur Nachrichten von bekannten Absendern. Lösung: Trage deine registrierte E-Mail-Adresse unter "Einstellungen \-\> Standard Absender-E-Mail" als Fallback ein.  
* **Fehlercode \-13 (Rate Limit):** Du sendest zu viele Nachrichten pro Sekunde. Die API hat dich kurzzeitig blockiert.