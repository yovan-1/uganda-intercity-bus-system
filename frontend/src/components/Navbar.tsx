import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, User, Bus, Menu, X, LogOut, Wifi, Luggage, ShieldAlert } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Dropdown state for Services
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setServicesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close all menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setServicesDropdownOpen(false);
  }, [location.pathname]);

  return (
    <nav ref={navRef} className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-xs text-slate-800 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center shadow-xs group-hover:bg-blue-800 transition-colors flex-shrink-0">
              <Bus className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight text-slate-900 flex items-center gap-1 font-mono leading-none">
                UG<span className="text-blue-700"> Express</span>
              </span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-normal mt-0.5">
                Uganda Intercity Bus Network
              </span>
            </div>
          </Link>

          {/* Center Navigation Items (Desktop Wide: lg screens & above) */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-3 text-xs font-medium text-slate-700">
            {/* Plan Your Journey (Direct Link to Home Page) */}
            <Link
              to="/"
              className={`px-3 py-2 rounded-xl transition-colors hover:bg-slate-100 hover:text-blue-700 whitespace-nowrap ${
                isActive('/') ? 'bg-blue-50 text-blue-700 font-semibold' : ''
              }`}
            >
              Plan Your Journey
            </Link>

            {/* Services Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl transition-colors hover:bg-slate-100 hover:text-blue-700 ${
                  servicesDropdownOpen ? 'bg-blue-50 text-blue-700 font-semibold' : ''
                }`}
              >
                <span>Services</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${servicesDropdownOpen ? 'rotate-180 text-blue-700' : ''}`} />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white/98 backdrop-blur-xl border border-slate-200 rounded-2xl p-4 shadow-xl z-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2">Onboard Comfort & Support</div>
                  <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50 text-slate-800 transition-colors">
                    <Wifi className="w-4 h-4 text-blue-700 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-xs">High-Speed Wi-Fi & Power</div>
                      <div className="text-[10px] text-slate-500">Free 4G Wi-Fi on all coaches</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50 text-slate-800 transition-colors">
                    <Luggage className="w-4 h-4 text-blue-700 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-xs">Luggage Allowance</div>
                      <div className="text-[10px] text-slate-500">20kg free hold baggage per passenger</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50 text-slate-800 transition-colors">
                    <ShieldAlert className="w-4 h-4 text-blue-700 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-xs">Instant QR E-Tickets</div>
                      <div className="text-[10px] text-slate-500">Paperless digital check-in</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Manage My Booking */}
            <Link
              to={user?.role === 'CUSTOMER' ? '/dashboard' : '/auth'}
              className={`px-3 py-2 rounded-xl transition-colors hover:bg-slate-100 hover:text-blue-700 whitespace-nowrap ${
                isActive('/dashboard') ? 'bg-blue-50 text-blue-700 font-semibold' : ''
              }`}
            >
              Manage My Booking
            </Link>

            {/* Trip Tracker */}
            <Link
              to={user?.role === 'STAFF' ? '/staff' : '/auth'}
              className={`px-3 py-2 rounded-xl transition-colors hover:bg-slate-100 hover:text-blue-700 whitespace-nowrap ${
                isActive('/staff') ? 'bg-blue-50 text-blue-700 font-semibold' : ''
              }`}
            >
              Trip Tracker
            </Link>

            {/* Admin Link if Admin User */}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold uppercase shadow-xs hover:bg-blue-800 transition-colors whitespace-nowrap"
              >
                Admin Panel
              </Link>
            )}

            {/* Help Button */}
            <button
              type="button"
              onClick={() => setHelpModalOpen(true)}
              className="px-3 py-2 rounded-xl transition-colors hover:bg-slate-100 hover:text-blue-700 whitespace-nowrap"
            >
              Help
            </button>
          </div>

          {/* Right Action Controls (Desktop) */}
          <div className="hidden lg:flex items-center gap-3 text-xs font-normal">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 cursor-pointer bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors">
              <span className="font-mono text-[11px] font-semibold text-blue-800">UG / EN</span>
            </div>

            {/* User Account Controls */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-extrabold">
                  <User className="w-3.5 h-3.5 text-blue-700" />
                  <span>{user.name.split(' ')[0]}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-extrabold text-xs px-3 py-1.5 rounded-xl transition-colors shadow-xs"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5" />
                <span>Register / Sign in</span>
              </Link>
            )}
          </div>

          {/* Mobile & Tablet Drawer Toggle Button */}
          <div className="lg:hidden flex items-center gap-2">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold"
              >
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </button>
            ) : (
              <Link to="/auth" className="px-3 py-1.5 rounded-xl bg-blue-700 text-white text-xs font-semibold">
                Sign In
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-700 hover:text-blue-700 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X className="w-5 h-5 text-blue-700" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Visible on Mobile & Tablet < 1024px) */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 text-xs font-medium text-slate-700 shadow-xl max-h-[85vh] overflow-y-auto text-left">
          <Link to="/" className="block py-2.5 border-b border-slate-100 font-semibold text-slate-900 hover:text-blue-700 text-sm">
            Plan Your Journey
          </Link>

          {/* Services Collapsible Section */}
          <div className="border-b border-slate-100 pb-2">
            <button
              type="button"
              onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              className="flex items-center justify-between w-full py-2 text-slate-900 font-semibold text-sm"
            >
              <span>Services & Onboard Amenities</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${mobileServicesOpen ? 'rotate-180 text-blue-700' : ''}`} />
            </button>
            {mobileServicesOpen && (
              <div className="pl-3 py-2 space-y-2 border-l-2 border-blue-200 ml-1 text-xs">
                <div className="py-1">Free 4G Wi-Fi & Power Outlets</div>
                <div className="py-1">20kg Free Baggage Allowance</div>
                <div className="py-1">Instant QR Code E-Tickets</div>
              </div>
            )}
          </div>

          <Link to="/dashboard" className="block py-2.5 border-b border-slate-100 font-semibold text-slate-900 hover:text-blue-700 text-sm">
            Manage My Booking
          </Link>

          <Link to="/staff" className="block py-2.5 border-b border-slate-100 font-semibold text-slate-900 hover:text-blue-700 text-sm">
            Trip Tracker
          </Link>

          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              setHelpModalOpen(true);
            }}
            className="block text-left w-full py-2.5 border-b border-slate-100 font-semibold text-slate-900 hover:text-blue-700 text-sm"
          >
            Help & Passenger Support
          </button>

          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="block py-2.5 border-b border-slate-100 font-bold text-blue-700 text-sm">
              Admin Panel
            </Link>
          )}

          {user ? (
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="font-semibold text-slate-900">Signed in as {user.name}</span>
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                  navigate('/');
                }}
                className="text-red-600 font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="block text-center bg-blue-700 text-white font-semibold py-3 rounded-xl mt-3 text-sm shadow-xs"
            >
              Register / Sign in
            </Link>
          )}
        </div>
      )}

      {/* Interactive Passenger Help & Support Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 text-left max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-mono">Passenger Help & Support</h3>
                  <p className="text-xs text-slate-500 font-medium">Instant answers & 24/7 customer service</p>
                </div>
              </div>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-1">
                <span className="font-mono font-bold text-blue-800 uppercase tracking-wider text-[10px] block">Hotline Support</span>
                <span className="font-extrabold text-slate-900 text-xs block">+256 771 234567</span>
                <span className="text-[10px] text-slate-500 block">Available 24 Hours / 7 Days</span>
              </div>
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl space-y-1">
                <span className="font-mono font-bold text-emerald-800 uppercase tracking-wider text-[10px] block">WhatsApp / SMS</span>
                <span className="font-extrabold text-slate-900 text-xs block">+256 771 234567</span>
                <span className="text-[10px] text-slate-500 block">Instant Chat Assistance</span>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Frequently Asked Questions</h4>
              <div className="space-y-2 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900">How do I receive my bus ticket?</div>
                  <div className="text-slate-600 leading-relaxed">
                    Once you complete your payment via Mobile Money or Card, your digital E-Ticket with a QR code is generated instantly. You can print it or show it on your phone.
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900">What is the luggage allowance?</div>
                  <div className="text-slate-600 leading-relaxed">
                    Each passenger is allowed up to 20kg of hold luggage free of charge, plus 1 small hand luggage bag.
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900">How do I select or change my seat?</div>
                  <div className="text-slate-600 leading-relaxed">
                    During booking, click any blue seat on the interactive seat map to select it. To view existing reservations, log in and visit your Passenger Dashboard.
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setHelpModalOpen(false);
                  const footerEl = document.getElementById('help');
                  if (footerEl) footerEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
              >
                View Full Terminal Info
              </button>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
              >
                Close Help
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
