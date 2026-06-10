# custom_components/sno_teammessage/services.py | v1.1.0
"""Services with Smart Fallbacks and Fault Tolerance for SNO - TeamMessage."""
import logging
import re
import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import config_validation as cv
from homeassistant.exceptions import HomeAssistantError

from .const import DOMAIN, CONF_TEAM_ID, CONF_DEFAULT_TEAMLIST, CONF_DEFAULT_SENDER, CONF_DEFAULT_KEYWORD
from .api import TeamMessageAPIError, TeamMessageConnectionError, TeamMessageAuthError

_LOGGER = logging.getLogger(__name__)

SERVICE_SEND_MESSAGE_SCHEMA = vol.Schema({
    vol.Required("message"): cv.string,
    vol.Optional("to_mobile"): cv.string,
    vol.Optional("teamlist_email"): cv.string,
    vol.Optional("keyword"): cv.string,
    vol.Optional("sender_email"): cv.string,
    vol.Optional("from_mobile"): cv.string,
    vol.Optional("channel"): cv.string, # Virtual parameter for UI/Cards
    vol.Optional("date"): cv.string,
    vol.Optional("time"): cv.string,
    vol.Optional("flash", default=False): cv.boolean,
    vol.Optional("test", default=False): cv.boolean,
    vol.Optional("ucs2", default=False): cv.boolean,
})

def format_phone_number(num_str: str) -> str:
    """
    Smarte Formatierung und Bereinigung von Telefonnummern.
    Verhindert API-Fehler -6 (to_mobile invalid).
    """
    if not num_str:
        return ""
    
    # Entferne alle Zeichen außer Zahlen und das Plus-Zeichen
    s = re.sub(r'[^0-9+]', '', str(num_str))
    
    # Reduziere versehentlich doppelte Plus-Zeichen
    s = re.sub(r'\++', '+', s)
    
    # Konvertiere Nullen in korrekte Ländercodes
    if s.startswith('00'):
        s = '+' + s[2:]
    elif s.startswith('0'):
        s = '+49' + s[1:]
    elif re.match(r'^(49|43|41)\d+$', s):
        s = '+' + s
        
    # Entferne eventuelle führende Nullen NACH dem Ländercode (z.B. +490170 -> +49170)
    s = re.sub(r'^\+(49|43|41)0+', r'+\1', s)
    
    return s

async def async_setup_services(hass: HomeAssistant) -> None:
    async def async_send_message(call: ServiceCall) -> None:
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            raise HomeAssistantError("TeamMessage ist nicht konfiguriert.")
        
        entry = entries[0]
        client = hass.data[DOMAIN][entry.entry_id]["client"]
        main_team_id = int(entry.data[CONF_TEAM_ID])
        
        # Smart Fallbacks aus den Integrationseinstellungen laden
        fb_tl = entry.options.get(CONF_DEFAULT_TEAMLIST)
        fb_sender = entry.options.get(CONF_DEFAULT_SENDER)
        fb_kw = entry.options.get(CONF_DEFAULT_KEYWORD)

        data = call.data
        payload = {
            "message": data.get("message", ""),
            "msg": data.get("message", "")
        }

        # Fehlertoleranz: Rufnummern prüfen und korrigieren
        if data.get("to_mobile"):
            raw_num = data.get("to_mobile")
            formatted_num = format_phone_number(raw_num)
            
            # API erwartet zwingend 7-20 Ziffern im internationalen Format
            if not re.match(r'^\+[0-9]{8,15}$', formatted_num):
                raise HomeAssistantError(f"Ungültige Telefonnummer: {raw_num}. Bitte Format prüfen (Erwartet: +49...).")
                
            payload["to_mobile"] = formatted_num
            payload["tsms"] = formatted_num
            
        tl_val = data.get("teamlist_email", fb_tl)
        if tl_val:
            tl_val = str(tl_val).strip()
            if tl_val.isdigit():
                payload["tl"] = int(tl_val)
            else:
                payload["teamlist_email"] = tl_val
                payload["tn"] = tl_val
        else:
            # Fallback auf Haupt-ID, falls nichts anderes da ist
            payload["tl"] = main_team_id

        sender_val = data.get("sender_email", fb_sender)
        if sender_val: payload["sender_email"] = str(sender_val).strip()

        kw_val = data.get("keyword", fb_kw)
        if kw_val:
            payload["keyword"] = str(kw_val).strip()
            payload["ky"] = str(kw_val).strip()

        for key in ["from_mobile", "date", "time"]:
            val = data.get(key)
            if val: payload[key] = str(val).strip()

        if data.get("flash"): payload["flash"] = 1
        if data.get("test"): payload["test"] = 1
        if data.get("ucs2"): payload["ucs2"] = 1

        try:
            _LOGGER.debug("Sende TeamMessage Payload: %s", payload)
            response = await client.send_message(payload)
            _LOGGER.info("Nachricht erfolgreich versendet: %s", response)
        except TeamMessageAPIError as err:
            raise HomeAssistantError(f"API Fehler: {err.error_key} - {str(err)}") from err
        except TeamMessageAuthError as err:
            raise HomeAssistantError("Authentifizierung fehlgeschlagen.") from err
        except TeamMessageConnectionError as err:
            raise HomeAssistantError(f"Netzwerkfehler: {err}") from err

    hass.services.async_register(DOMAIN, "send_message", async_send_message, schema=SERVICE_SEND_MESSAGE_SCHEMA)
