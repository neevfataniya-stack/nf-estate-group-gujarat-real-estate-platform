import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { 
  X, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Building
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'signup';
  onSuccessRedirect?: () => void;
  onOpenPrivacyPolicy?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  onSuccessRedirect,
  onOpenPrivacyPolicy,
}) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup' | 'forgot'>(initialTab);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setTab(initialTab);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await login(email, password);
      onClose();
      if (onSuccessRedirect) onSuccessRedirect();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !confirmPassword) {
      setErrorMessage('Please fill in all registration fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (!privacyConsent) {
      setErrorMessage('Please accept the Privacy Policy to create your account.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await register({
        name,
        email,
        phone,
        password,
        confirmPassword,
        consent: privacyConsent,
      });

      onClose();
      if (onSuccessRedirect) onSuccessRedirect();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. This email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please provide your registered email address.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.forgotPassword(email);
      setSuccessMessage(res.message);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-[#F4F0E7] rounded-2xl shadow-2xl border border-[#17211D]/15 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#17211D] text-[#F4F0E7] border-b border-[#23312C]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#B87952] flex items-center justify-center text-white">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-[#F4F0E7]">
                NF ESTATE GROUP
              </h3>
              <p className="text-[10px] text-[#C8D6B0] uppercase tracking-wider">
                Gujarat Real Estate Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#F4F0E7]/70 hover:text-white hover:bg-[#23312C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {tab !== 'forgot' && (
          <div className="grid grid-cols-2 border-b border-[#17211D]/10 bg-white/50 text-xs font-semibold">
            <button
              onClick={() => {
                setTab('login');
                setErrorMessage(null);
              }}
              className={`py-3 text-center transition-colors ${
                tab === 'login'
                  ? 'border-b-2 border-[#B87952] text-[#17211D] bg-white font-bold'
                  : 'text-[#17211D]/60 hover:text-[#17211D]'
              }`}
            >
              Login to Your Account
            </button>
            <button
              onClick={() => {
                setTab('signup');
                setErrorMessage(null);
              }}
              className={`py-3 text-center transition-colors ${
                tab === 'signup'
                  ? 'border-b-2 border-[#B87952] text-[#17211D] bg-white font-bold'
                  : 'text-[#17211D]/60 hover:text-[#17211D]'
              }`}
            >
              Create Your Account
            </button>
          </div>
        )}

        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#17211D]/40 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#17211D]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-[#B87952] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#17211D]/40 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#17211D]/50 hover:text-[#17211D]"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login to Your Account'}
              </button>

              {/* Hint / Demo Credentials helper for owner testing */}
              <div className="pt-3 border-t border-[#17211D]/10 text-[11px] text-[#17211D]/60 space-y-1">
                <p className="font-semibold text-[#17211D]">Quick Access Credentials:</p>
                <div className="flex justify-between">
                  <span>Owner Admin:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@nfestategroup.com');
                      setPassword('NFEstate@2026#Gujarat');
                    }}
                    className="text-[#B87952] underline font-mono text-[10px]"
                  >
                    Auto-Fill Admin
                  </button>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('rajesh.patel@gujaratbiz.com');
                      setPassword('Customer@123');
                    }}
                    className="text-[#B87952] underline font-mono text-[10px]"
                  >
                    Auto-Fill Customer
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: SIGN UP */}
          {tab === 'signup' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#17211D]/40 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Shah"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#17211D]/40 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Phone Number (Gujarat Contact) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#17211D]/40 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98250 XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#17211D]/40 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#17211D]/50 hover:text-[#17211D]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#17211D]/40 absolute left-3 top-2.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-[#17211D]/50 hover:text-[#17211D]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Acceptance of Privacy Policy */}
              <label className="flex items-start gap-2 text-xs text-[#17211D]/80 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  required
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  className="mt-0.5 rounded text-[#B87952] focus:ring-[#B87952]"
                />
                <span>
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={onOpenPrivacyPolicy}
                    className="text-[#B87952] underline font-semibold hover:text-[#9E6340]"
                  >
                    NF ESTATE GROUP Privacy Policy
                  </button>{' '}
                  and agree to the confidential handling of my contact information.
                </span>
              </label>

              {/* Create Your Account CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Your Account'}
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-xs text-[#17211D]/75">
                Enter your registered email address. We will verify your account in the database and dispatch secure password reset credentials.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#17211D]/40 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  />
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="w-1/2 py-2.5 px-3 rounded-lg border border-[#17211D]/20 text-[#17211D] text-xs font-semibold hover:bg-black/5"
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2.5 px-3 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-xs font-bold transition-colors shadow-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
