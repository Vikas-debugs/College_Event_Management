import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { attendanceApi } from '../services/api';
import TihsLogo from '../components/TihsLogo';
import {
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  MapPin,
  Ticket,
  BadgeCheck,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  QrCode,
} from 'lucide-react';

// ── Parse QR JSON payload or plain ticket string ─────────────────────────────
const parsePayload = (raw) => {
  try {
    const obj = JSON.parse(raw);
    return {
      ticketCode: obj.ticketCode,
      userName:   obj.userName,
      eventTitle: obj.eventTitle,
      userId:     obj.userId,
      eventId:    obj.eventId,
      raw,
    };
  } catch {
    return { ticketCode: raw?.trim(), raw };
  }
};

const TicketVerify = () => {
  const [searchParams] = useSearchParams();
  const [payload, setPayload]   = useState(null);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [manualInput, setManualInput] = useState('');

  // Auto-lookup when ?t=<ticketCode> or ?q=<jsonBase64> is in URL
  useEffect(() => {
    const t = searchParams.get('t'); // plain ticket code
    const q = searchParams.get('q'); // base64-encoded JSON

    let raw = null;
    if (t)      raw = t;
    else if (q) { try { raw = atob(q); } catch {} }

    if (raw) {
      const parsed = parsePayload(raw);
      setPayload(parsed);
      fetchVerify(parsed);
    }
  }, []);

  const fetchVerify = async (p) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await attendanceApi.verifyPublic({
        qrData: p.raw,
        ticketCode: p.ticketCode,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not verify ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const parsed = parsePayload(manualInput.trim());
    setPayload(parsed);
    fetchVerify(parsed);
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '—';

  const statusLabel = (s) => {
    if (s === 'registered') return { label: 'Registered', cls: 'bg-blue-100 text-blue-700' };
    if (s === 'attended')   return { label: 'Attended ✓',  cls: 'bg-emerald-100 text-emerald-700' };
    if (s === 'cancelled')  return { label: 'Cancelled',   cls: 'bg-red-100 text-red-700' };
    if (s === 'waitlisted') return { label: 'Waitlisted',  cls: 'bg-amber-100 text-amber-700' };
    return { label: s || 'Unknown', cls: 'bg-gray-100 text-gray-600' };
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <TihsLogo className="w-14 h-14 mx-auto rounded-2xl shadow" />
          </Link>
          <h2 className="font-heading text-2xl font-extrabold text-deep-purple">
            TIHS Ticket Verification
          </h2>
          <p className="text-xs text-text-muted">
            Techno Institute of Higher Studies, Lucknow · Event Management System
          </p>
        </div>

        {/* ── Loading ────────────────────────────────────────────────────── */}
        {loading && (
          <div className="bg-white rounded-3xl border border-pale-purple p-8 text-center shadow space-y-3">
            <Loader2 className="w-10 h-10 text-deep-purple animate-spin mx-auto" />
            <p className="text-sm font-semibold text-deep-purple">Verifying ticket…</p>
            {payload?.ticketCode && (
              <p className="font-mono text-xs text-text-muted">{payload.ticketCode}</p>
            )}
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {!loading && error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-6 text-center space-y-3 shadow">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="font-heading text-lg font-bold text-red-700">Ticket Not Found</h3>
            <p className="text-xs text-red-600">{error}</p>
            <button
              onClick={() => { setPayload(null); setError(null); setResult(null); setManualInput(''); }}
              className="mt-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl"
            >
              Try Another Ticket
            </button>
          </div>
        )}

        {/* ── Result ────────────────────────────────────────────────────── */}
        {!loading && result && (
          <div className={`bg-white rounded-3xl border-2 p-6 shadow-lg space-y-5 ${
            result.checkedIn ? 'border-emerald-400' : 'border-deep-purple/30'
          }`}>

            {/* Status banner */}
            <div className={`rounded-2xl p-4 flex items-center gap-3 ${
              result.checkedIn ? 'bg-emerald-50' : 'bg-pale-purple/30'
            }`}>
              {result.checkedIn
                ? <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                : <ShieldCheck className="w-8 h-8 text-deep-purple shrink-0" />
              }
              <div>
                <div className={`font-heading text-base font-bold ${result.checkedIn ? 'text-emerald-700' : 'text-deep-purple'}`}>
                  {result.checkedIn ? '✅ Valid & Checked-In' : '🎟️ Valid Ticket (Not Yet Checked-In)'}
                </div>
                {result.checkedIn && result.checkedInAt && (
                  <div className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    Entry marked at {formatDate(result.checkedInAt)}
                  </div>
                )}
              </div>
            </div>

            {/* Ticket details */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 py-2 border-b border-pale-purple">
                <Ticket className="w-4 h-4 text-mid-purple shrink-0" />
                <div>
                  <div className="text-text-muted">Ticket Code</div>
                  <div className="font-mono font-bold text-deep-purple tracking-widest text-sm">
                    {result.ticket?.ticketCode}
                  </div>
                </div>
                <span className={`ml-auto text-[10px] font-bold px-2 py-1 rounded-lg ${statusLabel(result.ticket?.status).cls}`}>
                  {statusLabel(result.ticket?.status).label}
                </span>
              </div>

              <div className="flex items-center gap-3 py-2 border-b border-pale-purple">
                <User className="w-4 h-4 text-bright-orange shrink-0" />
                <div>
                  <div className="text-text-muted">Participant</div>
                  <div className="font-bold text-text-dark text-sm">{result.student?.name}</div>
                  <div className="text-text-muted">
                    {result.student?.department && `${result.student.department}`}
                    {result.student?.year && ` · Year ${result.student.year}`}
                  </div>
                </div>
                {result.checkedIn && (
                  <BadgeCheck className="w-5 h-5 text-emerald-500 ml-auto shrink-0" />
                )}
              </div>

              <div className="flex items-start gap-3 py-2 border-b border-pale-purple">
                <Calendar className="w-4 h-4 text-deep-purple shrink-0 mt-0.5" />
                <div>
                  <div className="text-text-muted">Event</div>
                  <div className="font-bold text-text-dark">{result.event?.title}</div>
                  <div className="text-text-muted mt-0.5">{formatDate(result.event?.startDate)}</div>
                </div>
              </div>

              {result.event?.venue && (
                <div className="flex items-center gap-3 py-2">
                  <MapPin className="w-4 h-4 text-bright-orange shrink-0" />
                  <div>
                    <div className="text-text-muted">Venue</div>
                    <div className="font-semibold text-text-dark">{result.event.venue}</div>
                  </div>
                </div>
              )}
            </div>

            {/* TIHS seal */}
            <div className="bg-pale-purple/20 rounded-2xl p-3 flex items-center gap-2 text-[10px] text-text-muted">
              <ShieldCheck className="w-4 h-4 text-deep-purple shrink-0" />
              Verified by TIHS College Event Management System · {new Date().toLocaleDateString('en-IN')}
            </div>

            <button
              onClick={() => { setPayload(null); setResult(null); setManualInput(''); }}
              className="w-full py-2.5 bg-pale-purple hover:bg-light-purple text-deep-purple font-bold text-xs rounded-xl transition-colors"
            >
              Verify Another Ticket
            </button>
          </div>
        )}

        {/* ── Manual Entry (shown when no result yet) ───────────────────── */}
        {!loading && !result && !error && !payload && (
          <div className="bg-white rounded-3xl border border-pale-purple p-6 shadow space-y-4">
            <div className="text-center space-y-1">
              <QrCode className="w-10 h-10 text-deep-purple/40 mx-auto" />
              <h3 className="font-heading text-base font-bold text-deep-purple">Check Ticket Status</h3>
              <p className="text-xs text-text-muted">Enter a ticket code or paste the QR JSON below</p>
            </div>
            <form onSubmit={handleManualVerify} className="space-y-3">
              <input
                type="text"
                required
                placeholder='TIHS-CUL-852677-309  or  {"ticketCode":"..."}'
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream/60 border border-pale-purple rounded-xl text-xs font-mono focus:outline-none focus:border-deep-purple"
              />
              <button
                type="submit"
                className="w-full py-3 bg-deep-purple hover:bg-mid-purple text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Verify Ticket
              </button>
            </form>
          </div>
        )}

        <div className="text-center text-[10px] text-text-muted">
          <Link to="/" className="text-deep-purple hover:underline font-semibold">TIHS CEMS</Link>
          {' '}· Techno Institute of Higher Studies, Lucknow
        </div>
      </div>
    </div>
  );
};

export default TicketVerify;
