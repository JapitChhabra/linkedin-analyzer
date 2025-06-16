import requests
import json
import os
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

def print_response(prefix: str, text: str):
    """Format and print chat messages."""
    print(f"\n{prefix}:")
    print("=" * (len(prefix) + 1))
    print(text.strip())
    print("-" * 50)

def test_chat():
    # Base URL for the API
    base_url = 'http://localhost:5000'
    
    # Test data
    test_summary = """
    John Doe is a Senior Software Engineer at Tech Corp with over 10 years of experience in software development.
    He specializes in full-stack development, cloud architecture, and machine learning.
    Previously worked at StartUp Inc and has a Master's degree in Computer Science.
    """
    
    test_raw_data = """
    === Profile Information ===
    Name: John Doe
    Title: Senior Software Engineer
    Company: Tech Corp
    Location: San Francisco, CA
    
    === Experience ===
    - Senior Software Engineer, Tech Corp (2020-Present)
    - Software Engineer, StartUp Inc (2015-2020)
    
    === Education ===
    - MS Computer Science, Stanford University (2013-2015)
    - BS Computer Engineering, MIT (2009-2013)
    """
    
    try:
        # Step 1: Initialize chat session
        print("\nInitializing chat session...")
        init_response = requests.post(
            f'{base_url}/api/chat/init',
            json={
                'summary': test_summary,
                'raw_data': test_raw_data
            }
        )
        
        init_response.raise_for_status()
        session_data = init_response.json()
        session_id = session_data['session_id']
        print(f"Chat session initialized with ID: {session_id}")
        
        # Step 2: Test message exchange
        test_messages = [
            "What is John's current role and responsibilities?",
            "What is his educational background and academic achievements?",
            "What are his key skills and areas of expertise?",
            "Can you analyze his career progression and growth?",
            "Based on his profile, what kind of roles would be suitable for his next career move?"
        ]
        
        for i, message in enumerate(test_messages, 1):
            print_response(f"User Message {i}", message)
            
            message_response = requests.post(
                f'{base_url}/api/chat/message',
                json={
                    'session_id': session_id,
                    'message': message
                }
            )
            
            message_response.raise_for_status()
            response_data = message_response.json()
            print_response(f"AI Response {i}", response_data['response'])
            
            # Add a small delay between messages to avoid rate limiting
            if i < len(test_messages):
                time.sleep(1)
        
        print("\nChat test completed successfully!")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server. Make sure the Flask server is running on localhost:5000")
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
        try:
            error_data = e.response.json()
            print(f"Server Error Details: {json.dumps(error_data, indent=2)}")
        except:
            print(f"Raw Response: {e.response.text}")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")

if __name__ == "__main__":
    test_chat() 