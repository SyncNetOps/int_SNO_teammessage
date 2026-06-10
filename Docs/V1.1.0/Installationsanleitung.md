# **🛠 Ausführliche Installationsanleitung: SNO TeamMessage**

Diese Anleitung führt dich Schritt für Schritt durch die Installation der Integration und die Einrichtung der Dashboard-Karten.

## **Teil 1: Vorbereitung (TeamMessage-Konto)**

Bevor du startest, benötigst du die Zugangsdaten für die API:

1. Registriere dich auf [teammessage.eu/registrieren](https://teammessage.eu/registrieren).  
2. Notiere dir deine **Team-ID** (eine 5- oder 6-stellige Zahl).  
3. Gehe im Menü auf **Einstellungen \-\> API-Zugang / Tokens**.  
4. Erstelle einen Token für die **REST-API** und kopiere den angezeigten Zeichenschlüssel (Bearer Token).

## **Teil 2: Installation der Integration**

### **Variante A: Über HACS (Empfohlen & Einfach)**

1. Öffne **HACS** in der Seitenleiste deines Home Assistant.  
2. Klicke auf **Integrationen**.  
3. Klicke oben rechts auf die drei Punkte (...) und wähle **Benutzerdefinierte Repositories**.  
4. Trage bei URL https://github.com/SyncNetOps/int\_SNO\_teammessage ein.  
5. Wähle als Kategorie **Integration** und klicke auf "Hinzufügen".  
6. Suche nun in HACS nach "SNO \- TeamMessage" und klicke auf **Herunterladen**.  
7. **Starte Home Assistant komplett neu** (*Einstellungen \-\> System \-\> Neu starten*).

### **Variante B: Manuelle Installation**

1. Lade dir die neueste ZIP-Datei aus dem GitHub Release herunter.  
2. Entpacke die ZIP-Datei.  
3. Kopiere den gesamten Ordner sno\_teammessage in den Ordner custom\_components deines Home Assistant Servers (Zugriff z.B. via Samba oder File Editor Add-on). *(Pfad: /config/custom\_components/sno\_teammessage/)*  
4. **Starte Home Assistant komplett neu**.

## **Teil 3: Integration einrichten (Config Flow)**

1. Gehe in Home Assistant zu **Einstellungen \-\> Geräte & Dienste**.  
2. Klicke unten rechts auf **Integration hinzufügen**.  
3. Suche nach SNO \- TeamMessage.  
4. Gib in das Formular deine **Team-ID** und den **API Token** ein.  
5. Klicke auf Speichern. Das System testet nun die Verbindung.  
6. Fertig\! In der linken Seitenleiste findest du nun das "TeamMessage" Panel.

## **Teil 4: Dashboard Karten installieren (Optional, aber empfohlen)**

Zusätzlich zum Seitenleisten-Panel bringt die Integration wunderschöne Karten für dein normales Lovelace-Dashboard mit. Die Skript-Datei hierfür wurde bei der Installation bereits heruntergeladen und liegt im Ordner www/sno-teammessage/teammessage-cards.js.  
**So machst du die Karten sichtbar:**

1. Gehe in Home Assistant zu **Einstellungen \-\> Dashboards**.  
2. Klicke oben rechts auf die drei Punkte (...) und wähle **Ressourcen**. *(Hinweis: Falls du den Punkt "Ressourcen" nicht siehst, musst du unter deinem Benutzerprofil den "Erweiterten Modus" aktivieren).*  
3. Klicke unten rechts auf **Ressource hinzufügen**.  
4. Trage folgende URL ein: /local/sno-teammessage/teammessage-cards.js?v=1  
5. Wähle als Ressourcentyp **JavaScript Modul**.  
6. Klicke auf Erstellen.

**Karten auf dem Dashboard platzieren:**

1. Gehe auf dein gewünschtes Dashboard (z.B. Übersicht) und klicke oben rechts auf das Stift-Symbol (Dashboard bearbeiten).  
2. Klicke auf **Karte hinzufügen**.  
3. Scrolle ganz nach unten zu den benutzerdefinierten Karten. Du findest dort nun vier neue Karten:  
   * **TeamMessage Guthaben** (Optischer Ring mit Statistik)  
   * **TeamMessage Senden** (Schnellversand-Formular)  
   * **TeamMessage Logs** (Interaktives Logbuch mit Akkordeon)  
   * **TeamMessage Statistik** (Minimalistische Anzeige)  
4. Wähle eine Karte aus. Im visuellen Editor kannst du nun den Titel anpassen und (zwingend erforderlich) deine **Team-ID (tm)** eintragen.

*Profitipp:* Wenn die Entwickler ein Update der Karten herausbringen, ändere in der Ressourcen-Verwaltung einfach die Endung auf ?v=2 oder ?v=3, um den Browser-Cache zu leeren\!