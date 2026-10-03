import React from 'react';

const Loader = ({ text = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div
        className={`${sizeClasses[size]} rounded-full border-pale-purple border-t-deep-purple animate-spin`}
      />
      {text && <p className="text-xs font-semibold text-text-muted animate-pulse">{text}</p>}
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-pale-purple animate-pulse space-y-4">
      <div className="h-44 bg-pale-purple/60 rounded-xl w-full" />
      <div className="space-y-2">
        <div className="h-4 bg-pale-purple/60 rounded w-3/4" />
        <div className="h-3 bg-pale-purple/40 rounded w-full" />
        <div className="h-3 bg-pale-purple/40 rounded w-2/3" />
      </div>
      <div className="h-8 bg-pale-purple/50 rounded-lg w-full" />
    </div>
  );
};

export default Loader;
