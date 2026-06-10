// www/sno-teammessage/teammessage-cards.js | v1.1.0
// HINWEIS: Muss manuell als Dashboard Ressource (/local/sno-teammessage/teammessage-cards.js) geladen werden!

class TeamMessageCreditCard extends HTMLElement {
    set hass(hass) {
        if (!this.content) {
            this.innerHTML = `
                <ha-card header="TeamMessage Guthaben">
                    <div class="card-content" style="text-align:center; padding:20px;">
                        <h1 id="tm-credit" style="font-size:3rem; color:var(--primary-color); margin:0;">-</h1>
                        <p>Verfügbare SMS</p>
                    </div>
                </ha-card>
            `;
            this.content = this.querySelector('#tm-credit');
        }
        
        // Suche dynamisch nach dem Credit Sensor der Integration
        const entityId = Object.keys(hass.states).find(e => e.startsWith('sensor.sno_teammessage_') && e.endsWith('_credit'));
        if (entityId && hass.states[entityId]) {
            this.content.innerText = hass.states[entityId].state;
        } else {
            this.content.innerText = "N/A";
        }
    }
    setConfig(config) { this.config = config; }
    static getStubConfig() { return { type: "custom:teammessage-credit-card" }; }
}
customElements.define('teammessage-credit-card', TeamMessageCreditCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "teammessage-credit-card", name: "TM Guthaben", description: "Zeigt das SNO TeamMessage Guthaben" });

class TeamMessageSendCard extends HTMLElement {
    set hass(hass) {
        this._hass = hass;
        if (!this.content) {
            this.innerHTML = `
                <ha-card header="Schnellversand (TeamMessage)">
                    <div class="card-content">
                        <textarea id="tm-quick-msg" rows="3" style="width:100%; border-radius:4px; padding:8px; border:1px solid var(--divider-color); background:var(--card-background-color); color:var(--primary-text-color);" placeholder="Nachricht (nutzt globale Fallbacks)..."></textarea>
                        <button id="tm-quick-btn" style="margin-top:10px; width:100%; background:var(--primary-color); color:white; border:none; padding:10px; border-radius:4px; cursor:pointer;">Senden</button>
                        <div id="tm-quick-res" style="margin-top:8px; font-size:0.9em;"></div>
                    </div>
                </ha-card>
            `;
            this.content = true;
            this.querySelector('#tm-quick-btn').addEventListener('click', async () => {
                const msg = this.querySelector('#tm-quick-msg').value;
                if(!msg) return;
                this.querySelector('#tm-quick-res').innerText = "Sende...";
                try {
                    await this._hass.callService('sno_teammessage', 'send_message', { message: msg });
                    this.querySelector('#tm-quick-res').innerText = "Erfolgreich!";
                    this.querySelector('#tm-quick-msg').value = '';
                } catch(e) {
                    this.querySelector('#tm-quick-res').innerText = "Fehler: " + e.message;
                }
            });
        }
    }
    setConfig(config) { this.config = config; }
    static getStubConfig() { return { type: "custom:teammessage-send-card" }; }
}
customElements.define('teammessage-send-card', TeamMessageSendCard);
window.customCards.push({ type: "teammessage-send-card", name: "TM Senden", description: "Schnellversand Formular" });