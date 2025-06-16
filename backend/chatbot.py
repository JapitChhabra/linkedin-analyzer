import os
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

class ChatSession:
    def __init__(self, session_id: str, summary_data: str):
        """Initialize a new chat session."""
        self.session_id = session_id
        self.summary_data = summary_data
        self.created_at = datetime.now()
        self.last_accessed = datetime.now()
        self.history: List[Dict[str, List[str]]] = []
        
        # Initialize chat with context
        initial_prompt = f"""You are an AI assistant helping to analyze and discuss a LinkedIn profile summary.
        Here's the profile summary data to provide context for our conversation:
        
        {summary_data}
        
        Make sure to keep your responses properly formatted and prefer not using any bold formatting or lists, answer in an intuitive paragraph style chat format. if your refer anything from the data provided also make sure not to use any asterix or other symbols used for markdown formatting.
        Please help answer questions and provide insights about this profile. Keep your responses professional and focused on the career and professional aspects discussed in the summary."""
        
        try:
            # Add initial context to history
            self.history.append({"role": "user", "parts": [initial_prompt]})
            # Get initial response from Gemini
            initial_response = self._get_gemini_response(self.history)
            self.history.append({"role": "model", "parts": [initial_response]})
        except Exception as e:
            logger.error(f"Failed to initialize chat session: {str(e)}")
            raise

    def send_message(self, message: str) -> str:
        """Send a message to the chat and get the response."""
        try:
            self.last_accessed = datetime.now()
            
            # Add user message to history
            self.history.append({"role": "user", "parts": [message]})
            
            # Get response from Gemini
            response = self._get_gemini_response(self.history)
            
            # Add response to history
            self.history.append({"role": "model", "parts": [response]})
            
            return response
        except Exception as e:
            logger.error(f"Error in chat message exchange: {str(e)}")
            raise

    def _get_gemini_response(self, history: List[Dict[str, List[str]]]) -> str:
        """Get response from Gemini API using the same approach as generate_summary.py."""
        try:
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                logger.error('Gemini API key not found in environment variables')
                return "Error: Gemini API key not configured"

            headers = {
                "Content-Type": "application/json"
            }
            
            payload = {
                "contents": [
                    {
                        "role": msg["role"],
                        "parts": [{"text": msg["parts"][0]}]
                    }
                    for msg in history
                ]
            }
            
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
            
            logger.info('Sending request to Gemini API')
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            if "candidates" in result:
                return result["candidates"][0]["content"]["parts"][0]["text"]
            else:
                logger.error('Unexpected API response format')
                return "Error: Unable to generate response from the API"
                
        except requests.exceptions.RequestException as e:
            logger.error(f'Error calling Gemini API: {str(e)}')
            return f"Error calling Gemini API: {str(e)}"
        except Exception as e:
            logger.error(f'Unexpected error in getting response: {str(e)}')
            return f"Error generating response: {str(e)}"

class ChatManager:
    def __init__(self, session_timeout_minutes: int = 30):
        """Initialize the chat manager."""
        self.sessions: Dict[str, ChatSession] = {}
        self.session_timeout = timedelta(minutes=session_timeout_minutes)

    def create_session(self, session_id: str, summary_data: str) -> ChatSession:
        """Create a new chat session."""
        try:
            session = ChatSession(session_id, summary_data)
            self.sessions[session_id] = session
            return session
        except Exception as e:
            logger.error(f"Failed to create chat session: {str(e)}")
            raise

    def get_session(self, session_id: str) -> Optional[ChatSession]:
        """Get an existing chat session."""
        session = self.sessions.get(session_id)
        if session:
            # Check if session has expired
            if datetime.now() - session.last_accessed > self.session_timeout:
                logger.info(f"Session {session_id} has expired")
                del self.sessions[session_id]
                return None
            return session
        return None

    def cleanup_expired_sessions(self):
        """Remove expired chat sessions."""
        current_time = datetime.now()
        expired_sessions = [
            session_id for session_id, session in self.sessions.items()
            if current_time - session.last_accessed > self.session_timeout
        ]
        for session_id in expired_sessions:
            del self.sessions[session_id]

# Create global chat manager instance
chat_manager = ChatManager() 