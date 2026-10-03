import React from 'react';

const TihsLogo = ({ className = "w-12 h-12" }) => {
  return (
    <svg
      viewBox="0 0 256 256"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="TIHS Logo"
    >
      <defs>
        <linearGradient id="tihsLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4c0c56" />
          <stop offset="100%" stopColor="#3a0944" />
        </linearGradient>
        <linearGradient id="tihsGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e29826" />
          <stop offset="100%" stopColor="#d4a229" />
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="42" fill="url(#tihsLogoGrad)" />
      <circle cx="128" cy="128" r="110" fill="none" stroke="url(#tihsGoldGrad)" strokeWidth="4" strokeDasharray="8 4" />
      <circle cx="128" cy="128" r="98" fill="none" stroke="#f3eaf6" strokeWidth="1.5" />
      
      {/* Graduation Cap / Shield Crest */}
      <path d="M128 46 L190 74 L128 102 L66 74 Z" fill="url(#tihsGoldGrad)" />
      <path d="M96 90 L96 120 C96 138 128 150 128 150 C128 150 160 138 160 120 L160 90" fill="none" stroke="url(#tihsGoldGrad)" strokeWidth="4" />
      <line x1="190" y1="74" x2="190" y2="116" stroke="#e29826" strokeWidth="3" />
      <circle cx="190" cy="120" r="5" fill="#e29826" />

      <text x="128" y="182" fontFamily="'Playfair Display', Georgia, serif" fontSize="34" fontWeight="bold" fill="#ffffff" textAnchor="middle" letterSpacing="3">TIHS</text>
      <text x="128" y="204" fontFamily="'Inter', sans-serif" fontSize="10" fontWeight="700" fill="#e29826" textAnchor="middle" letterSpacing="1.5">LUCKNOW • ESTD 2008</text>
      <text x="128" y="222" fontFamily="'Inter', sans-serif" fontSize="8" fontWeight="600" fill="#f3eaf6" textAnchor="middle" letterSpacing="0.8">NAAC ACCREDITED</text>
    </svg>
  );
};

export default TihsLogo;
