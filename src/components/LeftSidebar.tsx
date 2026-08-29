import React from 'react';
import { Cpu, Zap, History, Sliders, ShieldCheck, FileCode2 } from 'lucide-react';
import { UserHardwareSpecs } from '../types';
import { STARTER_PROMPTS } from '../data/gamingKnowledge';

interface LeftSidebarProps {
  userSpecs: UserHardwareSpecs;
  onOpenSpecsModal: () => void;
  onSelectPrompt: (text: string) => void;
  activeTab: string;
  setActiveTab: (tab: 'chat' | 'optimizer' | 'config' | 'fixes' | 'logs') => void;
  recentSearches?: string[];
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  userSpecs,
  onOpenSpecsModal,
  onSelectPrompt,
  activeTab,
  setActiveTab,
  recentSearches = [],
}) => {

  return (
    <aside className="w-64 shrink-0 border-r border-white/10 bg-[#0c0c0e]/80 p-4 flex flex-col justify-between select-none overflow-y-auto hidden lg:flex">
      <div className="space-y-6">
        {/* Hardware Profile Box */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Hardware Profile
            </h2>
            <button
              onClick={onOpenSpecsModal}
              className="text-[9px] font-mono text-green-400 hover:underline uppercase"
            >
              Configure
            </button>
          </div>

          <div
            onClick={onOpenSpecsModal}
            className="space-y-3 bg-white/5 p-3 rounded-lg border border-white/5 hover:border-green-500/30 transition cursor-pointer group"
          >
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold font-mono">GPU</span>
              <span className="text-sm font-mono text-green-400 leading-tight truncate group-hover:text-green-300">
                {userSpecs.gpu.replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '')}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold font-mono">CPU</span>
              <span className="text-sm font-mono text-slate-200 leading-tight truncate">
                {userSpecs.cpu}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold font-mono">RAM</span>
              <span className="text-sm font-mono text-slate-300 leading-tight truncate">
                {userSpecs.ram}
              </span>
            </div>

            <div className="flex flex-col pt-1 border-t border-white/5">
              <span className="text-[10px] text-slate-500 uppercase font-bold font-mono">TARGET DISPLAY</span>
              <span className="text-xs font-mono text-cyan-400 leading-tight">
                {userSpecs.resolution.split(' ')[0]} @ {userSpecs.refreshRate}
              </span>
            </div>
          </div>

          {/* Quick Config Tool Trigger */}
          <button
            onClick={() => setActiveTab('config')}
            className={`w-full mt-2.5 p-2.5 rounded-lg border text-left transition flex items-center justify-between group cursor-pointer ${
              activeTab === 'config'
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'bg-cyan-950/30 border-cyan-500/20 text-slate-300 hover:bg-cyan-900/40 hover:border-cyan-500/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-cyan-400 group-hover:rotate-6 transition-transform" />
              <div>
                <div className="text-[11px] font-mono font-bold text-white leading-tight">
                  Config Generator
                </div>
                <div className="text-[9px] font-mono text-cyan-400">
                  .ini / .cfg / .json AI
                </div>
              </div>
            </div>
            <span className="text-cyan-400 font-mono text-xs group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </button>

          {/* Error Code Lookup Engine Trigger */}
          <button
            onClick={() => setActiveTab('fixes')}
            className={`w-full mt-2 p-2.5 rounded-lg border text-left transition flex items-center justify-between group cursor-pointer ${
              activeTab === 'fixes'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-emerald-950/30 border-emerald-500/20 text-slate-300 hover:bg-emerald-900/40 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-[11px] font-mono font-bold text-white leading-tight">
                  Error Code Engine
                </div>
                <div className="text-[9px] font-mono text-emerald-400">
                  DirectX, DLL & Crash AI
                </div>
              </div>
            </div>
            <span className="text-emerald-400 font-mono text-xs group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </button>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-500" />
                Recent Searches
              </h2>
            </div>
            <div className="space-y-1.5">
              {recentSearches.map((search, idx) => (
                <button
                  key={`recent-${idx}`}
                  onClick={() => {
                    if (activeTab !== 'chat') setActiveTab('chat');
                    onSelectPrompt(search);
                  }}
                  className="w-full text-left p-2 rounded bg-white/5 hover:bg-white/10 hover:border-green-500/40 border border-transparent transition text-xs font-medium text-slate-300 hover:text-white flex items-center gap-2 group truncate"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-green-400 shrink-0 transition-colors" />
                  <span className="truncate">{search}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Diagnostic Presets & Sessions */}
        <div>
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-3">
            Quick Diagnostic Presets
          </h2>
          <div className="space-y-1.5">
            {STARTER_PROMPTS.slice(0, 5).map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (activeTab !== 'chat') setActiveTab('chat');
                  onSelectPrompt(preset.text);
                }}
                className="w-full text-left p-2 rounded bg-white/5 hover:bg-white/10 hover:border-green-500/40 border border-transparent transition text-xs font-medium text-slate-300 hover:text-white flex flex-col group"
              >
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase mb-0.5">
                  <span className="text-green-400 font-bold">{preset.tag}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition text-green-400">&rarr;</span>
                </div>
                <span className="truncate leading-tight">{preset.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Diagnostic Status */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-2 p-2 rounded bg-white/5 text-[10px] font-mono text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-green-400 shrink-0" />
          <span>Vanguard / EAC / DirectX Sandbox Ready</span>
        </div>
      </div>

    </aside>
  );
};
