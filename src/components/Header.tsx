import React from 'react';
import { ShieldCheck, Cpu, Flame, Terminal, FileText, Gamepad2, Volume2, VolumeX, Sparkles, Activity, Globe } from 'lucide-react';
import { UserHardwareSpecs } from '../types';

interface HeaderProps {
  activeTab: 'chat' | 'optimizer' | 'fixes' | 'logs';
  setActiveTab: (tab: 'chat' | 'optimizer' | 'fixes' | 'logs') => void;
  userSpecs: UserHardwareSpecs;
  onOpenSpecsModal: () => void;
  audioMuted: boolean;
  onToggleAudio: () => void;
  resolvedCount: number;
  showTelemetry: boolean;
  onToggleTelemetry: () => void;
  uiLang: 'tn' | 'en';
  onToggleUiLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userSpecs,
  onOpenSpecsModal,
  audioMuted,
  onToggleAudio,
  resolvedCount,
  showTelemetry,
  onToggleTelemetry,
  uiLang,
  onToggleUiLang,
}) => {
  const isTn = uiLang === 'tn';

  return (
    <header className="sticky top-0 z-30 bg-[#0c0c0e] border-b border-white/10 text-slate-100 select-none">
      <div className="w-full px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => setActiveTab('chat')}
          >
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)] group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.94 12.21 22 12 22C11.79 22 11.59 21.94 11.43 21.82L3.53 17.38C3.21 17.21 3 16.88 3 16.5V7.5C3 7.12 3.21 6.79 3.53 6.62L11.43 2.18C11.59 2.06 11.79 2 12 2C12.21 2 12.41 2.06 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5Z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none text-white">
                GameFix <span className="text-green-500">AI</span>
              </h1>
              <span className="text-[9px] font-mono text-slate-500 tracking-wider mt-0.5 hidden sm:block">
                {isTn ? 'تشخيص و تصليح ألعاب الـ PC و Console' : 'HIGH DENSITY GAMING DIAGNOSTICS'}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-[#18181b] p-1 rounded-lg border border-white/10">
            <button
              id="nav-tab-chat"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'chat'
                  ? 'bg-green-500 text-black font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isTn ? 'المساعد المباشر' : 'Live Support'}</span>
            </button>

            <button
              id="nav-tab-optimizer"
              onClick={() => setActiveTab('optimizer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'optimizer'
                  ? 'bg-green-500 text-black font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{isTn ? 'أوبتيمايزر FPS' : 'Settings Optimizer'}</span>
            </button>

            <button
              id="nav-tab-fixes"
              onClick={() => setActiveTab('fixes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'fixes'
                  ? 'bg-green-500 text-black font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{isTn ? 'حلول سريعة' : 'Instant Fixes'}</span>
            </button>

            <button
              id="nav-tab-logs"
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'logs'
                  ? 'bg-green-500 text-black font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isTn ? 'فحص الـ Crash' : 'Crash Logs'}</span>
            </button>
          </nav>

          {/* Right Status & Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Language Switcher */}
            <button
              id="language-switcher-btn"
              onClick={onToggleUiLang}
              title={isTn ? 'اللغة: تونسي (انقر للتغيير إلى الإنجليزية)' : 'Language: English (Click to switch to Tunisian)'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono transition group"
            >
              <Globe className="w-3.5 h-3.5 text-green-400 group-hover:rotate-12 transition-transform" />
              <span className="font-bold text-slate-200">
                {isTn ? '🇹🇳 تونسي' : '🇺🇸 English'}
              </span>
            </button>

            {/* Resolved Counter Badge */}
            {resolvedCount > 0 && (
              <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                <span>{resolvedCount} {isTn ? 'تم حلها' : 'FIXED'}</span>
              </div>
            )}

            {/* Telemetry Toggle */}
            <button
              id="toggle-telemetry-btn"
              onClick={onToggleTelemetry}
              title={isTn ? 'إظهار/إخفاء مراقب الحرارة والـ FPS' : 'Toggle Telemetry Monitor'}
              className={`p-1.5 rounded-lg border text-xs transition flex items-center gap-1 font-mono ${
                showTelemetry
                  ? 'bg-green-500/20 border-green-500/40 text-green-400'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span className="text-[10px] hidden sm:inline">{isTn ? 'تليميتري' : 'MONITOR'}</span>
            </button>

            {/* Audio Voice Toggle */}
            <button
              id="toggle-audio-btn"
              onClick={onToggleAudio}
              title={audioMuted ? (isTn ? 'الصوت مقفول' : 'Voice output muted') : (isTn ? 'الصوت يخدم' : 'Voice output active')}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition"
            >
              {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-green-400" />}
            </button>

            {/* Rig Profile Capsule */}
            <button
              id="open-rig-specs-btn"
              onClick={onOpenSpecsModal}
              title={isTn ? 'إعدادات ومواصفات الـ PC متاعك' : 'Configure PC Rig Hardware'}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-green-500/40 hover:bg-white/10 transition group text-left"
            >
              <Cpu className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
              <div className="hidden sm:block text-xs font-mono">
                <div className="font-bold text-slate-200 truncate max-w-[120px]">
                  {userSpecs.gpu.replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '')}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                  {userSpecs.ram.split(' ')[0]} • {userSpecs.resolution.split(' ')[0]}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
