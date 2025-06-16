import React, { useState } from 'react';

const SummaryDisplay = ({ summary, profileData }) => {
  const [copied, setCopied] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Generated Summary */}
      <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">AI Generated Summary</h2>
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
        <div>
          <pre className="whitespace-pre-wrap text-gray-600">{summary}</pre>
        </div>
      </div>

      {/* Toggle Raw Data Button */}
      <div className="w-full max-w-2xl mx-auto">
        <button
          onClick={() => setShowRawData(!showRawData)}
          className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          {showRawData ? 'Hide Raw Data' : 'Show Raw Data'}
        </button>
      </div>

      {/* Raw Profile Data */}
      {showRawData && profileData && (
        <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Raw Profile Data</h2>
          
          {/* Basic Info */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Basic Information</h3>
            <div className="bg-gray-50 p-3 rounded">
              <p><strong>Name:</strong> {profileData.profile_info.Name}</p>
              <p><strong>Role:</strong> {profileData.profile_info.Designation}</p>
              <p><strong>Location:</strong> {profileData.profile_info.Location}</p>
              <p><strong>About:</strong> {profileData.profile_info.About}</p>
            </div>
          </div>

          {/* Experience */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Experience</h3>
            <div className="space-y-3">
              {profileData.experience.map((exp, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded">
                  <p><strong>{exp.Title}</strong> at {exp.Company}</p>
                  <p className="text-sm text-gray-600">{exp.Duration}</p>
                  <p className="text-sm text-gray-600">{exp.Location}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Education</h3>
            <div className="space-y-3">
              {profileData.education.map((edu, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded">
                  <p><strong>{edu.School}</strong></p>
                  <p className="text-sm text-gray-600">{edu.Degree}</p>
                  <p className="text-sm text-gray-600">{edu.Duration}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Posts */}
          {profileData.posts && profileData.posts.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Recent Posts</h3>
              <div className="space-y-3">
                {profileData.posts.slice(0, 3).map((post, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">{post}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SummaryDisplay; 