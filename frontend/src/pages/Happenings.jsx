import React from 'react';
import { Calendar, Tag, ChevronRight, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';

const Happenings = () => {
  const articles = [
    {
      title: 'TechnoUtsav 2026: Lucknow\'s Biggest Inter-College Cultural Extravaganza Announced',
      date: 'September 28, 2026',
      category: 'Cultural Fest',
      desc: 'TIHS prepares for a three-day celebration of dance, rock band competitions, theatrical performances, and celebrity live show at the campus amphitheatre.',
      img: '/assets/images/campus-hero.webp',
    },
    {
      title: 'Hack-Techno 2026: 24-Hour AI & Web3 Hackathon Opens National Registrations',
      date: 'September 25, 2026',
      category: 'Technical Hackathon',
      desc: 'Over 100 teams from Uttar Pradesh universities expected to solve real-world industry problem statements with ₹50,000 cash rewards and direct internship interviews.',
      img: '/assets/images/facilities.webp',
    },
    {
      title: 'TIHS Ranked 3rd Best B-School in Lucknow in Latest Times of India Survey',
      date: 'September 20, 2026',
      category: 'Accreditation & Rank',
      desc: 'Recognized for excellent industry-oriented curricula, distinguished Ph.D faculty mentorship, and consistent placement track record across top MNCs.',
      img: '/assets/images/faculty.webp',
    },
    {
      title: 'Ranbhoomi Sports Carnival 2026: Inter-Departmental League Begins Next Week',
      date: 'September 15, 2026',
      category: 'Sports Arena',
      desc: '7 academic departments prepare for cricket, badminton singles, table tennis, and athletics track events at the TIHS Ranbhoomi complex.',
      img: '/assets/images/campus-life.webp',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Header Banner */}
      <section className="bg-purple-gradient text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-gold font-bold text-xs uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-gold/30">
            News & Media
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold">
            Latest Happenings at TIHS
          </h1>
          <p className="text-sm sm:text-base text-pale-purple/90 font-heading italic">
            "Campus announcements, student achievements, and academic bulletins"
          </p>
        </div>
      </section>

      {/* Blog / News Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((art, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl overflow-hidden border border-pale-purple shadow-sm hover:shadow-lg transition-all flex flex-col group"
            >
              <div className="h-52 w-full overflow-hidden bg-dark-purple">
                <img
                  src={art.img}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="bg-amber-50 text-bright-orange font-bold px-2.5 py-0.5 rounded-full border border-bright-orange/30">
                      {art.category}
                    </span>
                    <span className="text-text-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {art.date}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-deep-purple group-hover:text-bright-orange transition-colors">
                    {art.title}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">{art.desc}</p>
                </div>

                <Link
                  to="/events"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-deep-purple hover:text-bright-orange"
                >
                  <span>Explore Associated Events</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Happenings;
