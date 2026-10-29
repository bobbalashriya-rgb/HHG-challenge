import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import { BarChart3, Search, Settings, BookOpen, Building2 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, single, compare, config, directory
  const [resetKey, setResetKey] = useState(0);

  const handleNav = (tab) => {
    setActiveTab(tab);
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] font-sans text-slate-50 selection:bg-blue-500/30">
      <header className="border-b border-slate-800/60 sticky top-0 z-10 bg-[#0A0F1C]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={() => handleNav('overview')}>
            <div className="w-8 h-8 bg-[#3B82F6] rounded-md flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">F</div>
            <h1 className="text-xl font-bold text-white tracking-tight">Finlytics AI</h1>
          </div>
          <nav className="flex space-x-1 overflow-x-auto py-1 no-scrollbar">
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
          </nav>
        </div>
      </header>
      <main>
        <Dashboard externalMode={activeTab} setExternalMode={setActiveTab} resetKey={resetKey} />
      </main>
    </div>
  );
}

export default App;
