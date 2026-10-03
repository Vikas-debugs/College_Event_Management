import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Tag, ArrowRight, Sparkles } from 'lucide-react';

const categoryColors = {
  Cultural: 'bg-pink-100 text-pink-800 border-pink-200',
  Technical: 'bg-blue-100 text-blue-800 border-blue-200',
  Sports: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Workshop: 'bg-amber-100 text-amber-800 border-amber-200',
  'Fine Arts': 'bg-purple-100 text-purple-800 border-purple-200',
};

const EventCard = ({ event }) => {
  const formattedDate = new Date(event.startDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(event.startDate).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const categoryBadge = categoryColors[event.category] || 'bg-pale-purple text-deep-purple border-light-purple/30';
  const seatsFilled = event.registeredCount || 0;
  const totalCapacity = event.capacity || 100;
  const fillPercentage = Math.min(100, Math.round((seatsFilled / totalCapacity) * 100));

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-pale-purple/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group">
      {/* Banner & Category Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-dark-purple">
        <img
          src={event.banner || '/assets/images/campus-hero.webp'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = '/assets/images/campus-hero.webp';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-purple/90 via-dark-purple/20 to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border backdrop-blur-md ${categoryBadge}`}>
            {event.category}
          </span>
          {event.department && event.department !== 'All' && (
            <span className="bg-dark-purple/80 text-gold px-2.5 py-0.5 rounded-full text-xs font-bold border border-gold/30">
              {event.department}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-sm ${
            event.fee === 0
              ? 'bg-emerald-600 text-white'
              : 'bg-bright-orange text-white'
          }`}>
            {event.fee === 0 ? 'FREE ENTRY' : `₹${event.fee}`}
          </span>
        </div>

        {/* Date Stamp on Banner */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5 font-medium drop-shadow-md">
            <Calendar className="w-3.5 h-3.5 text-bright-orange" />
            <span>{formattedDate} • {formattedTime}</span>
          </div>
          {event.status === 'completed' && (
            <span className="bg-gray-800/80 text-gray-200 px-2 py-0.5 rounded text-[10px] font-bold">
              COMPLETED
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-heading font-bold text-lg text-text-dark group-hover:text-deep-purple transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>
          <p className="text-xs text-text-muted mt-2 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Venue & Capacity Info */}
        <div className="space-y-2.5 pt-2 border-t border-pale-purple/50 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-deep-purple shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-text-dark">
                <Users className="w-3 h-3 text-deep-purple" />
                {seatsFilled} / {totalCapacity} Seats Booked
              </span>
              <span className="text-[10px] font-bold text-deep-purple">
                {event.remainingSeats !== undefined ? `${event.remainingSeats} left` : ''}
              </span>
            </div>
            <div className="w-full bg-pale-purple rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  fillPercentage > 85 ? 'bg-red-500' : 'bg-deep-purple'
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/events/${event.slug || event._id}`}
          className="w-full py-2.5 px-4 bg-pale-purple text-deep-purple group-hover:bg-deep-purple group-hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
        >
          <span>{event.status === 'completed' ? 'View Event & Certificates' : 'Explore & Register'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
