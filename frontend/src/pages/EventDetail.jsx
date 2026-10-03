import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventApi, registrationApi, paymentApi, feedbackApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import {
  Calendar,
  MapPin,
  Users,
  Award,
  ShieldAlert,
  Tag,
  Share2,
  CheckCircle,
  Clock,
  Star,
  MessageSquare,
  QrCode,
  Download,
  AlertCircle,
  X,
  CreditCard,
} from 'lucide-react';

const EventDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Registration Modal State
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [isTeam, setIsTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState([{ name: '', email: '', rollNo: '' }]);
  const [customResponses, setCustomResponses] = useState({});
  const [submittingReg, setSubmittingReg] = useState(false);
  const [confirmedReg, setConfirmedReg] = useState(null);

  // Feedback Modal State
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const res = await eventApi.getById(id);
        if (res.data.success) {
          setEvent(res.data.data);

          // Fetch event feedbacks
          try {
            const fbRes = await feedbackApi.getByEvent(res.data.data._id);
            if (fbRes.data.success) {
              setFeedbacks(fbRes.data.data);
            }
          } catch (e) {
            console.warn('Could not fetch feedback:', e);
          }
        }
      } catch (err) {
        toast.error('Event not found or failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader text="Loading event details..." size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-pale-purple text-center shadow-md">
        <AlertCircle className="w-12 h-12 text-deep-purple/40 mx-auto mb-3" />
        <h2 className="font-heading text-xl font-bold text-text-dark">Event Not Found</h2>
        <p className="text-xs text-text-muted mt-2">The event you are looking for does not exist or has been removed.</p>
        <Link
          to="/events"
          className="mt-6 inline-block px-5 py-2.5 bg-deep-purple text-white text-xs font-bold rounded-xl"
        >
          Back to All Events
        </Link>
      </div>
    );
  }

  const handleAddMember = () => {
    if (teamMembers.length >= 4) {
      toast.error('Maximum team size is 4 members');
      return;
    }
    setTeamMembers([...teamMembers, { name: '', email: '', rollNo: '' }]);
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in or create an account to register');
      navigate('/login');
      return;
    }

    setSubmittingReg(true);
    try {
      // 1. If paid event, handle Razorpay Test Flow
      if (event.fee > 0) {
        const orderRes = await paymentApi.createOrder({
          eventId: event._id,
          amount: event.fee,
        });

        if (orderRes.data.success) {
          const { order, keyId } = orderRes.data;

          // Razorpay test modal options
          const options = {
            key: keyId,
            amount: order.amount,
            currency: order.currency,
            name: 'Techno Institute of Higher Studies (TIHS)',
            description: `Registration Fee: ${event.title}`,
            image: '/assets/images/tihs-logo.webp',
            order_id: order.id,
            handler: async function (response) {
              try {
                // Verify payment
                const verifyRes = await paymentApi.verify({
                  razorpay_order_id: response.razorpay_order_id || order.id,
                  razorpay_payment_id: response.razorpay_payment_id || `pay_test_${Date.now()}`,
                  razorpay_signature: response.razorpay_signature || 'demo_signature',
                  eventId: event._id,
                  amount: event.fee,
                });

                if (verifyRes.data.success) {
                  // Register event with payment
                  const regRes = await registrationApi.register(event._id, {
                    team: { isTeam, teamName: isTeam ? teamName : '', members: isTeam ? teamMembers : [] },
                    customResponses,
                    paymentId: verifyRes.data.payment._id,
                    paymentStatus: 'paid',
                  });

                  if (regRes.data.success) {
                    setConfirmedReg(regRes.data.data);
                    toast.success(regRes.data.message);
                  }
                }
              } catch (err) {
                toast.error('Payment verification failed');
              }
            },
            prefill: {
              name: user?.name,
              email: user?.email,
              contact: user?.phone || '+917897123111',
            },
            theme: {
              color: '#4c0c56',
            },
          };

          if (window.Razorpay) {
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (resp) {
              toast.error(`Payment failed: ${resp.error.description}`);
            });
            rzp.open();
          } else {
            // Direct sandbox simulation if Razorpay JS SDK isn't loaded
            const regRes = await registrationApi.register(event._id, {
              team: { isTeam, teamName: isTeam ? teamName : '', members: isTeam ? teamMembers : [] },
              customResponses,
              paymentStatus: 'paid',
            });
            setConfirmedReg(regRes.data.data);
            toast.success('Test payment simulated & registration confirmed!');
          }
        }
      } else {
        // Free Event Registration
        const res = await registrationApi.register(event._id, {
          team: { isTeam, teamName: isTeam ? teamName : '', members: isTeam ? teamMembers : [] },
          customResponses,
          paymentStatus: 'free',
        });

        if (res.data.success) {
          setConfirmedReg(res.data.data);
          toast.success(res.data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setSubmittingReg(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter a feedback comment');
      return;
    }

    setSubmittingFeedback(true);
    try {
      const res = await feedbackApi.submit({
        eventId: event._id,
        rating,
        comment,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setFeedbacks([res.data.data, ...feedbacks]);
        setFeedbackModalOpen(false);
        setComment('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const formattedDate = new Date(event.startDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = new Date(event.startDate).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumbs */}
      <div className="text-xs text-text-muted flex items-center gap-2">
        <Link to="/" className="hover:text-deep-purple">Home</Link>
        <span>/</span>
        <Link to="/events" className="hover:text-deep-purple">Events</Link>
        <span>/</span>
        <span className="text-deep-purple font-semibold truncate">{event.title}</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Event Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Hero Banner Card */}
          <div className="bg-white rounded-3xl overflow-hidden border border-pale-purple shadow-sm">
            <div className="relative h-72 sm:h-96 w-full bg-dark-purple overflow-hidden">
              <img
                src={event.banner || '/assets/images/campus-hero.webp'}
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/assets/images/campus-hero.webp';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-purple/90 via-dark-purple/30 to-transparent" />
              
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="bg-bright-orange text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  {event.category}
                </span>
                {event.department && (
                  <span className="bg-dark-purple text-gold border border-gold/40 text-xs font-bold px-3 py-1 rounded-full">
                    Dept of {event.department}
                  </span>
                )}
              </div>

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold leading-tight">
                  {event.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-pale-purple">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-bright-orange" />
                    {formattedDate} • {formattedTime}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-bright-orange" />
                    {event.venue}
                  </span>
                </div>
              </div>
            </div>

            {/* Description & Overview */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="font-heading text-xl font-bold text-deep-purple mb-3">About the Event</h3>
                <p className="text-xs sm:text-sm text-text-dark/80 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* Rules & Guidelines */}
              {event.rules && (
                <div className="bg-pale-purple/50 p-5 rounded-2xl border border-light-purple/30 space-y-2">
                  <div className="flex items-center gap-2 text-deep-purple font-bold text-sm">
                    <ShieldAlert className="w-4 h-4 text-bright-orange" />
                    <span>Guidelines & Entry Rules</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">{event.rules}</p>
                </div>
              )}

              {/* Prizes & Recognition */}
              {event.prizes && (
                <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <Award className="w-4 h-4 text-bright-orange" />
                    <span>Prizes & Certificates</span>
                  </div>
                  <p className="text-xs text-amber-900/80 leading-relaxed">{event.prizes}</p>
                </div>
              )}

              {/* Tags Strip */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2">
                  <Tag className="w-3.5 h-3.5 text-text-muted" />
                  {event.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-cream text-text-muted px-2.5 py-1 rounded-lg border border-pale-purple">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Feedback & Reviews Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pale-purple shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-xl font-bold text-deep-purple">Student Reviews & Feedback</h3>
                <p className="text-xs text-text-muted mt-0.5">Attendee experiences from TIHS students</p>
              </div>

              {isAuthenticated && (
                <button
                  onClick={() => setFeedbackModalOpen(true)}
                  className="px-4 py-2 bg-pale-purple hover:bg-light-purple/20 text-deep-purple text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Leave Feedback</span>
                </button>
              )}
            </div>

            {feedbacks.length > 0 ? (
              <div className="divide-y divide-pale-purple space-y-4 pt-2">
                {feedbacks.map((fb, idx) => (
                  <div key={idx} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-text-dark">
                        {fb.user?.name || 'TIHS Student'}
                        {fb.user?.department && (
                          <span className="text-text-muted font-normal ml-2">
                            ({fb.user.department} {fb.user.year ? `• Year ${fb.user.year}` : ''})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < fb.rating ? 'fill-gold text-gold' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">{fb.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-text-muted">
                No feedback reviews yet. Attendees can submit their experience post-event.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Registration & Pass Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-pale-purple shadow-lg space-y-6 sticky top-28">
            <div className="flex items-center justify-between border-b border-pale-purple pb-4">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Pass Fee</span>
              <span className="font-heading text-2xl font-black text-deep-purple">
                {event.fee === 0 ? 'FREE ENTRY' : `₹${event.fee}`}
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-deep-purple" /> Capacity
                </span>
                <span className="font-bold text-text-dark">{event.capacity} seats</span>
              </div>

              <div className="flex items-center justify-between text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-deep-purple" /> Remaining
                </span>
                <span className={`font-bold ${event.remainingSeats === 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {event.remainingSeats} slots left
                </span>
              </div>

              <div className="flex items-center justify-between text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-deep-purple" /> Certificate
                </span>
                <span className="font-bold text-deep-purple">Automated PDF</span>
              </div>
            </div>

            {/* CTA Button */}
            {event.status === 'completed' ? (
              <div className="p-4 bg-gray-100 rounded-2xl text-center space-y-1">
                <div className="text-xs font-bold text-gray-700 uppercase">Event Completed</div>
                <p className="text-[11px] text-gray-500">Participation certificates have been generated.</p>
              </div>
            ) : (
              <button
                onClick={() => setRegModalOpen(true)}
                className="w-full py-3.5 px-6 bg-bright-orange hover:bg-amber-600 text-white font-bold text-sm rounded-2xl shadow-md shadow-bright-orange/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Book Event Ticket</span>
              </button>
            )}

            {/* College Guarantee Badge */}
            <div className="p-4 bg-pale-purple/50 rounded-2xl border border-light-purple/20 space-y-2 text-[11px] text-text-muted">
              <div className="font-bold text-deep-purple flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-bright-orange" />
                <span>TIHS Student Verification</span>
              </div>
              <p>Entry requires digital QR ticket scan + valid TIHS College ID card at campus security.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= REGISTRATION MODAL ================= */}
      {regModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-pale-purple my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setRegModalOpen(false);
                setConfirmedReg(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-full text-text-muted hover:bg-pale-purple"
            >
              <X className="w-5 h-5" />
            </button>

            {confirmedReg ? (
              /* Success Confirmation Screen with QR Ticket */
              <div className="text-center space-y-5 py-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-deep-purple">Registration Confirmed!</h3>
                  <p className="text-xs text-text-muted mt-1">Ticket pass generated and sent to your email.</p>
                </div>

                <div className="bg-pale-purple/40 p-5 rounded-2xl border border-light-purple/40 space-y-3 text-left">
                  <div className="text-xs">
                    <span className="text-text-muted">Ticket Code:</span>{' '}
                    <span className="font-mono font-bold text-deep-purple">{confirmedReg.ticketCode}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-text-muted">Participant:</span>{' '}
                    <span className="font-bold text-text-dark">{user?.name}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-text-muted">Status:</span>{' '}
                    <span className="font-bold uppercase text-emerald-600">{confirmedReg.status}</span>
                  </div>

                  {confirmedReg.qrCode && (
                    <div className="text-center pt-2">
                      <img
                        src={confirmedReg.qrCode}
                        alt="QR Ticket"
                        className="w-40 h-40 mx-auto rounded-xl border-2 border-deep-purple"
                      />
                      <span className="text-[10px] text-text-muted block mt-1">Scan at entrance gate</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link
                    to="/student/dashboard"
                    className="flex-1 py-3 bg-deep-purple text-white text-xs font-bold rounded-xl text-center"
                  >
                    View in Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setRegModalOpen(false);
                      setConfirmedReg(null);
                    }}
                    className="flex-1 py-3 bg-pale-purple text-deep-purple text-xs font-bold rounded-xl text-center"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Registration Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div>
                  <span className="text-[10px] font-bold text-bright-orange uppercase tracking-wider">Event Pass</span>
                  <h3 className="font-heading text-xl font-bold text-deep-purple">{event.title}</h3>
                  <p className="text-xs text-text-muted mt-1">Pass Fee: {event.fee === 0 ? 'Free' : `₹${event.fee}`}</p>
                </div>

                {/* Team Toggle */}
                <div className="p-3 bg-cream rounded-xl border border-pale-purple flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-dark">Register as a Team?</span>
                  <input
                    type="checkbox"
                    checked={isTeam}
                    onChange={(e) => setIsTeam(e.target.checked)}
                    className="w-4 h-4 text-deep-purple rounded focus:ring-deep-purple"
                  />
                </div>

                {isTeam && (
                  <div className="space-y-3 bg-pale-purple/30 p-4 rounded-xl border border-light-purple/30">
                    <div>
                      <label className="block text-xs font-semibold text-text-dark mb-1">Team Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. TIHS Cyber Knights"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-pale-purple rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-text-dark">Team Members</span>
                        <button
                          type="button"
                          onClick={handleAddMember}
                          className="text-[11px] font-bold text-deep-purple hover:underline"
                        >
                          + Add Member
                        </button>
                      </div>

                      {teamMembers.map((m, idx) => (
                        <div key={idx} className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Name"
                            required
                            value={m.name}
                            onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                            className="px-2.5 py-1.5 bg-white border border-pale-purple rounded-lg text-xs"
                          />
                          <input
                            type="email"
                            placeholder="Email"
                            required
                            value={m.email}
                            onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                            className="px-2.5 py-1.5 bg-white border border-pale-purple rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Roll No"
                            value={m.rollNo}
                            onChange={(e) => handleMemberChange(idx, 'rollNo', e.target.value)}
                            className="px-2.5 py-1.5 bg-white border border-pale-purple rounded-lg text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Fields defined by Faculty/Admin */}
                {event.customFields && event.customFields.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-deep-purple">Additional Information</h4>
                    {event.customFields.map((field, idx) => (
                      <div key={idx}>
                        <label className="block text-xs font-semibold text-text-dark mb-1">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type={field.fieldType || 'text'}
                          required={field.required}
                          value={customResponses[field.label] || ''}
                          onChange={(e) =>
                            setCustomResponses({ ...customResponses, [field.label]: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-cream/60 border border-pale-purple rounded-lg text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingReg}
                  className="w-full py-3.5 bg-bright-orange hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingReg ? (
                    <Loader text="Processing Ticket..." size="sm" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>{event.fee > 0 ? `Pay ₹${event.fee} & Confirm Pass` : 'Confirm Free Registration'}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= FEEDBACK MODAL ================= */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-pale-purple">
            <button
              onClick={() => setFeedbackModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-text-muted hover:bg-pale-purple"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleFeedbackSubmit} className="space-y-5">
              <div>
                <h3 className="font-heading text-xl font-bold text-deep-purple">Share Your Feedback</h3>
                <p className="text-xs text-text-muted mt-0.5">{event.title}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-2">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${star <= rating ? 'fill-gold text-gold' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Your Comments & Experience</label>
                <textarea
                  rows={4}
                  required
                  placeholder="What did you like most about the event organization?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 bg-cream/60 border border-pale-purple rounded-xl text-xs focus:outline-none focus:border-deep-purple"
                />
              </div>

              <button
                type="submit"
                disabled={submittingFeedback}
                className="w-full py-3 bg-deep-purple hover:bg-mid-purple text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
