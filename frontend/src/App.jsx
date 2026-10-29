import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import { BarChart3, Search, BookOpen, Building2, User, ShieldCheck, LogIn, Lock, LogOut } from 'lucide-react';
import { fetchCurrentUser, logoutUser } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, single, config, directory, auth
  const [resetKey, setResetKey] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check initial session / local storage
    fetchCurrentUser().then(user => {
      if (user) setCurrentUser(user);
      setAuthChecked(true);
    }).catch(() => {
      setAuthChecked(true);
    });
  }, []);

  const handleNav = (tab) => {
    setActiveTab(tab);
    setResetKey((prev) => prev + 1);
  };

  const handleSignOut = async () => {
    await logoutUser();
    setCurrentUser(null);
    setActiveTab('auth');
  };

  // Minimal loading screen while checking server authentication
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-[#3B82F6] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30 animate-pulse">
            F
          </div>
          <div className="text-slate-400 text-sm font-medium">Verifying authorization...</div>
        </div>
      </div>
    );
  }

  // GATEKEEPER: If user is not authenticated, show Login Page first before any analytics
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] font-sans text-slate-50 selection:bg-blue-500/30">
        <header className="border-b border-slate-800/60 sticky top-0 z-10 bg-[#0A0F1C]/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#3B82F6] rounded-md flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">F</div>
              <h1 className="text-xl font-bold text-white tracking-tight">Finlytics AI</h1>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              Authentication Required
            </div>
          </div>
        </header>

        <main>
          <LoginPage 
            currentUser={null} 
            isGate={true}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setActiveTab('overview');
            }} 
          />
        </main>
      </div>
    );
  }

  // AUTHENTICATED: Full Access to Analytics & Dashboards
  return (
    <div className="min-h-screen bg-[#0A0F1C] font-sans text-slate-50 selection:bg-blue-500/30">
      <header className="border-b border-slate-800/60 sticky top-0 z-10 bg-[#0A0F1C]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={() => handleNav('overview')}>
            <div className="w-8 h-8 bg-[#3B82F6] rounded-md flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">F</div>
            <h1 className="text-xl font-bold text-white tracking-tight">Finlytics AI</h1>
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto py-1 no-scrollbar">
            <nav className="flex space-x-1">
              <button 
                onClick={() => handleNav('overview')}
                className={`flex items-center gap-2 text-sm px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                <BarChart3 className="w-4 h-4" />
                Overview
              </button>
              <button 
                onClick={() => handleNav('single')}
                className={`flex items-center gap-2 text-sm px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'single' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                <Search className="w-4 h-4" />
                Company Deep Dive
              </button>
              <button 
                onClick={() => handleNav('directory')}
                className={`flex items-center gap-2 text-sm px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'directory' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                <Building2 className="w-4 h-4" />
                Company Directory
              </button>
              <button 
                onClick={() => handleNav('config')}
                className={`flex items-center gap-2 text-sm px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'config' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                <BookOpen className="w-4 h-4" />
                Investment Principles
              </button>
              <button 
                onClick={() => handleNav('auth')}
                className={`flex items-center gap-2 text-sm px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'auth' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                <ShieldCheck className="w-4 h-4" />
                OAuth & Groups
              </button>
            </nav>

            {/* USER PROFILE PILL */}
            <div className="pl-2 border-l border-slate-800 flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleNav('auth')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#131B2F] border border-slate-700/80 hover:border-blue-500/50 transition-colors text-xs"
                title="View account & assigned groups"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
                  {currentUser.first_name ? currentUser.first_name[0] : (currentUser.username ? currentUser.username[0].toUpperCase() : 'U')}
                </div>
                <span className="font-semibold text-slate-200 max-w-[100px] truncate">{currentUser.username}</span>
                {currentUser.groups && currentUser.groups.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">
                    {currentUser.groups[0]}
                  </span>
                )}
              </button>

              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg hover:bg-red-950/40 text-slate-400 hover:text-red-300 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {activeTab === 'auth' ? (
          <LoginPage 
            currentUser={currentUser} 
            isGate={false}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setActiveTab('overview');
            }}
            onLogoutSuccess={() => {
              setCurrentUser(null);
            }}
          />
        ) : (
          <Dashboard externalMode={activeTab} setExternalMode={setActiveTab} resetKey={resetKey} />
        )}
      </main>
    </div>
  );
}

export default App;
