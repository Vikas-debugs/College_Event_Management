import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import Loader from '../components/Loader';
import TihsLogo from '../components/TihsLogo';
import CaptchaBox from '../components/CaptchaBox';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaExpected, setCaptchaExpected] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (captchaInput !== captchaExpected) {
      toast.error('Incorrect captcha answer! Please solve the security puzzle.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.user.role === 'admin' || result.user.role === 'faculty') {
        navigate('/admin/dashboard');
      } else if (result.user.role === 'volunteer') {
        navigate('/scanner');
      } else {
        navigate(from === '/' ? '/student/dashboard' : from);
      }
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setCaptchaInput(captchaExpected); // Auto-fill captcha for instant 1-click test login
    toast.success(`Demo credentials and security verification loaded for ${demoEmail}`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <TihsLogo className="w-16 h-16 mx-auto" />
          </Link>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-deep-purple">
            Sign In to TIHS CEMS
          </h2>
          <p className="text-xs text-text-muted">Techno Institute of Higher Studies, Lucknow</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-pale-purple shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-text-dark">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-bright-orange hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-cream/60 border border-pale-purple rounded-xl text-xs sm:text-sm focus:outline-none focus:border-deep-purple"
                />
              </div>
            </div>

            {/* Captcha Security Box */}
            <CaptchaBox
              onCaptchaChange={(ans) => setCaptchaExpected(ans)}
              userInput={captchaInput}
              setUserInput={setCaptchaInput}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-deep-purple hover:bg-mid-purple text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader text="" size="sm" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Login Shortcuts */}
          <div className="pt-4 border-t border-pale-purple/80 space-y-2.5">
            <div className="text-[11px] font-bold text-text-muted text-center uppercase tracking-wider">
              Quick One-Click Demo Logins
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@tihs.edu.in', 'Admin@123')}
                className="p-2 bg-pale-purple text-deep-purple text-[11px] font-bold rounded-lg border border-light-purple/30 hover:bg-light-purple/20 text-center"
              >
                Admin (Dr. Singh)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('faculty@tihs.edu.in', 'Faculty@123')}
                className="p-2 bg-pale-purple text-deep-purple text-[11px] font-bold rounded-lg border border-light-purple/30 hover:bg-light-purple/20 text-center"
              >
                Faculty (Prof. Verma)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('student@tihs.edu.in', 'Student@123')}
                className="p-2 bg-amber-50 text-bright-orange text-[11px] font-bold rounded-lg border border-amber-200 hover:bg-amber-100 text-center"
              >
                Student (Aarav)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('volunteer@tihs.edu.in', 'Volunteer@123')}
                className="p-2 bg-amber-50 text-bright-orange text-[11px] font-bold rounded-lg border border-amber-200 hover:bg-amber-100 text-center"
              >
                Volunteer (Priya)
              </button>
            </div>
          </div>
        </div>

        {/* Signup Link */}
        <div className="text-center text-xs text-text-muted">
          Don't have an account on TIHS CEMS?{' '}
          <Link to="/signup" className="text-bright-orange font-bold hover:underline">
            Register for Free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
