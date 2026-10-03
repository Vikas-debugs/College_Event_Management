import React from 'react';
import { Award, ShieldCheck, Target, Eye, BookOpen, Users, CheckCircle } from 'lucide-react';

const About = () => {
  return (
    <div className="space-y-16 pb-16">
      {/* Header Banner */}
      <section className="bg-purple-gradient text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-gold font-bold text-xs uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-gold/30">
            About Techno Institute
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold">
            Pioneering Higher Education in Lucknow
          </h1>
          <p className="text-sm sm:text-base text-pale-purple/90 italic font-heading">
            "Shaping Future Skilled Professionals"
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Story & Accreditations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-deep-purple">
              Excellence in Education, Character & Innovation
            </h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Established in Lucknow, Uttar Pradesh, <strong>Techno Institute of Higher Studies (TIHS)</strong> is a premier institution dedicated to academic rigor, corporate readiness, and holistic personality development. Affiliated to the renowned <strong>University of Lucknow</strong>, TIHS delivers multi-disciplinary undergraduate degrees designed to empower future leaders.
            </p>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Recognized as the <strong>3rd Best B-School in Lucknow by the Times of India</strong>, TIHS blends academic curriculum with real-world case studies, guest masterclasses, hackathons, sports championships, and cultural fests.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
              <div className="bg-pale-purple/60 p-4 rounded-xl border border-light-purple/30">
                <div className="font-heading text-xl font-bold text-deep-purple">NAAC</div>
                <div className="text-xs text-text-muted mt-0.5">Accredited Quality Standard</div>
              </div>
              <div className="bg-pale-purple/60 p-4 rounded-xl border border-light-purple/30">
                <div className="font-heading text-xl font-bold text-deep-purple">NCTE</div>
                <div className="text-xs text-text-muted mt-0.5">Approved Teacher Education</div>
              </div>
              <div className="bg-pale-purple/60 p-4 rounded-xl border border-light-purple/30">
                <div className="font-heading text-xl font-bold text-deep-purple">ISO 9001</div>
                <div className="text-xs text-text-muted mt-0.5">Certified Management System</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <img
              src="/assets/images/campus-hero.webp"
              alt="TIHS Campus — NAAC Accredited"
              className="rounded-3xl shadow-xl border-2 border-gold/30 object-cover w-full h-80"
            />
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-pale-purple shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-pale-purple text-deep-purple flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl font-bold text-deep-purple">Our Vision</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              To be globally recognized as a center of academic excellence that fosters creative thinking, technical competency, professional ethics, and entrepreneurship among students from diverse backgrounds.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-pale-purple shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-bright-orange flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl font-bold text-deep-purple">Our Mission</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              To deliver value-driven education through cutting-edge laboratories, dedicated mentorship, state-of-the-art campus facilities, industry alliances, and active student co-curricular forums.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
