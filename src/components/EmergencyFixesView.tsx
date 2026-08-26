import React, { useState } from 'react';
import { Terminal, Search, Copy, Check, AlertCircle, Wrench, Lightbulb, ShieldCheck, Zap } from 'lucide-react';
import { ERROR_DATABASE } from '../data/gamingKnowledge';
import { ErrorDatabaseEntry } from '../types';

export const EmergencyFixesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string>(ERROR_DATABASE[0].id);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const categories = [
    'All',
    'DLL & Runtime',
    'Anti-Cheat & Launchers',
    'DirectX & GPU',
    'GPU & Drivers',
    'Launchers & Stores',
    'Network & Ping',
    'Controllers & Peripherals',
    'Legacy & Compatibility',
    'Modding & Addons',
    'Low-End PC Optimization',
    'Thermal & Hardware',
    'Windows Tweaks',
  ];

  const filteredErrors = ERROR_DATABASE.filter((entry) => {
    const matchesCategory = selectedCategory === 'All' || entry.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.symptoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.affectedGames.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0c0c0e] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-green-500 text-black flex items-center justify-center font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]">
              <Terminal className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-black tracking-tight text-white uppercase italic">
              Emergency Error & Crash Fix Database
            </h1>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-green-400 font-bold uppercase">
              1-Click Solutions
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Instant verified resolution protocols for DirectX DXGI crashes, missing MSVCP140 DLLs, Riot Vanguard VAN 128, and high packet loss.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <ShieldCheck className="w-4 h-4 text-green-400" />
          <span>OFFLINE CACHED V4.2</span>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="error-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by error code (e.g. 0xc000007b, VAN 128, DXGI_ERROR_DEVICE_REMOVED, ping, stutter)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#0c0c0e] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition border ${
                selectedCategory === cat
                  ? 'bg-green-500 text-black font-bold border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                  : 'bg-[#0c0c0e] border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Error Grid & Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Error Code List */}
        <div className="space-y-1.5 lg:max-h-[600px] overflow-y-auto pr-1">
          {filteredErrors.map((err) => {
            const isSelected = expandedId === err.id;
            return (
              <button
                key={err.id}
                onClick={() => setExpandedId(err.id)}
                className={`w-full text-left p-3 rounded-xl border transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#18181b] border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)] text-white'
                    : 'bg-[#0c0c0e] border-white/5 text-slate-300 hover:border-white/20 hover:bg-[#18181b]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-green-400">
                    {err.code}
                  </span>
                  <span
                    className={`text-[8px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                      err.severity === 'Critical'
                        ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                        : err.severity === 'High'
                        ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {err.severity}
                  </span>
                </div>
                <div className="text-xs font-semibold line-clamp-1">{err.title}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                  Games: {err.affectedGames.join(', ')}
                </div>
              </button>
            );
          })}

          {filteredErrors.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-500 bg-[#0c0c0e] rounded-xl border border-white/10">
              No matching errors found. Try asking GameFix AI directly in Live Support!
            </div>
          )}
        </div>

        {/* Selected Error Full Solution View */}
        <div className="lg:col-span-2">
          {(() => {
            const activeErr = ERROR_DATABASE.find((e) => e.id === expandedId) || ERROR_DATABASE[0];
            return (
              <div className="p-4 sm:p-5 rounded-xl bg-[#0c0c0e] border border-white/10 space-y-4">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                        {activeErr.code}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{activeErr.category}</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-white mt-1.5">
                      {activeErr.title}
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Verified for: <strong className="text-green-400">{activeErr.affectedGames.join(', ')}</strong>
                  </span>
                </div>

                {/* Quick Cause */}
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest font-mono block mb-0.5">
                        Quick Cause Assessment
                      </span>
                      <p className="text-xs sm:text-sm text-slate-200">{activeErr.quickCause}</p>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Fix */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    <Wrench className="w-3.5 h-3.5 text-green-400" />
                    <span>Ordered Step-by-Step Fix</span>
                  </div>

                  <div className="space-y-1.5">
                    {activeErr.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#18181b] border border-white/5 flex items-start gap-3"
                      >
                        <span className="w-5 h-5 rounded bg-white/5 text-green-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-300 leading-normal">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Command Snippet (if available) */}
                {activeErr.commandSnippet && (
                  <div className="p-3 rounded-lg bg-[#18181b] border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-green-400" />
                        Admin Command Line Fix
                      </span>
                      <button
                        onClick={() => handleCopy(activeErr.commandSnippet!)}
                        className="flex items-center gap-1 text-xs font-mono font-semibold text-slate-300 hover:text-green-400 transition"
                      >
                        {copiedCommand === activeErr.commandSnippet ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-green-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Command</span>
                          </>
                        )}
                      </button>
                    </div>
                    <code className="block p-2 rounded bg-[#09090b] border border-white/10 font-mono text-xs text-green-400 overflow-x-auto">
                      {activeErr.commandSnippet}
                    </code>
                  </div>
                )}

                {/* Pro-Tip */}
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest font-mono block mb-0.5">
                      PRO-TIP / OPTIMIZATION NOTE
                    </span>
                    <p className="text-xs text-slate-300">{activeErr.proTip}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
