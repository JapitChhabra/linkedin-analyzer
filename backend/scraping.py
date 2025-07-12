from playwright.sync_api import sync_playwright
import time
import logging
import os
from dotenv import load_dotenv

# Use credentials from credentials module
from credentials import get_linkedin_credentials

POSTS_CAP = 15  # Maximum number of posts to scrape

logger = logging.getLogger(__name__)

def scrape_all_posts(page, profile_url):
    """Scroll and extract all LinkedIn posts from a profile's activity."""
    logger.info('Starting to scrape posts')
    posts = []
    try:
        page.goto(profile_url + "recent-activity/all/", timeout=30000)
        logger.info('Navigated to activity page')
        
        page.wait_for_selector("div.update-components-text.relative.update-components-update-v2__commentary", timeout=30000)
        logger.info('Found posts container')

        last_height = 0
        scroll_attempts = 0

        while scroll_attempts < 10 and len(posts) < POSTS_CAP:
            page.evaluate("window.scrollBy(0, document.body.scrollHeight)")
            time.sleep(2)

            new_height = page.evaluate("document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height
            scroll_attempts += 1
            logger.debug(f'Scroll attempt {scroll_attempts}/10')

        post_elements = page.locator("div.update-components-text.relative.update-components-update-v2__commentary span.break-words").all()
        logger.info(f'Found {len(post_elements)} posts')
        
        for post in post_elements:
            if len(posts) >= POSTS_CAP:
                break
            posts.append(post.inner_text())
        
        logger.info(f'Scraped {len(posts)} posts (capped at {POSTS_CAP})')
        return posts
    except Exception as e:
        logger.error(f'Error scraping posts: {str(e)}')
        return []

def scrape_experience(page, profile_url):
    """Extracts experience details from a LinkedIn profile."""
    logger.info('Starting to scrape experience')
    try:
        page.goto(profile_url + "details/experience/", timeout=30000)
        logger.info('Navigated to experience page')
        logger.info(profile_url + "details/experience/")
        
        page.wait_for_selector("div.scaffold-finite-scroll__content", timeout=30000)
        logger.info('Found experience container')

        last_height = 0
        for attempt in range(5):
            page.evaluate("window.scrollBy(0, document.body.scrollHeight)")
            time.sleep(2)
            new_height = page.evaluate("document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height
            logger.debug(f'Scroll attempt {attempt + 1}/5')

        experience_blocks = page.locator("li.pvs-list__paged-list-item").all()
        logger.info(f'Found {len(experience_blocks)} experience entries')
        
        experience_list = []
        for exp in experience_blocks:
            try:
                title = exp.locator("div.display-flex.align-items-center.mr1.hoverable-link-text.t-bold span[aria-hidden='true']").first.inner_text() if exp.locator("div.display-flex.align-items-center.mr1.hoverable-link-text.t-bold span[aria-hidden='true']").count() > 0 else "N/A"
                company = exp.locator("span.t-14.t-normal span[aria-hidden='true']").first.inner_text() if exp.locator("span.t-14.t-normal span[aria-hidden='true']").count() > 0 else "N/A"
                duration = exp.locator("span.pvs-entity__caption-wrapper[aria-hidden='true']").first.inner_text() if exp.locator("span.pvs-entity__caption-wrapper[aria-hidden='true']").count() > 0 else "N/A"
                location = exp.locator("span.t-14.t-normal.t-black--light span[aria-hidden='true']").nth(1).inner_text() if exp.locator("span.t-14.t-normal.t-black--light span[aria-hidden='true']").count() > 1 else "N/A"
                
                experience_list.append({
                    "Title": title,
                    "Company": company,
                    "Duration": duration,
                    "Location": location
                })
                logger.debug(f'Scraped experience: {title} at {company}')
            except Exception as e:
                logger.error(f'Error scraping individual experience: {str(e)}')

        return experience_list
    except Exception as e:
        logger.error(f'Error scraping experience section: {str(e)}')
        return []

def scrape_education(page, profile_url):
    """Extracts education details from a LinkedIn profile."""
    logger.info('Starting to scrape education')
    try:
        page.goto(profile_url + "details/education/", timeout=30000)
        logger.info('Navigated to education page')
        logger.info(profile_url + "details/education/")
        
        page.wait_for_selector("div.scaffold-finite-scroll__content", timeout=30000)
        logger.info('Found education container')

        last_height = 0
        for attempt in range(5):
            page.evaluate("window.scrollBy(0, document.body.scrollHeight)")
            time.sleep(2)
            new_height = page.evaluate("document.body.scrollHeight")
            if new_height == last_height:
                break
            last_height = new_height
            logger.debug(f'Scroll attempt {attempt + 1}/5')

        education_blocks = page.locator("li.pvs-list__paged-list-item").all()
        logger.info(f'Found {len(education_blocks)} education entries')
        
        education_list = []
        for edu in education_blocks:
            try:
                school = edu.locator("div.display-flex.align-items-center.mr1.hoverable-link-text.t-bold span[aria-hidden='true']").first.inner_text() if edu.locator("div.display-flex.align-items-center.mr1.hoverable-link-text.t-bold span[aria-hidden='true']").count() > 0 else "N/A"
                degree = edu.locator("span.t-14.t-normal span[aria-hidden='true']").first.inner_text() if edu.locator("span.t-14.t-normal span[aria-hidden='true']").count() > 0 else "N/A"
                duration = edu.locator("span.pvs-entity__caption-wrapper[aria-hidden='true']").first.inner_text() if edu.locator("span.pvs-entity__caption-wrapper[aria-hidden='true']").count() > 0 else "N/A"
                
                education_list.append({
                    "School": school,
                    "Degree": degree,
                    "Duration": duration
                })
                logger.debug(f'Scraped education: {degree} at {school}')
            except Exception as e:
                logger.error(f'Error scraping individual education: {str(e)}')

        return education_list
    except Exception as e:
        logger.error(f'Error scraping education section: {str(e)}')
        return []

def scrape_profile_info(page, profile_url):
    """Extracts comprehensive profile information."""
    logger.info('Starting to scrape profile info')
    try:
        page.goto(profile_url, timeout=30000)
        logger.info('Navigated to profile page')
        
        page.wait_for_selector("div.mt2.relative", timeout=30000)
        logger.info('Found profile container')
        
        name = page.locator("h1.TfZOidgbseHvfVjmVghPLqMaKHCaBSBgoRKASA").inner_text() if page.locator("h1.TfZOidgbseHvfVjmVghPLqMaKHCaBSBgoRKASA").count() > 0 else profile_url
        designation = page.locator("div.text-body-medium").inner_text() if page.locator("div.text-body-medium").count() > 0 else "N/A"
        location = page.locator("span.text-body-small.inline.t-black--light").first.inner_text() if page.locator("span.text-body-small.inline.t-black--light").count() > 0 else "N/A"
        
        profile_info = {
            "Name": name,
            "Designation": designation,
            "Location": location
        }
        
        logger.info(f'Successfully scraped profile info for {name}')
        return profile_info
    except Exception as e:
        logger.error(f'Error scraping profile info: {str(e)}')
        return {
            "Name": "N/A",
            "Designation": "N/A",
            "Location": "N/A",
            "About Title": "N/A",
            "About": "N/A"
        } 

def main(profile_url=None):
    """Main function to orchestrate the LinkedIn scraping process."""
    if not profile_url:
        logger.error('No profile URL provided')
        return None
    
    # Get LinkedIn credentials
    linkedin_email, linkedin_password = get_linkedin_credentials()
    
    # Detailed logging for credentials
    logger.info(f'Attempting to scrape profile. Email provided: {bool(linkedin_email)}')
    logger.info(f'Password provided: {bool(linkedin_password)}')
    
    # Check if credentials are set
    if not linkedin_email or not linkedin_password:
        logger.error('LinkedIn credentials not set')
        logger.error(f'Actual email value: {linkedin_email}')
        logger.error(f'Actual password value: {"*" if linkedin_password else "None"}')
        return None
        
    logger.info('Starting LinkedIn scraping process')
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            # Navigate to LinkedIn login
            logger.info('Navigating to LinkedIn login page')
            page.goto("https://www.linkedin.com/login")

            # Fill login form and submit
            logger.info('Attempting to log in')
            page.fill("input[name='session_key']", linkedin_email)
            page.fill("input[name='session_password']", linkedin_password)
            page.click("button[type='submit']")

            # Wait for page load
            page.wait_for_timeout(1500)
            logger.info('Login successful')

            # Navigate to profile page and scrape profile information
            logger.info('Starting profile information scraping')
            profile_info = scrape_profile_info(page, profile_url)
            print("\n=== Profile Information ===")
            print(profile_info)

            # Scrape experience
            logger.info('Starting experience scraping')
            experience = scrape_experience(page, profile_url)
            print("\n=== Experience ===")
            print(experience)

            # Scrape education
            logger.info('Starting education scraping')
            education = scrape_education(page, profile_url)
            print("\n=== Education ===")
            print(education)

            # Scrape posts
            logger.info('Starting posts scraping')
            posts = scrape_all_posts(page, profile_url)
            print("\n=== Recent Posts ===")
            print(posts)

            browser.close()
            
            return {
                'profile': profile_info,
                'experience': experience,
                'education': education,
                'posts': posts
            }
    except Exception as e:
        logger.error(f'Error during LinkedIn scraping: {str(e)}')
        return None

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    main() 