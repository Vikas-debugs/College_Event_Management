import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminApi, eventApi, attendanceApi } from '../services/api';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import TihsLogo from '../components/TihsLogo';
import {
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  PlusCircle,
  Shield,
  FileText,
  Upload,
  BarChart2,
  PieChart as PieIcon,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  QrCode,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Camera,
  UserCheck,
  RefreshCw,
  X,
  Radio,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#4c0c56', '#e29826', '#6b2d7b', '#d4a229', '#9966ac', '#22c55e'];
const CATEGORIES = ['All', 'Cultural', 'Technical', 'Sports', 'Workshop', 'Fine Arts'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Navigation tab
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'qrScan', 'eventsCrud', 'approvals', 'createEvent', 'users', 'audit', 'bulk'

  // Dashboard Data
  const [analytics, setAnalytics] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Events CRUD Filters & Modals
  const [eventCategoryFilter, setEventCategoryFilter] = useState('All');
  const [eventStatusFilter, setEventStatusFilter] = useState('all');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);

  // User CRUD Edit Modal
  const [editingUser, setEditingUser] = useState(null);

  // QR Attendance Scanner State
  const [qrInput, setQrInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scannedAttendees, setScannedAttendees] = useState([]);

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: 'Workshop',
    department: 'All',
    startDate: '',
    endDate: '',
    venue: '',
    capacity: 100,
    fee: 0,
    rules: '',
    prizes: '',
    tags: '',
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [creatingEvent, setCreatingEvent] = useState(false);

  // Bulk CSV State
  const [csvText, setCsvText] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, pendingRes, allEventsRes] = await Promise.all([
        adminApi.getAnalytics(),
        eventApi.getAll({ status: 'pending' }),
        eventApi.getAll({ status: 'all' }),
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }
      if (pendingRes.data.success) {
        setPendingEvents(pendingRes.data.data);
      }
      if (allEventsRes.data.success) {
        setAllEvents(allEventsRes.data.data);
      }

      if (isAdmin) {
        const [usersRes, logsRes] = await Promise.all([
          adminApi.getUsers({}),
          adminApi.getAuditLogs(),
        ]);
        if (usersRes.data.success) setUsersList(usersRes.data.data);
        if (logsRes.data.success) setAuditLogs(logsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ================= QR SCANNER & ATTENDANCE VERIFICATION =================
  const handleVerifyTicket = async (ticketCodeOrQr) => {
    const code = (ticketCodeOrQr || qrInput).trim();
    if (!code) {
      toast.error('Please enter or scan a valid ticket code');
      return;
    }

    setScanning(true);
    try {
      const res = await attendanceApi.scan({
        qrData: code,
        method: 'qr_scan',
      });

      if (res.data.success) {
        setScanResult({
          status: 'success',
          message: res.data.message,
          student: res.data.student,
          event: res.data.event,
          attendance: res.data.attendance,
        });

        // Add to scanned attendee table
        setScannedAttendees((prev) => [
          {
            id: Date.now(),
            name: res.data.student?.name || 'Student',
            email: res.data.student?.email,
            department: res.data.student?.department || 'BCA',
            year: res.data.student?.year || 1,
            ticketCode: code,
            eventTitle: res.data.event?.title || 'Campus Event',
            scannedAt: new Date().toLocaleTimeString('en-IN'),
            status: 'Verified & Stored',
          },
          ...prev,
        ]);

        toast.success(`✅ Verified: ${res.data.student?.name}`);
        setQrInput('');
        fetchDashboardData();
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
          message: resp?.message || 'Invalid or unregistered ticket pass.',
        });
        toast.error(resp?.message || 'Invalid Ticket');
      }
    } finally {
      setScanning(false);
    }
  };

  // ================= EVENT CRUD ACTIONS =================
  const handleDeleteEvent = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete event "${title}" from the database?`)) {
      return;
    }
    try {
      const res = await eventApi.delete(eventId);
      if (res.data.success) {
        toast.success('Event deleted from database');
        setAllEvents((prev) => prev.filter((e) => e._id !== eventId));
        setPendingEvents((prev) => prev.filter((e) => e._id !== eventId));
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Could not delete event');
    }
  };

  const handleQuickStatusChange = async (eventId, newStatus) => {
    try {
      const res = await eventApi.update(eventId, { status: newStatus });
      if (res.data.success) {
        toast.success(`Event status changed to ${newStatus}`);
        setAllEvents((prev) => prev.map((ev) => (ev._id === eventId ? { ...ev, status: newStatus } : ev)));
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Could not update status');
    }
  };

  const handleUpdateEventSubmit = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      const res = await eventApi.update(editingEvent._id, editingEvent);
      if (res.data.success) {
        toast.success('Event updated successfully');
        setAllEvents((prev) => prev.map((ev) => (ev._id === editingEvent._id ? res.data.data : ev)));
        setEditingEvent(null);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Could not update event');
    }
  };

  // ================= USER CRUD ACTIONS =================
  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}" from the database?`)) {
      return;
    }
    try {
      const res = await adminApi.deleteUser(userId);
      if (res.data.success) {
        toast.success('User removed from database');
        setUsersList((prev) => prev.filter((u) => u._id !== userId));
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete user');
    }
  };

  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await adminApi.updateUser(editingUser._id, editingUser);
      if (res.data.success) {
        toast.success('User updated successfully');
        setUsersList((prev) => prev.map((u) => (u._id === editingUser._id ? res.data.data : u)));
        setEditingUser(null);
      }
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await adminApi.updateRole(userId, newRole);
      if (res.data.success) {
        toast.success(`Role updated to ${newRole}`);
        setUsersList(usersList.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      }
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleToggleBlock = async (userId) => {
    try {
      const res = await adminApi.toggleBlock(userId);
      if (res.data.success) {
        toast.success(res.data.message);
        setUsersList(usersList.map((u) => (u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u)));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleApprove = async (eventId) => {
    try {
      const res = await eventApi.approve(eventId);
      if (res.data.success) {
        toast.success(res.data.message);
        setPendingEvents(pendingEvents.filter((e) => e._id !== eventId));
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Could not approve event');
    }
  };

  const handleReject = async (eventId) => {
    const reason = prompt('Please enter the reason for rejection (will be emailed to faculty):');
    if (reason === null) return;
    try {
      const res = await eventApi.reject(eventId, reason);
      if (res.data.success) {
        toast.success(res.data.message);
        setPendingEvents(pendingEvents.filter((e) => e._id !== eventId));
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Could not reject event');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreatingEvent(true);
    try {
      const formData = new FormData();
      Object.keys(newEvent).forEach((key) => {
        formData.append(key, newEvent[key]);
      });
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      const res = await eventApi.create(formData);
      if (res.data.success) {
        toast.success(res.data.message);
        setNewEvent({
          title: '',
          description: '',
          category: 'Workshop',
          department: 'All',
          startDate: '',
          endDate: '',
          venue: '',
          capacity: 100,
          fee: 0,
          rules: '',
          prizes: '',
          tags: '',
        });
        setBannerFile(null);
        setActiveTab('eventsCrud');
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create event');
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleCsvImport = async () => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length <= 1) {
        toast.error('CSV must contain header and at least one event row');
        return;
      }
      const headers = lines[0].split(',').map((h) => h.trim());
      const events = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = values[i];
        });
        return obj;
      });

      const res = await eventApi.bulkImport(events);
      if (res.data.success) {
        toast.success(res.data.message);
        setCsvText('');
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('CSV Import failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader text="Loading Administration Portal..." size="lg" />
      </div>
    );
  }

  const summary = analytics?.summary || {};

  // Filter events for CRUD table
  const filteredEventsForCrud = allEvents.filter((ev) => {
    const matchesCategory = eventCategoryFilter === 'All' || ev.category === eventCategoryFilter;
    const matchesStatus = eventStatusFilter === 'all' || ev.status === eventStatusFilter;
    const matchesSearch =
      !eventSearchQuery ||
      ev.title?.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      ev.venue?.toLowerCase().includes(eventSearchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-purple-gradient text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-light-purple/20">
        <div>
          <span className="bg-gold text-dark-purple text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {isAdmin ? 'ADMINISTRATIVE CONTROL PANEL' : 'FACULTY COORDINATOR PORTAL'}
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold mt-1">
            TIHS CEMS Management Dashboard
          </h1>
          <p className="text-xs text-pale-purple/90 mt-0.5">
            Techno Institute of Higher Studies, Lucknow • NAAC Accredited • ISO 9001:2015
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('qrScan')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 shadow transition-all flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-bright-orange" />
            <span>Gate Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('createEvent')}
            className="px-5 py-2.5 bg-bright-orange hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-pale-purple">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'analytics'
              ? 'bg-deep-purple text-white shadow-sm'
              : 'bg-white text-text-muted hover:bg-pale-purple'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Analytics & Reports</span>
        </button>

        <button
          onClick={() => setActiveTab('qrScan')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'qrScan'
              ? 'bg-deep-purple text-white shadow-sm'
              : 'bg-white text-text-muted hover:bg-pale-purple'
          }`}
        >
          <QrCode className="w-4 h-4 text-bright-orange" />
          <span>QR Gate Scanner</span>
        </button>

        <button
          onClick={() => setActiveTab('eventsCrud')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'eventsCrud'
              ? 'bg-deep-purple text-white shadow-sm'
              : 'bg-white text-text-muted hover:bg-pale-purple'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Events CRUD Management ({allEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 relative ${
            activeTab === 'approvals'
              ? 'bg-deep-purple text-white shadow-sm'
              : 'bg-white text-text-muted hover:bg-pale-purple'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Approval Queue</span>
          {pendingEvents.length > 0 && (
            <span className="bg-bright-orange text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ml-1">
              {pendingEvents.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('createEvent')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'createEvent'
              ? 'bg-deep-purple text-white shadow-sm'
              : 'bg-white text-text-muted hover:bg-pale-purple'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Event</span>
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'users'
                  ? 'bg-deep-purple text-white shadow-sm'
                  : 'bg-white text-text-muted hover:bg-pale-purple'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Management ({usersList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'audit'
                  ? 'bg-deep-purple text-white shadow-sm'
                  : 'bg-white text-text-muted hover:bg-pale-purple'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Audit Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'bulk'
                  ? 'bg-deep-purple text-white shadow-sm'
                  : 'bg-white text-text-muted hover:bg-pale-purple'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Bulk CSV</span>
            </button>
          </>
        )}
      </div>

      {/* ================= TAB 1: ANALYTICS ================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Events"
              value={summary.totalEvents || 0}
              subtitle={`${summary.publishedEvents || 0} Active • ${summary.pendingEvents || 0} Pending`}
              icon={Calendar}
            />
            <StatCard
              title="Student Registrations"
              value={summary.totalRegistrations || 0}
              subtitle="Confirmed passes issued"
              icon={Users}
              trend="+24% this month"
            />
            <StatCard
              title="Total Revenue"
              value={`₹${summary.totalRevenue || 0}`}
              subtitle="Razorpay Test Gateway"
              icon={DollarSign}
            />
            <StatCard
              title="Verified Attendees"
              value={summary.totalAttendance || 0}
              subtitle="Scanned by QR Gate Staff"
              icon={CheckCircle}
            />
          </div>

          {/* Recharts Row 1: Line & Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-pale-purple shadow-sm space-y-4">
              <h3 className="font-heading text-lg font-bold text-deep-purple">Monthly Registration Trend</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.monthlyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3eaf6" />
                    <XAxis dataKey="month" stroke="#6b5a72" fontSize={12} />
                    <YAxis stroke="#6b5a72" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="registrations"
                      name="Registrations"
                      stroke="#e29826"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      name="Attended"
                      stroke="#4c0c56"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-pale-purple shadow-sm space-y-4">
              <h3 className="font-heading text-lg font-bold text-deep-purple">Events by Category</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.categoryDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="_id"
                      label
                    >
                      {(analytics?.categoryDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: QR GATE SCANNER & ATTENDANCE ================= */}
      {activeTab === 'qrScan' && (
        <div className="space-y-8">
          {/* Scanner Controls Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-pale-purple shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold bg-bright-orange text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  REAL-TIME GATE SCANNER
                </span>
                <h2 className="font-heading text-xl font-bold text-deep-purple mt-1">
                  Scan Digital QR Pass & Verify Student Entry
                </h2>
                <p className="text-xs text-text-muted">
                  Point the camera at attendee QR passes or type the ticket code below. Attendance is recorded instantly into the database.
                </p>
              </div>
            </div>

            {/* Quick Ticket Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyTicket();
              }}
              className="flex flex-col sm:flex-row items-center gap-3"
            >
              <div className="relative flex-1 w-full">
                <QrCode className="w-5 h-5 text-deep-purple absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Paste QR payload or enter Ticket Code (e.g. TIHS-CUL-19283-492)"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 font-mono text-xs sm:text-sm bg-cream/60 border border-pale-purple rounded-xl focus:outline-none focus:border-deep-purple font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={scanning || !qrInput.trim()}
                className="w-full sm:w-auto px-6 py-2.5 bg-deep-purple hover:bg-mid-purple text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {scanning ? (
                  <Loader text="" size="sm" />
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-bright-orange" />
                    <span>Verify & Store Attendance</span>
                  </>
                )}
              </button>
            </form>

            {/* Verification Result Display Card */}
            {scanResult && (
              <div
                className={`p-6 rounded-3xl border-2 transition-all space-y-4 ${
                  scanResult.status === 'success'
                    ? 'bg-emerald-50 border-emerald-400'
                    : scanResult.status === 'duplicate'
                    ? 'bg-amber-50 border-amber-400'
                    : 'bg-red-50 border-red-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {scanResult.status === 'success' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                    {scanResult.status === 'duplicate' && <AlertCircle className="w-6 h-6 text-amber-600" />}
                    {scanResult.status === 'invalid' && <XCircle className="w-6 h-6 text-red-600" />}
                    <h3
                      className={`font-heading font-black text-lg ${
                        scanResult.status === 'success'
                          ? 'text-emerald-800'
                          : scanResult.status === 'duplicate'
                          ? 'text-amber-800'
                          : 'text-red-800'
                      }`}
                    >
                      {scanResult.message}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                      scanResult.status === 'success'
                        ? 'bg-emerald-200 text-emerald-900'
                        : scanResult.status === 'duplicate'
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-red-200 text-red-900'
                    }`}
                  >
                    {scanResult.status === 'success'
                      ? 'Recorded in Database'
                      : scanResult.status === 'duplicate'
                      ? 'Duplicate Scan Detected'
                      : 'Verification Failed'}
                  </span>
                </div>

                {scanResult.student && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white/80 p-4 rounded-2xl border border-pale-purple">
                    <div>
                      <span className="text-[10px] font-semibold text-text-muted block">Student Name</span>
                      <strong className="text-xs text-deep-purple font-bold">
                        {scanResult.student.name}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-text-muted block">Department / Year</span>
                      <strong className="text-xs text-deep-purple font-bold">
                        {scanResult.student.department || 'BCA'} (Year {scanResult.student.year || 1})
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-text-muted block">College Email</span>
                      <span className="text-xs text-text-dark font-mono truncate block">
                        {scanResult.student.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-text-muted block">Event Target</span>
                      <strong className="text-xs text-bright-orange font-bold truncate block">
                        {scanResult.event?.title || 'Campus Event'}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Today's Live Attendance Table */}
          <div className="bg-white p-6 rounded-3xl border border-pale-purple shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-deep-purple flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Session Verified Attendance Log ({scannedAttendees.length})</span>
              </h3>
              <span className="text-xs text-text-muted">Live anti-duplicate synchronization active</span>
            </div>

            {scannedAttendees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-pale-purple text-deep-purple uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3 rounded-l-xl">Time</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Ticket Code</th>
                      <th className="p-3">Event</th>
                      <th className="p-3 rounded-r-xl">Database Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pale-purple">
                    {scannedAttendees.map((att) => (
                      <tr key={att.id} className="hover:bg-cream/50">
                        <td className="p-3 font-mono text-text-muted">{att.scannedAt}</td>
                        <td className="p-3 font-bold text-deep-purple">{att.name}</td>
                        <td className="p-3">
                          {att.department} (Yr {att.year})
                        </td>
                        <td className="p-3 font-mono font-bold text-bright-orange">{att.ticketCode}</td>
                        <td className="p-3 truncate max-w-xs">{att.eventTitle}</td>
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ✅ Confirmed & Stored
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-text-muted">
                No entries scanned in this browser session yet. Use the ticket input above to verify gate passes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: EVENTS CRUD MANAGEMENT ================= */}
      {activeTab === 'eventsCrud' && (
        <div className="bg-white p-6 rounded-3xl border border-pale-purple shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-bold text-deep-purple">Events Database Management</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Full CRUD control: Create, Read, Update details, Delete, or toggle publication status.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('createEvent')}
              className="px-4 py-2 bg-bright-orange hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>

          {/* Filters & Search Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setEventCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                    eventCategoryFilter === cat
                      ? 'bg-deep-purple text-white shadow-sm'
                      : 'bg-pale-purple/50 text-text-dark hover:bg-pale-purple'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={eventStatusFilter}
              onChange={(e) => setEventStatusFilter(e.target.value)}
              className="py-1.5 px-3 bg-cream/70 border border-pale-purple rounded-xl text-xs font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="pending">Pending Approval</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search event title, venue..."
                value={eventSearchQuery}
                onChange={(e) => setEventSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-cream/50 border border-pale-purple rounded-xl text-xs focus:outline-none focus:border-deep-purple"
              />
            </div>
          </div>

          {/* Events CRUD Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-pale-purple text-deep-purple uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-xl">Event Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Start Date</th>
                  <th className="p-3">Venue</th>
                  <th className="p-3">Capacity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pale-purple">
                {filteredEventsForCrud.map((ev) => (
                  <tr key={ev._id} className="hover:bg-cream/50 transition-colors">
                    <td className="p-3">
                      <strong className="text-deep-purple font-bold block">{ev.title}</strong>
                      <span className="text-[10px] text-text-muted">Fee: {ev.fee > 0 ? `₹${ev.fee}` : 'Free'}</span>
                    </td>
                    <td className="p-3">
                      <span className="bg-pale-purple text-deep-purple px-2 py-0.5 rounded-full font-bold text-[10px]">
                        {ev.category}
                      </span>
                    </td>
                    <td className="p-3 text-text-muted">
                      {ev.startDate ? new Date(ev.startDate).toLocaleDateString('en-IN') : 'TBD'}
                    </td>
                    <td className="p-3 text-text-dark">{ev.venue || 'Campus'}</td>
                    <td className="p-3 font-semibold">
                      {ev.capacity} seats
                    </td>
                    <td className="p-3">
                      <select
                        value={ev.status}
                        onChange={(e) => handleQuickStatusChange(ev._id, e.target.value)}
                        className={`text-[10px] font-bold py-1 px-2 rounded-lg border focus:outline-none ${
                          ev.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : ev.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : ev.status === 'completed'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : 'bg-red-50 text-red-700 border-red-300'
                        }`}
                      >
                        <option value="published">published</option>
                        <option value="pending">pending</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingEvent({ ...ev })}
                          className="p-1.5 bg-pale-purple hover:bg-light-purple/30 text-deep-purple rounded-lg transition-colors"
                          title="Edit Event"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev._id, ev.title)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: APPROVAL QUEUE ================= */}
      {activeTab === 'approvals' && (
        <div className="bg-white p-6 rounded-3xl border border-pale-purple shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-deep-purple">Pending Faculty Proposals</h2>
            <span className="text-xs text-text-muted">{pendingEvents.length} awaiting review</span>
          </div>

          {pendingEvents.length > 0 ? (
            <div className="space-y-4">
              {pendingEvents.map((ev) => (
                <div
                  key={ev._id}
                  className="bg-cream/60 p-5 rounded-2xl border border-pale-purple flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="bg-pale-purple text-deep-purple text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {ev.category}
                    </span>
                    <h3 className="font-heading text-lg font-bold text-deep-purple">{ev.title}</h3>
                    <p className="text-xs text-text-muted">{ev.description}</p>
                    <p className="text-[11px] text-text-muted">
                      📍 {ev.venue} • 📅 {new Date(ev.startDate).toLocaleDateString('en-IN')} • Submitted by{' '}
                      <strong>{ev.createdBy?.name || 'Faculty Coordinator'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(ev._id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(ev._id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-text-muted">
              No pending event proposals. All submissions reviewed.
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: CREATE EVENT ================= */}
      {activeTab === 'createEvent' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-pale-purple shadow-sm space-y-6">
          <h2 className="font-heading text-xl font-bold text-deep-purple">Post New Event Proposal</h2>

          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TIHS Tech Horizon Hackathon 2026"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream/60 border border-pale-purple rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Category</label>
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  className="w-full py-2.5 px-3 bg-cream/60 border border-pale-purple rounded-xl text-xs font-medium"
                >
                  {['Cultural', 'Technical', 'Sports', 'Workshop', 'Fine Arts'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-dark mb-1">Description</label>
              <textarea
                rows={4}
                required
                placeholder="Comprehensive event details, keynote speakers, agendas..."
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="w-full p-3 bg-cream/60 border border-pale-purple rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Department</label>
                <select
                  value={newEvent.department}
                  onChange={(e) => setNewEvent({ ...newEvent, department: e.target.value })}
                  className="w-full py-2.5 px-3 bg-cream/60 border border-pale-purple rounded-xl text-xs font-medium"
                >
                  <option value="All">All Departments</option>
                  {['BBA', 'BCA', 'B.Com', 'BFA', 'BAJMC', 'B.Ed', 'B.Sc'].map((d) => (
                    <option key={d} value={d}>
                      Dept of {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Start Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-cream/60 border border-pale-purple rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">End Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-cream/60 border border-pale-purple rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Campus Venue</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TIHS Main Auditorium"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream/60 border border-pale-purple rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Max Capacity (Seats)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newEvent.capacity}
                  onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream/60 border border-pale-purple rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Fee (0 for Free)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newEvent.fee}
                  onChange={(e) => setNewEvent({ ...newEvent, fee: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-cream/60 border border-pale-purple rounded-xl text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingEvent}
              className="px-8 py-3.5 bg-bright-orange hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
            >
              {creatingEvent ? <Loader text="Submitting..." size="sm" /> : <span>Publish Event</span>}
            </button>
          </form>
        </div>
      )}

      {/* ================= TAB 6: USERS (Admin Only) ================= */}
      {isAdmin && activeTab === 'users' && (
        <div className="bg-white p-6 rounded-3xl border border-pale-purple shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-deep-purple">Registered Users Directory</h2>
            <span className="text-xs text-text-muted">{usersList.length} Total Registered Users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-pale-purple text-deep-purple uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-xl">User Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pale-purple">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-cream/50 transition-colors">
                    <td className="p-3 font-semibold text-text-dark">{u.name}</td>
                    <td className="p-3 text-text-muted font-mono">{u.email}</td>
                    <td className="p-3">{u.department || 'BCA'} (Yr {u.year || 1})</td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="py-1 px-2 bg-pale-purple text-deep-purple font-bold rounded-lg border border-light-purple/30 text-[11px]"
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingUser({ ...u })}
                          className="p-1.5 bg-pale-purple hover:bg-light-purple/30 text-deep-purple rounded-lg transition-colors"
                          title="Edit User Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleBlock(u._id)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg ${
                            u.isBlocked
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 7: AUDIT LOGS (Admin Only) ================= */}
      {isAdmin && activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-3xl border border-pale-purple shadow-sm space-y-4">
          <h2 className="font-heading text-xl font-bold text-deep-purple">System Audit Logs</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-pale-purple text-deep-purple uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-xl">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 rounded-r-xl">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pale-purple">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-cream/50">
                    <td className="p-3 text-text-muted">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-mono font-bold text-deep-purple">{log.action}</td>
                    <td className="p-3 text-text-dark">{log.userEmail || log.user?.email || 'System'}</td>
                    <td className="p-3 uppercase font-semibold text-bright-orange">{log.userRole || 'N/A'}</td>
                    <td className="p-3 font-mono text-text-muted">{log.ip || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 8: BULK CSV (Admin Only) ================= */}
      {isAdmin && activeTab === 'bulk' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-pale-purple shadow-sm space-y-6">
          <div>
            <h2 className="font-heading text-xl font-bold text-deep-purple">Bulk CSV Event Import</h2>
            <p className="text-xs text-text-muted mt-1">
              Paste CSV content with headers: <code>title, category, venue, capacity, fee, description</code>
            </p>
          </div>

          <textarea
            rows={8}
            placeholder={`title,category,venue,capacity,fee,description\nTIHS Coding Bootcamp,Technical,Lab 2,80,0,Intensive DSA & Python training\nRobotics Expo 2026,Technical,Block B,100,50,Robotics design showcase`}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full p-4 font-mono text-xs bg-cream/70 border border-pale-purple rounded-2xl focus:outline-none focus:border-deep-purple"
          />

          <button
            type="button"
            onClick={handleCsvImport}
            className="px-6 py-3 bg-deep-purple hover:bg-mid-purple text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-gold" />
            <span>Process Bulk Import</span>
          </button>
        </div>
      )}

      {/* ================= MODAL: EDIT EVENT ================= */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border-2 border-deep-purple space-y-5">
            <button
              onClick={() => setEditingEvent(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:bg-pale-purple transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-bright-orange uppercase tracking-wider">
                DATABASE MUTATION
              </span>
              <h3 className="font-heading text-xl font-bold text-deep-purple">
                Edit Event Details
              </h3>
            </div>

            <form onSubmit={handleUpdateEventSubmit} className="space-y-4 text-xs text-left">
              <div>
                <label className="block font-semibold mb-1 text-text-dark">Event Title</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full px-3 py-2 bg-cream/50 border border-pale-purple rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-text-dark">Category</label>
                  <select
                    value={editingEvent.category}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/50 border border-pale-purple rounded-xl font-semibold"
                  >
                    {['Cultural', 'Technical', 'Sports', 'Workshop', 'Fine Arts'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-text-dark">Status</label>
                  <select
                    value={editingEvent.status}
                    onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/50 border border-pale-purple rounded-xl font-semibold"
                  >
                    <option value="published">Published</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-text-dark">Campus Venue</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.venue}
                    onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/50 border border-pale-purple rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-text-dark">Capacity (Seats)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingEvent.capacity}
                    onChange={(e) => setEditingEvent({ ...editingEvent, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-cream/50 border border-pale-purple rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-text-dark">Fee (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingEvent.fee}
                    onChange={(e) => setEditingEvent({ ...editingEvent, fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-cream/50 border border-pale-purple rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-text-dark">Department</label>
                  <input
                    type="text"
                    value={editingEvent.department || 'All'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, department: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/50 border border-pale-purple rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-text-dark">Description</label>
                <textarea
                  rows={3}
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full p-2.5 bg-cream/50 border border-pale-purple rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="flex-1 py-2.5 bg-pale-purple text-deep-purple font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-deep-purple hover:bg-mid-purple text-white font-bold rounded-xl transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT USER ================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border-2 border-deep-purple space-y-5">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:bg-pale-purple transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-bright-orange uppercase tracking-wider">
                ADMIN PRIVILEGES
              </span>
              <h3 className="font-heading text-xl font-bold text-deep-purple">
                Update User Profile
              </h3>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-4 text-xs text-left">
              <div>
                <label className="block font-semibold mb-1 text-text-dark">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 bg-cream/50 border border-pale-purple rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-text-dark">Department</label>
                <select
                  value={editingUser.department || 'BCA'}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full px-3 py-2 bg-cream/50 border border-pale-purple rounded-xl font-semibold"
                >
                  {['BBA', 'BCA', 'B.Com', 'BFA', 'BAJMC', 'B.Ed', 'B.Sc'].map((d) => (
                    <option key={d} value={d}>Dept of {d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-text-dark">Year</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={editingUser.year || 1}
                    onChange={(e) => setEditingUser({ ...editingUser, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-cream/50 border border-pale-purple rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-text-dark">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/50 border border-pale-purple rounded-xl font-semibold"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-text-dark">Phone Number</label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-cream/50 border border-pale-purple rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 bg-pale-purple text-deep-purple font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-deep-purple hover:bg-mid-purple text-white font-bold rounded-xl transition-colors"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
