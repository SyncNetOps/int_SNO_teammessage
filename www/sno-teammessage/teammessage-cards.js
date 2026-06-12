// ==============================================================================
// SNO TeamMessage - Custom Dashboard Cards (V2.0 - Hybrid Settings System)
// ==============================================================================

console.info(
    `%c SNO-TEAMMESSAGE CARDS %c Version 2.0 - Lade Premium UI... `,
    'color: white; background: #03a9f4; font-weight: bold; padding: 4px; border-radius: 4px 0 0 4px;',
    'color: white; background: #333; font-weight: bold; padding: 4px; border-radius: 0 4px 4px 0;'
);

// --- State Persistenz Helfer (Neu in V2.0) ---
function getCardKey(config) {
    const safeTitle = (config.title || 'default').replace(/[^a-zA-Z0-9]/g, '_');
    return `sno_tm_v2_${config.type}_${safeTitle}`;
}

// --- Flexibler API Fetcher ---
async function fetchTMApi(hass, endpoint, config) {
    if (config && config.direct_api) {
        try {
            const headers = { 'Accept': 'application/json' };
            if (config.api_token) headers['Authorization'] = `Bearer ${config.api_token}`;
            const res = await fetch(`https://www.teammessage.de/api/v1${endpoint}`, { headers });
            if (!res.ok) return { error: `HTTP ${res.status} (Direct API)` };
            const data = await res.json();
            return { data };
        } catch (e) {
            return { error: `Netzwerk/CORS-Fehler (Direct API) - ${e.message}` };
        }
    }
    try {
        const data = await hass.callApi('GET', `sno_teammessage/proxy?endpoint=${encodeURIComponent(endpoint)}`);
        return { data };
    } catch (e) {
        const code = e.status_code || 'Unbekannt';
        const msg = e.message || 'Endpunkt nicht erreichbar';
        return { error: `Proxy HTTP ${code} (${msg})` };
    }
}

// --- Hilfsfunktionen ---
function maskPhone(num) {
    if (!num) return "Unbekannt";
    const s = String(num).trim();
    if (s.includes('@')) return s; 
    const clean = s.replace(/[^0-9+]/g, '');
    if (clean.length < 8) return s;
    const prefix = clean.substring(0, 6);
    const suffix = clean.substring(clean.length - 2);
    return `${prefix}....${suffix}`;
}

function detectNetwork(num) {
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

function getStatusInfo(status) {
    const s = parseInt(status);
    if (s === 0 || s === -1) return { icon: 'check-circle', color: '#4caf50', text: 'Zugestellt', pulse: false };
    if (s === 1 || s === 3 || s === 1001) return { icon: 'timer-sand', color: '#ff9800', text: 'Wird gesendet...', pulse: true };
    return { icon: 'alert-circle', color: '#f44336', text: 'Fehler', pulse: false };
}

function autoFormatPhone(inputStr) {
    if (!inputStr) return "";
    let s = inputStr.replace(/[^0-9+]/g, '');
    s = s.replace(/\++/g, '+');
    if (s.startsWith('00')) s = '+' + s.substring(2);
    else if (s.startsWith('0')) s = '+49' + s.substring(1);
    else if (s.match(/^(49|43|41)[0-9]+$/)) s = '+' + s;
    s = s.replace(/^\+(49|43|41)0+/, '+$1');
    return s;
}

// ==================================================================
// UNIVERSAL EDITOREN (Home Assistant GUI)
// ==================================================================
class SNOTeamMessageSendCardEditor extends HTMLElement {
    setConfig(config) { this._config = config; this.render(); }
    render() {
        if (!this._config || this._rendered) return;
        this.innerHTML = `
            <div style="padding: 16px;">
                <label style="display:block; margin-bottom:5px; font-weight:bold;">Karten-Titel</label>
                <input type="text" id="title" value="${this._config.title || ''}" class="tm-input">
                
                <label style="display:block; margin-bottom:5px; font-weight:bold; margin-top:10px;">Verfügbare Teamlisten (kommagetrennt)</label>
                <input type="text" id="teamlists" value="${this._config.teamlists || ''}" class="tm-input" placeholder="z.B. alarme@tmsg.de, it@tmsg.de">
                <p style="font-size:0.8rem; color:var(--secondary-text-color); margin-top:-10px; margin-bottom:15px;">Diese Listen können komfortabel im Dropdown ausgewählt werden.</p>

                <h3 style="margin-top:20px; border-bottom: 1px solid var(--divider-color); padding-bottom:5px;">Visuelles Setup (Globaler Standard)</h3>
                <label style="display:block; margin-bottom:5px; font-weight:bold;">Design-Modus</label>
                <select id="theme" class="tm-input">
                    <option value="classic" ${this._config.theme === 'classic' ? 'selected' : ''}>Klassisch (HA Default)</option>
                    <option value="minimal" ${this._config.theme === 'minimal' ? 'selected' : ''}>Modern Minimal</option>
                    <option value="glass" ${this._config.theme === 'glass' ? 'selected' : ''}>Glassmorphism</option>
                    <option value="dark" ${this._config.theme === 'dark' ? 'selected' : ''}>High Contrast Dark</option>
                    <option value="neon" ${this._config.theme === 'neon' ? 'selected' : ''}>Neon Cyberpunk</option>
                </select>

                <label style="display:flex; align-items:center; cursor:pointer; font-weight:bold; margin-top:10px;">
                    <input type="checkbox" id="animation" ${this._config.animation !== false ? 'checked' : ''} style="width:auto; margin-right:8px;">
                    Start-Animation aktivieren
                </label>
            </div>
            <style>.tm-input { width:100%; padding:10px; margin-bottom:15px; border:1px solid var(--divider-color); border-radius:4px; background:var(--secondary-background-color); color:var(--primary-text-color); box-sizing: border-box; }</style>
        `;
        this.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', (e) => {
                const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                this.fireEvent(e.target.id, val);
            });
            el.addEventListener('change', (e) => {
                const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                this.fireEvent(e.target.id, val);
            });
        });
        this._rendered = true;
    }
    fireEvent(key, value) {
        if (!this._config) return;
        const newConfig = { ...this._config };
        newConfig[key] = value;
        const event = new Event('config-changed', { bubbles: true, composed: true });
        event.detail = { config: newConfig };
        this.dispatchEvent(event);
    }
}
customElements.define("sno-teammessage-send-editor", SNOTeamMessageSendCardEditor);

class SNOTeamMessageDataCardEditor extends HTMLElement {
    setConfig(config) { this._config = config; this.render(); }
    render() {
        if (!this._config || this._rendered) return;
        const isLog = this._config.type === 'custom:sno-teammessage-log-card';
        this.innerHTML = `
            <div style="padding: 16px;">
                <label style="display:block; margin-bottom:5px; font-weight:bold;">Karten-Titel</label>
                <input type="text" id="title" value="${this._config.title || ''}" class="tm-input">
                
                <label style="display:block; margin-bottom:5px; font-weight:bold; color:var(--primary-color);">Kd.Nr. (Team-ID) - PFLICHTFELD</label>
                <input type="number" id="tm" value="${this._config.tm || ''}" class="tm-input" placeholder="z.B. 100042">
                
                <h3 style="margin-top:20px; border-bottom: 1px solid var(--divider-color); padding-bottom:5px;">Visuelles Setup & Logik (Globaler Standard)</h3>
                
                <label style="display:block; margin-bottom:5px; font-weight:bold;">Design-Modus</label>
                <select id="theme" class="tm-input">
                    <option value="classic" ${this._config.theme === 'classic' ? 'selected' : ''}>Klassisch (HA Default)</option>
                    <option value="minimal" ${this._config.theme === 'minimal' ? 'selected' : ''}>Modern Minimal</option>
                    <option value="glass" ${this._config.theme === 'glass' ? 'selected' : ''}>Glassmorphism</option>
                    <option value="dark" ${this._config.theme === 'dark' ? 'selected' : ''}>High Contrast Dark</option>
                    <option value="neon" ${this._config.theme === 'neon' ? 'selected' : ''}>Neon Cyberpunk</option>
                </select>

                <label style="display:flex; align-items:center; cursor:pointer; font-weight:bold; margin-top:10px; margin-bottom:15px;">
                    <input type="checkbox" id="animation" ${this._config.animation !== false ? 'checked' : ''} style="width:auto; margin-right:8px;">
                    Start-Animation aktivieren
                </label>

                <label style="display:block; margin-bottom:5px; font-weight:bold;">Aktualisierungsintervall</label>
                <select id="interval" class="tm-input">
                    <option value="10000" ${this._config.interval === 10000 ? 'selected' : ''}>10 Sekunden</option>
                    <option value="30000" ${(!this._config.interval || this._config.interval === 30000) ? 'selected' : ''}>30 Sekunden (Standard)</option>
                    <option value="60000" ${this._config.interval === 60000 ? 'selected' : ''}>1 Minute</option>
                </select>

                ${isLog ? `
                <label style="display:block; margin-bottom:5px; font-weight:bold;">Anzahl Einträge</label>
                <input type="number" id="quantity" value="${this._config.quantity || 5}" class="tm-input">
                ` : ''}

                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--divider-color);">
                    <label style="display:flex; align-items:center; cursor:pointer; font-weight:bold;">
                        <input type="checkbox" id="direct_api" ${this._config.direct_api ? 'checked' : ''} style="width:auto; margin-right:8px;">
                        Direkte API nutzen (Proxy umgehen)
                    </label>
                    <div id="token_container" style="display: ${this._config.direct_api ? 'block' : 'none'}; margin-top:10px;">
                        <input type="password" id="api_token" value="${this._config.api_token || ''}" class="tm-input" placeholder="Bearer Token...">
                    </div>
                </div>
            </div>
            <style>.tm-input { width:100%; padding:10px; margin-bottom:15px; border:1px solid var(--divider-color); border-radius:4px; background:var(--secondary-background-color); color:var(--primary-text-color); box-sizing: border-box; }</style>
        `;
        
        this.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', (e) => {
                let val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                if(e.target.type === 'number') val = parseInt(val) || '';
                this.fireEvent(e.target.id, val);
            });
            el.addEventListener('change', (e) => {
                let val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                if(e.target.type === 'number') val = parseInt(val) || '';
                this.fireEvent(e.target.id, val);
            });
        });

        this.querySelector('#direct_api').addEventListener('change', (e) => {
            this.querySelector('#token_container').style.display = e.target.checked ? 'block' : 'none';
        });

        this._rendered = true;
    }
    fireEvent(key, value) {
        if (!this._config) return;
        const newConfig = { ...this._config };
        newConfig[key] = value;
        const event = new Event('config-changed', { bubbles: true, composed: true });
        event.detail = { config: newConfig };
        this.dispatchEvent(event);
    }
}
customElements.define("sno-teammessage-data-editor", SNOTeamMessageDataCardEditor);


// --- Styling System ---
const getStyles = () => `
    <style>
        ha-card { padding: 16px; border-radius: var(--ha-card-border-radius, 12px); box-shadow: var(--ha-card-box-shadow, 0px 2px 1px -1px rgba(0,0,0,0.2)); background: var(--card-background-color, #fff); color: var(--primary-text-color, #000); position: relative; overflow: hidden; transition: all 0.3s ease; }
        
        ha-card.theme-minimal { box-shadow: none !important; border: 2px solid var(--divider-color, #e0e0e0) !important; background: transparent !important; }
        ha-card.theme-minimal .header { border-bottom: 2px solid var(--divider-color); padding-bottom: 12px; margin-bottom: 20px;}
        ha-card.theme-minimal .credit-stats { border: 1px solid var(--divider-color); background: transparent; }
        
        ha-card.theme-glass { background: rgba(var(--rgb-card-background-color, 255,255,255), 0.15) !important; backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(120,120,120,0.2) !important; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important; }
        ha-card.theme-glass .log-details, ha-card.theme-glass .credit-stats { background: rgba(0,0,0,0.05); }
        ha-card.theme-glass input, ha-card.theme-glass select, ha-card.theme-glass textarea { background: rgba(var(--rgb-card-background-color, 255,255,255), 0.5); }
        
        ha-card.theme-dark { background: #121212 !important; color: #ffffff !important; border: 1px solid #333 !important; box-shadow: 0 10px 30px rgba(0,0,0,0.8) !important; }
        ha-card.theme-dark .header, ha-card.theme-dark span, ha-card.theme-dark div { color: #ffffff; }
        ha-card.theme-dark .log-entry { border-bottom-color: #333; }
        ha-card.theme-dark .log-details, ha-card.theme-dark .credit-stats { background: #1e1e1e; color:#eee;}
        ha-card.theme-dark input, ha-card.theme-dark select, ha-card.theme-dark textarea { background: #222 !important; color: #fff !important; border-color: #444 !important; }
        ha-card.theme-dark .detail-label { color: #aaa; }
        
        ha-card.theme-neon { background: #09090b !important; color: #e0e0e0 !important; border: 1px solid var(--primary-color) !important; box-shadow: 0 0 15px rgba(var(--rgb-primary-color), 0.3), inset 0 0 10px rgba(var(--rgb-primary-color), 0.1) !important; }
        ha-card.theme-neon .header { color: var(--primary-color) !important; text-shadow: 0 0 8px rgba(var(--rgb-primary-color), 0.6); border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.3); padding-bottom: 10px;}
        ha-card.theme-neon input, ha-card.theme-neon select, ha-card.theme-neon textarea { background: #121214 !important; border: 1px solid var(--primary-color) !important; color: #fff !important; box-shadow: inset 0 0 5px rgba(var(--rgb-primary-color), 0.3); }
        ha-card.theme-neon .log-entry { border-bottom-color: rgba(var(--rgb-primary-color), 0.3); }
        ha-card.theme-neon .log-details, ha-card.theme-neon .credit-stats { background: #121214; border-left: 2px solid var(--primary-color); }
        ha-card.theme-neon button:not(.btn-secondary) { box-shadow: 0 0 10px rgba(var(--rgb-primary-color), 0.5); }

        .animate-on-load { animation: cardFadeScaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes cardFadeScaleIn { 0% { opacity: 0; transform: translateY(15px) scale(0.97); } 100% { opacity: 1; transform: translateY(0) scale(1); } }

        .header { font-size: 1.2rem; font-weight: 500; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
        .header-left { display: flex; align-items: center; gap: 8px; }
        .header-actions { display: flex; gap: 8px; }
        .header-btn { cursor: pointer; color: var(--secondary-text-color); transition: color 0.2s, transform 0.2s; padding: 4px; border-radius: 50%; }
        .header-btn:hover { color: var(--primary-color); background: rgba(var(--rgb-primary-color), 0.1); transform: rotate(15deg); }
        .header-btn:active { transform: scale(0.9); }
        .refreshing { animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite; color: var(--primary-color); }
        
        .input-group { margin-bottom: 12px; position: relative;}
        input:not([type="checkbox"]), select, textarea { width: 100%; padding: 10px; border: 1px solid var(--divider-color, #e0e0e0); border-radius: 6px; box-sizing: border-box; background: var(--secondary-background-color); color: var(--primary-text-color); font-family: inherit; }
        input:focus, select:focus, textarea:focus { border-color: var(--primary-color); outline: none; }
        textarea { resize: vertical; min-height: 80px; }
        button { width: 100%; padding: 10px; border: none; border-radius: 6px; background: var(--primary-color); color: white; font-weight: bold; cursor: pointer; transition: all 0.2s;}
        button:hover { filter: brightness(1.1); }
        button:active { transform: scale(0.98); }
        button:disabled { opacity: 0.5; cursor:not-allowed; }
        
        /* Secondary Button (Reset) */
        button.btn-secondary { background: transparent; color: var(--secondary-text-color); border: 1px solid var(--divider-color); margin-top: 10px; font-weight: normal;}
        button.btn-secondary:hover { background: var(--secondary-background-color); color: var(--primary-text-color); }
        
        .msg { margin-top: 10px; font-weight: bold; padding: 8px; border-radius: 4px; }
        .err { color: #f44336; background: rgba(244, 67, 54, 0.1); border-left: 4px solid #f44336; }
        .succ { color: #4caf50; background: rgba(76, 175, 80, 0.1); }
        .warn { color: #ff9800; background: rgba(255, 152, 0, 0.1); }
        
        .credit-graphic { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 0; }
        .credit-ring { width: 140px; height: 140px; border-radius: 50%; border: 8px solid var(--primary-color); display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 0 15px rgba(0,0,0,0.1), 0 0 15px rgba(var(--rgb-primary-color), 0.3); background: var(--secondary-background-color); }
        .credit-ring .val { font-size: 2.5rem; font-weight: bold; color: var(--primary-color); line-height: 1; }
        .credit-ring .sub { font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;}
        .credit-stats { background: var(--secondary-background-color); border-radius: 8px; padding: 12px; margin-top: 10px; display: flex; justify-content: center; align-items: center; gap: 10px; font-size: 0.95rem;}
        
        .log-entry { border-bottom: 1px solid var(--divider-color); transition: background 0.2s; }
        .log-entry:last-child { border-bottom: none; }
        .log-entry:hover { background: rgba(0,0,0,0.02); }
        .log-summary { display: flex; align-items: center; padding: 12px 8px; cursor: pointer; gap: 12px; }
        .log-icon { flex-shrink: 0; display: flex; align-items: center; }
        .log-info { flex: 1; min-width: 0; }
        .log-info-top { display: flex; justify-content: space-between; font-weight: bold; font-size: 0.95rem; }
        .log-info-bottom { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--secondary-text-color); margin-top: 4px; }
        .log-details { display: none; padding: 12px; background: var(--secondary-background-color); border-radius: 0 0 8px 8px; font-size: 0.85rem; line-height: 1.4; border-left: 3px solid var(--primary-color); margin: 0 8px 12px 8px;}
        .log-details.open { display: block; animation: slideDown 0.3s ease; }
        .detail-row { display: flex; margin-bottom: 6px; }
        .detail-label { width: 95px; font-weight: 600; color: var(--secondary-text-color); flex-shrink:0;}
        .detail-value { flex: 1; word-break: break-word; }
        .detail-text { background: rgba(0,0,0,0.1); padding: 8px; border-radius: 4px; margin-top: 8px; font-family: monospace; white-space: pre-wrap; font-size: 0.9rem;}
        
        /* Interaktives Settings Modal Overlay */
        .modal-overlay { display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 100; justify-content: center; align-items: center; backdrop-filter: blur(3px); }
        .modal-content { background: var(--card-background-color, #fff); padding: 20px; border-radius: 8px; width: 90%; max-width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid var(--divider-color); animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; font-weight: bold; font-size: 1.1rem; border-bottom: 1px solid var(--divider-color); padding-bottom: 10px;}
        .modal-close { cursor: pointer; color: var(--secondary-text-color); }
        .modal-row { margin-bottom: 12px; }
        .modal-row label { display: block; font-size: 0.85rem; margin-bottom: 4px; font-weight: 500;}
        .modal-hint { font-size: 0.75rem; color: var(--primary-color); margin-top: 5px; text-align: left; opacity: 0.9; }

        .status-pulse { animation: pulseIcon 1.5s infinite; }
        .format-hint { font-size: 0.75rem; color: var(--primary-color); position: absolute; right: 8px; top: 12px; opacity: 0; transition: opacity 0.3s; pointer-events: none;}
        .format-hint.visible { opacity: 1; }
        
        @keyframes slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseIcon { 0% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.5; transform: scale(0.9); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes modalPop { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
    </style>
`;

function getSettingsModalHTML(type, state) {
    const isData = type !== 'send';
    const isLog = type === 'log';
    const isSend = type === 'send';
    return `
        <div class="modal-overlay tm-settings-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <span>Persönliche Einstellungen</span>
                    <ha-icon icon="mdi:close" class="modal-close"></ha-icon>
                </div>
                
                <div class="modal-row">
                    <label>Design-Modus</label>
                    <select class="set-theme">
                        <option value="classic" ${state.theme === 'classic' ? 'selected' : ''}>Klassisch</option>
                        <option value="minimal" ${state.theme === 'minimal' ? 'selected' : ''}>Modern Minimal</option>
                        <option value="glass" ${state.theme === 'glass' ? 'selected' : ''}>Glassmorphism</option>
                        <option value="dark" ${state.theme === 'dark' ? 'selected' : ''}>High Contrast Dark</option>
                        <option value="neon" ${state.theme === 'neon' ? 'selected' : ''}>Neon Cyberpunk</option>
                    </select>
                </div>
                <div class="modal-row">
                    <label style="display:flex; align-items:center; cursor:pointer;">
                        <input type="checkbox" class="set-anim" ${state.animation ? 'checked' : ''} style="width:auto; margin-right:8px;"> Start-Animation
                    </label>
                </div>

                ${isSend ? `
                <div class="modal-row" style="margin-top:15px; border-top: 1px solid var(--divider-color); padding-top: 10px;">
                    <label>Verfügbare Teamlisten</label>
                    <input type="text" class="set-teamlists" value="${state.teamlists || ''}" placeholder="liste1@tmsg.de, alarm@tmsg.de">
                    <div class="modal-hint">Kommagetrennt eingeben. Erstellt automatisch das Dropdown-Menü beim Versand.</div>
                </div>
                ` : ''}

                ${isData ? `
                <div class="modal-row">
                    <label style="display:flex; align-items:center; cursor:pointer;">
                        <input type="checkbox" class="set-auto" ${state.autoRefresh ? 'checked' : ''} style="width:auto; margin-right:8px;"> Auto-Refresh
                    </label>
                </div>
                <div class="modal-row">
                    <label>Intervall</label>
                    <select class="set-interval">
                        <option value="10000" ${state.interval === 10000 ? 'selected' : ''}>10 Sekunden</option>
                        <option value="30000" ${state.interval === 30000 ? 'selected' : ''}>30 Sekunden</option>
                        <option value="60000" ${state.interval === 60000 ? 'selected' : ''}>1 Minute</option>
                    </select>
                </div>
                ` : ''}

                ${isLog ? `
                <div class="modal-row">
                    <label>Logs anzeigen (Menge)</label>
                    <input type="number" class="set-limit" value="${state.limit}" min="1" max="50">
                </div>
                ` : ''}

                <button class="btn-save-settings" style="margin-top:15px;">Persönlich anwenden</button>
                <button class="btn-secondary btn-reset-settings">Auf globalen Standard zurücksetzen</button>
            </div>
        </div>
    `;
}


// ==========================================
// 1. SENDEN KARTE
// ==========================================
class SNOTeamMessageSendCard extends HTMLElement {
    static getConfigElement() { return document.createElement("sno-teammessage-send-editor"); }
    static getStubConfig() { return { type: "custom:sno-teammessage-send-card", title: "TeamMessage Senden" }; }
    
    setConfig(config) { 
        this.config = config; 
        this.cardKey = getCardKey(this.config);
        
        // State Merging: 1. LocalStorage (Nutzer) > 2. Config (Global Admin) > 3. Fallback
        let local = {};
        try { local = JSON.parse(localStorage.getItem(this.cardKey)) || {}; } catch(e){}

        this.state = {
            theme: local.theme ?? this.config.theme ?? 'classic',
            animation: local.animation ?? this.config.animation !== false,
            teamlists: local.teamlists ?? this.config.teamlists ?? ''
        };
    }
    
    getCardSize() { return 4; }

    set hass(hass) {
        this._hass = hass;
        if (!this.querySelector('ha-card')) {
            const animClass = this.state.animation ? 'animate-on-load' : '';
            this.innerHTML = `
                ${getStyles()}
                <ha-card class="theme-${this.state.theme} ${animClass}">
                    <div class="header">
                        <div class="header-left"><ha-icon icon="mdi:message-fast"></ha-icon> <span>${this.config.title || 'Nachricht Senden'}</span></div>
                        <div class="header-actions">
                            <div class="header-btn btn-settings" title="Persönliche Einstellungen"><ha-icon icon="mdi:cog"></ha-icon></div>
                        </div>
                    </div>
                    <div class="input-group">
                        <select id="tm-type">
                            <option value="direct">Direkt an Nummer (+49...)</option>
                            <option value="team">An Teamliste (E-Mail)</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <span id="format-hint" class="format-hint">Wird formatiert...</span>
                        <input type="text" id="tm-target-input" placeholder="Empfänger (+49...)">
                        <select id="tm-target-select" style="display:none;"></select>
                    </div>
                    <div class="input-group">
                        <textarea id="tm-msg" placeholder="Ihre Nachricht..."></textarea>
                    </div>
                    <button id="tm-btn">Nachricht Senden</button>
                    <div id="tm-status" style="display:none;" class="msg"></div>
                    ${getSettingsModalHTML('send', this.state)}
                </ha-card>
            `;
            this.setupInteractions();
            this.updateDropdownVisibility(); 
        } else {
            this.applyThemeUpdates();
            this.updateDropdownVisibility(); 
        }
    }

    updateDropdownVisibility() {
        const typeSelect = this.querySelector('#tm-type');
        const targetInput = this.querySelector('#tm-target-input');
        const targetSelect = this.querySelector('#tm-target-select');
        
        if (!targetInput || !targetSelect || !typeSelect) return;

        const teamlistsStr = this.state.teamlists || "";
        const lists = teamlistsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const hasTeamlists = lists.length > 0;

        if (typeSelect.value === 'direct') {
            targetInput.style.display = 'block';
            targetSelect.style.display = 'none';
            targetInput.placeholder = "Empfänger (+49...)";
        } else {
            if (hasTeamlists) {
                const currentVal = targetSelect.value;
                targetSelect.innerHTML = lists.map(l => `<option value="${l}">${l}</option>`).join('');
                if (lists.includes(currentVal)) targetSelect.value = currentVal;
                
                targetInput.style.display = 'none';
                targetSelect.style.display = 'block';
            } else {
                targetInput.style.display = 'block';
                targetSelect.style.display = 'none';
                targetInput.placeholder = "Teamliste (z.B. liste@tmsg.de)";
            }
        }
    }

    applyThemeUpdates() {
        const titleSpan = this.querySelector('.header span');
        if(titleSpan) titleSpan.innerText = this.config.title || 'Nachricht Senden';
        const card = this.querySelector('ha-card');
        if(card) card.className = `theme-${this.state.theme} ${this.state.animation ? 'animate-on-load' : ''}`;
    }

    setupInteractions() {
        const typeSelect = this.querySelector('#tm-type');
        const targetInput = this.querySelector('#tm-target-input');
        const hint = this.querySelector('#format-hint');
        const btn = this.querySelector('#tm-btn');
        const modal = this.querySelector('.tm-settings-modal');

        // Modal Logic (Zahnrad)
        this.querySelector('.btn-settings').addEventListener('click', () => modal.style.display = 'flex');
        this.querySelector('.modal-close').addEventListener('click', () => modal.style.display = 'none');
        
        // Einstellungen Anwenden & Speichern (LocalStorage)
        this.querySelector('.btn-save-settings').addEventListener('click', () => {
            this.state.theme = this.querySelector('.set-theme').value;
            this.state.animation = this.querySelector('.set-anim').checked;
            const teamlistsInput = this.querySelector('.set-teamlists');
            if (teamlistsInput) this.state.teamlists = teamlistsInput.value;
            
            localStorage.setItem(this.cardKey, JSON.stringify(this.state));
            
            this.applyThemeUpdates();
            this.updateDropdownVisibility(); 
            modal.style.display = 'none';
        });

        // Auf Globalen Standard zurücksetzen
        this.querySelector('.btn-reset-settings').addEventListener('click', () => {
            localStorage.removeItem(this.cardKey);
            this.state = {
                theme: this.config.theme || 'classic',
                animation: this.config.animation !== false,
                teamlists: this.config.teamlists || ''
            };
            
            this.querySelector('.set-theme').value = this.state.theme;
            this.querySelector('.set-anim').checked = this.state.animation;
            const setTeamlists = this.querySelector('.set-teamlists');
            if (setTeamlists) setTeamlists.value = this.state.teamlists;

            this.applyThemeUpdates();
            this.updateDropdownVisibility();
            modal.style.display = 'none';
        });

        // Form Logic
        targetInput.addEventListener('blur', (e) => {
            if (typeSelect.value === 'direct') {
                const original = e.target.value;
                const formatted = autoFormatPhone(original);
                if (original !== formatted && formatted.length > 0) {
                    e.target.value = formatted;
                    hint.classList.add('visible');
                    setTimeout(() => hint.classList.remove('visible'), 2000);
                }
            }
        });

        typeSelect.addEventListener('change', (e) => {
            this.updateDropdownVisibility();
            if (e.target.value === 'direct') {
                targetInput.value = autoFormatPhone(targetInput.value); 
            }
        });

        btn.addEventListener('click', () => this.send());
    }

    send() {
        const type = this.querySelector('#tm-type').value;
        const targetInput = this.querySelector('#tm-target-input');
        const targetSelect = this.querySelector('#tm-target-select');
        const msg = this.querySelector('#tm-msg').value.trim();
        const status = this.querySelector('#tm-status');
        const btn = this.querySelector('#tm-btn');

        status.style.display = 'block';
        let finalTarget = "";
        
        if (type === 'direct') {
            finalTarget = autoFormatPhone(targetInput.value.trim());
            targetInput.value = finalTarget; 
            if (!finalTarget.match(/^\+[0-9]{8,15}$/)) {
                status.className = "msg err"; status.innerText = "Ungültige Telefonnummer (z.B. +49171...)."; return;
            }
        } else {
            if (targetSelect.style.display === 'block' && targetSelect.options.length > 0) {
                finalTarget = targetSelect.value.trim();
            } else {
                finalTarget = targetInput.value.trim();
            }
            if (!finalTarget.includes('@')) {
                status.className = "msg err"; status.innerText = "Ungültige E-Mail-Adresse für Teamliste."; return;
            }
        }

        if (!finalTarget || !msg) { status.className = "msg err"; status.innerText = "Bitte Empfänger und Nachricht eingeben."; return; }

        btn.disabled = true; btn.innerText = "Senden...";
        const payload = { message: msg };
        if (type === 'direct') payload.to_mobile = finalTarget;
        else payload.teamlist_email = finalTarget;

        this._hass.callService('sno_teammessage', 'send_message', payload).then(() => {
            status.className = "msg succ"; status.innerText = "Erfolgreich an TeamMessage übergeben!";
            this.querySelector('#tm-msg').value = '';
            setTimeout(() => { status.style.display = 'none'; }, 5000);
        }).catch((e) => {
            status.className = "msg err"; status.innerText = `Fehler beim Senden: ${e.message || 'Service nicht verfügbar'}`;
        }).finally(() => {
            btn.disabled = false; btn.innerText = "Nachricht Senden";
        });
    }
}
customElements.define('sno-teammessage-send-card', SNOTeamMessageSendCard);

// ==========================================
// 2. GUTHABEN KARTE
// ==========================================
class SNOTeamMessageCreditCard extends HTMLElement {
    static getConfigElement() { return document.createElement("sno-teammessage-data-editor"); }
    static getStubConfig() { return { type: "custom:sno-teammessage-credit-card", title: "SMS Guthaben", tm: "" }; }
    
    setConfig(config) { 
        this.config = config; 
        this.cardKey = getCardKey(this.config);
        
        let local = {};
        try { local = JSON.parse(localStorage.getItem(this.cardKey)) || {}; } catch(e){}

        this.state = {
            theme: local.theme ?? this.config.theme ?? 'classic',
            animation: local.animation ?? this.config.animation !== false,
            interval: local.interval ?? this.config.interval ?? 30000,
            autoRefresh: local.autoRefresh ?? true
        };
        this.lastFetch = 0;
        this.timer = null;
    }
    getCardSize() { return 3; }
    disconnectedCallback() { if (this.timer) clearInterval(this.timer); }

    set hass(hass) {
        this._hass = hass; 
        if (!this.querySelector('ha-card')) {
            const animClass = this.state.animation ? 'animate-on-load' : '';
            this.innerHTML = `
                ${getStyles()}
                <ha-card class="theme-${this.state.theme} ${animClass}">
                    <div class="header">
                        <div class="header-left"><ha-icon icon="mdi:wallet"></ha-icon> <span>${this.config.title || 'Guthaben & Statistik'}</span></div>
                        <div class="header-actions">
                            <div class="header-btn" id="btn-refresh" title="Aktualisieren"><ha-icon icon="mdi:refresh"></ha-icon></div>
                            <div class="header-btn btn-settings" title="Persönliche Einstellungen"><ha-icon icon="mdi:cog"></ha-icon></div>
                        </div>
                    </div>
                    <div id="tm-content" class="msg warn">Lade Daten...</div>
                    ${getSettingsModalHTML('credit', this.state)}
                </ha-card>
            `;
            this.setupInteractions();
            this.setupTimer();
        } else {
            this.applyThemeUpdates();
        }
        if (Date.now() - this.lastFetch > this.state.interval) this.fetchData();
    }

    applyThemeUpdates() {
        const titleSpan = this.querySelector('.header span');
        if(titleSpan) titleSpan.innerText = this.config.title || 'Guthaben & Statistik';
        const card = this.querySelector('ha-card');
        if(card) card.className = `theme-${this.state.theme} ${this.state.animation ? 'animate-on-load' : ''}`;
    }

    setupInteractions() {
        this.querySelector('#btn-refresh').addEventListener('click', (e) => {
            e.currentTarget.classList.add('refreshing');
            this.fetchData(true).then(() => e.currentTarget.classList.remove('refreshing'));
        });

        const modal = this.querySelector('.tm-settings-modal');
        this.querySelector('.btn-settings').addEventListener('click', () => modal.style.display = 'flex');
        this.querySelector('.modal-close').addEventListener('click', () => modal.style.display = 'none');
        
        // Speichern
        this.querySelector('.btn-save-settings').addEventListener('click', () => {
            this.state.theme = this.querySelector('.set-theme').value;
            this.state.animation = this.querySelector('.set-anim').checked;
            this.state.autoRefresh = this.querySelector('.set-auto').checked;
            this.state.interval = parseInt(this.querySelector('.set-interval').value);
            
            localStorage.setItem(this.cardKey, JSON.stringify(this.state));

            this.applyThemeUpdates();
            this.setupTimer();
            modal.style.display = 'none';
        });

        // Zurücksetzen
        this.querySelector('.btn-reset-settings').addEventListener('click', () => {
            localStorage.removeItem(this.cardKey);
            this.state = {
                theme: this.config.theme || 'classic',
                animation: this.config.animation !== false,
                interval: this.config.interval || 30000,
                autoRefresh: true
            };
            
            this.querySelector('.set-theme').value = this.state.theme;
            this.querySelector('.set-anim').checked = this.state.animation;
            this.querySelector('.set-auto').checked = this.state.autoRefresh;
            this.querySelector('.set-interval').value = this.state.interval;

            this.applyThemeUpdates();
            this.setupTimer();
            modal.style.display = 'none';
        });
    }

    setupTimer() {
        if (this.timer) clearInterval(this.timer);
        if (this.state.autoRefresh) this.timer = setInterval(() => this.fetchData(), this.state.interval);
    }

    async fetchData(force = false) {
        if (!force && Date.now() - this.lastFetch < 5000) return;
        this.lastFetch = Date.now();
        const content = this.querySelector('#tm-content');
        if (!this.config.tm) { content.className = "msg warn"; content.innerHTML = 'Kd.Nr. (tm) fehlt im Editor.'; return; }
        
        const res = await fetchTMApi(this._hass, `/teamlist/credit/?tm=${this.config.tm}`, this.config);
        if (res.error) {
            content.className = "msg err"; content.innerHTML = `Ladefehler:<br><small>${res.error}</small>`;
        } else if (res.data) {
            content.className = "";
            const credit = res.data.sms_credit !== undefined ? res.data.sms_credit : '--';
            const sum = res.data.sms_sum !== undefined ? res.data.sms_sum : '--';
            content.innerHTML = `
                <div class="credit-graphic">
                    <div class="credit-ring"><span class="val">${credit}</span><span class="sub">Verfügbar</span></div>
                </div>
                <div class="credit-stats"><ha-icon icon="mdi:send-check" style="color:var(--primary-color);"></ha-icon> <span>Gesamt gesendet: <strong>${sum}</strong></span></div>
            `;
        }
    }
}
customElements.define('sno-teammessage-credit-card', SNOTeamMessageCreditCard);

// ==========================================
// 3. STATISTIK KARTE
// ==========================================
class SNOTeamMessageStatsCard extends HTMLElement {
    static getConfigElement() { return document.createElement("sno-teammessage-data-editor"); }
    static getStubConfig() { return { type: "custom:sno-teammessage-stats-card", title: "SMS Verbrauch", tm: "" }; }
    
    setConfig(config) { 
        this.config = config; 
        this.cardKey = getCardKey(this.config);

        let local = {};
        try { local = JSON.parse(localStorage.getItem(this.cardKey)) || {}; } catch(e){}

        this.state = {
            theme: local.theme ?? this.config.theme ?? 'classic',
            animation: local.animation ?? this.config.animation !== false,
            interval: local.interval ?? this.config.interval ?? 30000,
            autoRefresh: local.autoRefresh ?? true
        };
        this.lastFetch = 0; this.timer = null;
    }
    getCardSize() { return 2; }
    disconnectedCallback() { if (this.timer) clearInterval(this.timer); }

    set hass(hass) {
        this._hass = hass;
        if (!this.querySelector('ha-card')) {
            const animClass = this.state.animation ? 'animate-on-load' : '';
            this.innerHTML = `
                ${getStyles()}
                <ha-card class="theme-${this.state.theme} ${animClass}">
                    <div class="header">
                        <div class="header-left"><ha-icon icon="mdi:chart-bar"></ha-icon> <span>${this.config.title || 'Verbrauch'}</span></div>
                        <div class="header-actions">
                            <div class="header-btn" id="btn-refresh" title="Aktualisieren"><ha-icon icon="mdi:refresh"></ha-icon></div>
                            <div class="header-btn btn-settings" title="Persönliche Einstellungen"><ha-icon icon="mdi:cog"></ha-icon></div>
                        </div>
                    </div>
                    <div id="tm-content" class="msg warn">Lade Daten...</div>
                    ${getSettingsModalHTML('stats', this.state)}
                </ha-card>`;
            this.setupInteractions();
            this.setupTimer();
        } else {
            this.applyThemeUpdates();
        }
        if (Date.now() - this.lastFetch > this.state.interval) this.fetchData();
    }

    applyThemeUpdates() {
        const titleSpan = this.querySelector('.header span');
        if(titleSpan) titleSpan.innerText = this.config.title || 'Verbrauch';
        const card = this.querySelector('ha-card');
        if(card) card.className = `theme-${this.state.theme} ${this.state.animation ? 'animate-on-load' : ''}`;
    }

    setupInteractions() {
        this.querySelector('#btn-refresh').addEventListener('click', (e) => {
            e.currentTarget.classList.add('refreshing');
            this.fetchData(true).then(() => e.currentTarget.classList.remove('refreshing'));
        });
        const modal = this.querySelector('.tm-settings-modal');
        this.querySelector('.btn-settings').addEventListener('click', () => modal.style.display = 'flex');
        this.querySelector('.modal-close').addEventListener('click', () => modal.style.display = 'none');
        
        // Speichern
        this.querySelector('.btn-save-settings').addEventListener('click', () => {
            this.state.theme = this.querySelector('.set-theme').value;
            this.state.animation = this.querySelector('.set-anim').checked;
            this.state.autoRefresh = this.querySelector('.set-auto').checked;
            this.state.interval = parseInt(this.querySelector('.set-interval').value);
            
            localStorage.setItem(this.cardKey, JSON.stringify(this.state));

            this.applyThemeUpdates();
            this.setupTimer();
            modal.style.display = 'none';
        });

        // Zurücksetzen
        this.querySelector('.btn-reset-settings').addEventListener('click', () => {
            localStorage.removeItem(this.cardKey);
            this.state = {
                theme: this.config.theme || 'classic',
                animation: this.config.animation !== false,
                interval: this.config.interval || 30000,
                autoRefresh: true
            };
            
            this.querySelector('.set-theme').value = this.state.theme;
            this.querySelector('.set-anim').checked = this.state.animation;
            this.querySelector('.set-auto').checked = this.state.autoRefresh;
            this.querySelector('.set-interval').value = this.state.interval;

            this.applyThemeUpdates();
            this.setupTimer();
            modal.style.display = 'none';
        });
    }

    setupTimer() {
        if (this.timer) clearInterval(this.timer);
        if (this.state.autoRefresh) this.timer = setInterval(() => this.fetchData(), this.state.interval);
    }

    async fetchData(force = false) {
        if (!force && Date.now() - this.lastFetch < 5000) return;
        this.lastFetch = Date.now();
        const content = this.querySelector('#tm-content');
        if (!this.config.tm) { content.className = "msg warn"; content.innerHTML = 'Kd.Nr. fehlt.'; return; }
        
        const res = await fetchTMApi(this._hass, `/teamlist/credit/?tm=${this.config.tm}`, this.config);
        if (res.data && res.data.sms_sum !== undefined) {
            content.className = "";
            content.innerHTML = `<div style="border:1px solid var(--primary-color); border-radius:8px; padding:15px; text-align:center;"><div style="font-size: 2.5rem; font-weight: bold; color: var(--primary-color);">${res.data.sms_sum}</div><div style="font-size: 0.8rem; color: var(--secondary-text-color);">Nachrichten gesendet</div></div>`;
        } else {
            content.className = "msg err"; content.innerHTML = res.error || 'Fehler beim Laden';
        }
    }
}
customElements.define('sno-teammessage-stats-card', SNOTeamMessageStatsCard);

// ==========================================
// 4. LOG KARTE
// ==========================================
class SNOTeamMessageLogCard extends HTMLElement {
    static getConfigElement() { return document.createElement("sno-teammessage-data-editor"); }
    static getStubConfig() { return { type: "custom:sno-teammessage-log-card", title: "Letzte Nachrichten", tm: "", quantity: 5 }; }
    
    setConfig(config) { 
        this.config = config; 
        this.cardKey = getCardKey(this.config);

        let local = {};
        try { local = JSON.parse(localStorage.getItem(this.cardKey)) || {}; } catch(e){}

        this.state = {
            theme: local.theme ?? this.config.theme ?? 'classic',
            animation: local.animation ?? this.config.animation !== false,
            interval: local.interval ?? this.config.interval ?? 30000,
            autoRefresh: local.autoRefresh ?? true,
            limit: local.limit ?? this.config.quantity ?? 5
        };
        this.lastFetch = 0; this.timer = null;
    }
    getCardSize() { return 4; }
    disconnectedCallback() { if (this.timer) clearInterval(this.timer); }

    set hass(hass) {
        this._hass = hass;
        if (!this.querySelector('ha-card')) {
            const animClass = this.state.animation ? 'animate-on-load' : '';
            this.innerHTML = `
                ${getStyles()}
                <ha-card class="theme-${this.state.theme} ${animClass}">
                    <div class="header">
                        <div class="header-left"><ha-icon icon="mdi:format-list-bulleted"></ha-icon> <span>${this.config.title || 'Protokoll'}</span></div>
                        <div class="header-actions">
                            <div class="header-btn" id="btn-refresh" title="Aktualisieren"><ha-icon icon="mdi:refresh"></ha-icon></div>
                            <div class="header-btn btn-settings" title="Persönliche Einstellungen"><ha-icon icon="mdi:cog"></ha-icon></div>
                        </div>
                    </div>
                    <div id="tm-content" class="msg warn">Lade Daten...</div>
                    ${getSettingsModalHTML('log', this.state)}
                </ha-card>`;
            this.setupInteractions();
            this.setupTimer();
        } else {
            this.applyThemeUpdates();
        }
        if (Date.now() - this.lastFetch > this.state.interval) this.fetchData();
    }

    applyThemeUpdates() {
        const titleSpan = this.querySelector('.header span');
        if(titleSpan) titleSpan.innerText = this.config.title || 'Protokoll';
        const card = this.querySelector('ha-card');
        if(card) card.className = `theme-${this.state.theme} ${this.state.animation ? 'animate-on-load' : ''}`;
    }

    setupInteractions() {
        this.querySelector('#btn-refresh').addEventListener('click', (e) => {
            e.currentTarget.classList.add('refreshing');
            this.fetchData(true).then(() => e.currentTarget.classList.remove('refreshing'));
        });
        const modal = this.querySelector('.tm-settings-modal');
        this.querySelector('.btn-settings').addEventListener('click', () => modal.style.display = 'flex');
        this.querySelector('.modal-close').addEventListener('click', () => modal.style.display = 'none');
        
        // Speichern
        this.querySelector('.btn-save-settings').addEventListener('click', () => {
            this.state.theme = this.querySelector('.set-theme').value;
            this.state.animation = this.querySelector('.set-anim').checked;
            this.state.autoRefresh = this.querySelector('.set-auto').checked;
            this.state.interval = parseInt(this.querySelector('.set-interval').value);
            this.state.limit = parseInt(this.querySelector('.set-limit').value) || 5;
            
            localStorage.setItem(this.cardKey, JSON.stringify(this.state));

            this.applyThemeUpdates();
            this.setupTimer();
            modal.style.display = 'none';
            this.fetchData(true);
        });

        // Zurücksetzen
        this.querySelector('.btn-reset-settings').addEventListener('click', () => {
            localStorage.removeItem(this.cardKey);
            this.state = {
                theme: this.config.theme || 'classic',
                animation: this.config.animation !== false,
                interval: this.config.interval || 30000,
                autoRefresh: true,
                limit: this.config.quantity || 5
            };
            
            this.querySelector('.set-theme').value = this.state.theme;
            this.querySelector('.set-anim').checked = this.state.animation;
            this.querySelector('.set-auto').checked = this.state.autoRefresh;
            this.querySelector('.set-interval').value = this.state.interval;
            this.querySelector('.set-limit').value = this.state.limit;

            this.applyThemeUpdates();
            this.setupTimer();
            modal.style.display = 'none';
            this.fetchData(true);
        });
    }

    setupTimer() {
        if (this.timer) clearInterval(this.timer);
        if (this.state.autoRefresh) this.timer = setInterval(() => this.fetchData(), this.state.interval);
    }

    async fetchData(force = false) {
        if (!force && Date.now() - this.lastFetch < 5000) return;
        this.lastFetch = Date.now();
        const content = this.querySelector('#tm-content');
        if (!this.config.tm) { content.className = "msg warn"; content.innerHTML = 'Kd.Nr. fehlt.'; return; }
        
        const res = await fetchTMApi(this._hass, `/logging/sms/?tm=${this.config.tm}&start=0&quantity=${this.state.limit}`, this.config);
        if (res.error) {
            content.className = "msg err"; content.innerHTML = `Ladefehler:<br><small>${res.error}</small>`;
        } else if (res.data) {
            const logs = Array.isArray(res.data) ? res.data : (res.data.rows || []);
            content.className = "";
            if (logs.length === 0) { content.innerHTML = '<div style="color:var(--secondary-text-color); text-align:center; padding: 20px 0;">Keine Log-Einträge vorhanden.</div>'; return; }
            
            let html = '';
            logs.forEach((log) => {
                let statusInfo = getStatusInfo(log.status);
                let target = log.target || log.to_mobile || 'Unbekannt';
                let shortTarget = maskPhone(target);
                let networkName = detectNetwork(target);
                
                let displayDateObj = new Date();
                let createdDateObj = new Date();
                if (log.ts_changed || log.ts_created) displayDateObj = new Date((log.ts_changed || log.ts_created).replace(' ', 'T'));
                if (log.ts_created) createdDateObj = new Date(log.ts_created.replace(' ', 'T'));
                
                let displayTimeString = displayDateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                let displayDateString = displayDateObj.toLocaleDateString();
                let createdTimeString = createdDateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                let createdDateString = createdDateObj.toLocaleDateString();
                
                let msgText = log.full_text || log.message || log.text;
                if (!msgText || msgText.trim() === '') msgText = 'Aus Datenschutzgründen nicht im Log gespeichert.';
                
                let sender = log.sms_from || 'System/API';
                let iconClass = statusInfo.pulse ? 'status-pulse' : '';
                
                html += `
                    <div class="log-entry">
                        <div class="log-summary">
                            <div class="log-icon ${iconClass}"><ha-icon icon="mdi:${statusInfo.icon}" style="color:${statusInfo.color};"></ha-icon></div>
                            <div class="log-info">
                                <div class="log-info-top"><span>${shortTarget}</span><span>${displayTimeString}</span></div>
                                <div class="log-info-bottom"><span style="color:${statusInfo.color}; font-weight:bold;">${statusInfo.text}</span><span><ha-icon icon="mdi:send-outline" style="width:14px;height:14px;"></ha-icon> SMS/Voice</span></div>
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
            content.innerHTML = html;
            
            content.querySelectorAll('.log-summary').forEach(el => {
                el.addEventListener('click', (e) => {
                    const details = e.currentTarget.nextElementSibling;
                    const chevron = e.currentTarget.querySelector('ha-icon[icon="mdi:chevron-down"], ha-icon[icon="mdi:chevron-up"]');
                    if (details.classList.contains('open')) {
                        details.classList.remove('open');
                        if(chevron) chevron.setAttribute('icon', 'mdi:chevron-down');
                    } else {
                        content.querySelectorAll('.log-details.open').forEach(openDet => {
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
    }
}
customElements.define('sno-teammessage-log-card', SNOTeamMessageLogCard);

// ==========================================
// REGISTRIERUNG
// ==========================================
window.customCards = window.customCards || [];
[
    { type: "sno-teammessage-send-card", name: "TeamMessage Senden", description: "SMS/Voice senden" },
    { type: "sno-teammessage-credit-card", name: "TeamMessage Guthaben", description: "Guthaben und Statistik anzeigen" },
    { type: "sno-teammessage-stats-card", name: "TeamMessage Statistik", description: "Minimalistische Verbrauchsanzeige" },
    { type: "sno-teammessage-log-card", name: "TeamMessage Logs", description: "Interaktives Nachrichtenprotokoll" }
].forEach(c => {
    if (!window.customCards.some(existing => existing.type === c.type)) {
        window.customCards.push({ ...c, preview: true });
    }
});
