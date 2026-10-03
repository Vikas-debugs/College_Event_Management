import React from 'react';
import { Phone, Award, Sparkles, MapPin } from 'lucide-react';

const TopBar = () => {
  return (
    <div className="bg-dark-purple text-pale-purple text-xs py-2 px-4 border-b border-light-purple/20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="w-3.5 h-3.5 text-bright-orange" />
            <a href="tel:+917897123111" className="font-medium">+91-7897123111</a>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-light-purple">
            <span>|</span>
            <MapPin className="w-3.5 h-3.5 text-bright-orange" />
            <span>Lucknow, Uttar Pradesh</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-gold font-medium">
            <Award className="w-3.5 h-3.5" />
            <span>NAAC Accredited • NCTE Approved • ISO 9001:2015</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 bg-bright-orange text-white px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wide animate-pulse">
            <Sparkles className="w-3 h-3" /> Admissions Open 2026–27
          </span>
          <span className="hidden sm:inline text-light-purple/60">|</span>
          <span className="text-light-purple text-[11px] hidden sm:inline">Affiliated to University of Lucknow</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
