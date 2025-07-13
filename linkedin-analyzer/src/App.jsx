import React, { useState, Suspense, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import axios from 'axios';
import { logger } from './utils/logger';
import './App.css';
import { Chart, registerables } from 'chart.js';
import { Toaster, toast } from 'react-hot-toast';
import { 
  SunIcon, 
  MoonIcon, 
  ChatBubbleLeftRightIcon,
  KeyIcon  // Add KeyIcon for credentials
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import ChatDialog from './components/Chat/ChatDialog';

Chart.register(...registerables);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      suspense: true,
      onError: (error) => {
        logger.error('Query error occurred', error);
        toast.error('An error occurred while fetching data');
      },
    },
  },
});

// New Credentials Modal Component
const CredentialsModal = ({ isOpen, onClose, onSave }) => {
  const [credentials, setCredentials] = useState({
    geminiApiKey: '',
    linkedinEmail: '',
    linkedinPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!credentials.geminiApiKey || !credentials.linkedinEmail || !credentials.linkedinPassword) {
      toast.error('Please fill in all credential fields');
      return;
    }

    try {
      // Send credentials to backend
      const response = await api.post('/set-credentials', {
        linkedin_email: credentials.linkedinEmail,
        linkedin_password: credentials.linkedinPassword,
        gemini_api_key: credentials.geminiApiKey
      });

      // Also save to localStorage as a backup
      localStorage.setItem('geminiApiKey', credentials.geminiApiKey);
      localStorage.setItem('linkedinCredentials', JSON.stringify({
        email: credentials.linkedinEmail,
        password: credentials.linkedinPassword
      }));

      // Notify user of successful save
      toast.success(response.data.message || 'Credentials saved successfully');

      // Close the modal
      onClose();
    } catch (error) {
      // Handle any errors from the API
      const errorMessage = error.response?.data?.message || 'Failed to save credentials';
      toast.error(errorMessage);
      console.error('Credentials save error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-primary">
            Configure Credentials
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Gemini API Key</span>
              </label>
              <input
                type="text"
                placeholder="Enter Gemini API Key"
                className="input input-bordered w-full"
                value={credentials.geminiApiKey}
                onChange={(e) => setCredentials(prev => ({
                  ...prev, 
                  geminiApiKey: e.target.value
                }))}
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">LinkedIn Email</span>
              </label>
              <input
                type="email"
                placeholder="Enter LinkedIn Email"
                className="input input-bordered w-full"
                value={credentials.linkedinEmail}
                onChange={(e) => setCredentials(prev => ({
                  ...prev, 
                  linkedinEmail: e.target.value
                }))}
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">LinkedIn Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter LinkedIn Password"
                className="input input-bordered w-full"
                value={credentials.linkedinPassword}
                onChange={(e) => setCredentials(prev => ({
                  ...prev, 
                  linkedinPassword: e.target.value
                }))}
                required
              />
            </div>
            
            <div className="alert alert-warning shadow-lg mt-4">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>
                  It is strongly recommended to use a LinkedIn account created with a temporary email address for scraping, rather than your personal or primary account. This helps protect your privacy and reduces risk of account restrictions.
                </span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                type="button" 
                className="btn btn-ghost"
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Save Credentials
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Modify Navbar to include Credentials Button
const Navbar = ({ theme, toggleTheme, onChatClick, isChatEnabled, onCredentialsClick }) => (
  <div className="navbar bg-base-100 shadow-lg px-4 sm:px-8">
    <div className="flex-1">
      <h1 className="text-2xl font-bold text-primary">EasyRecruit</h1>
    </div>
    <div className="flex-none space-x-2">
      {/* Add Credentials Button */}
      <button 
        className="btn btn-ghost btn-circle"
        onClick={onCredentialsClick}
        aria-label="Open Credentials"
      >
        <KeyIcon className="h-6 w-6" />
      </button>

      {isChatEnabled && (
        <button 
          className="btn btn-ghost btn-circle"
          onClick={onChatClick}
          aria-label="Open chat"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>
      )}
      <button 
        className="btn btn-circle btn-ghost"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <MoonIcon className="h-6 w-6" />
        ) : (
          <SunIcon className="h-6 w-6" />
        )}
      </button>
    </div>
  </div>
);

const StatsCard = ({ icon: Icon, title, value, description }) => (
  <div className="card bg-base-100 shadow-xl">
    <div className="card-body">
      <div className="flex items-center gap-2">
        <Icon className="h-6 w-6 text-primary" />
        <h2 className="card-title">{title}</h2>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-base-content/70">{description}</p>
    </div>
  </div>
);

const URLInputCard = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [summaryOptions, setSummaryOptions] = useState({
    years_of_experience: false,
    relevant_job_titles: false,
    degrees_earned: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(url, customPrompt, summaryOptions);
  };

  const handleOptionChange = (option) => {
    setSummaryOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <div className="card w-full max-w-xl mx-auto bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold text-center justify-center">Analyze LinkedIn Profile</h2>
        <form onSubmit={handleSubmit} className="form-control w-full gap-4 mt-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-lg">Enter LinkedIn Profile URL (or "1234" for demo)</span>
            </label>
            <input
              type="text"
              placeholder="https://www.linkedin.com/in/username"
              className="input input-bordered input-primary w-full"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-lg">Summary Options</span>
            </label>
            <div className="flex flex-col gap-2">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={summaryOptions.years_of_experience}
                  onChange={() => handleOptionChange('years_of_experience')}
                />
                <span className="label-text">Years of experience</span>
              </label>
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={summaryOptions.relevant_job_titles}
                  onChange={() => handleOptionChange('relevant_job_titles')}
                />
                <span className="label-text">Relevant job titles</span>
              </label>
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={summaryOptions.degrees_earned}
                  onChange={() => handleOptionChange('degrees_earned')}
                />
                <span className="label-text">Degrees earned</span>
              </label>
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-lg">Custom Requirements</span>
            </label>
            <textarea
              placeholder="Eg. Specify the technical experiences"
              className="textarea textarea-bordered textarea-primary w-full h-32"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-md"></span>
                Analyzing...
              </>
            ) : (
              'Analyze Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[200px]">
    <span className="loading loading-spinner loading-lg text-primary"></span>
    <p className="mt-4 text-base-content/70">Analyzing profile...</p>
  </div>
);

const cleanMarkdown = (markdownText) => {
  if (!markdownText) return '';
  return markdownText.replace(/^```markdown\n/, '').replace(/\n```$/, '');
};

const SimilarityAnalysisCard = ({ similarityData }) => {
  const score = (similarityData.score * 100).toFixed(2);
  const scoreColor = score >= 70 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-error';

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Similarity Analysis</h2>
        <div className="divider"></div>
        
        <div className="grid gap-6">
          <div className="text-base-content/70 mb-2">
            Using cosine similarity metric to measure how well the generated summary preserves the key information from the original profile. A higher score indicates better information retention.
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Similarity Score</div>
              <div className={`stat-value ${scoreColor}`}>{score}%</div>
              <div className="stat-desc">Between raw data and summary</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Raw Data Length</div>
                <div className="stat-value text-primary">{similarityData.metrics.raw_data_length}</div>
                <div className="stat-desc">Words in original text</div>
              </div>
            </div>

            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Summary Length</div>
                <div className="stat-value text-secondary">{similarityData.metrics.summary_length}</div>
                <div className="stat-desc">Words in generated summary</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [chatState, setChatState] = useState({
    messages: [],
    sessionId: null,
    currentProfile: null
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleChatOpen = () => {
    if (analysisResult) {
      setIsChatOpen(true);
    } else {
      toast.error('Please analyze a profile first to start chatting');
    }
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
  };

  const handleAnalyzeProfile = async (url, customPrompt, summaryOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/analyze-profile', { 
        url,
        customPrompt: customPrompt.trim() || undefined,
        summaryOptions
      });
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setAnalysisResult(response.data);
      setChatState({
        messages: [],
        sessionId: null,
        currentProfile: url
      });
      toast.success('Profile analysis completed successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to analyze profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatStateUpdate = (newState) => {
    setChatState(newState);
  };

  const handleCredentialsClick = () => {
    setIsCredentialsModalOpen(true);
  };

  const handleCredentialsClose = () => {
    setIsCredentialsModalOpen(false);
  };

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <div className="min-h-screen bg-base-200 p-4">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <h1 className="text-3xl font-bold text-error">Error!</h1>
            <p className="text-base-content/80">{error.message}</p>
            <button className="btn btn-primary" onClick={resetErrorBoundary}>
              Try again
            </button>
          </div>
        </div>
      )}
    >
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<LoadingSpinner />}>
          <div className="min-h-screen bg-base-200">
            <Navbar 
              theme={theme} 
              toggleTheme={toggleTheme} 
              onChatClick={handleChatOpen}
              isChatEnabled={!!analysisResult}
              onCredentialsClick={handleCredentialsClick}
            />
            <main className="container mx-auto px-4 py-8">
              <div className="max-w-6xl mx-auto">
                <div className="grid gap-6">
                  <URLInputCard onSubmit={handleAnalyzeProfile} isLoading={isLoading} />
                  
                  {isLoading && <LoadingSpinner />}
                  
                  {analysisResult && (
                    <>
                      <div className="tabs tabs-boxed justify-center">
                        <button
                          className={`tab tab-lg ${activeTab === 'summary' ? 'tab-active' : ''}`}
                          onClick={() => setActiveTab('summary')}
                        >
                          Summary
                        </button>
                        <button
                          className={`tab tab-lg ${activeTab === 'raw' ? 'tab-active' : ''}`}
                          onClick={() => setActiveTab('raw')}
                        >
                          Raw Data
                        </button>
                        <button
                          className={`tab tab-lg ${activeTab === 'similarity' ? 'tab-active' : ''}`}
                          onClick={() => setActiveTab('similarity')}
                        >
                          Similarity Analysis
                        </button>
                      </div>

                      {activeTab === 'summary' ? (
                        <div className="card bg-base-100 shadow-xl">
                          <div className="card-body">
                            <h2 className="card-title text-2xl mb-4">AI Generated Summary</h2>
                            <div className="divider"></div>
                            <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
                              <ReactMarkdown>
                                {cleanMarkdown(analysisResult.summary)}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      ) : activeTab === 'raw' ? (
                        <div className="card bg-base-100 shadow-xl">
                          <div className="card-body">
                            <h2 className="card-title text-2xl mb-4">Raw Data</h2>
                            <div className="divider"></div>
                            <pre className="whitespace-pre-wrap">
                              {analysisResult.raw_data}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <SimilarityAnalysisCard similarityData={analysisResult.similarity_analysis} />
                      )}
                    </>
                  )}
                </div>
              </div>
            </main>
            
            <ChatDialog
              isOpen={isChatOpen}
              onClose={handleChatClose}
              summary={analysisResult?.summary || ''}
              rawData={analysisResult?.raw_data || ''}
              chatState={chatState}
              onChatStateUpdate={handleChatStateUpdate}
            />

            {/* Credentials Modal */}
            <CredentialsModal 
              isOpen={isCredentialsModalOpen}
              onClose={handleCredentialsClose}
            />
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'bg-base-100 text-base-content',
              duration: 4000,
            }}
          />
        </Suspense>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
