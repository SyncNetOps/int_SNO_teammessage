# custom_components/sno_teammessage/sensor.py || V1.1.1
"""Sensor platform for SNO - TeamMessage."""
import logging
from typing import Any, Dict

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, MANUFACTURER, NAME
from .coordinator import TeamMessageDataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback) -> None:
    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    team_id = hass.data[DOMAIN][entry.entry_id]["team_id"]
    async_add_entities([
        TeamMessageCreditSensor(coordinator, team_id),
        TeamMessageUsedSensor(coordinator, team_id),
        TeamMessageTariffSensor(coordinator, team_id),
    ])

class TeamMessageBaseSensor(CoordinatorEntity, SensorEntity):
    def __init__(self, coordinator, team_id: str, sensor_type: str) -> None:
        super().__init__(coordinator)
        self._team_id = team_id
        self._sensor_type = sensor_type
        self._attr_has_entity_name = True
        self._attr_unique_id = f"sno_teammessage_{team_id}_{sensor_type}"

    @property
    def device_info(self) -> Dict[str, Any]:
        return {
            "identifiers": {(DOMAIN, self._team_id)},
            "name": f"{NAME} ({self._team_id})",
            "manufacturer": MANUFACTURER,
            "sw_version": "1.1.1",
        }

class TeamMessageCreditSensor(TeamMessageBaseSensor):
    def __init__(self, coordinator, team_id: str) -> None:
        super().__init__(coordinator, team_id, "credit")
        self._attr_translation_key = "credit"
        self._attr_icon = "mdi:message-badge"

    @property
    def native_value(self) -> Any:
        return self.coordinator.data.get("credit", {}).get("sms_credit")

class TeamMessageUsedSensor(TeamMessageBaseSensor):
    def __init__(self, coordinator, team_id: str) -> None:
        super().__init__(coordinator, team_id, "used")
        self._attr_translation_key = "used"
        self._attr_icon = "mdi:message-arrow-right"

    @property
    def native_value(self) -> Any:
        return self.coordinator.data.get("credit", {}).get("sms_sum")

class TeamMessageTariffSensor(TeamMessageBaseSensor):
    def __init__(self, coordinator, team_id: str) -> None:
        super().__init__(coordinator, team_id, "tariff")
        self._attr_translation_key = "tariff"
        self._attr_icon = "mdi:card-account-details"

    @property
    def native_value(self) -> Any:
        return self.coordinator.data.get("credit", {}).get("tariff_code")
