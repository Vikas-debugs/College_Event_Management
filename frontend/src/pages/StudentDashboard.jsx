import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventApi, registrationApi, certificateApi } from '../services/api';
import Loader, { SkeletonCard } from '../components/Loader';
import TihsLogo from '../components/TihsLogo';
import {
  User,
  Calendar,
  Award,
  QrCode,
  Download,
  AlertCircle,
  Clock,
  CheckCircle,
  X,
  ExternalLink,
  ChevronRight,
  Search,
  Filter,
  Sparkles,
  MapPin,
  Tag,
  Radio,
  Printer,
  CheckCircle2,
  Camera,
  Edit3,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Cultural', 'Technical', 'Sports', 'Workshop', 'Fine Arts'];

const StudentDashboard = () => {
  const { user, updateProfilePhoto, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('explore'); // 'explore', 'registrations', 'certificates'
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Edit Profile Modal
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileDepartment, setProfileDepartment] = useState('BCA');
  const [profileYear, setProfileYear] = useState(1);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Category & Search filter for Events
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Ticket QR Modal
  const [selectedTicket, setSelectedTicket] = useState(null);

  const openEditProfile = () => {
    setProfileName(user?.name || '');
    setProfilePhone(user?.phone || '');
    setProfileDepartment(user?.department || 'BCA');
    setProfileYear(user?.year || 1);
    setProfilePhotoPreview(user?.profilePhoto || '');
    setEditProfileOpen(true);
  };

  const handleModalPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSavingProfile(true);
    const res = await updateProfile({
      name: profileName.trim(),
      phone: profilePhone.trim(),
      department: profileDepartment,
      year: Number(profileYear),
      profilePhoto: profilePhotoPreview,
    });
    setSavingProfile(false);
    if (res?.success) {
      setEditProfileOpen(false);
    }
  };

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      setUploadingPhoto(true);
      try {
        if (updateProfilePhoto) {
          await updateProfilePhoto(base64Data);
          toast.success('Profile photo updated for certificates & dashboard!');
        }
      } catch (err) {
        toast.error('Could not save photo');
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [eventsRes, regRes, certRes] = await Promise.all([
        eventApi.getAll({ status: 'published' }),
        registrationApi.getMyRegistrations(),
        certificateApi.getMyCertificates(),
      ]);

      if (eventsRes.data.success) {
        setEvents(eventsRes.data.data);
      }
      if (regRes.data.success) {
        setRegistrations(regRes.data.data);
      }
      if (certRes.data.success) {
        setCertificates(certRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick 1-click Register & Generate QR Gate Pass
  const handleRegisterAndGetPass = async (event) => {
    setRegisteringId(event._id);
    try {
      const res = await registrationApi.register(event._id, {
        notes: 'Quick registration via Student Dashboard',
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Registered! Gate pass generated.');
        const newReg = res.data.data;
        // Ensure event data is attached for modal
        newReg.event = event;
        setRegistrations((prev) => [newReg, ...prev]);
        // Immediately display the Digital QR Ticket Pass modal
        setSelectedTicket(newReg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Could not complete registration';
      toast.error(errorMsg);
      if (err.response?.data?.registration) {
        // If already registered, load that ticket in modal
        const existing = err.response.data.registration;
        existing.event = event;
        setSelectedTicket(existing);
      }
    } finally {
      setRegisteringId(null);
    }
  };

  const handleCancelReg = async (regId) => {
    if (!window.confirm('Are you sure you want to cancel this event registration?')) return;
    try {
      const res = await registrationApi.cancel(regId, 'User requested cancellation');
      if (res.data.success) {
        toast.success('Registration cancelled');
        setRegistrations(registrations.map((r) => (r._id === regId ? { ...r, status: 'cancelled' } : r)));
      }
    } catch (err) {
      toast.error('Could not cancel registration');
    }
  };

  // Helper to check if event is running today
  const isRunningToday = (startDate, endDate) => {
    if (!startDate) return false;
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 86400000);
    return now >= new Date(start.setHours(0, 0, 0, 0)) && now <= new Date(end.setHours(23, 59, 59, 999));
  };

  // Filter events
  const filteredEvents = events.filter((ev) => {
    const matchesCategory = selectedCategory === 'All' || ev.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      ev.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const runningEvents = filteredEvents.filter((ev) => isRunningToday(ev.startDate, ev.endDate));
  const upcomingEvents = filteredEvents.filter((ev) => !isRunningToday(ev.startDate, ev.endDate));

  // Check if student already has an active pass for an event
  const getExistingRegistration = (eventId) => {
    return registrations.find(
      (r) => (r.event?._id === eventId || r.event === eventId) && r.status !== 'cancelled'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-purple-gradient text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-light-purple/20">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-gold/40 flex items-center justify-center font-heading font-black text-2xl text-gold shadow-md overflow-hidden">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name?.slice(0, 2).toUpperCase() || 'ST'}</span>
              )}
            </div>
            <label
              className="absolute -bottom-1 -right-1 bg-bright-orange hover:bg-amber-600 text-white p-1 rounded-lg cursor-pointer shadow-md transition-transform group-hover:scale-110"
              title="Upload profile photo for certificates & passes"
            >
              <Camera className="w-3.5 h-3.5" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePhotoUpload}
                disabled={uploadingPhoto}
              />
            </label>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold">{user?.name}</h1>
              <span className="bg-bright-orange text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-pale-purple/90">
              Department of {user?.department || 'BCA'} • Year {user?.year || 1} • {user?.email}
            </p>
            <button
              onClick={openEditProfile}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-lg border border-white/20 transition-all mt-1 shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-gold" />
              <span>Update Details & Photo</span>
            </button>
          </div>
        </div>

        {/* Quick Counts */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
          <div className="text-center">
            <span className="block text-xs text-pale-purple font-medium">Available Events</span>
            <span className="font-heading text-2xl font-bold text-gold">{events.length}</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <span className="block text-xs text-pale-purple font-medium">My Passes</span>
            <span className="font-heading text-2xl font-bold text-bright-orange">{registrations.length}</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <span className="block text-xs text-pale-purple font-medium">Certificates</span>
            <span className="font-heading text-2xl font-bold text-emerald-400">{certificates.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-pale-purple pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('explore')}
          className={`pb-2 px-3 text-sm font-bold transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'explore'
              ? 'text-deep-purple border-b-2 border-bright-orange'
              : 'text-text-muted hover:text-deep-purple'
          }`}
        >
          <Sparkles className="w-4 h-4 text-bright-orange" />
          <span>Explore & Register Events ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('registrations')}
          className={`pb-2 px-3 text-sm font-bold transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'registrations'
              ? 'text-deep-purple border-b-2 border-bright-orange'
              : 'text-text-muted hover:text-deep-purple'
          }`}
        >
          <QrCode className="w-4 h-4 text-deep-purple" />
          <span>My Digital Gate Passes ({registrations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`pb-2 px-3 text-sm font-bold transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'certificates'
              ? 'text-deep-purple border-b-2 border-bright-orange'
              : 'text-text-muted hover:text-deep-purple'
          }`}
        >
          <Award className="w-4 h-4 text-gold" />
          <span>My Participation Certificates ({certificates.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: EXPLORE & REGISTER EVENTS ================= */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Category Filter Pills & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-pale-purple shadow-sm">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-deep-purple text-white shadow-sm'
                      : 'bg-pale-purple/50 text-text-dark hover:bg-pale-purple'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search event, venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-cream/50 border border-pale-purple rounded-xl text-xs focus:outline-none focus:border-deep-purple"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <SkeletonCard key={n} />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* 🔴 RUNNING / LIVE TODAY SECTION */}
              {runningEvents.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                    </span>
                    <h2 className="font-heading text-lg font-bold text-deep-purple">
                      Running & Happening Today on Campus
                    </h2>
                    <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      Live Gate Entry
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {runningEvents.map((ev) => {
                      const reg = getExistingRegistration(ev._id);
                      return (
                        <EventCard
                          key={ev._id}
                          event={ev}
                          existingReg={reg}
                          isLive={true}
                          onRegister={() => handleRegisterAndGetPass(ev)}
                          onViewPass={() => {
                            reg.event = ev;
                            setSelectedTicket(reg);
                          }}
                          registering={registeringId === ev._id}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 📅 UPCOMING EVENTS SECTION */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-lg font-bold text-deep-purple flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-bright-orange" />
                    <span>Upcoming TIHS College Events ({upcomingEvents.length})</span>
                  </h2>
                </div>

                {upcomingEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingEvents.map((ev) => {
                      const reg = getExistingRegistration(ev._id);
                      return (
                        <EventCard
                          key={ev._id}
                          event={ev}
                          existingReg={reg}
                          isLive={false}
                          onRegister={() => handleRegisterAndGetPass(ev)}
                          onViewPass={() => {
                            reg.event = ev;
                            setSelectedTicket(reg);
                          }}
                          registering={registeringId === ev._id}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-10 text-center border border-pale-purple max-w-md mx-auto space-y-2">
                    <Calendar className="w-10 h-10 text-deep-purple/30 mx-auto" />
                    <h3 className="font-heading font-bold text-base text-text-dark">No upcoming events match</h3>
                    <p className="text-xs text-text-muted">
                      Try switching categories or clearing search keywords.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: MY DIGITAL GATE PASSES ================= */}
      {activeTab === 'registrations' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <SkeletonCard key={n} />
              ))}
            </div>
          ) : registrations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations.map((reg) => {
                const event = reg.event || {};
                const isCancelled = reg.status === 'cancelled';
                const isWaitlist = reg.status === 'waitlisted';

                return (
                  <div
                    key={reg._id}
                    className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between space-y-4 ${
                      isCancelled ? 'border-red-200 opacity-70' : 'border-pale-purple hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            isCancelled
                              ? 'bg-red-100 text-red-700'
                              : isWaitlist
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {reg.status}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-deep-purple">
                          {reg.ticketCode}
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-base text-deep-purple line-clamp-1">
                        {event.title || 'TIHS College Event'}
                      </h3>

                      <div className="text-xs text-text-muted space-y-1">
                        <p>📍 {event.venue || 'Campus Venue'}</p>
                        <p>
                          📅 {event.startDate ? new Date(event.startDate).toLocaleDateString('en-IN') : 'TBD'}
                        </p>
                        <p>
                          💳 Pass Type:{' '}
                          <span className="font-semibold uppercase text-deep-purple">
                            {event.fee > 0 ? `Paid (₹${event.fee})` : 'Free Entry Pass'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-pale-purple flex items-center gap-2">
                      <button
                        onClick={() => setSelectedTicket(reg)}
                        className="flex-1 py-2.5 bg-deep-purple hover:bg-mid-purple text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <QrCode className="w-4 h-4 text-bright-orange" />
                        <span>View Gate Pass QR</span>
                      </button>

                      {!isCancelled && (
                        <button
                          onClick={() => handleCancelReg(reg._id)}
                          className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-pale-purple space-y-3 max-w-md mx-auto">
              <Calendar className="w-12 h-12 text-deep-purple/30 mx-auto" />
              <h3 className="font-heading text-lg font-bold text-text-dark">No Active Gate Passes</h3>
              <p className="text-xs text-text-muted">
                Explore running and upcoming college events and claim your digital QR entry pass.
              </p>
              <button
                onClick={() => setActiveTab('explore')}
                className="mt-2 inline-block px-5 py-2.5 bg-bright-orange text-white text-xs font-bold rounded-xl"
              >
                Explore Events Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: CERTIFICATES ================= */}
      {activeTab === 'certificates' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map((n) => (
                <SkeletonCard key={n} />
              ))}
            </div>
          ) : certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert._id}
                  className="bg-white rounded-3xl p-6 border border-pale-purple shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-bright-orange flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase">
                      Certificate ID: {cert.certificateId}
                    </span>
                    <h3 className="font-heading font-bold text-base text-deep-purple mt-1">
                      {cert.event?.title || 'TIHS Participation Certificate'}
                    </h3>
                    <p className="text-xs text-text-muted mt-1">
                      Issued on {new Date(cert.issuedAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-pale-purple flex items-center gap-2">
                    <Link
                      to={`/certificates/${cert.certificateId || cert._id}`}
                      className="flex-1 py-2 bg-pale-purple hover:bg-light-purple/20 text-deep-purple text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Link>
                    <a
                      href={`/api/certificates/${cert.certificateId || cert._id}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 bg-deep-purple hover:bg-mid-purple text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-pale-purple space-y-3 max-w-md mx-auto">
              <Award className="w-12 h-12 text-deep-purple/30 mx-auto" />
              <h3 className="font-heading text-lg font-bold text-text-dark">No Certificates Yet</h3>
              <p className="text-xs text-text-muted">
                Certificates are automatically generated and issued after you attend completed college events.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ================= DIGITAL QR EVENT GATE PASS MODAL ================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border-2 border-deep-purple space-y-5 text-center">
            {/* Close Button */}
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:bg-pale-purple transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* College Header Crest */}
            <div className="flex items-center justify-center gap-3 border-b border-pale-purple pb-4">
              <img
                src="/assets/images/tihs-logo.webp"
                alt="TIHS Logo"
                className="w-14 h-14 object-contain rounded-xl shadow-sm"
                onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/tihs-logo.svg'; }}
              />
              <div className="text-left">
                <span className="text-[10px] font-bold text-bright-orange uppercase tracking-wider block">
                  OFFICIAL EVENT GATE PASS
                </span>
                <h4 className="font-heading font-black text-sm text-deep-purple leading-tight">
                  TECHNO INSTITUTE OF HIGHER STUDIES
                </h4>
                <p className="text-[9px] text-text-muted">Lucknow • NAAC Accredited • ISO 9001:2015</p>
              </div>
            </div>

            {/* Event Info */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold bg-pale-purple text-deep-purple px-2 py-0.5 rounded-full uppercase">
                {selectedTicket.event?.category || 'TIHS Event'}
              </span>
              <h3 className="font-heading text-xl font-bold text-deep-purple">
                {selectedTicket.event?.title || 'Campus Event'}
              </h3>
              <p className="text-xs text-text-muted">
                📍 {selectedTicket.event?.venue || 'Campus Main Ground'} • 📅{' '}
                {selectedTicket.event?.startDate
                  ? new Date(selectedTicket.event?.startDate).toLocaleDateString('en-IN')
                  : 'Today'}
              </p>
            </div>

            {/* Big Monospace Ticket Code & High-Res QR Code */}
            <div className="p-4 bg-cream rounded-2xl border-2 border-dashed border-deep-purple/30 inline-block space-y-3">
              <div className="text-xs font-mono font-black text-deep-purple tracking-wider bg-white py-1 px-3 rounded-lg border border-pale-purple shadow-inner">
                {selectedTicket.ticketCode}
              </div>

              {selectedTicket.qrCode ? (
                <img
                  src={selectedTicket.qrCode}
                  alt="TIHS Digital Gate Pass QR"
                  className="w-48 h-48 mx-auto rounded-xl border border-deep-purple/40 shadow-sm"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-text-muted bg-white rounded-xl">
                  Generating QR Pass...
                </div>
              )}

              <span className="text-[10px] font-mono text-text-muted block">
                SCAN AT MAIN GATE ENTRANCE
              </span>
            </div>

            {/* Student Attendee Details */}
            <div className="bg-pale-purple/30 rounded-2xl p-3 text-xs text-left space-y-1 border border-pale-purple">
              <div className="flex justify-between">
                <span className="text-text-muted">Attendee:</span>
                <strong className="text-deep-purple">{user?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Department:</span>
                <strong className="text-deep-purple">{user?.department} (Year {user?.year || 1})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Email:</span>
                <strong className="text-deep-purple">{user?.email}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Pass Status:</span>
                <span className="font-bold text-emerald-600 uppercase text-[10px]">
                  {selectedTicket.status || 'Confirmed'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-pale-purple hover:bg-light-purple/30 text-deep-purple font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4 text-deep-purple" />
                <span>Print Pass</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="flex-1 py-2.5 bg-deep-purple hover:bg-mid-purple text-white font-bold text-xs rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT PROFILE & DETAILS MODAL ================= */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-pale-purple space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setEditProfileOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-deep-purple p-1.5 rounded-full hover:bg-pale-purple/50 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="font-heading text-2xl font-bold text-deep-purple">
                Update Profile & Details
              </h3>
              <p className="text-xs text-text-muted">
                Keep your student profile and certificate photo up-to-date
              </p>
            </div>

            {/* Profile Photo Preview & Uploader */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl border-4 border-gold shadow-md overflow-hidden bg-cream flex items-center justify-center">
                  {profilePhotoPreview ? (
                    <img
                      src={profilePhotoPreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-deep-purple/40" />
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 bg-bright-orange hover:bg-amber-600 text-white p-2 rounded-xl cursor-pointer shadow-md transition-transform group-hover:scale-105" title="Change Photo">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleModalPhotoUpload}
                  />
                </label>
              </div>
              <span className="text-[11px] text-text-muted font-medium">
                Click camera to upload / change photo
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-cream/60 border border-pale-purple rounded-xl focus:border-deep-purple focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-cream/60 border border-pale-purple rounded-xl focus:border-deep-purple focus:outline-none"
                  placeholder="+91-XXXXXXXXXX"
                />
              </div>

              {/* Department & Academic Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-dark mb-1">
                    Department
                  </label>
                  <select
                    value={profileDepartment}
                    onChange={(e) => setProfileDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-cream/60 border border-pale-purple rounded-xl focus:border-deep-purple focus:outline-none"
                  >
                    <option value="BCA">BCA</option>
                    <option value="BBA">BBA</option>
                    <option value="B.Com">B.Com</option>
                    <option value="BFA">BFA</option>
                    <option value="BAJMC">BAJMC</option>
                    <option value="B.Ed">B.Ed</option>
                    <option value="B.Sc">B.Sc</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-dark mb-1">
                    Academic Year
                  </label>
                  <select
                    value={profileYear}
                    onChange={(e) => setProfileYear(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-cream/60 border border-pale-purple rounded-xl focus:border-deep-purple focus:outline-none"
                  >
                    <option value={1}>1st Year (Fresher)</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year (Final)</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
              </div>

              {/* Email (Read only) */}
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1 flex items-center justify-between">
                  <span>Registered College Email</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Verified Credential</span>
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 text-xs bg-gray-100 border border-gray-200 rounded-xl text-text-muted cursor-not-allowed"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-pale-purple/50">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="px-4 py-2.5 bg-pale-purple hover:bg-light-purple/30 text-deep-purple text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 bg-deep-purple hover:bg-mid-purple text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {savingProfile ? (
                    <Loader text="" size="sm" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for individual Event Card
const EventCard = ({ event, existingReg, isLive, onRegister, onViewPass, registering }) => {
  return (
    <div
      className={`bg-white rounded-3xl p-5 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative ${
        isLive ? 'border-red-300 ring-2 ring-red-100' : 'border-pale-purple'
      }`}
    >
      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
          <Radio className="w-3 h-3" />
          <span>LIVE TODAY</span>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-pale-purple text-deep-purple">
            {event.category}
          </span>
          <span className="text-[10px] font-semibold text-text-muted">
            Dept: {event.department || 'All'}
          </span>
        </div>

        <h3 className="font-heading font-bold text-base text-deep-purple line-clamp-2">
          {event.title}
        </h3>

        <p className="text-xs text-text-muted line-clamp-2">
          {event.description || 'Join fellow students and faculty for this campus activity.'}
        </p>

        <div className="text-xs text-text-dark space-y-1.5 bg-cream/50 p-3 rounded-2xl border border-pale-purple/50">
          <div className="flex items-center gap-2 text-text-muted">
            <MapPin className="w-3.5 h-3.5 text-bright-orange shrink-0" />
            <span className="truncate">{event.venue || 'Campus Venue'}</span>
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            <Calendar className="w-3.5 h-3.5 text-deep-purple shrink-0" />
            <span>
              {event.startDate
                ? new Date(event.startDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Date Announced Soon'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-pale-purple/40 text-[11px]">
            <span className="font-bold text-deep-purple">
              {event.fee > 0 ? `₹${event.fee} Entry Fee` : 'Free Entry'}
            </span>
            <span className="text-text-muted">
              Capacity: {event.capacity || 100} seats
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-pale-purple flex items-center gap-2">
        {existingReg ? (
          <button
            onClick={onViewPass}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>View Gate Pass QR</span>
          </button>
        ) : (
          <button
            onClick={onRegister}
            disabled={registering}
            className="w-full py-2.5 bg-bright-orange hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            {registering ? (
              <Loader text="" size="sm" />
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                <span>Register & Get QR Pass</span>
              </>
            )}
          </button>
        )}

        <Link
          to={`/events/${event.slug || event._id}`}
          className="p-2.5 bg-pale-purple hover:bg-light-purple/30 text-deep-purple rounded-xl transition-colors shrink-0"
          title="View Event Details"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;
