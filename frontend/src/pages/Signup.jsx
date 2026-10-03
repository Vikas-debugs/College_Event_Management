import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Phone, BookOpen, ArrowRight, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import Loader from '../components/Loader';
import TihsLogo from '../components/TihsLogo';
import CaptchaBox from '../components/CaptchaBox';
import toast from 'react-hot-toast';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('BCA');
  const [year, setYear] = useState(1);
  const [phone, setPhone] = useState('+91-7897123111');
  const [loading, setLoading] = useState(false);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  // OTP Modal
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);

  const { register, verifyEmail, resendOtp } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isCaptchaValid) {
      toast.error('Please solve the security anti-bot math challenge first.');
      return;
    }

    setLoading(true);

    const result = await register({
      name,
      email,
      password,
      role,
      department,
      year: Number(year),
      phone,
    });

    setLoading(false);
    if (result.success) {
      setOtp('');
      setOtpModalOpen(true);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }
    setResendingOtp(true);
    await resendOtp(email);
    setResendingOtp(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setVerifyingOtp(true);
    const res = await verifyEmail(email, otp || '123456');
    setVerifyingOtp(false);

    if (res.success) {
      setOtpModalOpen(false);
      if (role === 'admin' || role === 'faculty') {
        navigate('/admin/dashboard');
      } else if (role === 'volunteer') {
        navigate('/scanner');
      } else {
        navigate('/student/dashboard');
      }
    }
  };


  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <TihsLogo className="w-16 h-16 mx-auto shadow-md rounded-2xl" />
          </Link>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-deep-purple">
            Create TIHS CEMS Account
          </h2>
          <p className="text-xs text-text-muted">Techno Institute of Higher Studies, Lucknow</p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-pale-purple shadow-xl space-y-6">
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-text-dark mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-cream/60 border border-pale-purple rounded-xl text-xs sm:text-sm focus:outline-none focus:border-deep-purple"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-text-dark mb-1">College Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@tihs.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-cream/60 border border-pale-purple rounded-xl text-xs sm:text-sm focus:outline-none focus:border-deep-purple"
                />
              </div>
            </div>

            {/* Role and Department Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">User Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full py-2.5 px-3 bg-cream/60 border border-pale-purple rounded-xl text-xs sm:text-sm focus:outline-none focus:border-deep-purple font-medium"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty / Coordinator</option>
                  <option value="volunteer">Volunteer (Attendance Scanner)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full py-2.5 px-3 bg-cream/60 border border-pale-purple rounded-xl text-xs sm:text-sm focus:outline-none focus:border-deep-purple font-medium"
                >
                  {['BBA', 'BCA', 'B.Com', 'BFA', 'BAJMC', 'B.Ed', 'B.Sc'].map((dept) => (
                    <option key={dept} value={dept}>
                      Dept of {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Year & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Academic Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full py-2.5 px-3 bg-cream/60 border border-pale-purple rounded-xl text-xs sm:text-sm focus:outline-none focus:border-deep-purple font-medium"
                >
                  <option value={1}>1st Year (Fresher)</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year (Final)</option>
                  <option value={4}>4th Year (BFA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-dark mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="+91-7897123111"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-cream/60 border border-pale-purple rounded-xl text-xs sm:text-sm focus:outline-none focus:border-deep-purple"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-text-dark mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-cream/60 border border-pale-purple rounded-xl text-xs sm:text-sm focus:outline-none focus:border-deep-purple"
                />
              </div>
            </div>

            {/* Security Captcha Challenge */}
            <CaptchaBox onValidate={setIsCaptchaValid} />

            <button
              type="submit"
              disabled={loading || !isCaptchaValid}
              className="w-full py-3 bg-bright-orange hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader text="" size="sm" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-deep-purple font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>

      {/* ================= OTP VERIFICATION MODAL ================= */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-pale-purple text-center space-y-5">
            {/* Close Button */}
            <button
              onClick={() => setOtpModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-deep-purple p-1.5 rounded-full hover:bg-pale-purple/50 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 bg-pale-purple text-deep-purple rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Mail className="w-7 h-7 text-deep-purple" />
            </div>

            <div>
              <h3 className="font-heading text-2xl font-bold text-deep-purple">Verify College Email</h3>
              <p className="text-xs text-text-muted mt-1">
                A 6-digit OTP verification email has been dispatched to:
              </p>
              <div className="mt-1.5 inline-block bg-pale-purple/60 border border-light-purple/40 px-3 py-1 rounded-full text-xs font-bold text-deep-purple">
                {email}
              </div>
              <p className="text-[11px] text-text-muted mt-1">
                Please check your inbox as well as your <strong>Spam / Junk</strong> folder.
              </p>
            </div>



            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                required
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center text-2xl tracking-[8px] font-bold py-3 bg-cream/70 border-2 border-pale-purple rounded-2xl focus:border-deep-purple focus:outline-none"
              />

              <button
                type="submit"
                disabled={verifyingOtp}
                className="w-full py-3 bg-deep-purple hover:bg-mid-purple text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
              >
                {verifyingOtp ? <Loader text="" size="sm" /> : <span>Verify & Continue to Dashboard</span>}
              </button>

              <div className="pt-2 border-t border-pale-purple/50 flex items-center justify-between text-xs">
                <span className="text-text-muted">Didn't receive email?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendingOtp}
                  className="font-bold text-deep-purple hover:text-bright-orange transition-colors flex items-center gap-1"
                >
                  {resendingOtp ? 'Sending...' : 'Resend OTP to Inbox'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

  );
};

export default Signup;
