# custom_components/sno_teammessage/__init__.py | v1.1.0
"""The SNO - TeamMessage integration."""
import logging
import os

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.components import webhook as ha_webhook
from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.components.http import StaticPathConfig

from .api import TeamMessageApiClient
from .coordinator import TeamMessageDataUpdateCoordinator
from .services import async_setup_services
from .webhook import handle_webhook
from .views import TeamMessageApiView
from .const import DOMAIN, CONF_TEAM_ID, CONF_BEARER_TOKEN

_LOGGER = logging.getLogger(__name__)
PLATFORMS = [Platform.SENSOR]

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up SNO - TeamMessage from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    team_id = entry.data[CONF_TEAM_ID]
    bearer_token = entry.data[CONF_BEARER_TOKEN]
    session = async_get_clientsession(hass)

    client = TeamMessageApiClient(team_id, bearer_token, session)
    coordinator = TeamMessageDataUpdateCoordinator(hass, client, team_id)

    await coordinator.async_config_entry_first_refresh()

    webhook_id = f"{DOMAIN}_{team_id}"
    ha_webhook.async_register(hass, DOMAIN, f"SNO TeamMessage Inbound ({team_id})", webhook_id, handle_webhook)

    hass.data[DOMAIN][entry.entry_id] = {
        "client": client,
        "coordinator": coordinator,
        "team_id": team_id,
        "webhook_id": webhook_id,
    }

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(update_listener))

    if not hass.data[DOMAIN].get("setup_complete"):
        await async_setup_services(hass)
        
        frontend_path = hass.config.path("custom_components/sno_teammessage/frontend")
        if os.path.exists(frontend_path):
            await hass.http.async_register_static_paths([
                StaticPathConfig("/sno_teammessage_frontend", frontend_path, cache_headers=False)
            ])

        hass.http.register_view(TeamMessageApiView(hass))

        async_register_built_in_panel(
            hass,
            component_name="custom",
            sidebar_title="TeamMessage",
            sidebar_icon="mdi:message-text-fast",
            frontend_url_path="sno_teammessage",
            require_admin=True,
            config={"_panel_custom": {"name": "teammessage-panel", "module_url": "/sno_teammessage_frontend/teammessage-panel.js"}},
        )
        hass.data[DOMAIN]["setup_complete"] = True

    return True

async def update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle options update."""
    await hass.config_entries.async_reload(entry.entry_id)

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    webhook_id = hass.data[DOMAIN][entry.entry_id].get("webhook_id")
    if webhook_id:
        ha_webhook.async_unregister(hass, webhook_id)

    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok