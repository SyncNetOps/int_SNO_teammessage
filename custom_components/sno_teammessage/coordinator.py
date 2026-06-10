# custom_components/sno_teammessage/coordinator.py | v1.1.0
"""DataUpdateCoordinator for SNO - TeamMessage."""
import logging
from datetime import timedelta
from typing import Any, Dict

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import TeamMessageApiClient, TeamMessageConnectionError, TeamMessageAPIError, TeamMessageAuthError
from .const import DOMAIN, UPDATE_INTERVAL_MINUTES

_LOGGER = logging.getLogger(__name__)

class TeamMessageDataUpdateCoordinator(DataUpdateCoordinator[Dict[str, Any]]):
    def __init__(self, hass: HomeAssistant, client: TeamMessageApiClient, team_id: str) -> None:
        super().__init__(hass, _LOGGER, name=DOMAIN, update_interval=timedelta(minutes=UPDATE_INTERVAL_MINUTES))
        self.client = client
        self.team_id = team_id

    async def _async_update_data(self) -> Dict[str, Any]:
        try:
            health_data = await self.client.get_health()
            credit_data = await self.client.get_credit()
            logs_data = await self.client.get_logs(limit=50)

            return {
                "health": health_data,
                "credit": credit_data,
                "logs": logs_data,
            }
        except TeamMessageAPIError as err:
            if err.error_key == "rate_limit_exceeded":
                _LOGGER.warning("TeamMessage Rate-Limit überschritten. Pausiere Abfragen.")
            raise UpdateFailed(f"API Fehler: {err}") from err
        except TeamMessageAuthError as err:
            raise UpdateFailed("Authentifizierung fehlgeschlagen.") from err
        except TeamMessageConnectionError as err:
            raise UpdateFailed(f"Verbindungsfehler zur API: {err}") from err
        except Exception as err:
            _LOGGER.exception("Unerwarteter Fehler beim Abrufen der TeamMessage Daten")
            raise UpdateFailed(f"Unbekannter Fehler: {err}") from err