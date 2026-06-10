
// custom_components/sno_teammessage/frontend/teammessage-card.js
class TeamMessageCard extends HTMLElement {
    set hass(hass) {
        this._hass = hass;
        if (!this.content) {
            this.innerHTML = `
                <ha-card header="TeamMessage Quick-Send">
                    <div class="card-content">
                        <style>
                            .tm-form { display: flex; flex-direction: column; gap: 12px; }
                            .tm-input, .tm-select { 
                                width: 100%; padding: 8px; border: 1px solid var(--divider-color); 
                                border-radius: 4px; background: var(--card-background-color); 
                                color: var(--primary-text-color); 
                            }
                            .tm-textarea { resize: vertical; min-height: 80px; }
                            .tm-btn { 
                                background-color: var(--primary-color); color: white; 
                                border: none; padding: 10px; border-radius: 4px; 
                                cursor: pointer; font-weight: bold; 
                            }
                            .tm-btn:hover { opacity: 0.9; }
                            .tm-status { font-size: 0.9em; margin-top: 10px; text-align: center; }
                            .tm-success { color: var(--success-color); }
                            .tm-error { color: var(--error-color); }
                        </style>
                        <div class="tm-form">
                            <label>Ziel (Telefon oder Teamliste)</label>
                            <input type="text" id="tm-target" class="tm-input" placeholder="+491701234567 oder team@tmsg.de">
                            
                            <label>Nachricht</label>
                            <textarea id="tm-msg" class="tm-input tm-textarea" placeholder="Deine Nachricht hier..."></textarea>
                            
                            <button id="tm-send" class="tm-btn">Nachricht Senden</button>
                        </div>
                        <div id="tm-status" class="tm-status"></div>
                    </div>
                </ha-card>
            `;
            this.content = true;

            const btn = this.querySelector('#tm-send');
            btn.addEventListener('click', () => this.sendMessage());
        }
    }

    async sendMessage() {
        const target = this.querySelector('#tm-target').value;
        const msg = this.querySelector('#tm-msg').value;
        const statusDiv = this.querySelector('#tm-status');

        if (!target || !msg) {
            statusDiv.innerHTML = '<span class="tm-error">Bitte Ziel und Nachricht eingeben!</span>';
            return;
        }

        statusDiv.innerHTML = 'Sende...';

        const isEmail = target.includes('@');
        const serviceData = { message: msg };
        
        if (isEmail) {
            serviceData.teamlist_email = target;
        } else {
            serviceData.to_mobile = target;
        }

        try {
            await this._hass.callService('sno_teammessage', 'send_message', serviceData);
            statusDiv.innerHTML = '<span class="tm-success">Nachricht erfolgreich versendet!</span>';
            this.querySelector('#tm-msg').value = ''; // Reset textarea
        } catch (err) {
            statusDiv.innerHTML = `<span class="tm-error">Fehler beim Senden: ${err.message}</span>`;
        }
    }

    setConfig(config) {
        this.config = config;
    }

    getCardSize() {
        return 3;
    }
}

customElements.define('teammessage-card', TeamMessageCard);
window.customCards = window.customCards || [];
window.customCards.push({
    type: "teammessage-card",
    name: "TeamMessage Card",
    description: "Eine Lovelace Karte für den schnellen SMS/Push Versand."
});
