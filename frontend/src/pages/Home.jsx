import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventApi } from '../services/api';
import EventCard from '../components/EventCard';
import { SkeletonCard } from '../components/Loader';
import {
  Sparkles,
  Calendar,
  Award,
  ArrowRight,
  Music,
  Code,
  Trophy,
  BookOpen,
  Palette,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  CreditCard,
} from 'lucide-react';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const res = await eventApi.getAll({ status: 'published' });
        if (res.data.success) {
          setEvents(res.data.data.slice(0, 6));
        }
      } catch (err) {
        console.error('Error fetching home events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcomingEvents();
  }, []);

  const statsCategories = [
    { name: 'Cultural', icon: Music, count: '12+ Events', desc: 'Music, Dance & Drama' },
    { name: 'Technical', icon: Code, count: '8+ Hackathons', desc: 'AI, Coding & Robotics' },
    { name: 'Sports', icon: Trophy, count: '15+ Tournaments', desc: 'Cricket, Chess & Track' },
    { name: 'Workshop', icon: BookOpen, count: '20+ Seminars', desc: 'Fintech, Media & Law' },
    { name: 'Fine Arts', icon: Palette, count: '10+ Exhibits', desc: 'Painting & Photography' },
  ];

  const departments = [
    { code: 'BBA', name: 'Bachelor of Business Administration', seats: '120 Seats', duration: '3 Years' },
    { code: 'BCA', name: 'Bachelor of Computer Applications', seats: '120 Seats', duration: '3 Years' },
    { code: 'B.Com', name: 'Bachelor of Commerce', seats: '140 Seats', duration: '3 Years' },
    { code: 'BFA', name: 'Bachelor of Fine Arts', seats: '60 Seats', duration: '4 Years' },
    { code: 'BAJMC', name: 'BA in Journalism & Mass Comm.', seats: '60 Seats', duration: '3 Years' },
    { code: 'B.Ed', name: 'Bachelor of Education (NCTE Approved)', seats: '100 Seats', duration: '2 Years' },
    { code: 'B.Sc', name: 'Bachelor of Science', seats: '80 Seats', duration: '3 Years' },
  ];

  const newsItems = [
    '🔔 Registrations open for TechnoUtsav 2026 Annual Cultural Fest.',
    '🏆 TIHS ranked 3rd Best B-School in Lucknow by Times of India B-School Ranking.',
    '💡 Hack-Techno 2026: 24-Hour AI Hackathon scheduled with ₹50,000 prize pool.',
    '🎓 Admissions Open for Session 2026–27. Scholarships available for meritorious students.',
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-purple-gradient text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-light-purple/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e29826_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-gold/40 text-gold text-xs font-bold tracking-wide">
              <Sparkles className="w-4 h-4 text-bright-orange" />
              <span>OFFICIAL EVENT PORTAL • LUCKNOW</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Techno Institute of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-bright-orange to-amber-200">
                Higher Studies
              </span>
            </h1>

            <p className="font-heading italic text-xl sm:text-2xl text-pale-purple/95 max-w-2xl font-medium">
              "Shaping Future Skilled Professionals"
            </p>

            <p className="text-sm sm:text-base text-pale-purple/80 max-w-xl leading-relaxed">
              Digitizing the entire event lifecycle at TIHS Lucknow. Register for fests, seminars, hackathons, download verified QR tickets, get automated certificates, and review campus happenings.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                to="/events"
                className="px-7 py-3.5 bg-bright-orange hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-bright-orange/30 hover:shadow-xl transition-all flex items-center gap-2"
              >
                <span>Browse All Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/signup"
                className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-sm rounded-xl backdrop-blur-sm transition-all"
              >
                Join CEMS Portal
              </Link>
            </div>

            {/* Badges strip */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-pale-purple/90">
              <span className="flex items-center gap-1.5 font-semibold text-gold">
                <CheckCircle2 className="w-4 h-4 text-bright-orange" /> NAAC Accredited
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <CheckCircle2 className="w-4 h-4 text-bright-orange" /> NCTE Approved
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <CheckCircle2 className="w-4 h-4 text-bright-orange" /> ISO 9001:2015
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-gold">
                <CheckCircle2 className="w-4 h-4 text-bright-orange" /> 3rd Best B-School (Lucknow)
              </span>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden border-2 border-gold/40 shadow-2xl bg-dark-purple group">
              {/* Campus Photo */}
              <img
                src="/assets/images/campus-hero.webp"
                alt="TIHS Campus — NAAC Accredited, Lucknow"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/images/campus-hero.svg';
                }}
              />
              {/* Overlay gradient at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-purple/90 via-transparent to-transparent" />

              {/* Logo badge top-left */}
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-xl px-2.5 py-1.5 shadow-lg">
                <img
                  src="/assets/images/tihs-logo.webp"
                  alt="TIHS Logo"
                  className="w-8 h-8 object-contain rounded"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div>
                  <div className="text-[10px] font-extrabold text-deep-purple leading-tight">TIHS</div>
                  <div className="text-[8px] text-text-muted leading-tight">Est. 1999</div>
                </div>
              </div>

              {/* NAAC badge top-right */}
              <div className="absolute top-3 right-3 bg-bright-orange text-white text-[9px] font-extrabold px-2 py-1 rounded-lg shadow-md tracking-wide">
                NAAC A+
              </div>

              {/* Bottom info panel */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-sm font-bold text-white font-heading">Techno Institute of Higher Studies</div>
                <div className="text-xs text-gold mt-0.5">Lucknow, Uttar Pradesh • Affiliated to University of Lucknow</div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {['NAAC Accredited', 'ISO 9001:2015', 'NCTE Approved'].map(tag => (
                    <span key={tag} className="text-[9px] bg-white/15 text-white px-2 py-0.5 rounded-full font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Cards (5 Categories) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {statsCategories.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={`/events?category=${encodeURIComponent(item.name)}`}
                className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-pale-purple/90 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all text-center flex flex-col items-center justify-center space-y-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-pale-purple group-hover:bg-deep-purple flex items-center justify-center transition-colors">
                  <Icon className="w-6 h-6 text-deep-purple group-hover:text-gold transition-colors" />
                </div>
                <h4 className="font-heading font-bold text-base text-text-dark group-hover:text-deep-purple">
                  {item.name}
                </h4>
                <span className="text-xs font-bold text-bright-orange">{item.count}</span>
                <p className="text-[11px] text-text-muted">{item.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Upcoming Events Grid (6 cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-bright-orange uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5" /> What's Happening Next
            </div>
            <h2 className="font-heading text-3xl font-extrabold text-deep-purple">Upcoming College Events</h2>
            <p className="text-xs text-text-muted mt-1">Discover, participate and lead cultural, technical and sports events.</p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-deep-purple hover:text-bright-orange transition-colors"
          >
            <span>View All Events</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-pale-purple">
            <Calendar className="w-12 h-12 text-deep-purple/40 mx-auto mb-3" />
            <h3 className="font-heading text-lg font-bold text-text-dark">No Events Scheduled</h3>
            <p className="text-xs text-text-muted mt-1">Check back soon or explore campus activities.</p>
          </div>
        )}
      </section>

      {/* 4. Academic Departments */}
      <section className="bg-pale-purple/40 py-16 px-4 sm:px-6 lg:px-8 border-y border-pale-purple">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-bright-orange uppercase tracking-wider">Academic Excellence</span>
            <h2 className="font-heading text-3xl font-extrabold text-deep-purple">7 Distinct Departments</h2>
            <p className="text-xs text-text-muted">
              Programs accredited by NAAC and affiliated to the prestigious University of Lucknow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.code}
                className="bg-white p-5 rounded-2xl border border-pale-purple shadow-sm hover:shadow-md transition-all hover:border-light-purple/50 group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="font-heading text-2xl font-black text-deep-purple group-hover:text-bright-orange transition-colors">
                    {dept.code}
                  </span>
                  <span className="bg-pale-purple text-deep-purple text-[10px] font-bold px-2 py-0.5 rounded">
                    {dept.duration}
                  </span>
                </div>
                <h4 className="font-medium text-xs text-text-dark mb-3 min-h-[32px] leading-snug">
                  {dept.name}
                </h4>
                <div className="pt-3 border-t border-pale-purple/60 flex justify-between items-center text-[11px] text-text-muted">
                  <span>Intake: {dept.seats}</span>
                  <Link
                    to={`/events?department=${dept.code}`}
                    className="text-deep-purple font-bold hover:text-bright-orange flex items-center gap-1"
                  >
                    <span>Events</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Latest Happenings News Ticker */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-dark-purple text-pale-purple p-4 sm:p-5 rounded-2xl border border-light-purple/30 flex flex-col md:flex-row items-center gap-4 shadow-md">
          <div className="flex items-center gap-2 bg-bright-orange text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shrink-0">
            <TrendingUp className="w-4 h-4" />
            <span>LATEST HAPPENINGS</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
              <span className="font-semibold text-gold">{newsItems[0]}</span>
              <span className="hidden lg:inline text-light-purple/60">•</span>
              <span className="hidden lg:inline text-pale-purple/80">{newsItems[1]}</span>
            </div>
          </div>
          <Link
            to="/happenings"
            className="text-xs font-bold text-gold hover:text-white underline underline-offset-2 shrink-0"
          >
            All Announcements →
          </Link>
        </div>
      </section>

      {/* 6. CTA Strip ("Register for Events" | "Pay Online") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-purple-accent-gradient rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <span className="bg-bright-orange text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Student Registration Portal
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold">Ready to Participate in TIHS Events?</h2>
            <p className="text-xs sm:text-sm text-pale-purple/90 leading-relaxed">
              Log in with your TIHS student credentials to claim event passes, generate instant QR tickets, make secure payments, and download certified achievements.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
            <Link
              to="/events"
              className="w-full sm:w-auto px-6 py-3.5 bg-bright-orange hover:bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl text-center shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Register for Events</span>
            </Link>
            <Link
              to="/signup"
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-deep-purple hover:bg-pale-purple font-bold text-xs sm:text-sm rounded-xl text-center transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-bright-orange" />
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
