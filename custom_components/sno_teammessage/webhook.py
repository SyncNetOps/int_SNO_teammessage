# custom_components/sno_teammessage/webhook.py || V1.1.1
"""Webhook handler for receiving inbound messages from TeamMessage."""
import logging
from aiohttp.web import Request, Response
from homeassistant.core import HomeAssistant
from .const import EVENT_INCOMING_MESSAGE

_LOGGER = logging.getLogger(__name__)

async def handle_webhook(hass: HomeAssistant, webhook_id: str, request: Request) -> Response:
    try:
        data = await request.json() if request.content_type == "application/json" else await request.post()
        payload = dict(data)
        
        _LOGGER.debug("TeamMessage Webhook Payload: %s", payload)
        hass.bus.async_fire(EVENT_INCOMING_MESSAGE, {"webhook_id": webhook_id, "payload": payload})
        return Response(text="OK", status=200)
    except Exception as err:
        _LOGGER.error("TeamMessage Webhook Fehler: %s", err)
        return Response(text="Internal Server Error", status=500)
