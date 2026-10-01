import React from 'react';

const LoadingSpinner = ({ label = 'Loading data...', fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      {label && <p className="text-sm font-medium text-slate-400 animate-pulse">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
