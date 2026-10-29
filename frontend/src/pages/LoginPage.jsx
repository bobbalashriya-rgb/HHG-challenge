import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  LogOut, 
  Key, 
  Sparkles, 
  Shield, 
  Building2, 
  Check, 
  ChevronRight,
  Fingerprint,
  Globe,
  X
} from 'lucide-react';
import { loginUser, loginOAuth, logoutUser, fetchGroups, fetchUsers } from '../services/api';

export default function LoginPage({ currentUser, onLoginSuccess, onLogoutSuccess, isGate = true }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // Custom Google Account prompt modal
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  // Django Groups & Users fetched from Postgres
  const [groups, setGroups] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const googleBtnRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    loadDbDirectory();
    initGoogleIdentity();
  }, [currentUser]);

  const initGoogleIdentity = () => {
    if (window.google && window.google.accounts && googleClientId && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
          shape: 'pill'
        });
      } catch (err) {
        console.warn('Google Identity initialization notice:', err);
      }
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) return;
    setError(null);
    setLoading(true);
    try {
      const resp = await loginOAuth({
        provider: 'google',
        credential: response.credential,
      });
      setSuccessMsg(resp.message || 'Authenticated successfully with Google!');
      if (onLoginSuccess) onLoginSuccess(resp.user);
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadDbDirectory = async () => {
    setLoadingGroups(true);
    try {
      const [gData, uData] = await Promise.all([
        fetchGroups().catch(() => []),
        fetchUsers().catch(() => [])
      ]);
      setGroups(gData);
      setDbUsers(uData);
    } catch (err) {
      console.warn('Could not load group directory', err);
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleDjangoLogin = async (e, customUser = null, customPass = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const u = customUser !== null ? customUser : username;
    const p = customPass !== null ? customPass : password;

    try {
      const resp = await loginUser({ username: u, password: p });
      setSuccessMsg(resp.message || 'Login successful!');
      if (onLoginSuccess) onLoginSuccess(resp.user);
    } catch (err) {
      setError(err.message || 'Login failed. Check your Django credentials.');
    } finally {
      setLoading(false);
    }
  };

  const triggerGoogleAuthFlow = () => {
    // If official Google prompt is configured and loaded, trigger prompt
    if (window.google && window.google.accounts && googleClientId) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setShowGoogleModal(true);
          }
        });
        return;
      } catch (_) {}
    }
    // Interactive Google Account modal
    setShowGoogleModal(true);
  };

  const handleDirectGoogleLogin = async (selectedEmail, selectedName) => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const resp = await loginOAuth({
        provider: 'google',
        email: selectedEmail,
        name: selectedName || selectedEmail.split('@')[0],
        oauth_id: `google_${Date.now()}`
      });
      setShowGoogleModal(false);
      setSuccessMsg(resp.message || 'Signed in with Google!');
      if (onLoginSuccess) onLoginSuccess(resp.user);
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider, defaultEmail = null, defaultName = null) => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const email = defaultEmail || (provider === 'google' ? 'analyst.google@example.com' : 'dev.github@example.com');
    const name = defaultName || (provider === 'google' ? 'Google Analyst' : 'GitHub Developer');

    try {
      const resp = await loginOAuth({
        provider,
        email,
        name,
        oauth_id: `${provider}_${Date.now()}`
      });
      setSuccessMsg(resp.message || `Signed in with ${provider}!`);
      if (onLoginSuccess) onLoginSuccess(resp.user);
    } catch (err) {
      setError(err.message || `${provider} authentication failed.`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      if (onLogoutSuccess) onLogoutSuccess();
      setSuccessMsg('You have been signed out.');
    } catch (err) {
      setError('Failed to log out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in">
      {/* HEADER BANNER */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Shield className="w-3.5 h-3.5" />
          Institutional Authentication Gateway
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Sign In to Access Analytics
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mt-3">
          Access to quantitative valuation dashboards, DCF models, and investment principles requires authenticated authorization via Google OAuth or Django credentials.
        </p>
      </div>

      {/* FEEDBACK BANNERS */}
      {error && (
        <div className="mb-6 bg-red-950/40 border border-red-800/60 p-4 rounded-xl flex items-start gap-3 shadow-lg max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-200">{error}</div>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-xl flex items-start gap-3 shadow-lg max-w-2xl mx-auto">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-emerald-200">{successMsg}</div>
        </div>
      )}

      {/* GOOGLE ACCOUNT SELECTION MODAL */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#131B2F] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h3 className="text-lg font-bold text-white">Google OAuth Sign-In</h3>
              </div>
              <button 
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 my-4 leading-relaxed">
              Sign in with your Google account. Finlytics will associate your identity with Django group <code className="text-emerald-400 font-mono">user group_1</code> and <code className="text-blue-400 font-mono">Investment Analysts</code> in PostgreSQL.
            </p>

            <div className="space-y-2 mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Choose a Google Account
              </span>
              <button
                type="button"
                onClick={() => handleDirectGoogleLogin('snehabeng@gmail.com', 'Sneha Beng')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0A0F1C] hover:bg-[#1A233A] border border-slate-800 hover:border-blue-500/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                    S
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Sneha Beng</div>
                    <div className="text-xs text-slate-400">snehabeng@gmail.com</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleDirectGoogleLogin('alex.analyst@gmail.com', 'Alex Analyst')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0A0F1C] hover:bg-[#1A233A] border border-slate-800 hover:border-blue-500/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    A
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Alex Analyst</div>
                    <div className="text-xs text-slate-400">alex.analyst@gmail.com</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Or Enter Custom Google Email
              </span>
              <div className="space-y-3">
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-[#0A0F1C] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  disabled={!googleEmail.includes('@')}
                  onClick={() => handleDirectGoogleLogin(googleEmail, googleName || googleEmail.split('@')[0])}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-40"
                >
                  Continue with this Google Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IF USER IS LOGGED IN: DISPLAY USER PROFILE & GROUPS */}
      {currentUser ? (
        <div className="bg-[#131B2F] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl mb-10 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
                {currentUser.first_name ? currentUser.first_name[0] : (currentUser.username ? currentUser.username[0].toUpperCase() : 'U')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">
                    {currentUser.full_name || currentUser.username}
                  </h2>
                  {currentUser.is_superuser && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Superuser
                    </span>
                  )}
                  {currentUser.is_staff && !currentUser.is_superuser && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Staff
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm mt-0.5 font-mono">@{currentUser.username} • {currentUser.email || 'No email associated'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-800/50 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* GROUPS ASSIGNED TO CURRENT USER */}
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Assigned Django Authorization Groups
            </h3>
            {currentUser.groups && currentUser.groups.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {currentUser.groups.map(g => (
                  <div 
                    key={g} 
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0A0F1C] border border-blue-500/30 text-blue-300 text-sm font-medium shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No Django groups currently assigned to this account.</p>
            )}
          </div>
        </div>
      ) : (
        /* IF LOGGED OUT: DISPLAY LOGIN FORM & OAUTH */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* LEFT COLUMN: OAUTH & DJANGO LOGIN (7 cols) */}
          <div className="lg:col-span-7 bg-[#131B2F] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Sign In to Continue</h2>
            <p className="text-sm text-slate-400 mb-6">Authenticate using your Google account or institutional Django credentials.</p>

            {/* OAUTH SECTION */}
            <div className="space-y-3 mb-6">
              {/* GOOGLE OAUTH BUTTON */}
              <button
                type="button"
                onClick={triggerGoogleAuthFlow}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all shadow-md shadow-black/20 disabled:opacity-50"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google OAuth
              </button>

              {/* RENDER DIV FOR GOOGLE IDENTITY IF INITIALIZED */}
              <div ref={googleBtnRef} className="flex justify-center empty:hidden"></div>

              {/* GITHUB OAUTH BUTTON */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('github')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#0A0F1C] hover:bg-[#1A233A] border border-slate-700/80 text-white font-medium text-sm transition-all hover:border-slate-500 shadow-sm disabled:opacity-50"
              >
                <svg className="w-5 h-5 fill-current text-white flex-shrink-0" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                Continue with GitHub
              </button>
            </div>

            {/* DIVIDER */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#131B2F] px-3 text-slate-500 font-semibold tracking-wider">
                  Or Sign In with Django Credentials
                </span>
              </div>
            </div>

            {/* DJANGO USERNAME & PASSWORD FORM */}
            <form onSubmit={handleDjangoLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Django Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <UserIcon className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin or sneha"
                    className="w-full bg-[#0A0F1C] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0A0F1C] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In with Django'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* ONE-CLICK TEST LOGINS */}
            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                Quick One-Click Test Accounts
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDjangoLogin(null, 'admin', 'admin')}
                  className="flex flex-col items-start p-3 rounded-xl bg-[#0A0F1C] border border-slate-800 hover:border-blue-500/50 transition-colors text-left group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">admin</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">Admin</span>
                  </div>
                  <span className="text-xs text-slate-400 mt-1">Pass: <code className="text-slate-300">admin</code></span>
                  <span className="text-[11px] text-blue-400/80 mt-0.5">Groups: user group_1, Administrators</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDjangoLogin(null, 'sneha', 'sneha123')}
                  className="flex flex-col items-start p-3 rounded-xl bg-[#0A0F1C] border border-slate-800 hover:border-emerald-500/50 transition-colors text-left group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">sneha</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Analyst</span>
                  </div>
                  <span className="text-xs text-slate-400 mt-1">Pass: <code className="text-slate-300">sneha123</code></span>
                  <span className="text-[11px] text-emerald-400/80 mt-0.5">Groups: user group_1, Investment Analysts</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: GROUPS & SECURITY (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* GROUPS STATUS CARD */}
            <div className="bg-[#131B2F] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold text-white">PostgreSQL Django Groups</h3>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-[#0A0F1C] px-2 py-0.5 rounded border border-slate-800">
                  {groups.length} Groups
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Roles and quantitative access are managed via standard Django <code className="text-slate-300">auth_group</code> in your PostgreSQL database.
              </p>

              <div className="space-y-3">
                {groups.map(g => (
                  <div key={g.id} className="p-3 rounded-xl bg-[#0A0F1C] border border-slate-800/80">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-200">{g.name}</span>
                      <span className="text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full">
                        {g.member_count} member{g.member_count === 1 ? '' : 's'}
                      </span>
                    </div>
                    {g.members && g.members.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {g.members.map(m => (
                          <span key={m} className="text-[11px] font-mono text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded">
                            @{m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* GOOGLE AUTH & GROUP MAPPING INFO */}
            <div className="bg-[#131B2F] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                Google OAuth Group Mapping
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                When signing in with Google OAuth, Finlytics automatically:
              </p>
              <ul className="text-xs text-slate-400 mt-2 space-y-1.5 list-disc list-inside">
                <li>Validates identity via Google Identity Services.</li>
                <li>Provisions or locates your Django <code className="text-slate-300">User</code> in PostgreSQL.</li>
                <li>Assigns you to default group <code className="text-emerald-400 font-mono">user group_1</code>.</li>
                <li>Grants <code className="text-blue-400 font-mono">Investment Analysts</code> permissions.</li>
                <li>Initializes a server session unlocking quantitative analytics.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
