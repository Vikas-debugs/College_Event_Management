import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventApi } from '../services/api';
import EventCard from '../components/EventCard';
import { SkeletonCard } from '../components/Loader';
import { Search, Filter, Calendar as CalendarIcon, Grid, List, Sparkles, X } from 'lucide-react';

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'calendar'

  const [statusFilter, setStatusFilter] = useState('published'); // 'published', 'all', 'completed'
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [department, setDepartment] = useState(searchParams.get('department') || 'All');
  const [feeType, setFeeType] = useState('all');
  const [search, setSearch] = useState('');

  const categories = ['All', 'Cultural', 'Technical', 'Sports', 'Workshop', 'Fine Arts'];
  const departments = ['All', 'BBA', 'BCA', 'B.Com', 'BFA', 'BAJMC', 'B.Ed', 'B.Sc'];

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = {
          status: statusFilter,
        };
        if (category !== 'All') params.category = category;
        if (department !== 'All') params.department = department;
        if (feeType !== 'all') params.feeType = feeType;
        if (search) params.search = search;

        const res = await eventApi.getAll(params);
        if (res.data.success) {
          setEvents(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [category, department, feeType, search, statusFilter]);


  const clearFilters = () => {
    setCategory('All');
    setDepartment('All');
    setFeeType('all');
    setSearch('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-purple-gradient text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-lg">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="bg-bright-orange text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase">
            TIHS Campus Events
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold">
            Explore Upcoming College Events
          </h1>
          <p className="text-xs sm:text-sm text-pale-purple/90">
            Search, filter and register for events hosted across all 7 departments of Techno Institute of Higher Studies.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-pale-purple shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by title, topic, venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-cream/60 border border-pale-purple rounded-xl text-xs sm:text-sm focus:outline-none focus:border-deep-purple transition-colors"
            />
          </div>

          {/* Department Select */}
          <div className="md:col-span-3">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full py-2.5 px-3 bg-cream/60 border border-pale-purple rounded-xl text-xs sm:text-sm focus:outline-none focus:border-deep-purple font-medium"
            >
              <option value="All">All Departments</option>
              {departments.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>
                  Dept of {d}
                </option>
              ))}
            </select>
          </div>

          {/* Fee Type Select */}
          <div className="md:col-span-2">
            <select
              value={feeType}
              onChange={(e) => setFeeType(e.target.value)}
              className="w-full py-2.5 px-3 bg-cream/60 border border-pale-purple rounded-xl text-xs sm:text-sm focus:outline-none focus:border-deep-purple font-medium"
            >
              <option value="all">All Fees</option>
              <option value="free">Free Events</option>
              <option value="paid">Paid Events</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="md:col-span-2 flex items-center justify-end gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-deep-purple text-white border-deep-purple'
                  : 'bg-white text-text-muted border-pale-purple hover:bg-pale-purple'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-deep-purple text-white border-deep-purple'
                  : 'bg-white text-text-muted border-pale-purple hover:bg-pale-purple'
              }`}
              title="Calendar Schedule"
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Schedule</span>
            </button>
          </div>
        </div>

        {/* Status & Category Pills Strip */}
        <div className="space-y-3 pt-2 border-t border-pale-purple/60">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider shrink-0 mr-1">
              Status:
            </span>
            {[
              { id: 'published', label: '🔴 Live & Upcoming' },
              { id: 'all', label: '📁 All Events' },
              { id: 'completed', label: '🏁 Past / Completed' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  statusFilter === st.id
                    ? 'bg-deep-purple text-white shadow-sm'
                    : 'bg-pale-purple/60 text-deep-purple hover:bg-pale-purple'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider shrink-0 mr-1">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  category === cat
                    ? 'bg-bright-orange text-white shadow-sm'
                    : 'bg-pale-purple text-deep-purple hover:bg-light-purple/20'
                }`}
              >
                {cat}
              </button>
            ))}

            {(category !== 'All' || department !== 'All' || feeType !== 'all' || search || statusFilter !== 'published') && (
              <button
                onClick={() => {
                  clearFilters();
                  setStatusFilter('published');
                }}
                className="ml-auto text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 shrink-0 px-2 py-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Events Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : events.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          /* Calendar / Schedule View */
          <div className="bg-white rounded-2xl p-6 border border-pale-purple space-y-4">
            <h3 className="font-heading text-lg font-bold text-deep-purple">Upcoming Event Schedule</h3>
            <div className="divide-y divide-pale-purple">
              {events.map((ev) => (
                <div key={ev._id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-pale-purple text-deep-purple rounded-xl p-3 text-center min-w-[70px]">
                      <span className="block text-xs font-bold uppercase">
                        {new Date(ev.startDate).toLocaleString('en-IN', { month: 'short' })}
                      </span>
                      <span className="font-heading text-2xl font-black">
                        {new Date(ev.startDate).getDate()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-bright-orange border border-bright-orange/30">
                          {ev.category}
                        </span>
                        <span className="text-xs text-text-muted">
                          {new Date(ev.startDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-base text-text-dark mt-1">{ev.title}</h4>
                      <p className="text-xs text-text-muted">{ev.venue}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-deep-purple">
                      {ev.fee === 0 ? 'FREE' : `₹${ev.fee}`}
                    </span>
                    <a
                      href={`/events/${ev.slug || ev._id}`}
                      className="px-4 py-2 bg-deep-purple hover:bg-mid-purple text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Details & Pass
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-pale-purple space-y-3 max-w-md mx-auto">
          <CalendarIcon className="w-12 h-12 text-deep-purple/30 mx-auto" />
          <h3 className="font-heading text-lg font-bold text-text-dark">No Events Found</h3>
          <p className="text-xs text-text-muted">
            Try adjusting your search criteria or clear active filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-2 px-4 py-2 bg-pale-purple text-deep-purple text-xs font-bold rounded-lg hover:bg-light-purple/20"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Events;
