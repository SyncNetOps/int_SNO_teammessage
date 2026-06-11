# custom_components/sno_teammessage/services.py || V1.1.1
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
    vol.Optional("target_type"): cv.string,
    vol.Optional("to_mobile"): cv.string,
    vol.Optional("teamlist_email"): cv.string,
    vol.Optional("keyword"): cv.string,
    vol.Optional("sender_email"): cv.string,
    vol.Optional("from_mobile"): cv.string,
    vol.Optional("channel"): cv.string,
    vol.Optional("date"): cv.string,
    vol.Optional("time"): cv.string,
    vol.Optional("flash", default=False): cv.boolean,
    vol.Optional("test", default=False): cv.boolean,
    vol.Optional("ucs2", default=False): cv.boolean,
})

def format_phone_number(num_str: str) -> str:
    """Smarte Formatierung und Bereinigung von Telefonnummern."""
    if not num_str:
        return ""
    
    s = re.sub(r'[^0-9+]', '', str(num_str))
    s = re.sub(r'\++', '+', s)
    
    if s.startswith('00'):
        s = '+' + s[2:]
    elif s.startswith('0'):
        s = '+49' + s[1:]
    elif re.match(r'^(49|43|41)\d+$', s):
        s = '+' + s
        
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
        
        fb_tl = entry.options.get(CONF_DEFAULT_TEAMLIST)
        fb_sender = entry.options.get(CONF_DEFAULT_SENDER)
        fb_kw = entry.options.get(CONF_DEFAULT_KEYWORD)

        data = call.data
        payload = {
            "message": data.get("message", ""),
            "msg": data.get("message", "")
        }

        # 1. Zielart (target_type) ermitteln
        target_type = data.get("target_type")
        if not target_type:
            if data.get("to_mobile") and str(data.get("to_mobile")).strip():
                target_type = "direct"
            else:
                target_type = "list"

        channel_val = str(data.get("channel", "sms")).strip().lower()
        if channel_val not in ["sms", "voice"]:
            channel_val = "sms"
        payload["channel"] = channel_val

        # AUTH & ROUTING PARAMETER
        tl_val = data.get("teamlist_email", fb_tl)
        if not tl_val or not str(tl_val).strip():
            payload["tl"] = main_team_id
        else:
            tl_str = str(tl_val).strip()
            if tl_str.isdigit():
                payload["tl"] = int(tl_str)
            else:
                payload["teamlist_email"] = tl_str
                payload["tn"] = tl_str
                
        kw_val = data.get("keyword", fb_kw)
        if kw_val and str(kw_val).strip():
            payload["keyword"] = str(kw_val).strip()
            payload["ky"] = str(kw_val).strip()
            
        sender_val = data.get("sender_email", fb_sender)
        if sender_val and str(sender_val).strip():
            payload["sender_email"] = str(sender_val).strip()

        # ---------------------------------------------------------------------
        # ZIEL LOGIK
        # ---------------------------------------------------------------------
        if target_type == "direct":
            mobile_val = data.get("to_mobile")
            if not mobile_val or not str(mobile_val).strip():
                raise HomeAssistantError("FEHLER: Für den Direktversand muss eine Zielrufnummer (to_mobile) angegeben werden.")
            
            formatted_num = format_phone_number(mobile_val)
            if not re.match(r'^\+[0-9]{8,15}$', formatted_num):
                raise HomeAssistantError(f"Ungültige Telefonnummer: {mobile_val}. Bitte internationales Format nutzen (+49...).")
                
            payload["to_mobile"] = formatted_num
            payload["tsms"] = formatted_num

        elif target_type == "list":
            # --- SMART GROUP RESOLVER ---
            try:
                list_target = payload.get("tl", payload.get("teamlist_email", main_team_id))
                _LOGGER.debug("Hole Mitglieder für Teamliste %s ab...", list_target)
                
                members_data = await client.get_teamlist_members(list_target)
                
                mobile_numbers = []
                if members_data and "rows" in members_data:
                    for mb in members_data["rows"]:
                        contact = mb.get("mb_contact", "")
                        ctype = str(mb.get("mb_contacttype", "")).lower()
                        
                        if ctype in ["sms", "voice"] and contact:
                            clean_num = format_phone_number(contact)
                            if clean_num:
                                mobile_numbers.append(clean_num)
                                
                if not mobile_numbers:
                    raise HomeAssistantError(f"Die Teamliste '{list_target}' enthält keine Mitglieder mit dem Typ SMS oder Voice.")
                    
                payload["to_mobile"] = ",".join(mobile_numbers)
                payload["tsms"] = payload["to_mobile"]
                _LOGGER.debug("Auto-Resolve erfolgreich. Sende an Nummern: %s", payload["to_mobile"])
                
            except Exception as e:
                if isinstance(e, HomeAssistantError):
                    raise e
                raise HomeAssistantError(f"Fehler beim Auflösen der Listenmitglieder: {e}")

        for key in ["from_mobile", "date", "time"]:
            val = data.get(key)
            if val and str(val).strip():
                payload[key] = str(val).strip()

        if data.get("flash"): payload["flash"] = 1
        if data.get("test"): payload["test"] = 1
        if data.get("ucs2"): payload["ucs2"] = 1

        try:
            response = await client.send_message(payload)
            _LOGGER.info("Nachricht erfolgreich versendet: %s", response)
        except TeamMessageAPIError as err:
            raise HomeAssistantError(f"API Fehler: {err.error_key} - {str(err)}") from err
        except TeamMessageAuthError as err:
            raise HomeAssistantError("Authentifizierung fehlgeschlagen.") from err
        except TeamMessageConnectionError as err:
            raise HomeAssistantError(f"Netzwerkfehler: {err}") from err

    hass.services.async_register(DOMAIN, "send_message", async_send_message, schema=SERVICE_SEND_MESSAGE_SCHEMA)
