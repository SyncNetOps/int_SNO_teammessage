# custom_components/sno_teammessage/api.py | v1.1.0
"""API Client for SNO - TeamMessage."""
import logging
import asyncio
import json
from typing import Any, Dict

import aiohttp
from .const import ENDPOINT_CREDIT, ENDPOINT_HEALTH, ENDPOINT_LOGGING, ENDPOINT_SMS_SEND, API_ERROR_MAP

_LOGGER = logging.getLogger(__name__)

class TeamMessageAPIError(Exception):
    def __init__(self, error_key: str, message: str = ""):
        super().__init__(message)
        self.error_key = error_key

class TeamMessageAuthError(Exception): pass
class TeamMessageConnectionError(Exception): pass

class TeamMessageApiClient:
    """API Client to interact with the TeamMessage.de REST API v1.1.0."""

    def __init__(self, team_id: str, bearer_token: str, session: aiohttp.ClientSession) -> None:
        self._team_id = int(team_id)
        self._bearer_token = bearer_token
        self._session = session
        self._headers = {
            "Authorization": f"Bearer {self._bearer_token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

    async def _request(self, method: str, url: str, **kwargs) -> Dict[str, Any]:
        params = kwargs.pop("params", {})
        params["tm"] = self._team_id
        params["team_id"] = self._team_id
        kwargs["params"] = params

        if method.upper() in ["POST", "PUT", "DELETE"]:
            raw_data = kwargs.pop("data", {})
            raw_data["tm"] = self._team_id
            raw_data["team_id"] = self._team_id
            kwargs["json"] = raw_data

        try:
            async with self._session.request(method, url, headers=self._headers, **kwargs) as response:
                if response.status in (401, 403):
                    raise TeamMessageAuthError("Ungültige Zugangsdaten")
                
                text_body = await response.text()
                try: result = json.loads(text_body)
                except json.JSONDecodeError: result = {}

                if response.status >= 400:
                    error_detail = result.get("message", result.get("detail", text_body))
                    if "code" in result and isinstance(result["code"], int) and result["code"] < 0:
                        raise TeamMessageAPIError(API_ERROR_MAP.get(result["code"], "unknown"), str(error_detail))
                    _LOGGER.error("TeamMessage HTTP %s: %s", response.status, error_detail)
                    raise TeamMessageConnectionError(f"HTTP {response.status} - API: {error_detail}")

                if "code" in result and isinstance(result["code"], int) and result["code"] < 0:
                    raise TeamMessageAPIError(API_ERROR_MAP.get(result["code"], "unknown"), result.get("message", f"API Error {result['code']}"))

                return result

        except aiohttp.ClientResponseError as err:
            raise TeamMessageConnectionError(f"HTTP Fehler: {err.status}") from err
        except aiohttp.ClientError as err:
            raise TeamMessageConnectionError(f"Verbindungsfehler: {err}") from err
        except asyncio.TimeoutError as err:
            raise TeamMessageConnectionError("Zeitüberschreitung (Timeout)") from err

    async def verify_credentials(self) -> Dict[str, Any]:
        return await self._request("GET", ENDPOINT_CREDIT, timeout=aiohttp.ClientTimeout(total=10))

    async def get_health(self) -> Dict[str, Any]:
        return await self._request("GET", ENDPOINT_HEALTH, timeout=aiohttp.ClientTimeout(total=10))

    async def get_credit(self) -> Dict[str, Any]:
        return await self._request("GET", ENDPOINT_CREDIT, timeout=aiohttp.ClientTimeout(total=10))

    async def get_logs(self, limit: int = 100) -> Dict[str, Any]:
        return await self._request("GET", ENDPOINT_LOGGING, params={"quantity": limit}, timeout=aiohttp.ClientTimeout(total=15))

    async def send_message(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return await self._request("POST", ENDPOINT_SMS_SEND, data=payload, timeout=aiohttp.ClientTimeout(total=20))