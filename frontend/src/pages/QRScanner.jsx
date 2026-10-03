import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { attendanceApi } from '../services/api';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  UserCheck,
  RefreshCw,
  User,
  Calendar,
  Hash,
  Ticket,
  ShieldCheck,
  ScanLine,
  ArrowRight,
  Clock,
  BadgeCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Parse QR payload (handles JSON or plain ticket code) ─────────────────────
const parseQRPayload = (raw) => {
  try {
    const obj = typeof raw === 'object' ? raw : JSON.parse(raw);
    return {
      ticketCode: obj.ticketCode || null,
      userId: obj.userId || null,
      eventId: obj.eventId || null,
      userName: obj.userName || null,
      eventTitle: obj.eventTitle || null,
      raw,
    };
  } catch {
    // Plain ticket code string e.g. "TIHS-CUL-852677-309"
    return {
      ticketCode: raw.trim(),
      userId: null,
      eventId: null,
      userName: null,
      eventTitle: null,
      raw,
    };
  }
};

const QRScanner = () => {
  const [scannedPayload, setScannedPayload] = useState(null); // parsed QR data (pre-confirm)
  const [scanResult, setScanResult]         = useState(null); // API verify result
  const [manualTicket, setManualTicket]     = useState('');
  const [processing, setProcessing]         = useState(false);
  const [totalScanned, setTotalScanned]     = useState(0);
  const [recentScans, setRecentScans]       = useState([]);
  const [scannerPaused, setScannerPaused]   = useState(false);

  const scannerRef = useRef(null);

  // ── Camera scanner init ────────────────────────────────────────────────────
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1.0 },
      false
    );
    scanner.render(onScanSuccess, () => {});
    scannerRef.current = scanner;
    return () => scanner.clear().catch(() => {});
  }, []);

  // ── On camera scan → parse & show preview (don't verify yet) ──────────────
  const onScanSuccess = (decodedText) => {
    if (processing || scannerPaused) return;
    setScannerPaused(true);
    const payload = parseQRPayload(decodedText);
    setScannedPayload(payload);
    setScanResult(null);
  };

  // ── Reset → ready for next scan ────────────────────────────────────────────
  const handleReset = () => {
    setScannedPayload(null);
    setScanResult(null);
    setManualTicket('');
    setScannerPaused(false);
  };

  // ── Call backend to verify & mark attendance ───────────────────────────────
  const handleVerifyTicket = async (payload) => {
    setProcessing(true);
    try {
      const res = await attendanceApi.scan({
        qrData: payload.raw,
        ticketCode: payload.ticketCode,
        method: 'qr_scan',
      });

      if (res.data.success) {
        const result = {
          status: 'success',
          message: res.data.message,
          student: res.data.student,
          event: res.data.event,
          attendance: res.data.attendance,
          totalAttended: res.data.totalAttended,
        };
        setScanResult(result);
        setTotalScanned((p) => p + 1);
        setRecentScans((p) => [
          {
            name: res.data.student?.name || payload.userName,
            ticket: payload.ticketCode,
            time: new Date().toLocaleTimeString('en-IN'),
            status: 'success',
          },
          ...p.slice(0, 9),
        ]);
        toast.success(`✅ Entry Verified: ${res.data.student?.name || payload.userName}`);
      }
    } catch (error) {
      const resp = error.response?.data;
      if (resp?.duplicate) {
        setScanResult({
          status: 'duplicate',
          message: resp.message,
          student: resp.student,
          event: resp.event,
          attendance: resp.attendance,
        });
        toast.error('⚠️ Ticket ALREADY SCANNED!');
      } else {
        setScanResult({
          status: 'invalid',
          message: resp?.message || 'Invalid or unrecognised ticket.',
        });
        toast.error(resp?.message || 'Invalid Ticket');
      }
    } finally {
      setProcessing(false);
    }
  };

  // ── Manual ticket code / QR JSON submission ────────────────────────────────
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualTicket.trim()) {
      toast.error('Please enter a ticket code or paste QR JSON');
      return;
    }
    const payload = parseQRPayload(manualTicket.trim());
    setScannedPayload(payload);
    setScanResult(null);
  };

  // ── Confirm button (after preview) ────────────────────────────────────────
  const handleConfirmEntry = () => {
    if (scannedPayload) handleVerifyTicket(scannedPayload);
  };

  // ── Status colour helpers ──────────────────────────────────────────────────
  const statusColors = {
    success:   { bg: 'bg-emerald-50',  border: 'border-emerald-300', text: 'text-emerald-700',  badge: 'bg-emerald-100 text-emerald-700' },
    duplicate: { bg: 'bg-amber-50',    border: 'border-amber-300',   text: 'text-amber-700',    badge: 'bg-amber-100 text-amber-700' },
    invalid:   { bg: 'bg-red-50',      border: 'border-red-300',     text: 'text-red-700',      badge: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-purple-gradient text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-light-purple/20">
        <div>
          <span className="bg-bright-orange text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            VOLUNTEER ATTENDANCE DESK
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold mt-1">
            Gate Entry QR Code Scanner
          </h1>
          <p className="text-xs text-pale-purple/90 mt-0.5">
            Scan attendee QR passes → preview details → confirm entry. Anti-duplicate protection enabled.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center shrink-0">
          <span className="text-[10px] text-pale-purple uppercase font-semibold block">Total Checked-In</span>
          <span className="font-heading text-3xl font-bold text-gold">{totalScanned}</span>
        </div>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT: Camera + Manual Input */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-pale-purple shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-pale-purple pb-3">
            <h3 className="font-heading text-base font-bold text-deep-purple flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-bright-orange" />
              <span>Camera Scanner</span>
            </h3>
            <span className="text-xs text-text-muted">
              {scannerPaused ? '⏸ Paused — review & confirm below' : '🟢 Live — point at QR code'}
            </span>
          </div>

          <div id="qr-reader" className="w-full rounded-2xl overflow-hidden border border-pale-purple" />

          {/* Manual entry */}
          <form onSubmit={handleManualSubmit} className="pt-2 border-t border-pale-purple space-y-2">
            <label className="block text-xs font-semibold text-text-dark">
              Manual Entry — Ticket Code or Paste QR JSON
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder='e.g. TIHS-CUL-852677-309  or  {"ticketCode":"...","userName":"..."}'
                value={manualTicket}
                onChange={(e) => setManualTicket(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-cream/60 border border-pale-purple rounded-xl text-xs font-mono focus:outline-none focus:border-deep-purple"
              />
              <button
                type="submit"
                disabled={processing}
                className="px-5 py-2.5 bg-deep-purple hover:bg-mid-purple text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>
            <p className="text-[10px] text-text-muted">
              Accepts plain ticket code (TIHS-CUL-…) or full JSON payload from QR scan.
            </p>
          </form>
        </div>

        {/* RIGHT: Preview / Result Panel */}
        <div className="lg:col-span-5 space-y-5">

          {/* ── STATE A: No scan yet ─────────────────────────────────────── */}
          {!scannedPayload && !scanResult && (
            <div className="bg-white p-8 rounded-3xl border border-pale-purple text-center space-y-3 shadow-sm">
              <div className="w-16 h-16 bg-pale-purple/50 rounded-2xl flex items-center justify-center mx-auto">
                <UserCheck className="w-8 h-8 text-deep-purple/40" />
              </div>
              <h4 className="font-heading text-base font-bold text-text-dark">Ready for Next Scan</h4>
              <p className="text-xs text-text-muted">
                Point the camera at an attendee's QR pass or manually enter a ticket code to begin.
              </p>
            </div>
          )}

          {/* ── STATE B: QR scanned — show preview, wait for confirm ─────── */}
          {scannedPayload && !scanResult && (
            <div className="bg-white p-6 rounded-3xl border-2 border-deep-purple/30 shadow-md space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-pale-purple">
                <QrCode className="w-5 h-5 text-deep-purple" />
                <h4 className="font-heading text-sm font-bold text-deep-purple">QR Code Scanned — Verify Details</h4>
              </div>

              {/* Parsed details card */}
              <div className="bg-pale-purple/20 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-deep-purple shrink-0" />
                  <div>
                    <span className="text-text-muted">Participant</span>
                    <div className="font-bold text-text-dark text-sm">
                      {scannedPayload.userName || <span className="italic text-text-muted">Loading from database…</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-bright-orange shrink-0" />
                  <div>
                    <span className="text-text-muted">Event</span>
                    <div className="font-semibold text-text-dark">
                      {scannedPayload.eventTitle || <span className="italic text-text-muted">Resolving from database…</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-mid-purple shrink-0" />
                  <div>
                    <span className="text-text-muted">Ticket Code</span>
                    <div className="font-mono font-bold text-deep-purple tracking-wide">
                      {scannedPayload.ticketCode || '—'}
                    </div>
                  </div>
                </div>
                {scannedPayload.userId && (
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-text-muted shrink-0" />
                    <div>
                      <span className="text-text-muted">User ID</span>
                      <div className="font-mono text-[10px] text-text-muted break-all">{scannedPayload.userId}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmEntry}
                  disabled={processing || !scannedPayload.ticketCode}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm & Mark Entry</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-3 bg-pale-purple hover:bg-light-purple text-deep-purple font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Rescan</span>
                </button>
              </div>
            </div>
          )}

          {/* ── STATE C: API result returned ─────────────────────────────── */}
          {scanResult && (
            <div className={`p-6 rounded-3xl border-2 shadow-md space-y-4 ${statusColors[scanResult.status]?.bg} ${statusColors[scanResult.status]?.border}`}>
              
              {/* Status header */}
              <div className="flex items-center gap-3">
                {scanResult.status === 'success' && <CheckCircle2 className="w-9 h-9 text-emerald-600 shrink-0" />}
                {scanResult.status === 'duplicate' && <AlertTriangle className="w-9 h-9 text-amber-600 shrink-0" />}
                {scanResult.status === 'invalid' && <XCircle className="w-9 h-9 text-red-600 shrink-0" />}
                <div>
                  <h4 className={`font-heading font-bold text-base ${statusColors[scanResult.status]?.text}`}>
                    {scanResult.status === 'success'   && '✅ Entry Verified & Allowed'}
                    {scanResult.status === 'duplicate' && '⚠️ Already Scanned — Duplicate!'}
                    {scanResult.status === 'invalid'   && '❌ Invalid Ticket'}
                  </h4>
                  <p className="text-xs text-text-muted mt-0.5">{scanResult.message}</p>
                </div>
              </div>

              {/* Student + Event details */}
              {(scanResult.student || scannedPayload) && (
                <div className="bg-white/80 p-4 rounded-2xl border border-pale-purple/60 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-pale-purple rounded-xl flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-deep-purple" />
                    </div>
                    <div>
                      <div className="font-bold text-deep-purple text-sm">
                        {scanResult.student?.name || scannedPayload?.userName || '—'}
                      </div>
                      <div className="text-text-muted">
                        {scanResult.student?.email || ''}
                        {scanResult.student?.department && ` · ${scanResult.student.department}`}
                        {scanResult.student?.year && ` · Year ${scanResult.student.year}`}
                      </div>
                    </div>
                  </div>

                  {(scanResult.event || scannedPayload?.eventTitle) && (
                    <div className="pt-2 border-t border-pale-purple/50 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-bright-orange shrink-0" />
                      <span className="font-semibold text-text-dark">
                        {scanResult.event?.title || scannedPayload?.eventTitle}
                      </span>
                    </div>
                  )}

                  {scannedPayload?.ticketCode && (
                    <div className="flex items-center gap-2">
                      <Ticket className="w-3.5 h-3.5 text-mid-purple shrink-0" />
                      <span className="font-mono text-[10px] font-bold text-deep-purple tracking-wide">
                        {scannedPayload.ticketCode}
                      </span>
                      {scanResult.status === 'success' && (
                        <span className="ml-auto bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <BadgeCheck className="w-3 h-3" /> CHECKED IN
                        </span>
                      )}
                      {scanResult.status === 'duplicate' && (
                        <span className="ml-auto bg-amber-100 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          DUPLICATE
                        </span>
                      )}
                    </div>
                  )}

                  {scanResult.totalAttended !== undefined && (
                    <div className="pt-1 border-t border-pale-purple/50 text-[10px] text-text-muted text-right">
                      Total attendees checked-in for this event: <strong>{scanResult.totalAttended}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Next scan button */}
              <button
                onClick={handleReset}
                className="w-full py-3 bg-deep-purple hover:bg-mid-purple text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Scan Next Attendee</span>
              </button>
            </div>
          )}

          {/* ── Recent Scans Session Log ───────────────────────────────────── */}
          {recentScans.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-pale-purple shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-deep-purple uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Check-Ins ({recentScans.length})
              </h4>
              <div className="divide-y divide-pale-purple text-xs max-h-56 overflow-y-auto">
                {recentScans.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-text-dark truncate">{item.name || item.ticket}</div>
                      <div className="font-mono text-[10px] text-text-muted truncate">{item.ticket}</div>
                      <span className="text-[10px] text-text-muted">{item.time}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg shrink-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> In
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
