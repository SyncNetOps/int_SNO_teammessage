# custom_components/sno_teammessage/config_flow.py || V1.1.1
"""Config flow and Options flow for SNO - TeamMessage integration."""
import logging
from typing import Any, Dict
import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import TeamMessageApiClient, TeamMessageAuthError, TeamMessageConnectionError, TeamMessageAPIError
from .const import (
    DOMAIN, CONF_TEAM_ID, CONF_BEARER_TOKEN, 
    CONF_DEFAULT_TEAMLIST, CONF_DEFAULT_SENDER, CONF_DEFAULT_KEYWORD
)

_LOGGER = logging.getLogger(__name__)

DATA_SCHEMA = vol.Schema({
    vol.Required(CONF_TEAM_ID): str,
    vol.Required(CONF_BEARER_TOKEN): str,
})

async def validate_input(hass: HomeAssistant, data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate the user input allows us to connect."""
    session = async_get_clientsession(hass)
    client = TeamMessageApiClient(data[CONF_TEAM_ID], data[CONF_BEARER_TOKEN], session)
    result = await client.verify_credentials()
    title = f"SNO - TeamMessage ({data[CONF_TEAM_ID]})" if "tariff_code" in result else f"TeamMessage ({data[CONF_TEAM_ID]})"
    return {"title": title}

class TeamMessageConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for SNO - TeamMessage."""
    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get the options flow for this handler."""
        return TeamMessageOptionsFlowHandler(config_entry)

    async def async_step_user(self, user_input: Dict[str, Any] | None = None) -> FlowResult:
        """Handle the initial user input."""
        errors: Dict[str, str] = {}

        if user_input is not None:
            await self.async_set_unique_id(user_input[CONF_TEAM_ID])
            self._abort_if_unique_id_configured()

            try:
                info = await validate_input(self.hass, user_input)
                return self.async_create_entry(title=info["title"], data=user_input)
            except TeamMessageConnectionError:
                errors["base"] = "cannot_connect"
            except TeamMessageAuthError:
                errors["base"] = "invalid_auth"
            except TeamMessageAPIError as err:
                errors["base"] = err.error_key
            except Exception as err:
                _LOGGER.exception("Unexpected exception during setup: %s", err)
                errors["base"] = "unknown"

        return self.async_show_form(step_id="user", data_schema=DATA_SCHEMA, errors=errors)

class TeamMessageOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle options flow for SNO - TeamMessage."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(self, user_input: Dict[str, Any] | None = None) -> FlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="Globale Fallbacks", data=user_input)

        options_schema = vol.Schema({
            vol.Optional(CONF_DEFAULT_TEAMLIST, default=self.config_entry.options.get(CONF_DEFAULT_TEAMLIST, "")): str,
            vol.Optional(CONF_DEFAULT_SENDER, default=self.config_entry.options.get(CONF_DEFAULT_SENDER, "")): str,
            vol.Optional(CONF_DEFAULT_KEYWORD, default=self.config_entry.options.get(CONF_DEFAULT_KEYWORD, "")): str,
        })

        return self.async_show_form(step_id="init", data_schema=options_schema)
