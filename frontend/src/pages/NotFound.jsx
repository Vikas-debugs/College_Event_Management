import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="font-heading text-8xl font-black text-deep-purple/20">404</div>
        <div className="space-y-2">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-deep-purple">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-text-muted">
            The page or resource you are looking for has been moved or does not exist on TIHS CEMS.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2.5 bg-pale-purple text-deep-purple text-xs font-bold rounded-xl hover:bg-light-purple/20 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <Link
            to="/"
            className="px-5 py-2.5 bg-deep-purple text-white text-xs font-bold rounded-xl hover:bg-mid-purple transition-colors flex items-center gap-1.5 shadow"
          >
            <Home className="w-4 h-4" />
            <span>Home Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
