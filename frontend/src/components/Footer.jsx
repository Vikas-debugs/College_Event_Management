import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Globe, MapPin, Award, CheckCircle2, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-purple text-pale-purple border-t-4 border-bright-orange">
      {/* Top Banner */}
      <div className="bg-deep-purple py-6 px-4 border-b border-light-purple/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <h4 className="font-heading text-lg font-bold text-white">Techno Institute of Higher Studies (TIHS)</h4>
            <p className="text-xs text-light-purple mt-0.5">"Shaping Future Skilled Professionals" • Lucknow, Uttar Pradesh</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
            <span className="bg-white/10 text-gold px-3 py-1 rounded-full border border-gold/30 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> NAAC Accredited
            </span>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full border border-white/20 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-bright-orange" /> NCTE Approved
            </span>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full border border-white/20 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-bright-orange" /> ISO 9001:2015
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/assets/images/tihs-logo.webp" alt="TIHS Logo" className="w-10 h-10 object-contain" />
              <div>
                <span className="font-heading font-bold text-white text-lg block leading-tight">TIHS Lucknow</span>
                <span className="text-[11px] text-gold font-semibold">Affiliated to University of Lucknow</span>
              </div>
            </div>
            <p className="text-xs text-pale-purple/80 leading-relaxed">
              Ranked 3rd Best B-School in Lucknow (Times of India). TIHS offers industry-integrated education across BBA, BCA, B.Com, BFA, BAJMC, B.Ed, and B.Sc with 100% placement support.
            </p>
            <div className="pt-2">
              <a
                href="https://www.tihs.edu.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-bright-orange hover:text-gold text-xs font-bold transition-colors"
              >
                <Globe className="w-3.5 h-3.5" /> Visit Official Website (tihs.edu.in)
              </a>
            </div>
          </div>

          {/* Col 2: Departments */}
          <div>
            <h5 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-bright-orange pl-2">
              Academic Departments
            </h5>
            <ul className="space-y-2 text-xs">
              {['BBA - Bachelor of Business Administration', 'BCA - Bachelor of Computer Applications', 'B.Com - Bachelor of Commerce', 'BFA - Bachelor of Fine Arts', 'BAJMC - Journalism & Mass Comm.', 'B.Ed - Bachelor of Education', 'B.Sc - Bachelor of Science'].map((dept) => (
                <li key={dept}>
                  <Link to="/events" className="hover:text-gold transition-colors block py-0.5">
                    {dept}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h5 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-bright-orange pl-2">
              Quick Navigation
            </h5>
            <ul className="space-y-2 text-xs">
              {[
                { name: 'Upcoming College Events', path: '/events' },
                { name: 'About TIHS & Accreditation', path: '/about' },
                { name: 'Campus Life & Facilities', path: '/campus' },
                { name: 'Distinguished Faculty', path: '/faculty' },
                { name: 'Placement Records', path: '/placements' },
                { name: 'Latest Happenings & News', path: '/happenings' },
                { name: 'Student Dashboard', path: '/student/dashboard' },
                { name: 'Volunteer QR Scanner', path: '/scanner' },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="hover:text-gold transition-colors block py-0.5">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Helpdesk */}
          <div className="space-y-3">
            <h5 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-bright-orange pl-2">
              Event Helpdesk & Campus
            </h5>
            <div className="flex items-start gap-2.5 text-xs text-pale-purple/80">
              <MapPin className="w-4 h-4 text-bright-orange shrink-0 mt-0.5" />
              <span>Techno Institute of Higher Studies, Faizabad Road, Lucknow, Uttar Pradesh 226028, India</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-pale-purple/80">
              <Phone className="w-4 h-4 text-bright-orange shrink-0" />
              <a href="tel:+917897123111" className="hover:text-white font-semibold">+91-7897123111</a>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-pale-purple/80">
              <Mail className="w-4 h-4 text-bright-orange shrink-0" />
              <a href="mailto:events@tihs.edu.in" className="hover:text-white">events@tihs.edu.in</a>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-deep-purple/60 border border-light-purple/30">
              <div className="text-[11px] font-bold text-gold">Admissions Open 2026–27</div>
              <p className="text-[10px] text-pale-purple/70 mt-0.5">Contact the admissions cell or visit campus for direct counseling.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="bg-black/40 py-4 px-4 border-t border-light-purple/10 text-center text-xs text-light-purple">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            © {new Date().getFullYear()} Techno Institute of Higher Studies (TIHS), Lucknow. All Rights Reserved.
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Designed for TIHS College Event Management System (CEMS)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
