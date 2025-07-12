# Global credentials storage
import logging

logger = logging.getLogger(__name__)

GLOBAL_LINKEDIN_EMAIL = None
GLOBAL_LINKEDIN_PASSWORD = None
GLOBAL_GEMINI_API_KEY = None

def set_linkedin_credentials(email, password):
    """Set LinkedIn credentials"""
    global GLOBAL_LINKEDIN_EMAIL, GLOBAL_LINKEDIN_PASSWORD
    GLOBAL_LINKEDIN_EMAIL = email
    GLOBAL_LINKEDIN_PASSWORD = password
    logger.info(f'LinkedIn credentials set. Email: {email[:3]}***{email[-3:]}')

def set_gemini_api_key(api_key):
    """Set Gemini API key"""
    global GLOBAL_GEMINI_API_KEY
    GLOBAL_GEMINI_API_KEY = api_key
    logger.info(f'Gemini API key set. First 5 chars: {api_key[:5]}***')

def get_linkedin_credentials():
    """Get LinkedIn credentials"""
    logger.info(f'Retrieving LinkedIn credentials. Email set: {bool(GLOBAL_LINKEDIN_EMAIL)}')
    return GLOBAL_LINKEDIN_EMAIL, GLOBAL_LINKEDIN_PASSWORD

def get_gemini_api_key():
    """Get Gemini API key"""
    logger.info(f'Retrieving Gemini API key. Key set: {bool(GLOBAL_GEMINI_API_KEY)}')
    return GLOBAL_GEMINI_API_KEY 