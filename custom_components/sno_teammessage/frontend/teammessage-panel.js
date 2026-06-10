// custom_components/sno_teammessage/frontend/teammessage-panel.js | v1.1.0
class TeamMessagePanel extends HTMLElement {
    set hass(hass) {
        this._hass = hass;
        if (!this._initialized) {
            this._initialized = true;
            this.currentTab = 'dashboard';
            this.logData = [];
            this.teamlists = [];
            this.currentContacts = [];
            this._loadedOptions = {};
            
            // Neue Logbuch Einstellungen
            this.logSettings = {
                autoRefresh: false,
                interval: 30000,
                limit: 50
            };
            this.logTimer = null;

            this.render();
            this.fetchInitialData();
        }
    }

    async fetchInitialData() {
        this.showToast('Initialisiere Panel...', 'info');
        await Promise.all([
            this.fetchTeamlists(),
            this.fetchDashboardInfo(),
            this.fetchLogs(true), // Silent fetch
            this.fetchOptions()
        ]);
        this.switchTab(this.currentTab);
        this.applyLogTimer();
    }

    disconnectedCallback() {
        if (this.logTimer) {
            clearInterval(this.logTimer);
        }
    }

    render() {
        this.innerHTML = `
            <style>
                :host {
                    display: block; padding: 20px; box-sizing: border-box;
                    background: var(--primary-background-color); color: var(--primary-text-color);
                    font-family: var(--paper-font-body1_-_font-family, Roboto, sans-serif);
                    min-height: 100vh; overflow-y: auto;
                }
                .glass {
                    background: rgba(var(--rgb-card-background-color, 255, 255, 255), 0.05);
                    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(var(--rgb-primary-text-color, 255, 255, 255), 0.1);
                    border-radius: 16px; padding: 24px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease; margin-bottom: 24px; position: relative;
                }
                .nav { display: flex; gap: 12px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 8px; }
                .nav button {
                    background: transparent; border: 1px solid var(--primary-color);
                    color: var(--primary-text-color); padding: 10px 20px; border-radius: 20px;
                    cursor: pointer; transition: 0.2s; white-space: nowrap; font-weight: bold;
                }
                .nav button.active, .nav button:hover { background: var(--primary-color); color: #fff; }
                .tab-content { display: none; animation: fadeIn 0.4s ease-in-out; }
                .tab-content.active { display: block; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                input, select, textarea {
                    width: 100%; padding: 12px; margin: 8px 0 20px; border-radius: 8px;
                    border: 1px solid var(--divider-color); background: var(--card-background-color);
                    color: var(--primary-text-color); box-sizing: border-box; font-family: inherit;
                }
                .btn-primary { background: var(--primary-color); color: #fff; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: opacity 0.2s; }
                .btn-primary:hover { opacity: 0.8; }
                .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
                .btn-secondary { background: var(--secondary-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color); padding: 8px 16px; border-radius: 6px; cursor: pointer; }
                .btn-danger { background: var(--error-color); color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
                
                table { width: 100%; border-collapse: collapse; }
                th, td { text-align: left; padding: 12px; border-bottom: 1px solid var(--divider-color); }
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
                @media(max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } }
                
                .stat-box { text-align: center; padding: 20px; border-radius: 12px; background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.1); }
                .stat-box h2 { margin: 0; font-size: 2.5rem; color: var(--primary-color); }
                
                .menu-btn { background: transparent; border: none; color: var(--primary-text-color); cursor: pointer; padding: 5px; border-radius: 50%; transition: background 0.2s; display: flex; align-items: center; justify-content: center; }
                .menu-btn:hover { background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.1); color: var(--primary-color); }
                .menu-btn svg { width: 24px; height: 24px; fill: currentColor; }

                /* Logbuch Akkordeon Styles */
                .log-entry { border-bottom: 1px solid var(--divider-color); transition: background 0.2s; }
                .log-entry:last-child { border-bottom: none; }
                .log-entry:hover { background: rgba(0,0,0,0.05); }
                .log-summary { display: flex; align-items: center; padding: 12px 8px; cursor: pointer; gap: 12px; }
                .log-icon { flex-shrink: 0; display: flex; align-items: center; }
                .log-info { flex: 1; min-width: 0; }
                .log-info-top { display: flex; justify-content: space-between; font-weight: bold; font-size: 0.95rem; }
                .log-info-bottom { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--secondary-text-color); margin-top: 4px; }
                .log-details { display: none; padding: 12px; background: rgba(var(--rgb-secondary-background-color, 0,0,0), 0.2); border-radius: 0 0 8px 8px; font-size: 0.85rem; line-height: 1.4; border-left: 3px solid var(--primary-color); margin: 0 8px 12px 8px;}
                .log-details.open { display: block; animation: slideDown 0.3s ease; }
                .detail-row { display: flex; margin-bottom: 6px; }
                .detail-label { width: 95px; font-weight: 600; color: var(--secondary-text-color); flex-shrink:0;}
                .detail-value { flex: 1; word-break: break-word; }
                .detail-text { background: rgba(0,0,0,0.1); padding: 8px; border-radius: 4px; margin-top: 8px; font-family: monospace; white-space: pre-wrap; font-size: 0.9rem;}
                .status-pulse { animation: pulseIcon 1.5s infinite; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulseIcon { 0% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.5; transform: scale(0.9); } }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); backdrop-filter: blur(5px);
                    display: none; align-items: center; justify-content: center; z-index: 1000;
                }
                .modal-overlay.active { display: flex; animation: fadeIn 0.2s; }
                .modal-content { background: var(--card-background-color); padding: 24px; border-radius: 16px; width: 90%; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }

                #toast {
                    position: fixed; bottom: 20px; right: 20px; padding: 16px 24px; border-radius: 8px;
                    color: white; opacity: 0; transition: 0.3s; z-index: 9999; pointer-events: none;
                }
                .toast-info { background: var(--info-color, #2196f3); }
                .toast-success { background: var(--success-color, #4caf50); }
                .toast-error { background: var(--error-color, #f44336); }
            </style>
            
            <div id="toast"></div>

            <!-- Modal for Contact CRUD -->
            <div id="contact-modal" class="modal-overlay">
                <div class="modal-content">
                    <h3 id="modal-title" style="margin-top:0;">Mitglied bearbeiten</h3>
                    <input type="hidden" id="modal-mb-id">
                    <label>Name</label>
                    <input type="text" id="modal-name" placeholder="Max Mustermann">
                    <label>Kontakt (Nummer / E-Mail)</label>
                    <input type="text" id="modal-contact" placeholder="+491701234567">
                    <label>Zustellkanal</label>
                    <select id="modal-type">
                        <option value="sms">SMS Textnachricht</option>
                        <option value="voice">Sprachanruf (Voice)</option>
                        <option value="email">E-Mail</option>
                        <option value="pushover">Pushover</option>
                        <option value="fax">Fax</option>
                    </select>
                    <div style="display:flex; justify-content:flex-end; gap:10px;">
                        <button class="btn-secondary" id="btn-modal-cancel">Abbrechen</button>
                        <button class="btn-primary" id="btn-modal-save">Speichern</button>
                    </div>
                </div>
            </div>

            <!-- Modal for Log Settings -->
            <div id="log-settings-modal" class="modal-overlay">
                <div class="modal-content">
                    <h3 style="margin-top:0;">Logbuch Einstellungen</h3>
                    
                    <label style="display:flex; align-items:center; cursor:pointer; margin-bottom: 15px;">
                        <input type="checkbox" id="log-opt-auto" style="width:auto; margin:0 10px 0 0;">
                        Automatisch aktualisieren
                    </label>
                    
                    <label>Aktualisierungsintervall</label>
                    <select id="log-opt-interval">
                        <option value="10000">10 Sekunden</option>
                        <option value="30000">30 Sekunden</option>
                        <option value="60000">1 Minute</option>
                        <option value="300000">5 Minuten</option>
                    </select>
                    
                    <label>Anzahl der Einträge (max. 1000)</label>
                    <input type="number" id="log-opt-limit" min="1" max="1000" placeholder="50">
                    
                    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top: 20px;">
                        <button class="btn-secondary" id="btn-log-modal-cancel">Schließen</button>
                        <button class="btn-primary" id="btn-log-modal-save">Übernehmen</button>
                    </div>
                </div>
            </div>

            <!-- Header with Burger Menu -->
            <div class="glass" style="display:flex; align-items:center;">
                <button class="menu-btn" id="burger-btn" title="Menü öffnen" style="margin-right: 15px;">
                    <svg viewBox="0 0 24 24"><path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/></svg>
                </button>
                <div style="flex-grow:1; display:flex; justify-content:space-between; align-items:center;">
                    <h1 style="margin:0;">SNO TeamMessage</h1>
                    <small>v1.1.0</small>
                </div>
            </div>

            <div class="nav">
                <button data-tab="dashboard" class="active">Dashboard</button>
                <button data-tab="send">Senden</button>
                <button data-tab="logs">Logbuch</button>
                <button data-tab="contacts">Kontakte</button>
                <button data-tab="settings">Einstellungen</button>
                <button data-tab="help">Hilfe / Doku</button>
            </div>

            <!-- Tab: Dashboard -->
            <div id="tab-dashboard" class="tab-content active glass">
                <h2>Übersicht</h2>
                <div class="grid-2">
                    <div class="stat-box">
                        <h2 id="dash-credit">-</h2>
                        <p>Verfügbares Guthaben</p>
                    </div>
                    <div class="stat-box">
                        <h2 id="dash-used">-</h2>
                        <p>Gesendet Gesamt</p>
                    </div>
                </div>
                <div style="margin-top: 20px;">
                    <h3>Information</h3>
                    <p>Aktiver Tarif: <strong id="dash-tariff">Lädt...</strong></p>
                    <p>Um schnelle Automatisierungen in Home Assistant zu erstellen, nutze den Dienst <code>sno_teammessage.send_message</code>.</p>
                </div>
            </div>

            <!-- Tab: Senden -->
            <div id="tab-send" class="tab-content glass">
                <h2>Nachricht versenden</h2>
                <div class="grid-2">
                    <div>
                        <label>Typ</label>
                        <select id="send-type">
                            <option value="list">An Teamliste / Gruppe</option>
                            <option value="direct">Direkt an Handynummer</option>
                        </select>
                        <label>Ziel (Teamliste oder Nummer)</label>
                        <div id="target-wrapper">
                            <select id="send-target-list"></select>
                        </div>
                    </div>
                    <div>
                        <label>Bevorzugter Kanal (Ignoriert bei Gruppen)</label>
                        <select id="send-channel">
                            <option value="sms">SMS Textnachricht</option>
                            <option value="voice">Sprachanruf (Voice)</option>
                        </select>
                        <label>Nachricht</label>
                        <textarea id="send-msg" rows="4" placeholder="Dein Text..."></textarea>
                    </div>
                </div>
                <button class="btn-primary" id="btn-send" style="width:100%; margin-top:10px;">Jetzt Senden</button>
            </div>

            <!-- Tab: Logs -->
            <div id="tab-logs" class="tab-content glass">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0;">Sende-Logbuch</h2>
                    <div style="display:flex; gap: 4px;">
                        <button class="menu-btn" id="btn-log-refresh" title="Protokoll aktualisieren">
                            <svg viewBox="0 0 24 24"><path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" /></svg>
                        </button>
                        <button class="menu-btn" id="btn-log-settings" title="Log Einstellungen">
                            <svg viewBox="0 0 24 24"><path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.98C19.47,12.66 19.5,12.34 19.5,12C19.5,11.66 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.65 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.65 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.66 4.5,12C4.5,12.34 4.53,12.66 4.57,12.98L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.04 4.95,18.95L7.44,17.95C7.96,18.35 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.35 16.56,17.95L19.05,18.95C19.27,19.04 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.98Z" /></svg>
                        </button>
                    </div>
                </div>
                <input type="text" id="log-filter" placeholder="Suchen nach Datum, Nummer, Text oder Statuscode..." style="margin-top: 15px;">
                <div id="log-list" style="margin-top: 15px;"></div>
            </div>

            <!-- Tab: Kontakte -->
            <div id="tab-contacts" class="tab-content glass">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2>Kontaktverwaltung</h2>
                    <button class="btn-primary" id="btn-new-contact" style="display:none; padding:8px 16px;">+ Neu</button>
                </div>
                <p>Wähle eine Teamliste aus, um Mitglieder zu verwalten.</p>
                <div style="display:flex; gap:10px;">
                    <select id="contact-tl" style="margin-bottom:0;"></select>
                    <button class="btn-secondary" id="btn-load-contacts">Laden</button>
                </div>
                <div id="contacts-table-wrapper" style="overflow-x: auto; margin-top:20px; display:none;">
                    <table>
                        <thead><tr><th>Name</th><th>Kontakt</th><th>Typ</th><th>Aktionen</th></tr></thead>
                        <tbody id="contacts-table"></tbody>
                    </table>
                </div>
            </div>

            <!-- Tab: Einstellungen -->
            <div id="tab-settings" class="tab-content glass">
                <h2>Smarte Fallbacks (Globale Einstellungen)</h2>
                <p>Diese Werte werden von der Integration verwendet, wenn in Automatisierungen Parameter weggelassen werden.</p>
                <div class="grid-2">
                    <div>
                        <label>Standard Teamliste (Abrechnungskontext)</label>
                        <select id="opt-teamlist"></select>
                        
                        <label>Standard Authentifizierungs-Keyword</label>
                        <input type="text" id="opt-keyword" placeholder="Sicherheits-Keyword (falls konfiguriert)">
                    </div>
                    <div>
                        <label>Standard Absender-E-Mail (Geschlossene Gruppe)</label>
                        <input type="email" id="opt-sender" placeholder="z.B. user@gmail.com">
                    </div>
                </div>
                <button class="btn-primary" id="btn-save-options">Optionen Speichern</button>
            </div>
            
            <!-- Tab: Hilfe / Doku -->
            <div id="tab-help" class="tab-content glass">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap: wrap; gap: 15px;">
                    <div style="display:flex; align-items:center; gap: 15px;">
                        <img src="https://sno.mb222.de/pics/snologoklein.png" alt="SNO Logo" style="height: 50px; border-radius: 8px;">
                        <div>
                            <h2 style="margin:0;">SyncNetOps</h2>
                            <span style="color:var(--secondary-text-color);">SNO TeamMessage Integration</span>
                        </div>
                    </div>
                    <div style="display:flex; gap: 10px;">
                        <a href="https://github.com/SyncNetOps/int_SNO_teammessage/tree/main" target="_blank" style="text-decoration: none;">
                            <span style="background: #333; color: white; padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; display: flex; align-items: center; gap: 5px;">
                                <svg style="width:16px;height:16px" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.96 11.15,6.86 12,6.86C12.85,6.86 13.71,6.96 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" /></svg>
                                v1.1.0
                            </span>
                        </a>
                    </div>
                </div>

                <div style="margin-top: 25px;">
                    <p><strong>Die Integration:</strong> Diese Home Assistant Integration verbindet dein Smart Home sicher mit dem professionellen Multi-Channel-Nachrichtendienst <a href="https://www.teammessage.de" target="_blank" style="color:var(--primary-color);">TeamMessage.de</a> über deren moderne REST-API. Sie ermöglicht den zuverlässigen Versand von SMS, Sprachanrufen (Voice) und E-Mails direkt aus deinen HA-Automatisierungen (über den Dienst <code>sno_teammessage.send_message</code>).</p>
                    <p><strong>Wo finde ich was im Panel?</strong><br>
                    - <strong>Dashboard:</strong> Überblick über dein aktuelles Restguthaben und deinen Kontostand.<br>
                    - <strong>Senden:</strong> Manueller, sofortiger Versand von Nachrichten direkt aus dem Panel.<br>
                    - <strong>Logbuch:</strong> Live-Einsicht in alle Sendeberichte und Zustellstatus-Codes.<br>
                    - <strong>Kontakte:</strong> Verwalte deine Teamlisten und Empfänger direkt in Home Assistant.<br>
                    - <strong>Einstellungen:</strong> Konfiguriere "Smarte Fallbacks" (Standard-Teamliste, Absender, Keywords), um deine YAML-Automatisierungen sauber zu halten.</p>
                </div>

                <hr style="border: 0; height: 1px; background: var(--divider-color); margin: 30px 0;">

                <h3>Der Drittanbieter: TeamMessage.de</h3>
                <p>Bitte beachte, dass dies eine API-Integration für einen <strong>Drittanbieter-Dienst</strong> ist. Für den reellen Versand von SMS und Sprachanrufen fallen entsprechende Kosten beim Anbieter an.</p>
                
                <div class="grid-3">
                    <div style="background: rgba(0,0,0,0.1); padding: 15px; border-radius: 8px;">
                        <h4 style="margin-top:0; color:var(--primary-color);">EASY (Prepaid)</h4>
                        <p style="font-size: 0.9rem; margin-bottom: 0;">Volle Kostenkontrolle ohne Grundgebühr. Du lädst dein Guthaben vorab auf (SMS ab 9ct, Voice ab 27ct). Keine Mindestabnahme.</p>
                    </div>
                    <div style="background: rgba(0,0,0,0.1); padding: 15px; border-radius: 8px;">
                        <h4 style="margin-top:0; color:var(--primary-color);">PAUSCHAL (Flatrate)</h4>
                        <p style="font-size: 0.9rem; margin-bottom: 0;">Monatliches Fix-Kontingent an Nachrichten. Ideal für Unternehmen und planbare Intensivnutzer.</p>
                    </div>
                    <div style="background: rgba(0,0,0,0.1); padding: 15px; border-radius: 8px;">
                        <h4 style="margin-top:0; color:var(--primary-color);">PROFI (Postpaid)</h4>
                        <p style="font-size: 0.9rem; margin-bottom: 0;">Bequeme monatliche Abrechnung im Nachhinein für professionelle und große Umgebungen.</p>
                    </div>
                </div>

                <div style="margin-top: 25px; background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.1); padding: 20px; border-radius: 12px; border-left: 4px solid var(--primary-color);">
                    <h3 style="margin-top: 0;">Erste Schritte / Registrierung</h3>
                    <ol style="margin-bottom: 0; padding-left: 20px; line-height: 1.6;">
                        <li>Registriere dich kostenlos unter <a href="https://teammessage.eu/registrieren" target="_blank" style="color:var(--primary-color); font-weight:bold;">teammessage.eu/registrieren</a> (Du erhältst 20 kostenlose Test-SMS).</li>
                        <li>Erstelle im TeamMessage-Portal im Bereich Einstellungen einen <strong>API-Token (Bearer Token)</strong>.</li>
                        <li>Hinterlege in Home Assistant unter Integrationen deine Team-ID und den generierten API-Token.</li>
                    </ol>
                </div>

                <hr style="border: 0; height: 1px; background: var(--divider-color); margin: 30px 0;">

                <h3>Hilfe & Support</h3>
                <div style="display:flex; gap: 15px; flex-wrap: wrap;">
                    <a href="https://sno.mb222.de/faq-tm/" target="_blank" class="btn-secondary" style="text-decoration:none; display:inline-block; text-align:center;">
                        Ausführliche Dokumentation & FAQ
                    </a>
                    <a href="https://github.com/SyncNetOps/int_SNO_teammessage/issues" target="_blank" class="btn-danger" style="text-decoration:none; display:inline-block; text-align:center;">
                        Fehler / Issue melden (GitHub)
                    </a>
                </div>
            </div>
        `;

        // Navigation & Menu
        this.querySelector('#burger-btn').addEventListener('click', () => this.fireEvent('hass-toggle-menu'));
        this.querySelectorAll('.nav button').forEach(btn => btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab)));
        
        // Logbuch Actions
        this.querySelector('#log-filter').addEventListener('input', (e) => this.renderLogs(e.target.value));
        this.querySelector('#btn-log-refresh').addEventListener('click', () => {
            this.showToast("Aktualisiere Logbuch...", "info");
            this.fetchLogs();
        });
        
        // Logbuch Settings Modal
        this.querySelector('#btn-log-settings').addEventListener('click', () => {
            this.querySelector('#log-opt-auto').checked = this.logSettings.autoRefresh;
            this.querySelector('#log-opt-interval').value = this.logSettings.interval;
            this.querySelector('#log-opt-limit').value = this.logSettings.limit;
            this.querySelector('#log-settings-modal').classList.add('active');
        });
        this.querySelector('#btn-log-modal-cancel').addEventListener('click', () => {
            this.querySelector('#log-settings-modal').classList.remove('active');
        });
        this.querySelector('#btn-log-modal-save').addEventListener('click', () => {
            this.logSettings.autoRefresh = this.querySelector('#log-opt-auto').checked;
            this.logSettings.interval = parseInt(this.querySelector('#log-opt-interval').value) || 30000;
            let newLimit = parseInt(this.querySelector('#log-opt-limit').value) || 50;
            if (newLimit > 1000) newLimit = 1000;
            if (newLimit < 1) newLimit = 1;
            this.logSettings.limit = newLimit;
            
            this.querySelector('#log-settings-modal').classList.remove('active');
            this.showToast("Log-Einstellungen übernommen.", "success");
            
            this.applyLogTimer();
            this.fetchLogs();
        });

        // Other Tabs Actions
        this.querySelector('#btn-send').addEventListener('click', () => this.sendMessage());
        this.querySelector('#btn-load-contacts').addEventListener('click', () => this.loadContacts());
        this.querySelector('#btn-new-contact').addEventListener('click', () => this.openContactModal(null));
        this.querySelector('#btn-modal-cancel').addEventListener('click', () => this.closeContactModal());
        this.querySelector('#btn-modal-save').addEventListener('click', () => this.saveContact());
        this.querySelector('#btn-save-options').addEventListener('click', () => this.saveOptions());

        this.querySelector('#send-type').addEventListener('change', (e) => {
            const wrap = this.querySelector('#target-wrapper');
            if (e.target.value === 'direct') {
                wrap.innerHTML = `<input type="text" id="send-target-direct" placeholder="+491701234567">`;
            } else {
                wrap.innerHTML = `<select id="send-target-list"></select>`;
                this.populateDropdowns();
            }
        });
    }

    applyLogTimer() {
        if (this.logTimer) {
            clearInterval(this.logTimer);
            this.logTimer = null;
        }
        if (this.logSettings.autoRefresh) {
            this.logTimer = setInterval(() => {
                // Führe den Refresh nur durch, wenn der User den Log-Tab geöffnet hat
                if (this.currentTab === 'logs') {
                    this.fetchLogs(true);
                }
            }, this.logSettings.interval);
        }
    }

    // --- Helferfunktionen für das Logbuch-Design ---
    maskPhone(num) {
        if (!num) return "Unbekannt";
        const s = String(num).trim();
        if (s.includes('@')) return s; 
        const clean = s.replace(/[^0-9+]/g, '');
        if (clean.length < 8) return s;
        const prefix = clean.substring(0, 6);
        const suffix = clean.substring(clean.length - 2);
        return `${prefix}....${suffix}`;
    }

    detectNetwork(num) {
        if (!num || String(num).includes('@')) return "Nicht ermittelbar";
        let s = String(num).replace(/[^0-9]/g, '');
        let local = s;
        if (s.startsWith('49')) local = '0' + s.substring(2);
        else if (s.startsWith('0049')) local = '0' + s.substring(4);
        else if (s.startsWith('43') || s.startsWith('0043')) return "Österreich";
        else if (s.startsWith('41') || s.startsWith('0041')) return "Schweiz";
        else if (!s.startsWith('0')) return "International";

        if (local.match(/^0(151|160|170|171|175)/)) return "Telekom (D1)";
        if (local.match(/^0(152|162|172|173|174)/)) return "Vodafone (D2)";
        if (local.match(/^0(157|159|176|179)/)) return "o2 / Telefónica";
        if (local.match(/^0(155|156)/)) return "1&1 / Drillisch";
        return "Anderes Netz / Festnetz";
    }

    getStatusInfo(status) {
        const s = parseInt(status);
        if (s === 0 || s === -1) return { icon: 'check-circle', color: '#4caf50', text: 'Zugestellt', pulse: false };
        if (s === 1 || s === 3 || s === 1001) return { icon: 'timer-sand', color: '#ff9800', text: 'Wird gesendet...', pulse: true };
        return { icon: 'alert-circle', color: '#f44336', text: 'Fehler', pulse: false };
    }

    fireEvent(evName) {
        const event = new Event(evName, { bubbles: true, cancelable: false, composed: true });
        this.dispatchEvent(event);
    }

    switchTab(tab) {
        this.currentTab = tab;
        this.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
        this.querySelector(`.nav button[data-tab="${tab}"]`).classList.add('active');
        this.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        this.querySelector(`#tab-${tab}`).classList.add('active');
    }

    showToast(msg, type='info') {
        const t = this.querySelector('#toast');
        t.className = `toast-${type}`;
        t.innerText = msg;
        t.style.opacity = 1;
        setTimeout(() => t.style.opacity = 0, 4000);
    }

    async apiCall(method, endpoint, payload=null, queryParams={}) {
        try {
            const safeEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
            let url = `sno_teammessage/proxy?endpoint=${encodeURIComponent(safeEndpoint)}`;
            for (const [key, value] of Object.entries(queryParams)) {
                url += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
            }
            
            const res = await this._hass.callApi(method, url, payload);
            if(res && res.message && res.status_code) throw new Error(res.message);
            return res;
        } catch (e) {
            console.error("Proxy API Error:", e);
            let errMsg = "API Kommunikationsfehler";
            if (e.body && e.body.message) errMsg = e.body.message;
            else if (e.message) errMsg = e.message;
            
            this.showToast(errMsg, "error");
            return null;
        }
    }

    async fetchTeamlists() {
        const data = await this.apiCall('GET', '/teamlist/lists/');
        if(data && data.rows) {
            this.teamlists = data.rows;
            this.populateDropdowns();
        }
    }

    populateDropdowns() {
        const optionsHTML = this.teamlists.map(tl => `<option value="${tl.tl}">${tl.tl_name} ${tl.tl_comment ? '('+tl.tl_comment+')' : ''}</option>`).join('');
        
        const sendList = this.querySelector('#send-target-list');
        if(sendList) sendList.innerHTML = optionsHTML;
        
        const contactList = this.querySelector('#contact-tl');
        if(contactList) contactList.innerHTML = optionsHTML;

        const optList = this.querySelector('#opt-teamlist');
        if(optList) {
            optList.innerHTML = `<option value="">-- Keine globale Liste --</option>` + optionsHTML;
            if(this._loadedOptions && this._loadedOptions.default_teamlist) {
                optList.value = this._loadedOptions.default_teamlist;
            }
        }
    }

    async fetchDashboardInfo() {
        const data = await this.apiCall('GET', '/teamlist/credit/');
        if(data && data.sms_credit !== undefined) {
            this.querySelector('#dash-credit').innerText = data.sms_credit;
            this.querySelector('#dash-used').innerText = data.sms_sum;
            this.querySelector('#dash-tariff').innerText = data.tariff_code;
        }
    }

    async fetchLogs(silent = false) {
        // Nutzt die konfigurierte Quantity aus dem Settings-Modal
        const data = await this.apiCall('GET', '/logging/sms/', null, { quantity: this.logSettings.limit });
        if(data && data.rows) {
            this.logData = data.rows;
            const currentFilter = this.querySelector('#log-filter').value;
            this.renderLogs(currentFilter);
            if (!silent) this.showToast("Logbuch erfolgreich aktualisiert", "success");
        }
    }

    renderLogs(filter = '') {
        const container = this.querySelector('#log-list');
        container.innerHTML = '';
        const lowerFilter = filter.toLowerCase();
        
        let filteredLogs = this.logData.filter(log => {
            if(!filter) return true;
            return (log.target || '').toLowerCase().includes(lowerFilter) || 
                   (log.full_text || '').toLowerCase().includes(lowerFilter) ||
                   (log.ts_created || '').toLowerCase().includes(lowerFilter) ||
                   String(log.status).includes(lowerFilter);
        });

        if (filteredLogs.length === 0) {
            container.innerHTML = '<div style="color:var(--secondary-text-color); text-align:center; padding: 20px 0;">Keine Log-Einträge gefunden.</div>';
            return;
        }

        let html = '';
        filteredLogs.forEach(log => {
            let statusInfo = this.getStatusInfo(log.status);
            let target = log.target || 'Unbekannt';
            let shortTarget = this.maskPhone(target);
            let networkName = this.detectNetwork(target);

            let displayDateObj = new Date();
            let createdDateObj = new Date();
            if (log.ts_changed || log.ts_created) displayDateObj = new Date((log.ts_changed || log.ts_created).replace(' ', 'T'));
            if (log.ts_created) createdDateObj = new Date(log.ts_created.replace(' ', 'T'));

            let displayTimeString = displayDateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            let displayDateString = displayDateObj.toLocaleDateString();
            let createdTimeString = createdDateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            let createdDateString = createdDateObj.toLocaleDateString();

            let msgText = log.full_text || 'Aus Datenschutzgründen nicht im Log gespeichert.';
            let sender = log.sms_from || 'System/API';
            let iconClass = statusInfo.pulse ? 'status-pulse' : '';

            html += `
                <div class="log-entry">
                    <div class="log-summary">
                        <div class="log-icon ${iconClass}"><ha-icon icon="mdi:${statusInfo.icon}" style="color:${statusInfo.color};"></ha-icon></div>
                        <div class="log-info">
                            <div class="log-info-top">
                                <span>${shortTarget}</span>
                                <span>${displayTimeString}</span>
                            </div>
                            <div class="log-info-bottom">
                                <span style="color:${statusInfo.color}; font-weight:bold;">${statusInfo.text}</span>
                                <span><ha-icon icon="mdi:send-outline" style="width:14px;height:14px;"></ha-icon> SMS/Voice</span>
                            </div>
                        </div>
                        <ha-icon icon="mdi:chevron-down" style="color:var(--secondary-text-color);"></ha-icon>
                    </div>
                    <div class="log-details">
                        <div class="detail-row"><div class="detail-label">Ziel:</div><div class="detail-value">${target}</div></div>
                        <div class="detail-row"><div class="detail-label">Netz:</div><div class="detail-value">${networkName}</div></div>
                        <div class="detail-row"><div class="detail-label">Gesendet:</div><div class="detail-value">${createdDateString} ${createdTimeString}</div></div>
                        <div class="detail-row"><div class="detail-label">Aktualisiert:</div><div class="detail-value">${displayDateString} ${displayTimeString}</div></div>
                        <div class="detail-row"><div class="detail-label">Absender:</div><div class="detail-value">${sender}</div></div>
                        <div class="detail-row"><div class="detail-label">Status:</div><div class="detail-value">${statusInfo.text} (Code: ${log.status})</div></div>
                        <div class="detail-text">${msgText}</div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;

        // Klick-Ereignisse für das Akkordeon
        container.querySelectorAll('.log-summary').forEach(el => {
            el.addEventListener('click', (e) => {
                const details = e.currentTarget.nextElementSibling;
                const chevron = e.currentTarget.querySelector('ha-icon[icon="mdi:chevron-down"], ha-icon[icon="mdi:chevron-up"]');
                if (details.classList.contains('open')) {
                    details.classList.remove('open');
                    if(chevron) chevron.setAttribute('icon', 'mdi:chevron-down');
                } else {
                    container.querySelectorAll('.log-details.open').forEach(openDet => {
                        openDet.classList.remove('open');
                        const prevChevron = openDet.previousElementSibling.querySelector('ha-icon[icon="mdi:chevron-up"]');
                        if(prevChevron) prevChevron.setAttribute('icon', 'mdi:chevron-down');
                    });
                    details.classList.add('open');
                    if(chevron) chevron.setAttribute('icon', 'mdi:chevron-up');
                }
            });
        });
    }

    // Nativer Aufruf des HA Services für 100% Backend-Fehlertoleranz!
    async sendMessage() {
        const type = this.querySelector('#send-type').value;
        const targetEl = type === 'direct' ? this.querySelector('#send-target-direct') : this.querySelector('#send-target-list');
        const target = targetEl ? targetEl.value : null;
        const msg = this.querySelector('#send-msg').value;
        const channel = this.querySelector('#send-channel').value; 
        
        if(!target || !msg) return this.showToast("Bitte Ziel und Nachricht ausfüllen", "error");
        
        const payload = { 
            message: msg,
            channel: channel 
        };
        
        if(type === 'direct') {
            payload.to_mobile = target;
        } else {
            payload.teamlist_email = target; 
        }

        const btn = this.querySelector('#btn-send');
        btn.innerText = "Senden...";
        btn.disabled = true;

        try {
            await this._hass.callService('sno_teammessage', 'send_message', payload);
            this.showToast("Nachricht wurde versendet!", "success");
            this.querySelector('#send-msg').value = '';
            setTimeout(() => this.fetchLogs(true), 1500); 
        } catch (e) {
            console.error("Service Error:", e);
            let errMsg = "Versand fehlgeschlagen";
            if (e.message) errMsg = e.message;
            this.showToast(errMsg, "error");
        } finally {
            btn.innerText = "Jetzt Senden";
            btn.disabled = false;
        }
    }

    async fetchOptions() {
        const options = await this.apiCall('GET', '/options');
        if(options) {
            this._loadedOptions = options;
            const senderEl = this.querySelector('#opt-sender');
            const keywordEl = this.querySelector('#opt-keyword');
            if(senderEl) senderEl.value = options.default_sender_email || '';
            if(keywordEl) keywordEl.value = options.default_keyword || '';
            const optList = this.querySelector('#opt-teamlist');
            if(optList && options.default_teamlist) optList.value = options.default_teamlist;
        }
    }

    async saveOptions() {
        const payload = {
            default_teamlist: this.querySelector('#opt-teamlist').value,
            default_sender_email: this.querySelector('#opt-sender').value,
            default_keyword: this.querySelector('#opt-keyword').value
        };
        this.showToast("Speichere Einstellungen...", "info");
        const res = await this.apiCall('POST', '/options', payload);
        if(res && res.success) {
            this.showToast("Einstellungen gespeichert!", "success");
            this._loadedOptions = payload;
        }
    }

    async loadContacts() {
        const tl = this.querySelector('#contact-tl').value;
        if(!tl) return this.showToast("Keine Teamliste ausgewählt", "error");
        
        this.showToast("Lade Mitglieder...", "info");
        const data = await this.apiCall('GET', '/teamlist/members/', null, { tl: tl });
        
        if(data && data.rows) {
            this.currentContacts = data.rows;
            this.renderContacts();
            this.querySelector('#contacts-table-wrapper').style.display = 'block';
            this.querySelector('#btn-new-contact').style.display = 'block';
            this.showToast("Mitglieder geladen", "success");
        } else {
            this.currentContacts = [];
            this.renderContacts();
        }
    }

    renderContacts() {
        const tbody = this.querySelector('#contacts-table');
        tbody.innerHTML = '';
        this.currentContacts.forEach(mb => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${mb.mb_name}</td><td>${mb.mb_contact}</td><td>${mb.mb_contacttype.toUpperCase()}</td>`;
            
            const actionTd = document.createElement('td');
            actionTd.style.display = "flex"; actionTd.style.gap = "8px";
            
            const btnEdit = document.createElement('button');
            btnEdit.className = "btn-secondary"; btnEdit.innerText = "Edit";
            btnEdit.onclick = () => this.openContactModal(mb);
            
            const btnDel = document.createElement('button');
            btnDel.className = "btn-danger"; btnDel.innerText = "X";
            btnDel.onclick = () => this.deleteContact(mb.mb_id);
            
            actionTd.appendChild(btnEdit); actionTd.appendChild(btnDel);
            tr.appendChild(actionTd);
            tbody.appendChild(tr);
        });
    }

    openContactModal(mb) {
        const modal = this.querySelector('#contact-modal');
        const title = this.querySelector('#modal-title');
        
        if(mb) {
            title.innerText = "Mitglied bearbeiten";
            this.querySelector('#modal-mb-id').value = mb.mb_id;
            this.querySelector('#modal-name').value = mb.mb_name;
            this.querySelector('#modal-contact').value = mb.mb_contact;
            this.querySelector('#modal-type').value = mb.mb_contacttype;
        } else {
            title.innerText = "Neues Mitglied anlegen";
            this.querySelector('#modal-mb-id').value = "";
            this.querySelector('#modal-name').value = "";
            this.querySelector('#modal-contact').value = "";
            this.querySelector('#modal-type').value = "sms";
        }
        modal.classList.add('active');
    }

    closeContactModal() {
        this.querySelector('#contact-modal').classList.remove('active');
    }

    async saveContact() {
        const tl = this.querySelector('#contact-tl').value;
        const id = this.querySelector('#modal-mb-id').value;
        
        const payload = {
            mb_name: this.querySelector('#modal-name').value,
            mb_contact: this.querySelector('#modal-contact').value,
            mb_contacttype: this.querySelector('#modal-type').value
        };

        if(!payload.mb_name || !payload.mb_contact) return this.showToast("Bitte Name und Kontakt angeben", "error");

        this.showToast("Speichere...", "info");
        let res;
        if(id) {
            res = await this.apiCall('PUT', '/teamlist/member/', payload, { tl: tl, mb: id });
        } else {
            res = await this.apiCall('POST', '/teamlist/member/', payload, { tl: tl });
        }

        if(res && res.success) {
            this.showToast("Erfolgreich gespeichert!", "success");
            this.closeContactModal();
            this.loadContacts();
        }
    }

    async deleteContact(mbId) {
        if(!confirm("Möchtest du dieses Mitglied wirklich löschen?")) return;
        const tl = this.querySelector('#contact-tl').value;
        
        this.showToast("Lösche Mitglied...", "info");
        const res = await this.apiCall('DELETE', '/teamlist/member/', null, { tl: tl, mb: mbId });
        
        if(res && res.success) {
            this.showToast("Mitglied gelöscht!", "success");
            this.loadContacts();
        }
    }
}
customElements.define('teammessage-panel', TeamMessagePanel);
