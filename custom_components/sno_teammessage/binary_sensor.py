
# custom_components/sno_teammessage/binary_sensor.py
"""Binary sensor platform for SNO - TeamMessage."""
import logging
from typing import Any, Dict

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, MANUFACTURER, NAME
from .coordinator import TeamMessageDataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the TeamMessage binary sensors."""
    coordinator: TeamMessageDataUpdateCoordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    team_id: str = hass.data[DOMAIN][entry.entry_id]["team_id"]

    async_add_entities([TeamMessageHealthSensor(coordinator, team_id)])


class TeamMessageHealthSensor(CoordinatorEntity, BinarySensorEntity):
    """Binary sensor monitoring the health of the TeamMessage API."""

    def __init__(self, coordinator: TeamMessageDataUpdateCoordinator, team_id: str) -> None:
        """Initialize the health binary sensor."""
        super().__init__(coordinator)
        self._team_id = team_id
        
        self._attr_has_entity_name = True
        self._attr_translation_key = "health"
        self._attr_unique_id = f"sno_teammessage_{team_id}_health"
        self._attr_device_class = BinarySensorDeviceClass.CONNECTIVITY

    @property
    def device_info(self) -> Dict[str, Any]:
        """Return device information to group entities together."""
        return {
            "identifiers": {(DOMAIN, self._team_id)},
            "name": f"{NAME} ({self._team_id})",
            "manufacturer": MANUFACTURER,
            "sw_version": "1.0.0",
        }

    @property
    def is_on(self) -> bool:
        """Return true if the API health check is successful."""
        health_data = self.coordinator.data.get("health", {})
        # Wenn im health_data ein expliziter "status" steht:
        if "status" in health_data:
            return str(health_data["status"]).lower() == "ok"
        
        # Falls die API ohne spezifischen Status antwortet, aber 200 OK ist:
        return True

