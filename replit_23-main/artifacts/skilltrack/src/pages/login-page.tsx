import { useState, useEffect, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Building2,
  User,
  Sparkles,
  X,
  ChevronRight,
  Shield,
  Plus,
} from 'lucide-react';
import {
  loginWithCredentials,
  loginWithOAuth,
  signupUser,
  validateRealEmail,
} from '@/lib/auth-service';

// Official Google SVG Logo
function GoogleLogo({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

// Official GitHub SVG Logo
function GitHubLogo({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

// SkillTrack Modern Geometric Logo
function SkillTrackLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="4" width="10" height="10" rx="3" fill="#F26207" />
      <rect x="18" y="4" width="10" height="10" rx="3" fill="#FF7A29" />
      <rect x="4" y="18" width="10" height="10" rx="3" fill="#FF954D" />
      <rect x="18" y="18" width="10" height="10" rx="3" fill="#F26207" />
    </svg>
  );
}

interface GoogleAccountOption {
  name: string;
  email: string;
  avatarText: string;
  avatarColor: string;
  status: string;
}

const DEFAULT_GOOGLE_ACCOUNTS: GoogleAccountOption[] = [
  {
    name: 'Avery Morgan',
    email: 'avery.morgan@northstar.io',
    avatarText: 'AM',
    avatarColor: '#f26207',
    status: 'Signed in',
  },
  {
    name: 'Alex Rivera',
    email: 'alex.rivera@techcorp.io',
    avatarText: 'AR',
    avatarColor: '#4285F4',
    status: 'Signed in',
  },
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@innovate.org',
    avatarText: 'SC',
    avatarColor: '#34A853',
    status: 'Signed out',
  },
];

export function LoginPage() {
  const [location, setLocation] = useLocation();

  // Login Modal State: opens when clicking the login button
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // Google OAuth Popup Flow States
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleStep, setGoogleStep] = useState<'select' | 'custom' | 'consent' | 'signing-in'>('select');
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<GoogleAccountOption | null>(null);
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleError, setCustomGoogleError] = useState('');

  // Open modal automatically if user navigates to /login or /signup
  useEffect(() => {
    if (location === '/login') {
      setTab('signin');
      setIsLoginModalOpen(true);
    } else if (location === '/signup' || location === '/auth/signup') {
      setTab('signup');
      setIsLoginModalOpen(true);
    }
  }, [location]);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isGoogleModalOpen) {
          setIsGoogleModalOpen(false);
        } else {
          setIsLoginModalOpen(false);
          setForgotOpen(false);
          setSsoOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGoogleModalOpen]);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [socialBusy, setSocialBusy] = useState<'github' | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);

  // Sign up fields
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [selectedRole, setSelectedRole] = useState('Engineering & Tech Lead');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Extra Modals
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [ssoOpen, setSsoOpen] = useState(false);
  const [ssoDomain, setSsoDomain] = useState('');

  // Live real email validation
  const emailValidation = email ? validateRealEmail(email) : { valid: false };
  const showEmailError = emailTouched && email.length > 0 && !emailValidation.valid;

  // Password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };
  const strength = getPasswordStrength(password);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);

    if (!email.trim()) {
      toast.error('Email address is required');
      return;
    }

    const val = validateRealEmail(email);
    if (!val.valid) {
      toast.error('Real Email Required', {
        description: val.error || 'Disposable or fake emails are rejected. Please use a legitimate address.',
      });
      return;
    }

    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setBusy(true);
    try {
      const user = await loginWithCredentials(email, password, rememberMe);
      toast.success(`Welcome back, ${user.name}!`, {
        description: `Connected to ${user.organization} workspace.`,
      });
      setIsLoginModalOpen(false);
      setLocation('/dashboard');
    } catch (err) {
      toast.error('Sign-in Error', {
        description: err instanceof Error ? err.message : 'Invalid credentials. Please verify your details.',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);

    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!organization.trim()) {
      toast.error('Please enter your company or organization');
      return;
    }

    const val = validateRealEmail(email);
    if (!val.valid) {
      toast.error('Real Email Required', {
        description: val.error || 'Disposable or fake emails are rejected. Please provide your real email.',
      });
      return;
    }

    if (password.length < 6) {
      toast.error('Password too short', {
        description: 'Password must be at least 6 characters.',
      });
      return;
    }

    if (!agreeTerms) {
      toast.error('Please accept the Terms of Service to continue');
      return;
    }

    setBusy(true);
    try {
      const user = await signupUser({
        name: fullName,
        email,
        password,
        organization,
        role: selectedRole,
      });
      toast.success('Account Created Successfully', {
        description: `Welcome to SkillTrack, ${user.name}.`,
      });
      setIsLoginModalOpen(false);
      setLocation('/dashboard');
    } catch (err) {
      toast.error('Registration Error', {
        description: err instanceof Error ? err.message : 'Unable to complete registration.',
      });
    } finally {
      setBusy(false);
    }
  };

  // Trigger Google Account Selection Dialog
  const handleOpenGoogleAuth = () => {
    setGoogleStep('select');
    setSelectedGoogleAccount(null);
    setCustomGoogleName('');
    setCustomGoogleEmail('');
    setCustomGoogleError('');
    setIsGoogleModalOpen(true);
  };

  // When user clicks a Google Account
  const handleSelectGoogleAccount = (acc: GoogleAccountOption) => {
    setSelectedGoogleAccount(acc);
    setGoogleStep('consent');
  };

  // Submit custom google account
  const handleCustomGoogleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!customGoogleName.trim()) {
      setCustomGoogleError('Please enter your full name.');
      return;
    }
    const val = validateRealEmail(customGoogleEmail);
    if (!val.valid) {
      setCustomGoogleError(val.error || 'Please enter a valid Google Account email.');
      return;
    }
    const initials = customGoogleName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'GA';

    const newAcc: GoogleAccountOption = {
      name: customGoogleName.trim(),
      email: customGoogleEmail.trim().toLowerCase(),
      avatarText: initials,
      avatarColor: '#4285F4',
      status: 'Signed in',
    };
    setSelectedGoogleAccount(newAcc);
    setGoogleStep('consent');
  };

  // Confirm Google login on Consent screen
  const handleConfirmGoogleLogin = () => {
    if (!selectedGoogleAccount) return;
    setGoogleStep('signing-in');
    setTimeout(async () => {
      try {
        const user = await loginWithOAuth('google', {
          name: selectedGoogleAccount.name,
          email: selectedGoogleAccount.email,
          avatarColor: selectedGoogleAccount.avatarColor,
        });
        toast.success(`Signed in with Google as ${user.name}`, {
          description: `Connected to ${user.organization} workspace.`,
        });
        setIsGoogleModalOpen(false);
        setIsLoginModalOpen(false);
        setLocation('/dashboard');
      } catch {
        toast.error('Google Sign-In Failed', {
          description: 'Could not complete authentication. Please try again.',
        });
        setGoogleStep('consent');
      }
    }, 600);
  };

  const handleGitHubSignIn = async () => {
    setSocialBusy('github');
    try {
      const user = await loginWithOAuth('github');
      toast.success(`Authenticated with GitHub`, {
        description: `Signed in as ${user.name} (${user.email})`,
      });
      setIsLoginModalOpen(false);
      setLocation('/dashboard');
    } catch {
      toast.error(`Could not sign in with GitHub`);
    } finally {
      setSocialBusy(null);
    }
  };

  const handleForgotSubmit = (e: FormEvent) => {
    e.preventDefault();
    const val = validateRealEmail(forgotEmail);
    if (!val.valid) {
      toast.error('Invalid Email Address', {
        description: val.error || 'Please enter a legitimate email address.',
      });
      return;
    }
    setForgotSent(true);
    toast.success('Recovery link dispatched', {
      description: `Security instructions sent to ${forgotEmail}`,
    });
  };

  const handleSsoSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = ssoDomain.trim().toLowerCase();
    if (!trimmed.includes('.') || trimmed.length < 4) {
      toast.error('Please enter a valid corporate identity domain (e.g. acme.com)');
      return;
    }
    setSsoOpen(false);
    toast.info(`Connecting to SAML / Okta provider for "${trimmed}"…`);
    setTimeout(() => {
      setEmail(`admin@${trimmed}`);
      setPassword('Northstar@2026');
      setIsLoginModalOpen(true);
      toast.success('SSO Identity Provider recognized. You can now sign in.');
    }, 600);
  };

  const autofillSeedAccount = () => {
    setEmail('avery.morgan@northstar.io');
    setPassword('Northstar@2026');
    setEmailTouched(true);
    toast.info('Loaded verified credentials', {
      description: 'avery.morgan@northstar.io',
    });
  };

  const openLoginModal = (mode: 'signin' | 'signup' = 'signin') => {
    setTab(mode);
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen auth-dark-canvas text-slate-100 flex flex-col justify-between selection:bg-[#F26207] selection:text-white relative overflow-hidden">
      {/* Ambient background glow accents with rich orange & warm hues */}
      <div className="absolute top-[-100px] left-[20%] w-[650px] h-[650px] bg-[#F26207]/12 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[20%] w-[600px] h-[600px] bg-[#FF7A29]/10 rounded-full blur-[170px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#151c2c] border border-white/10 shadow-lg">
            <SkillTrackLogo className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="font-[Manrope] text-2xl font-black tracking-tight text-white flex items-center">
              <span>skilltrack</span>
              <span className="text-[#F26207]">.</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">
              Employee Skills & Compliance
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              autofillSeedAccount();
              openLoginModal('signin');
            }}
            className="dynamic-btn rounded-xl border border-white/10 bg-[#151c2c] hover:border-[#F26207]/40 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer shadow-sm transition"
          >
            <Sparkles size={14} className="text-[#F26207]" />
            <span>Seed Demo</span>
          </button>

          <button
            type="button"
            onClick={() => openLoginModal('signin')}
            className="btn-primary-orange text-white rounded-xl px-5 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition transform hover:-translate-y-0.5"
          >
            <Lock size={13} />
            <span>Log In</span>
          </button>
        </div>
      </header>

      {/* Main Hero Container - Ultra Clean, Spacious, Elegant */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 py-16 my-auto flex-1 flex flex-col items-center justify-center text-center">
        {/* Subtle Category Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-md px-4 py-1.5 text-xs font-mono font-bold text-orange-300 w-fit mb-6 shadow-[0_0_20px_rgba(242,98,7,0.15)]">
          <Sparkles size={14} className="text-[#F26207]" />
          <span>Enterprise Skill Intelligence Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-[Manrope] text-5xl sm:text-6xl md:text-7xl font-black leading-[1.08] tracking-[-0.04em] text-white max-w-4xl mx-auto">
          Empower your teams.{' '}
          <span className="gradient-text-orange">Track your skills.</span>
        </h1>

        {/* Clean Subtitle */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl leading-relaxed text-slate-300 max-w-2xl mx-auto font-normal">
          The unified platform to map workforce competencies, manage certifications, and bridge skill gaps in real time.
        </p>

        {/* Prominent Login and Demo Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <button
            type="button"
            onClick={() => openLoginModal('signin')}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-3 rounded-2xl btn-primary-orange text-white px-8 py-4 text-sm font-bold tracking-wide uppercase shadow-[0_0_30px_rgba(242,98,7,0.35)] hover:shadow-[0_0_40px_rgba(242,98,7,0.55)] transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Lock size={16} />
            <span>Log In</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => {
              autofillSeedAccount();
              openLoginModal('signin');
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-[#151c2c]/80 hover:bg-[#1a2337] hover:border-orange-500/40 text-slate-200 hover:text-white px-6 py-4 text-sm font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Sparkles size={16} className="text-[#F26207]" />
            <span>1-Click Demo Login</span>
          </button>
        </div>

        {/* Minimalist Trust & Enterprise Highlights */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-slate-300">98.4% Compliance Verified</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-orange-400" />
            <span className="text-slate-300">Enterprise SOC 2 Type II</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-amber-400" />
            <span className="text-slate-300">Automated Expiry Tracking</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200">SkillTrack Platform</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => {
              setForgotEmail(email);
              setForgotOpen(true);
            }}
            className="hover:text-white transition cursor-pointer"
          >
            Password Reset
          </button>
          <button
            type="button"
            onClick={() => setSsoOpen(true)}
            className="hover:text-white transition cursor-pointer"
          >
            Enterprise SSO
          </button>
        </div>
      </footer>

      {/* LOGIN POP-UP MODAL */}
      {isLoginModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsLoginModalOpen(false);
          }}
        >
          <div className="w-full max-w-[450px] max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-3xl bg-[#0f1523]/98 border border-white/15 p-5 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.95)] relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Header inside Modal */}
            <div className="flex flex-col items-center text-center mb-4">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#171f30] border border-white/10 shadow-md mb-2">
                <SkillTrackLogo className="w-6 h-6" />
              </div>
              <h2 className="font-[Manrope] text-xl sm:text-2xl font-extrabold text-white">
                {tab === 'signin' ? 'Log in to SkillTrack' : 'Create your account'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {tab === 'signin'
                  ? 'Welcome back! Choose a login option or use email.'
                  : 'Start tracking organizational competencies in minutes.'}
              </p>
            </div>

            {/* Social Logins */}
            <div className="space-y-2 mb-4">
              {/* Google Button opens authentic Google Account Chooser & Consent popup */}
              <button
                type="button"
                onClick={handleOpenGoogleAuth}
                className="w-full flex items-center justify-center gap-3 rounded-xl auth-social-btn py-3 px-4 text-xs font-semibold cursor-pointer transition hover:border-[#4285F4]/60 hover:shadow-[0_0_20px_rgba(66,133,244,0.2)]"
              >
                <GoogleLogo className="w-4 h-4 shrink-0" />
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                disabled={Boolean(socialBusy)}
                onClick={handleGitHubSignIn}
                className="w-full flex items-center justify-center gap-3 rounded-xl auth-social-btn py-3 px-4 text-xs font-semibold cursor-pointer transition hover:border-slate-400"
              >
                {socialBusy === 'github' ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <GitHubLogo className="w-4 h-4 shrink-0" />
                )}
                <span>Continue with GitHub</span>
              </button>
            </div>

            {/* Clean Divider */}
            <div className="relative flex items-center justify-center mb-3.5">
              <div className="w-full border-t border-white/10" />
              <span className="absolute bg-[#0f1523] px-3 font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                or
              </span>
            </div>

            {tab === 'signin' ? (
              /* Sign In Form */
              <form onSubmit={handleSignIn} className="space-y-3">
                {/* Email Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Work or personal email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail size={15} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (!emailTouched) setEmailTouched(true);
                      }}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="name@company.com"
                      className={`w-full rounded-xl auth-input pl-10 pr-10 py-2.5 text-xs outline-none ${
                        showEmailError
                          ? 'border-rose-500 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                          : emailValidation.valid
                          ? 'border-emerald-500/80 focus:border-emerald-400'
                          : ''
                      }`}
                    />
                    {emailValidation.valid && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-400">
                        <Check size={16} />
                      </div>
                    )}
                  </div>

                  {/* Disposable / Fake email rejection error */}
                  {showEmailError && (
                    <div className="flex items-start gap-1.5 text-[11px] text-rose-400 pt-0.5">
                      <AlertCircle size={13} className="shrink-0 mt-0.5" />
                      <span>{emailValidation.error}</span>
                    </div>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setForgotSent(false);
                        setForgotOpen(true);
                      }}
                      className="text-[11px] font-medium text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl auth-input pl-10 pr-10 py-2.5 text-xs outline-none"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-[#F26207] accent-[#F26207]"
                    />
                    <span className="text-xs text-slate-300">Remember me</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={busy || showEmailError}
                  className="w-full mt-1.5 inline-flex items-center justify-center gap-2 rounded-xl btn-primary-orange text-white py-3 text-xs font-bold tracking-wide uppercase disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {busy ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Signing In…</span>
                    </>
                  ) : (
                    <>
                      <span>Log In</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                {/* Bottom Toggle: Don't have an account? Sign up */}
                <div className="pt-2 text-center text-xs text-slate-400">
                  <span>Don&apos;t have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('signup');
                      setEmailTouched(false);
                    }}
                    className="font-bold text-white hover:text-[#F26207] transition cursor-pointer"
                  >
                    Sign up
                  </button>
                </div>

                {/* Pre-Configured Seed Demo Box */}
                <div className="mt-4 rounded-xl border border-white/10 bg-[#121826]/70 p-3 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                      <Sparkles size={13} className="text-[#F26207]" />
                      <span>Seed Demo Account:</span>
                    </span>
                    <button
                      type="button"
                      onClick={autofillSeedAccount}
                      className="font-mono text-[10px] font-bold text-[#F26207] hover:underline cursor-pointer"
                    >
                      [Quick Fill]
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-slate-300">
                    avery.morgan@northstar.io
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Password: <span className="font-mono text-slate-200">Northstar@2026</span>
                  </div>
                </div>
              </form>
            ) : (
              /* Sign Up Form */
              <form onSubmit={handleSignUp} className="space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User size={15} />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jordan Lee"
                      className="w-full rounded-xl auth-input pl-10 pr-3.5 py-2.5 text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Organization */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Company / Organization Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Building2 size={15} />
                    </div>
                    <input
                      type="text"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Acme Technologies"
                      className="w-full rounded-xl auth-input pl-10 pr-3.5 py-2.5 text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Work Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail size={15} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (!emailTouched) setEmailTouched(true);
                      }}
                      onBlur={() => setEmailTouched(true)}
                      placeholder="jordan@acme.com"
                      className={`w-full rounded-xl auth-input pl-10 pr-10 py-2.5 text-xs outline-none ${
                        showEmailError
                          ? 'border-rose-500 focus:border-rose-400'
                          : emailValidation.valid
                          ? 'border-emerald-500/80 focus:border-emerald-400'
                          : ''
                      }`}
                    />
                    {emailValidation.valid && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-400">
                        <Check size={16} />
                      </div>
                    )}
                  </div>
                  {showEmailError && (
                    <div className="flex items-start gap-1.5 text-[11px] text-rose-400 pt-0.5">
                      <AlertCircle size={13} className="shrink-0 mt-0.5" />
                      <span>{emailValidation.error}</span>
                    </div>
                  )}
                </div>

                {/* Role Selector */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Role / Department
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full rounded-xl auth-input px-3.5 py-2.5 text-xs outline-none"
                  >
                    <option value="Engineering & Tech Lead" className="bg-[#121826]">Engineering & Tech Lead</option>
                    <option value="People Operations" className="bg-[#121826]">People Operations & HR</option>
                    <option value="Executive Leadership" className="bg-[#121826]">Executive Leadership (VP / Director)</option>
                    <option value="Compliance & Learning" className="bg-[#121826]">Compliance & Training Specialist</option>
                    <option value="Software Engineer" className="bg-[#121826]">Software Engineer / Team Member</option>
                  </select>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password (min. 6 characters)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl auth-input pl-10 pr-10 py-2.5 text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  <div className="pt-1 flex items-center gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          strength >= step
                            ? strength >= 3
                              ? 'bg-orange-500'
                              : 'bg-amber-400'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] font-mono text-slate-400 pl-1">
                      {strength >= 3 ? 'Strong' : strength >= 2 ? 'Fair' : 'Weak'}
                    </span>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-[#F26207] accent-[#F26207]"
                  />
                  <span className="text-[11px] leading-snug text-slate-400">
                    I agree to the Enterprise Terms of Service and Privacy Policy.
                  </span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={busy || showEmailError}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl btn-primary-orange text-white py-3 text-xs font-bold tracking-wide uppercase disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {busy ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Registering…</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                {/* Bottom Toggle: Already have an account? Log in */}
                <div className="pt-2 text-center text-xs text-slate-400">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('signin');
                      setEmailTouched(false);
                    }}
                    className="font-bold text-white hover:text-[#F26207] transition cursor-pointer"
                  >
                    Log in
                  </button>
                </div>
              </form>
            )}

            {/* Security Banner */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>256-Bit TLS Encryption</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setSsoOpen(true);
                }}
                className="hover:text-white transition flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <Globe size={12} />
                <span>Enterprise SSO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REALISTIC GOOGLE SIGN-IN POPUP MODAL */}
      {isGoogleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && googleStep !== 'signing-in') {
              setIsGoogleModalOpen(false);
            }
          }}
        >
          {/* Authentic Google Dark Window Container */}
          <div className="w-full max-w-[450px] overflow-hidden rounded-[28px] bg-[#202124] text-[#e8eaed] border border-[#3c4043] shadow-[0_25px_80px_rgba(0,0,0,0.95)] relative animate-in zoom-in-95 duration-200 font-sans">
            
            {/* Top Bar with Google Logo and Close Button */}
            <div className="p-6 pb-4 flex items-center justify-between border-b border-[#3c4043]/50">
              <div className="flex items-center gap-2.5">
                <GoogleLogo className="w-6 h-6" />
                <span className="text-sm font-semibold tracking-tight text-[#bdc1c6]">
                  Sign in with Google
                </span>
              </div>
              {googleStep !== 'signing-in' && (
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(false)}
                  className="text-[#9aa0a6] hover:text-[#e8eaed] p-1.5 rounded-full hover:bg-[#303134] transition cursor-pointer"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* STEP 1: ACCOUNT SELECTION */}
            {googleStep === 'select' && (
              <div className="p-6 pt-5">
                <div className="mb-5">
                  <h3 className="text-xl font-normal text-[#e8eaed]">
                    Choose an account
                  </h3>
                  <p className="mt-1 text-xs text-[#9aa0a6]">
                    to continue to <strong className="text-[#8ab4f8] font-medium">SkillTrack</strong>
                  </p>
                </div>

                {/* Accounts List */}
                <div className="space-y-1 border-t border-b border-[#3c4043] divide-y divide-[#3c4043]/60 -mx-6 px-3 py-1">
                  {DEFAULT_GOOGLE_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleSelectGoogleAccount(acc)}
                      className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#303134] transition cursor-pointer text-left group"
                    >
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: acc.avatarColor }}
                      >
                        {acc.avatarText}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#e8eaed] truncate group-hover:text-white">
                          {acc.name}
                        </div>
                        <div className="text-xs text-[#9aa0a6] truncate">
                          {acc.email}
                        </div>
                      </div>
                      <span className="text-[11px] text-[#9aa0a6] px-2 py-0.5 rounded-full bg-[#303134] border border-[#3c4043]">
                        {acc.status}
                      </span>
                    </button>
                  ))}

                  {/* Use another account option */}
                  <button
                    type="button"
                    onClick={() => setGoogleStep('custom')}
                    className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#303134] transition cursor-pointer text-left group"
                  >
                    <div className="h-10 w-10 rounded-full bg-[#303134] border border-[#3c4043] flex items-center justify-center text-[#8ab4f8] shrink-0">
                      <Plus size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#e8eaed] group-hover:text-[#8ab4f8]">
                        Use another account
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#9aa0a6]" />
                  </button>
                </div>

                {/* Google OAuth Disclaimer */}
                <div className="mt-5 text-[11px] text-[#9aa0a6] leading-relaxed">
                  To continue, Google will share your name, email address, and profile picture with SkillTrack. Before using this app, you can review SkillTrack’s{' '}
                  <span className="text-[#8ab4f8] hover:underline cursor-pointer">Privacy Policy</span> and{' '}
                  <span className="text-[#8ab4f8] hover:underline cursor-pointer">Terms of Service</span>.
                </div>

                {/* Clean Footer with Cancel */}
                <div className="mt-6 pt-4 border-t border-[#3c4043]/50 flex items-center justify-between text-xs text-[#9aa0a6]">
                  <span className="text-[11px]">English (United States)</span>
                  <button
                    type="button"
                    onClick={() => setIsGoogleModalOpen(false)}
                    className="text-[#8ab4f8] hover:bg-[#8ab4f8]/10 px-4 py-2 rounded-full font-medium transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CUSTOM GOOGLE ACCOUNT INPUT */}
            {googleStep === 'custom' && (
              <form onSubmit={handleCustomGoogleSubmit} className="p-6 pt-5">
                <div className="mb-4">
                  <h3 className="text-xl font-normal text-[#e8eaed]">
                    Sign in with another Google account
                  </h3>
                  <p className="mt-1 text-xs text-[#9aa0a6]">
                    Enter your Google identity to continue to SkillTrack
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#bdc1c6] mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customGoogleName}
                      onChange={(e) => {
                        setCustomGoogleName(e.target.value);
                        setCustomGoogleError('');
                      }}
                      placeholder="e.g. Avery Morgan"
                      className="w-full rounded-lg bg-[#303134] border border-[#5f6368] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#8ab4f8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#bdc1c6] mb-1">
                      Google Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={customGoogleEmail}
                      onChange={(e) => {
                        setCustomGoogleEmail(e.target.value);
                        setCustomGoogleError('');
                      }}
                      placeholder="you@gmail.com or you@company.com"
                      className="w-full rounded-lg bg-[#303134] border border-[#5f6368] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#8ab4f8]"
                    />
                  </div>

                  {customGoogleError && (
                    <div className="text-xs text-rose-400 flex items-center gap-1.5 pt-0.5">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{customGoogleError}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#3c4043]/50 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setGoogleStep('select')}
                    className="text-[#8ab4f8] hover:bg-[#8ab4f8]/10 px-4 py-2 rounded-full text-xs font-medium transition cursor-pointer"
                  >
                    Back to accounts
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-[#1a73e8] hover:bg-[#1b66c9] text-white px-6 py-2 text-xs font-medium transition cursor-pointer shadow-md"
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: AUTHENTIC GOOGLE CONSENT & PERMISSION SCREEN WITH CANCEL & CONTINUE BUTTONS */}
            {googleStep === 'consent' && selectedGoogleAccount && (
              <div className="p-6 pt-5">
                <div className="mb-4">
                  <h3 className="text-xl font-normal text-[#e8eaed]">
                    SkillTrack wants to access your Google Account
                  </h3>
                  <div className="mt-3 flex items-center gap-3 p-2.5 rounded-xl bg-[#303134] border border-[#3c4043]">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                      style={{ backgroundColor: selectedGoogleAccount.avatarColor }}
                    >
                      {selectedGoogleAccount.avatarText}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-[#e8eaed] truncate">
                        {selectedGoogleAccount.name}
                      </div>
                      <div className="text-[11px] text-[#9aa0a6] truncate">
                        {selectedGoogleAccount.email}
                      </div>
                    </div>
                    <CheckCircle2 size={16} className="text-[#8ab4f8] shrink-0" />
                  </div>
                </div>

                {/* Permissions Breakdown */}
                <div className="space-y-3 py-3 border-t border-b border-[#3c4043]">
                  <div className="text-xs font-medium text-[#bdc1c6]">
                    This will allow SkillTrack to:
                  </div>

                  <div className="flex items-start gap-3 text-xs text-[#e8eaed]">
                    <div className="mt-0.5 grid h-4 w-4 place-items-center text-[#8ab4f8] shrink-0">
                      <Check size={14} />
                    </div>
                    <span>See your primary Google Account email address</span>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-[#e8eaed]">
                    <div className="mt-0.5 grid h-4 w-4 place-items-center text-[#8ab4f8] shrink-0">
                      <Check size={14} />
                    </div>
                    <span>See your personal info, including any public profile details</span>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-[#e8eaed]">
                    <div className="mt-0.5 grid h-4 w-4 place-items-center text-[#8ab4f8] shrink-0">
                      <Shield size={14} />
                    </div>
                    <span>Associate your employee skills, certifications, and compliance status</span>
                  </div>
                </div>

                {/* Trust Notice */}
                <div className="mt-4 text-[11px] text-[#9aa0a6] leading-relaxed">
                  Make sure you trust SkillTrack. You may be sharing sensitive info with this site or app. Learn how Google helps you share data safely.
                </div>

                {/* CANCEL AND CONTINUE BUTTONS */}
                <div className="mt-6 pt-4 border-t border-[#3c4043]/50 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setGoogleStep('select')}
                    className="rounded-full px-5 py-2.5 text-xs font-medium text-[#8ab4f8] hover:bg-[#8ab4f8]/10 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmGoogleLogin}
                    className="rounded-full bg-[#1a73e8] hover:bg-[#1b66c9] text-white px-7 py-2.5 text-xs font-medium shadow-md transition cursor-pointer flex items-center gap-2"
                  >
                    <span>Continue</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SIGNING IN ANIMATION */}
            {googleStep === 'signing-in' && selectedGoogleAccount && (
              <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#1a73e8] border-t-transparent" />
                <div>
                  <h4 className="text-base font-medium text-white">
                    Signing in to SkillTrack…
                  </h4>
                  <p className="mt-1 text-xs text-[#9aa0a6]">
                    Connecting as <span className="text-[#8ab4f8]">{selectedGoogleAccount.email}</span>
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setForgotOpen(false);
          }}
        >
          <div className="w-full max-w-[420px] rounded-3xl bg-[#0f1523] border border-white/15 p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setForgotOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#171f30] border border-white/10 text-[#F26207]">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="font-[Manrope] text-base font-extrabold text-white">
                  Reset Password
                </h3>
                <p className="text-[11px] text-slate-400">
                  Secured recovery link for corporate accounts
                </p>
              </div>
            </div>

            {forgotSent ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-orange-500/15 border border-orange-500/30 p-4 text-xs text-orange-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> Recovery Link Dispatched
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Please check the inbox for <strong className="underline text-white">{forgotEmail}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setForgotOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full rounded-xl bg-slate-800 border border-white/10 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="mt-5 space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter your registered work email and our security system will send a one-time cryptographic reset token.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-xl auth-input px-3.5 py-2.5 text-xs outline-none"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl btn-primary-orange px-4 py-2.5 text-xs font-bold text-white cursor-pointer"
                  >
                    Send Recovery Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SSO Modal */}
      {ssoOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSsoOpen(false);
          }}
        >
          <div className="w-full max-w-[420px] rounded-3xl bg-[#0f1523] border border-white/15 p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setSsoOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#171f30] border border-white/10 text-[#F26207]">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="font-[Manrope] text-base font-extrabold text-white">
                  Enterprise Single Sign-On
                </h3>
                <p className="text-[11px] text-slate-400">
                  Authenticate via Okta, Azure AD, or SAML 2.0
                </p>
              </div>
            </div>

            <form onSubmit={handleSsoSubmit} className="mt-5 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your company identity domain to be redirected to your centralized identity provider.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Company Domain
                </label>
                <input
                  type="text"
                  required
                  value={ssoDomain}
                  onChange={(e) => setSsoDomain(e.target.value)}
                  placeholder="acme.com"
                  className="w-full rounded-xl auth-input px-3.5 py-2.5 text-xs outline-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setSsoOpen(false)}
                  className="rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl btn-primary-orange px-4 py-2.5 text-xs font-bold text-white cursor-pointer"
                >
                  Continue to SSO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
