# custom_components/sno_teammessage/const.py | v1.1.0
"""Constants for the SNO - TeamMessage integration."""

DOMAIN = "sno_teammessage"
MANUFACTURER = "SyncNetOps"
NAME = "TeamMessage"

# Configuration & Options Keys
CONF_TEAM_ID = "team_id"
CONF_BEARER_TOKEN = "bearer_token"
CONF_DEFAULT_TEAMLIST = "default_teamlist"
CONF_DEFAULT_SENDER = "default_sender_email"
CONF_DEFAULT_KEYWORD = "default_keyword"

# API Base URL
API_BASE_URL = "https://www.teammessage.de/api/v1"

# API Endpoints
ENDPOINT_HEALTH = f"{API_BASE_URL}/health/"
ENDPOINT_CREDIT = f"{API_BASE_URL}/teamlist/credit/"
ENDPOINT_SMS_SEND = f"{API_BASE_URL}/sms/send/"
ENDPOINT_LOGGING = f"{API_BASE_URL}/logging/sms/"

# Default intervals
UPDATE_INTERVAL_MINUTES = 5

# Event Names
EVENT_INCOMING_MESSAGE = "sno_teammessage_incoming"

# Custom API Error Map (REST API v1.1.0)
API_ERROR_MAP = {
    -1: "invalid_team_id",         
    -2: "invalid_teamlist_email",  
    -5: "invalid_message",         
    -6: "invalid_to_mobile",       
    -10: "account_not_found",      
    -11: "sms_blocked",            
    -12: "ip_not_whitelisted",     
    -13: "rate_limit_exceeded",    
    -14: "closed_group_auth",      
}