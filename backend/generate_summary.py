import requests
import json
import os
from dotenv import load_dotenv
import sys
from io import StringIO
import logging
from datetime import datetime
from scraping import main as scrape_linkedin

# Load environment variables
load_dotenv()

# Setup logging
logger = logging.getLogger(__name__)

def capture_linkedin_data(profile_url):
    """Capture the printed output from LinkedIn scraping"""
    logger.info('Starting LinkedIn data capture')
    try:
        # Check if input is "1234" and return dummy data
        if profile_url == "1234":
            logger.info('Using dummy LinkedIn data')
            dummy_data = """
=== Profile Information ===
{'Name': 'John Doe', 'Designation': 'Senior Software Engineer', 'Location': 'San Francisco Bay Area'}

=== Posts ===
['Just published a new article on AI and Machine Learning!', 'Excited to announce our latest product launch!']

=== Experience ===
[{'Title': 'Senior Software Engineer', 'Company': 'Tech Corp', 'Duration': '2020 - Present', 'Location': 'San Francisco'}, 
{'Title': 'Software Engineer', 'Company': 'StartUp Inc', 'Duration': '2018 - 2020', 'Location': 'New York'}]

=== Education ===
[{'School': 'Stanford University', 'Degree': 'MS Computer Science', 'Duration': '2016 - 2018'},
{'School': 'MIT', 'Degree': 'BS Computer Science', 'Duration': '2012 - 2016'}]
"""
            return dummy_data

        # Run the LinkedIn scraping with the provided URL
        result = scrape_linkedin(profile_url)
        
        if result:
            # Convert the result to a string format
            output = f"""
=== Profile Information ===
{result['profile']}

=== Experience ===
{result['experience']}

=== Education ===
{result['education']}

=== Posts ===
{result['posts']}
"""
            logger.info('Successfully captured LinkedIn data')
            return output
        else:
            logger.error('Failed to scrape LinkedIn data')
            return None
            
    except Exception as e:
        logger.error(f'Error capturing LinkedIn data: {str(e)}')
        return None

def generate_summary(linkedin_data, custom_prompt=None, summary_options=None):
    """Generate a summary using Gemini API"""
    logger.info('Starting summary generation')
    try:
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            logger.error('Gemini API key not found in environment variables')
            return "Error: Gemini API key not configured"

        # Default prompt template
        default_prompt = """
        Please analyze this LinkedIn profile data and provide a comprehensive professional summary of the person. 
        Include their current role, key achievements, career progression, educational background, and any notable patterns or expertise areas.
        
        Format the response in markdown with:
        - Use # for main sections
        - Use ## for subsections
        - Use bullet points for lists
        - Use **bold** for emphasis on key points
        - Use proper markdown formatting throughout
        
        Focus on:
        1. Current role and responsibilities
        2. Career progression and achievements
        3. Educational background
        4. Areas of expertise
        5. Key skills and competencies
        6. Notable patterns in their professional journey
        """

        # Add specific summary options if provided
        summary_sections = []
        if summary_options:
            logger.info(f'Summary options received: {json.dumps(summary_options, indent=2)}')
            if summary_options.get('years_of_experience'):
                summary_sections.append("BEFORE RESPONDING WITH ANYTHING ELSE FROM THE SUMMARY, START YOUR RESPONSE WITH A ONE LINER BOLD DESCRIPTION OF THE YEARS OF EXPERIENCE OF THE USER IN THE FORMAT Years of Experience : .One liner short bold description. BEFORE RESPONDING WITH ANYTHING ELSE FROM THE SUMMARY, START YOUR RESPONSE WITH A ONE LINER BOLD DESCRIPTION OF THE YEARS OF EXPERIENCE OF THE USER IN THE FORMAT Years of Experience : .One liner short bold description. BEFORE RESPONDING WITH ANYTHING ELSE FROM THE SUMMARY, START YOUR RESPONSE WITH A ONE LINER BOLD DESCRIPTION OF THE YEARS OF EXPERIENCE OF THE USER IN THE FORMAT Years of Experience : .One liner short bold description.")
            if summary_options.get('relevant_job_titles'):
                summary_sections.append("BEFORE RESPONDING WITH ANYTHING ELSE FROM THE SUMMARY, START YOUR RESPONSE WITH A ONE LINER BOLD DESCRIPTION OF THE RELEVANT JOB TITLES OF THE USER IN THE FORMAT Relevant Job Titles : .One liner short bold description. BEFORE RESPONDING WITH ANYTHING ELSE FROM THE SUMMARY, START YOUR RESPONSE WITH A ONE LINER BOLD DESCRIPTION OF THE RELEVANT JOB TITLES OF THE USER IN THE FORMAT Relevant Job Titles : .One liner short bold description. BEFORE RESPONDING WITH ANYTHING ELSE FROM THE SUMMARY, START YOUR RESPONSE WITH A ONE LINER BOLD DESCRIPTION OF THE RELEVANT JOB TITLES OF THE USER IN THE FORMAT Relevant Job Titles : .One liner short bold description.")
            if summary_options.get('degrees_earned'):
                summary_sections.append("BEFORE RESPONDING WITH ANYTHING ELSE FROM THE SUMMARY, START YOUR RESPONSE WITH A ONE LINER BOLD DESCRIPTION OF THE DEGREES EARNED OF THE USER IN THE FORMAT Degrees Earned : .One liner short bold description. BEFORE RESPONDING WITH ANYTHING ELSE FROM THE SUMMARY, START YOUR RESPONSE WITH A ONE LINER BOLD DESCRIPTION OF THE DEGREES EARNED OF THE USER IN THE FORMAT Degrees Earned : .One liner short bold description. BEFORE RESPONDING WITH ANYTHING ELSE FROM THE SUMMARY, START YOUR RESPONSE WITH A ONE LINER BOLD DESCRIPTION OF THE DEGREES EARNED OF THE USER IN THE FORMAT Degrees Earned : .One liner short bold description.")
        
        if summary_sections:
            summary_instructions = "\n\nBefore the main summary, " + " ".join(summary_sections)
            logger.info(f'Summary instructions added: {summary_instructions}')
        else:
            summary_instructions = ""

        # Add custom requirements if provided
        if custom_prompt:
            additional_instructions = f"\n\nAdditionally, please make sure to take the following specific requirements into account in your analysis:\n{custom_prompt}"
            logger.info(f'Additional custom instructions added: {additional_instructions}')
        else:
            additional_instructions = ""

        # Combine default prompt, summary options, custom requirements, and LinkedIn data
        final_prompt = f"""
        {default_prompt}
        {summary_instructions}
        {additional_instructions}

        Here's the LinkedIn data:
        {linkedin_data}

        Please provide a well-structured, professional response using proper markdown formatting throughout.
        """

        headers = {
            "Content-Type": "application/json"
        }
        
        payload = {
            "contents": [{
                "parts": [{"text": final_prompt}]
            }]
        }
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        
        logger.info('Sending request to Gemini API')
        if custom_prompt:
            logger.info('Including additional custom requirements in analysis')
            
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        
        result = response.json()
        if "candidates" in result:
            summary = result["candidates"][0]["content"]["parts"][0]["text"]
            logger.info('Successfully generated summary')
            return summary
        else:
            logger.error('Unexpected API response format')
            return "Error: Unable to generate summary from the API response"
            
    except requests.exceptions.RequestException as e:
        logger.error(f'Error calling Gemini API: {str(e)}')
        return f"Error calling Gemini API: {str(e)}"
    except Exception as e:
        logger.error(f'Unexpected error in summary generation: {str(e)}')
        return f"Error generating summary: {str(e)}"

def main(profile_url=None, custom_prompt=None, summary_options=None):
    """Main function to orchestrate the scraping and summary generation process"""
    logger.info('Starting the summary generation process')
    
    # Check for API key
    if not os.getenv('GEMINI_API_KEY'):
        logger.error('Please set your Gemini API key in the .env file')
        print("Please set your Gemini API key in the .env file!")
        return
    
    if not profile_url:
        logger.error('No profile URL provided')
        print("Error: No profile URL provided")
        return
    
    # Step 1: Scrape LinkedIn profile data
    logger.info('Starting LinkedIn data capture')
    linkedin_data = capture_linkedin_data(profile_url)
    
    if not linkedin_data:
        logger.error('Failed to capture LinkedIn data')
        print("Error: Failed to capture LinkedIn data")
        return
    
    # Step 2: Generate summary with optional custom prompt
    print("\nGenerating summary using Gemini API...")
    summary = generate_summary(linkedin_data, custom_prompt, summary_options)
    
    # Step 3: Output results
    print("\n=== Generated Professional Summary ===")
    print(summary)
    
    logger.info('Summary generation process completed')

if __name__ == "__main__":
    main() 