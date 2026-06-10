# custom_components/sno_teammessage/views.py | v1.1.0
"""HTTP Views providing a secure proxy for the Glassmorphism SPA."""
import logging
from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import DOMAIN, API_BASE_URL
from .api import TeamMessageAPIError, TeamMessageAuthError, TeamMessageConnectionError

_LOGGER = logging.getLogger(__name__)

class TeamMessageApiView(HomeAssistantView):
    """View to securely proxy API requests to TeamMessage."""
    url = "/api/sno_teammessage/proxy"
    name = "api:sno_teammessage:proxy"
    requires_auth = True 

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    async def get(self, request: web.Request) -> web.Response:
        return await self._handle_request(request, "GET")

    async def post(self, request: web.Request) -> web.Response:
        return await self._handle_request(request, "POST")

    async def put(self, request: web.Request) -> web.Response:
        return await self._handle_request(request, "PUT")

    async def delete(self, request: web.Request) -> web.Response:
        return await self._handle_request(request, "DELETE")

    async def _handle_request(self, request: web.Request, method: str) -> web.Response:
        entries = self.hass.config_entries.async_entries(DOMAIN)
        if not entries:
            return self.json_message("Integration nicht konfiguriert", status_code=400)

        entry = entries[0]
        client = self.hass.data[DOMAIN][entry.entry_id]["client"]
        
        # Hole alle Parameter aus der URL
        query_params = dict(request.query)
        endpoint = query_params.pop("endpoint", "")

        if not endpoint:
            return self.json_message("Fehlender Parameter 'endpoint'", status_code=400)

        # Bereinigter Endpunkt für die Auswertung (ohne Schrägstriche)
        clean_endpoint = endpoint.strip("/")

        # --- LOKALES OPTIONS-ROUTING ---
        if clean_endpoint == "options":
            if method == "GET":
                return self.json(dict(entry.options))
            elif method in ("POST", "PUT"):
                body = await request.json() if request.can_read_body else {}
                new_options = dict(entry.options)
                new_options.update(body)
                self.hass.config_entries.async_update_entry(entry, options=new_options)
                return self.json({"success": True})
            return self.json_message("Methode nicht erlaubt", status_code=405)
        # -------------------------------

        # --- EXTERNES API ROUTING ---
        # Stelle sicher, dass immer exakt ein Slash eingefügt wird
        if not endpoint.startswith("/"):
            endpoint = f"/{endpoint}"
            
        api_url = f"{API_BASE_URL}{endpoint}"

        try:
            if method == "GET":
                response_data = await client._request("GET", api_url, params=query_params)
            else:
                body = await request.json() if request.can_read_body else {}
                # Gebe zwingend auch params mit, da die TeamMessage API bei PUT/DELETE Parameter in der URL verlangt!
                response_data = await client._request(method, api_url, data=body, params=query_params)

            return self.json(response_data)

        except TeamMessageAPIError as err:
            return self.json_message(f"{err.error_key}: {str(err)}", status_code=400)
        except TeamMessageAuthError:
            return self.json_message("Authentifizierung fehlgeschlagen", status_code=401)
        except TeamMessageConnectionError as err:
            return self.json_message(f"Verbindungsfehler: {err}", status_code=502)
        except Exception as err:
            _LOGGER.exception("Frontend Proxy Fehler")
            return self.json_message(str(err), status_code=500)
