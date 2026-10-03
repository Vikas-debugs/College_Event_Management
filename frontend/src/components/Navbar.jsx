import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User, QrCode, LayoutDashboard, Calendar, PlusCircle, ShieldCheck } from 'lucide-react';

import TihsLogo from './TihsLogo';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Campus', path: '/campus' },
    { name: 'Faculty', path: '/faculty' },
    { name: 'Placements', path: '/placements' },
    { name: 'Happenings', path: '/happenings' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-pale-purple/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & College Title */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <img
              src="/assets/images/tihs-logo.webp"
              alt="TIHS Logo"
              className="w-12 h-12 object-contain group-hover:scale-105 transition-transform shrink-0 rounded-lg"
              onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/tihs-logo.svg'; }}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-xl tracking-wide text-deep-purple">TIHS</span>
                <span className="bg-pale-purple text-deep-purple font-bold text-[10px] px-2 py-0.5 rounded border border-light-purple/30">CEMS</span>
              </div>
              <span className="text-xs font-semibold text-text-dark tracking-tight leading-none">Techno Institute of Higher Studies</span>
              <span className="text-[10px] text-text-muted italic">Lucknow • 3rd Best B-School</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors py-1 ${
                    isActive
                      ? 'text-deep-purple border-b-2 border-bright-orange font-semibold'
                      : 'text-text-muted hover:text-deep-purple'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Auth Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Role specific quick action button */}
                {user?.role === 'volunteer' && (
                  <Link
                    to="/scanner"
                    className="flex items-center gap-1.5 bg-deep-purple text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-mid-purple transition-all shadow-sm"
                  >
                    <QrCode className="w-4 h-4 text-bright-orange" />
                    <span>Scan Tickets</span>
                  </Link>
                )}

                {(user?.role === 'admin' || user?.role === 'faculty') && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-1.5 bg-deep-purple text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-mid-purple transition-all shadow-sm"
                  >
                    <LayoutDashboard className="w-4 h-4 text-gold" />
                    <span>{user?.role === 'admin' ? 'Admin Panel' : 'Faculty Portal'}</span>
                  </Link>
                )}

                {user?.role === 'student' && (
                  <Link
                    to="/student/dashboard"
                    className="flex items-center gap-1.5 bg-pale-purple text-deep-purple border border-light-purple/40 px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-light-purple/20 transition-all shadow-sm"
                  >
                    <User className="w-4 h-4 text-deep-purple" />
                    <span>My Dashboard</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 pl-2 border-l border-pale-purple">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-text-dark max-w-[120px] truncate">{user?.name}</span>
                    <span className="text-[10px] uppercase font-bold text-bright-orange tracking-wider">{user?.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="text-deep-purple font-semibold text-sm px-4 py-2 rounded-lg border border-deep-purple/30 hover:bg-pale-purple transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-bright-orange hover:bg-amber-600 text-white font-bold text-sm px-4 py-2 rounded-lg transition-all shadow-sm shadow-bright-orange/30 hover:shadow"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-text-dark hover:bg-pale-purple transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-pale-purple px-4 pt-2 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pt-2 pb-3 border-b border-pale-purple">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-text-dark hover:text-deep-purple py-1.5 px-2 rounded hover:bg-pale-purple"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-pale-purple/50 p-3 rounded-lg">
                  <div>
                    <div className="text-sm font-bold text-deep-purple">{user?.name}</div>
                    <div className="text-xs text-bright-orange font-bold uppercase">{user?.role} • {user?.department}</div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>

                {user?.role === 'student' && (
                  <Link
                    to="/student/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center bg-deep-purple text-white py-2 rounded-lg font-bold text-sm"
                  >
                    Go to Student Dashboard
                  </Link>
                )}

                {(user?.role === 'admin' || user?.role === 'faculty') && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center bg-deep-purple text-white py-2 rounded-lg font-bold text-sm"
                  >
                    Go to {user?.role === 'admin' ? 'Admin' : 'Faculty'} Dashboard
                  </Link>
                )}

                {user?.role === 'volunteer' && (
                  <Link
                    to="/scanner"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center bg-bright-orange text-white py-2 rounded-lg font-bold text-sm"
                  >
                    Open QR Ticket Scanner
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-deep-purple border border-deep-purple py-2 rounded-lg font-bold text-sm"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center bg-bright-orange text-white py-2 rounded-lg font-bold text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
