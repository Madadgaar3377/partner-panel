import React from 'react';

const Loader = ({ size = 'md', fullScreen = false, text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Simple Spinner */}
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full border-4 border-red-100`}></div>
        <div className={`${sizeClasses[size]} absolute top-0 left-0 rounded-full border-4 border-transparent border-t-red-600 animate-spin`}></div>
      </div>

      {/* Loading Text */}
      {text && (
        <p className="text-gray-700 font-semibold">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

// Simple Page Loader
export const PageLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-red-100"></div>
          <div className="w-12 h-12 absolute top-0 left-0 rounded-full border-4 border-transparent border-t-red-600 animate-spin"></div>
        </div>
        {text && (
          <p className="text-gray-700 font-semibold">{text}</p>
        )}
      </div>
    </div>
  );
};

export default Loader;

