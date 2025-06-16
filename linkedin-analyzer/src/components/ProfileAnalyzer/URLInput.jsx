import React, { useState } from 'react';

const URLInput = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateURL = (url) => {
    // Allow "1234" as a special case for dummy data
    if (url === "1234") return true;
    
    const linkedinRegex = /^https:\/\/www\.linkedin\.com\/in\/[\w\-]+\/?$/;
    return linkedinRegex.test(url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a LinkedIn URL');
      return;
    }

    if (!validateURL(url)) {
      setError('Please enter a valid LinkedIn profile URL or "1234" for dummy data');
      return;
    }

    onSubmit(url);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-700">
            LinkedIn Profile URL
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="linkedin-url"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="https://www.linkedin.com/in/username"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isLoading ? 'Analyzing...' : 'Analyze Profile'}
        </button>
      </form>
    </div>
  );
};

export default URLInput; 