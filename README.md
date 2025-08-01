# LinkedIn Profile Analyzer

A full-stack application for analyzing LinkedIn profiles, generating professional summaries, and providing insights using AI. The project consists of a Python Flask backend and a modern React frontend.

---

## Features

### Backend (Flask)
- Scrapes LinkedIn profile data (experience, education, posts, etc.)
- Generates professional summaries using the Gemini API
- Supports custom prompts and summary options
- Provides similarity analysis between raw data and summary
- Caches results for performance
- Rate limiting and logging
- REST API endpoints for analysis and chat

### Frontend (React + Vite)
- Clean, modern UI for submitting LinkedIn profiles
- Options for custom summary prompts
- Visualizes summaries and similarity analysis
- Interactive chat based on the analyzed profile

---

## Project Structure

```
backend/              # Flask backend (API, scraping, summary generation)
  app.py              # Main backend application
  requirements.txt    # Python dependencies
  scraping.py         # LinkedIn scraping logic
  similarity_calculator.py # Similarity analysis logic
  generate_summary.py # Summary generation using Gemini API
  chatbot.py          # Chat functionality
  credentials.py      # Credential management
  test_chat.py        # Tests for chat functionality
  .env.example        # Environment variables example

linkedin-analyzer/    # React frontend (user interface)
  src/                # React source code
  package.json        # Node.js dependencies and scripts
  package-lock.json   # Lock file for dependencies
  tailwind.config.js  # Tailwind CSS configuration
  tailwind.config.cjs # CommonJS Tailwind CSS configuration
  index.html          # Entry HTML file
  postcss.config.js   # PostCSS configuration
  postcss.config.cjs  # CommonJS PostCSS configuration
  public/             # Static assets
  README.md           # Frontend README
  vite.config.js      # Vite configuration
  eslint.config.js    # ESLint configuration
  .gitignore          # Git ignore file
```

---

## Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm 9+

### Backend Setup
1. Navigate to the backend directory:
   ```powershell
   cd backend
   ```
2. Create and activate a virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Run the backend server:
   ```powershell
   python app.py
   ```

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```powershell
   cd linkedin-analyzer
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the development server:
   ```powershell
   npm run dev
   ```

---

## Usage
- Access the frontend at [http://localhost:5173](http://localhost:5173) (default Vite port).
- Click on the key icon in the top-right corner to input your credentials:
  1. Enter your Gemini API Key
  2. Enter your LinkedIn email
  3. Enter your LinkedIn password
- After saving credentials, enter a LinkedIn profile URL and (optionally) a custom prompt.
- View the generated summary, similarity analysis, and chat with the AI about the profile.

---

## API Endpoints (Backend)
- `POST /api/analyze-profile` — Analyze a LinkedIn profile
  - Request body: `{ url, customPrompt, summaryOptions }`
- `POST /api/set-credentials` — Store LinkedIn and Gemini credentials
  - Request body: `{ linkedin_email, linkedin_password, gemini_api_key }`
- `POST /api/chat/init` — Start a chat session with summary context
- `POST /api/chat/message` — Send a message in the chat
- `POST /api/clear-cache` — Clear cached results
- `GET /api/health` — Health check

---

> **Security Note:**
> - It is strongly recommended to use a LinkedIn account created with a temporary email address for scraping, rather than your personal or primary account. This helps protect your privacy and reduces risk of account restrictions.

---