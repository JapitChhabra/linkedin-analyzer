import React from 'react';

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <div className="text-gray-600 text-center">
        <p className="text-lg font-semibold">Analyzing Profile</p>
        <p className="text-sm">This may take a few moments...</p>
      </div>
    </div>
  );
};

export default LoadingState; 