import React from 'react';
import { Briefcase, TrendingUp, Building2, CheckCircle2 } from 'lucide-react';

const Placements = () => {
  const stats = [
    { title: 'Highest Package', value: '₹12.5 LPA', sub: 'National Placement Offer' },
    { title: 'Average Package', value: '₹5.2 LPA', sub: 'Across All Streams' },
    { title: 'Corporate Partners', value: '150+', sub: 'Active Recruiting Companies' },
    { title: 'Placement Rate', value: '94%', sub: 'Dedicated Placement Cell' },
  ];

  const recruiters = [
    'TCS', 'Infosys', 'Wipro', 'HCL Technologies', 'ICICI Bank', 'HDFC Bank',
    'Tech Mahindra', 'Axis Bank', 'Byju\'s', 'Deloitte', 'Cognizant', 'Vodafone Idea',
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Header Banner */}
      <section className="bg-purple-gradient text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-gold font-bold text-xs uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-gold/30">
            Career Excellence
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold">
            TIHS Placement Records & Corporate Tie-ups
          </h1>
          <p className="text-sm sm:text-base text-pale-purple/90 font-heading italic">
            Ranked 3rd Best B-School in Lucknow (Times of India)
          </p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-pale-purple shadow-sm text-center space-y-2 hover:shadow-md transition-all"
            >
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{s.title}</span>
              <div className="font-heading text-3xl font-extrabold text-deep-purple">{s.value}</div>
              <p className="text-xs text-bright-orange font-medium">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Recruiters Marquee Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-deep-purple">Our Top Corporate Recruiters</h2>
          <p className="text-xs text-text-muted">Leading MNCs and financial institutions hiring TIHS graduates</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recruiters.map((company, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-pale-purple text-center font-bold text-xs sm:text-sm text-deep-purple shadow-sm hover:border-bright-orange hover:shadow transition-all flex items-center justify-center min-h-[80px]"
            >
              {company}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Placements;
