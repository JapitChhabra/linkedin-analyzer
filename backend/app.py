from flask import Flask, request, jsonify
from flask_cors import CORS
from generate_summary import main as generate_summary_main
import os
import time
from functools import wraps
import logging
import sys
from io import StringIO
import json
import pathlib
import uuid
from chatbot import chat_manager
from similarity_calculator import SimilarityCalculator
import requests
from credentials import (
    set_linkedin_credentials, 
    set_gemini_api_key, 
    get_linkedin_credentials, 
    get_gemini_api_key
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# More verbose CORS configuration
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:5173",  # Vite dev server
            "http://127.0.0.1:5173",
            "http://localhost:5000",  # Flask server
            "http://127.0.0.1:5000",
            "https://easyrecruit-ai.netlify.app"
        ],
        "allow_headers": [
            "Content-Type", 
            "X-Requested-With",
            "Authorization", 
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Headers",
            "Access-Control-Allow-Credentials"
        ],
        "supports_credentials": True,
        "methods": ["GET", "POST", "OPTIONS"]
    }
})

# Add a catch-all logging middleware
@app.before_request
def log_request_info():
    app.logger.info('Request Headers: %s', request.headers)
    app.logger.info('Request Method: %s', request.method)
    app.logger.info('Request URL: %s', request.url)
    if request.get_data():
        app.logger.info('Request Data: %s', request.get_data())

# Explicit OPTIONS handler
@app.route('/api/set-credentials', methods=['OPTIONS'])
def handle_options():
    response = jsonify({'status': 'success'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'POST,GET,OPTIONS')
    return response

# File-based cache configuration
CACHE_DIR = pathlib.Path('cache')
CACHE_DIR.mkdir(exist_ok=True)

def get_cache_key(url, custom_prompt=None):
    """Generate a safe filename from URL and optional custom prompt"""
    key = f"{url}_{hash(custom_prompt) if custom_prompt else 'default'}"
    return str(hash(key)) + '.json'

def get_from_cache(url, custom_prompt=None):
    """Get cached result for a URL and custom prompt combination"""
    try:
        cache_file = CACHE_DIR / get_cache_key(url, custom_prompt)
        if cache_file.exists():
            # Check if cache is less than 24 hours old
            if time.time() - cache_file.stat().st_mtime < 86400:  # 24 hours
                with open(cache_file, 'r') as f:
                    logger.info(f'Cache hit for URL: {url}')
                    return json.load(f)
            else:
                logger.info(f'Cache expired for URL: {url}')
                cache_file.unlink()  # Delete expired cache
        return None
    except Exception as e:
        logger.error(f'Error reading cache: {str(e)}')
        return None

def save_to_cache(url, data, custom_prompt=None):
    """Save result to cache"""
    try:
        cache_file = CACHE_DIR / get_cache_key(url, custom_prompt)
        with open(cache_file, 'w') as f:
            json.dump(data, f)
        logger.info(f'Saved to cache: {url}')
    except Exception as e:
        logger.error(f'Error saving to cache: {str(e)}')

def rate_limit(limit_seconds=60):
    """Rate limiting decorator"""
    def decorator(f):
        last_request_time = {}
        
        @wraps(f)
        def wrapped(*args, **kwargs):
            current_time = time.time()
            if request.remote_addr in last_request_time:
                time_passed = current_time - last_request_time[request.remote_addr]
                if time_passed < limit_seconds:
                    logger.warning(f'Rate limit exceeded for IP {request.remote_addr}')
                    return jsonify({
                        'error': f'Please wait {int(limit_seconds - time_passed)} seconds before making another request'
                    }), 429
            
            last_request_time[request.remote_addr] = current_time
            return f(*args, **kwargs)
        return wrapped
    return decorator

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    logger.info('Health check endpoint called')
    return jsonify({'status': 'healthy'})

@app.route('/api/analyze-profile', methods=['POST'])
def analyze_profile():
    try:
        start_time = time.time()
        logger.info('Starting profile analysis')
        
        data = request.json
        linkedin_url = data.get('url')
        custom_prompt = data.get('customPrompt')  # Get custom prompt from request
        summary_options = data.get('summaryOptions')
        
        if not linkedin_url:
            logger.error('No URL provided in request')
            return jsonify({'error': 'No URL provided'}), 400
        
        logger.info(f'Analyzing profile: {linkedin_url}')
        logger.info(f'Custom prompt provided: {custom_prompt if custom_prompt else "None"}')
        
        # Create cache key that includes both URL and prompt
        cache_key = f"{linkedin_url}_{hash(custom_prompt) if custom_prompt else 'default'}"
        
        # Check cache first
        cached_result = get_from_cache(linkedin_url, custom_prompt)
        if cached_result:
            logger.info('Returning cached result')
            return jsonify(cached_result)
        
        # Run the main function from generate_summary.py with the URL and custom prompt
        old_stdout = sys.stdout
        string_buffer = StringIO()
        sys.stdout = string_buffer
        
        generate_summary_main(linkedin_url, custom_prompt, summary_options)
        
        # Get the output and restore stdout
        output = string_buffer.getvalue()
        sys.stdout = old_stdout
        
        # Parse the output to extract the summary
        summary_marker = "=== Generated Professional Summary ==="
        if summary_marker in output:
            summary = output.split(summary_marker)[1].strip()
            
            # Calculate similarity between raw data and summary
            calculator = SimilarityCalculator()
            similarity_score, similarity_metrics = calculator.calculate_similarity(output, summary)
            
            # Create response data
            response_data = {
                'summary': summary,
                'raw_data': output,
                'similarity_analysis': {
                    'score': similarity_score,
                    'metrics': similarity_metrics
                }
            }
            
            # Save to cache
            save_to_cache(linkedin_url, response_data, custom_prompt)
            
            end_time = time.time()
            logger.info(f'Profile analysis completed in {end_time - start_time:.2f} seconds')
            
            return jsonify(response_data)
        else:
            logger.error('Failed to generate summary')
            return jsonify({'error': 'Failed to generate summary'}), 500
            
    except Exception as e:
        logger.error(f'Unexpected error during profile analysis: {str(e)}', exc_info=True)
        if 'sys.stdout' in locals():
            sys.stdout = old_stdout  # Ensure stdout is restored in case of error
        return jsonify({'error': str(e)}), 500

@app.route('/api/clear-cache', methods=['POST'])
def clear_cache():
    """Clear the cache directory"""
    try:
        for cache_file in CACHE_DIR.glob('*.json'):
            cache_file.unlink()
        logger.info('Cache cleared successfully')
        return jsonify({'message': 'Cache cleared successfully'})
    except Exception as e:
        logger.error(f'Error clearing cache: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/init', methods=['POST'])
def init_chat():
    """Initialize a new chat session with the summary context."""
    try:
        data = request.json
        summary_data = data.get('summary')
        raw_data = data.get('raw_data')
        
        if not summary_data or not raw_data:
            return jsonify({'error': 'Summary and raw data are required'}), 400
            
        # Create a unique session ID
        session_id = str(uuid.uuid4())
        
        # Combine summary and raw data for context
        context_data = f"""
        Summary:
        {summary_data}
        
        Raw Profile Data:
        {raw_data}
        """
        
        # Create new chat session
        chat_manager.create_session(session_id, context_data)
        
        return jsonify({
            'session_id': session_id,
            'message': 'Chat session initialized successfully'
        })
        
    except Exception as e:
        logger.error(f'Error initializing chat session: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/message', methods=['POST'])
def chat_message():
    """Handle chat message exchange."""
    try:
        data = request.json
        session_id = data.get('session_id')
        message = data.get('message')
        
        if not session_id or not message:
            return jsonify({'error': 'Session ID and message are required'}), 400
            
        # Get the chat session
        session = chat_manager.get_session(session_id)
        if not session:
            return jsonify({'error': 'Chat session not found or expired'}), 404
            
        # Send message and get response
        response = session.send_message(message)
        
        return jsonify({
            'response': response
        })
        
    except Exception as e:
        logger.error(f'Error in chat message exchange: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/set-credentials', methods=['POST'])
def set_credentials():
    """Set credentials without validation"""
    try:
        data = request.json
        
        # Extract credentials
        linkedin_email = data.get('linkedin_email')
        linkedin_password = data.get('linkedin_password')
        gemini_api_key = data.get('gemini_api_key')
        
        # Validate inputs
        if not all([linkedin_email, linkedin_password, gemini_api_key]):
            return jsonify({
                'status': 'error', 
                'message': 'All credentials are required'
            }), 400
        
        # Simply store credentials
        set_linkedin_credentials(linkedin_email, linkedin_password)
        set_gemini_api_key(gemini_api_key)
        
        return jsonify({
            'status': 'success', 
            'message': 'Credentials stored successfully'
        }), 200
    
    except Exception as e:
        return jsonify({
            'status': 'error', 
            'message': str(e)
        }), 500

if __name__ == '__main__':
    logger.info('Starting Flask application')
    app.run(debug=True, port=5000) 