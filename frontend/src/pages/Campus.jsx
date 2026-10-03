import React from 'react';
import { Building2, Wifi, BookOpen, Trophy, Shield, Sparkles } from 'lucide-react';

const Campus = () => {
  const facilities = [
    {
      title: 'Smart Auditoriums & Amphitheatre',
      desc: 'Centrally air-conditioned open-air and indoor amphitheaters equipped with Dolby surround audio and high-definition laser projection for cultural fests and conferences.',
      icon: Building2,
      tag: '500+ Seater',
    },
    {
      title: 'Advanced AI & Computing Labs',
      desc: 'High-performance computing workstations with gigabit fiber backbone, high-speed GPUs, and licensed software for BCA & technical hackathons.',
      icon: Wifi,
      tag: '100 Mbps Backbone',
    },
    {
      title: 'Central Digital Library & Research Hub',
      desc: 'Extensive repository of over 30,000 reference volumes, international journals (IEEE, Springer), DELNET subscription, and quiet e-study cubicles.',
      icon: BookOpen,
      tag: '30,000+ Books',
    },
    {
      title: 'Ranbhoomi Sports Arena',
      desc: 'Dedicated synthetic badminton court, cricket nets, indoor table tennis, chess arena, and multipurpose sports ground for inter-college tournaments.',
      icon: Trophy,
      tag: 'Outdoor & Indoor',
    },
    {
      title: 'Student Innovation & Incubation Cell',
      desc: 'A vibrant co-working hub designed to mentor student startups, prototype products, and prepare pitches for venture investors.',
      icon: Sparkles,
      tag: 'Startup Mentorship',
    },
    {
      title: '24/7 Secured & Wi-Fi Enabled Campus',
      desc: 'Full campus CCTV surveillance, automated biometric access gates, clean cafeteria, and healthcare first-aid center.',
      icon: Shield,
      tag: 'Safe Campus',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Header Banner */}
      <section className="bg-purple-gradient text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-gold font-bold text-xs uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-gold/30">
            Campus Infrastructure
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold">
            World-Class Campus Life & Facilities
          </h1>
          <p className="text-sm sm:text-base text-pale-purple/90 font-heading italic">
            "Shaping Future Skilled Professionals" — Lucknow
          </p>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-pale-purple shadow-sm hover:shadow-md transition-all space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-pale-purple group-hover:bg-deep-purple flex items-center justify-center transition-colors">
                    <Icon className="w-6 h-6 text-deep-purple group-hover:text-gold transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold bg-amber-50 text-bright-orange border border-bright-orange/30 px-2.5 py-1 rounded-full uppercase">
                    {fac.tag}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-lg text-deep-purple group-hover:text-bright-orange transition-colors">
                  {fac.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">{fac.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Gallery Visual Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-3xl overflow-hidden shadow-md border border-pale-purple group">
            <img
              src="/assets/images/campus-hero.webp"
              alt="TIHS Campus Facilities"
              className="w-full h-56 object-cover object-center group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/campus-hero.svg'; }}
            />
            <div className="p-4 bg-white text-xs font-bold text-deep-purple text-center">
              Hi-Tech Computer & AI Labs
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-md border border-pale-purple group">
            <img
              src="/assets/images/campus-hero.webp"
              alt="TIHS Campus Life"
              className="w-full h-56 object-cover object-left group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/campus-hero.svg'; }}
            />
            <div className="p-4 bg-white text-xs font-bold text-deep-purple text-center">
              Student Activity & Cultural Arena
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-md border border-pale-purple group">
            <img
              src="/assets/images/campus-hero.webp"
              alt="TIHS Student Zone"
              className="w-full h-56 object-cover object-right group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/campus-hero.svg'; }}
            />
            <div className="p-4 bg-white text-xs font-bold text-deep-purple text-center">
              Cafeteria & Incubation Zone
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Campus;
