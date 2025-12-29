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
      {/* Main Loader - Spinning Circles */}
      <div className="relative">
        {/* Outer Circle */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200 animate-pulse`}></div>
        
        {/* Spinning Circle */}
        <div className={`${sizeClasses[size]} absolute top-0 left-0 rounded-full border-4 border-transparent border-t-red-600 border-r-red-600 animate-spin`}></div>
        
        {/* Center Logo */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-bold">M</span>
          </div>
        </div>
      </div>

      {/* Loading Text */}
      {text && (
        <div className="flex items-center gap-2">
          <p className="text-gray-700 font-semibold animate-pulse">{text}</p>
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-[9999]">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

// Skeleton Loader Component
export const SkeletonLoader = ({ type = 'text', className = '' }) => {
  const skeletonTypes = {
    text: 'h-4 bg-gray-200 rounded-lg animate-pulse',
    title: 'h-8 bg-gray-200 rounded-lg animate-pulse',
    avatar: 'w-12 h-12 bg-gray-200 rounded-full animate-pulse',
    card: 'h-64 bg-gray-200 rounded-2xl animate-pulse',
    button: 'h-12 w-32 bg-gray-200 rounded-xl animate-pulse',
  };

  return <div className={`${skeletonTypes[type]} ${className}`}></div>;
};

// Mini Loader for Buttons
export const MiniLoader = ({ color = 'white' }) => {
  const colorClasses = {
    white: 'border-white border-t-transparent',
    red: 'border-red-600 border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
  };

  return (
    <div className={`w-5 h-5 border-2 ${colorClasses[color]} rounded-full animate-spin`}></div>
  );
};

// Dots Loader
export const DotsLoader = ({ color = 'red' }) => {
  const colorClasses = {
    red: 'bg-red-600',
    white: 'bg-white',
    gray: 'bg-gray-600',
  };

  return (
    <div className="flex gap-2">
      <span className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></span>
      <span className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></span>
      <span className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></span>
    </div>
  );
};

// Progress Loader
export const ProgressLoader = ({ progress = 0, showPercentage = true }) => {
  return (
    <div className="w-full space-y-2">
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-red-600 to-red-700 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
      {showPercentage && (
        <p className="text-center text-sm font-semibold text-gray-700">{progress}%</p>
      )}
    </div>
  );
};

// Spinner Loader
export const SpinnerLoader = ({ size = 'md', color = 'red' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    red: 'border-red-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}></div>
  );
};

// Card Skeleton Loader
export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="flex gap-2 pt-4">
        <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
        <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
      </div>
    </div>
  );
};

// Table Skeleton Loader
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 p-4 flex gap-4">
        {[...Array(columns)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
        ))}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 flex gap-4 border-t border-gray-100">
          {[...Array(columns)].map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1 animate-pulse" style={{ animationDelay: `${colIndex * 100}ms` }}></div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Page Loader with Brand
export const PageLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center z-[9999]">
      <div className="text-center space-y-6">
        {/* Animated Logo */}
        <div className="relative">
          <div className="inline-block p-2 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-2xl animate-pulse">
            <img 
              src="/madadgaar-logo.jpg" 
              alt="Madadgaar" 
              className="w-24 h-24 rounded-xl object-cover"
            />
          </div>
          {/* Spinning Ring */}
          <div className="absolute -inset-2 border-4 border-transparent border-t-red-600 border-r-red-600 rounded-2xl animate-spin"></div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
          Madadgaar
        </h1>

        {/* Loading Text */}
        <div className="flex items-center justify-center gap-2">
          <p className="text-gray-700 font-semibold">{text}</p>
          <DotsLoader color="red" />
        </div>
      </div>
    </div>
  );
};

export default Loader;

