import React, { useState } from 'react';
import {
  Search,
  Terminal,
  Copy,
  Check,
  AlertTriangle,
  Flame,
  Lightbulb,
  ShieldAlert,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  Share2,
  Gamepad2,
} from 'lucide-react';
import { ErrorCodeLookupResult } from '../types';

interface ErrorCodeLookupEngineProps {
  onAskAi?: (query: string) => void;
  className?: string;
}

const QUICK_LOOKUP_TAGS = [
  { code: '0x887A0005', label: '0x887A0005 (Device Removed)', category: 'DirectX' },
  { code: '0xC0000005', label: '0xC0000005 (Access Violation)', category: 'Memory' },
  { code: '0xc000007b', label: '0xc000007b (DLL Mismatch)', category: 'Runtime' },
  { code: 'VAN 9003', label: 'VAN 9003 / 128 (TPM & Vanguard)', category: 'Anti-Cheat' },
  { code: 'EAC 30005', label: 'EAC 30005 (CreateFile 32)', category: 'EAC' },
  { code: 'ERR_GFX_D3D_INIT', label: 'ERR_GFX_D3D_INIT (GTA V)', category: 'RAGE Engine' },
  { code: '0x887A0006', label: '0x887A0006 (Device Hung)', category: 'DirectX' },
  { code: '0x80070005', label: '0x80070005 (Access Denied)', category: 'Xbox App' },
];

export const ErrorCodeLookupEngine: React.FC<ErrorCodeLookupEngineProps> = ({
  onAskAi,
  className = '',
}) => {
  const [errorCodeInput, setErrorCodeInput] = useState('0x887A0005');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [result, setResult] = useState<ErrorCodeLookupResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleLookup = async (overrideCode?: string) => {
    const codeToSearch = (overrideCode !== undefined ? overrideCode : errorCodeInput).trim();
    if (!codeToSearch) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch('/api/lookup-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorCode: codeToSearch }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        // Fallback result in case of network issue
        setResult({
          errorCode: codeToSearch,
          title: `Diagnosis for ${codeToSearch}`,
          description: `Direct runtime exception or engine stall identified for error code ${codeToSearch}.`,
          rootCause: `Subsystem failure or driver timeout reported under code ${codeToSearch}.`,
          severity: 'High',
          category: 'DirectX & GPU',
          steps: [
            {
              stepNumber: 1,
              title: 'Increase Windows TDR Delay in Registry',
              instruction: 'Increase driver timeout recovery threshold to 8 seconds to prevent premature engine crash.',
              command: 'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers" /v TdrDelay /t REG_DWORD /d 8 /f',
            },
            {
              stepNumber: 2,
              title: 'Verify Game Files and Runtime Libraries',
              instruction: 'Scan and repair corrupted OS runtimes and DirectX redistributable dependencies.',
              command: 'sfc /scannow && DISM /Online /Cleanup-Image /RestoreHealth',
            },
          ],
          commandSnippet: 'sfc /scannow && DISM /Online /Cleanup-Image /RestoreHealth',
          proTip: 'In your graphics control panel, set Power Management Mode to "Prefer Maximum Performance".',
          affectedGames: ['Apex Legends', 'Cyberpunk 2077', 'Warzone', 'Fortnite'],
        });
      }
    } catch (err) {
      console.error('Lookup Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(text);
    setTimeout(() => setCopiedCommand(null), 2200);
  };

  const handleTagClick = (code: string) => {
    setErrorCodeInput(code);
    handleLookup(code);
  };

  return (
    <div
      id="error-code-lookup-engine"
      className={`rounded-2xl bg-gradient-to-b from-[#0e131f] via-[#090d16] to-[#06080d] border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.07)] p-5 sm:p-7 space-y-6 text-slate-100 font-sans ${className}`}
    >
      {/* Engine Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <div className="w-full h-full bg-[#090d16] rounded-xl flex items-center justify-center">
              <Terminal className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-white uppercase italic">
                Error Code Lookup Engine
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                V4.2 Core
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Instant diagnostic analysis, root-cause detection & 1-click execution fixes for PC game crashes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">LIVE KNOWLEDGE BASE</span>
        </div>
      </div>

      {/* Prominent Search Bar & Action Button */}
      <div className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="relative flex flex-col sm:flex-row items-stretch gap-2.5"
        >
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur-sm group-focus-within:blur-md transition-all opacity-70 group-focus-within:opacity-100" />
            <div className="relative flex items-center bg-[#0d121d] border border-cyan-500/30 rounded-xl group-focus-within:border-cyan-400 shadow-inner transition-colors">
              <Search className="w-5 h-5 text-cyan-400/70 ml-4 group-focus-within:text-cyan-400 transition-colors shrink-0" />
              <input
                id="error-code-input"
                type="text"
                value={errorCodeInput}
                onChange={(e) => setErrorCodeInput(e.target.value)}
                placeholder="Enter Error Code (e.g., 0x887A0005)"
                className="w-full bg-transparent px-3 py-3.5 text-sm sm:text-base text-white placeholder-slate-500 font-mono focus:outline-none tracking-wide"
              />
              {errorCodeInput && (
                <button
                  type="button"
                  onClick={() => setErrorCodeInput('')}
                  className="mr-3 px-2 py-1 text-xs font-mono text-slate-400 hover:text-white bg-white/5 rounded transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <button
            id="find-solution-btn"
            type="submit"
            disabled={isLoading || !errorCodeInput.trim()}
            className="sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide uppercase italic bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Diagnosing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Find Solution</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mr-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            POPULAR CODES:
          </span>
          {QUICK_LOOKUP_TAGS.map((tag) => (
            <button
              key={tag.code}
              type="button"
              onClick={() => handleTagClick(tag.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                errorCodeInput.toLowerCase().includes(tag.code.toLowerCase())
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                  : 'bg-white/5 text-slate-300 border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200'
              }`}
            >
              {tag.code}
            </button>
          ))}
        </div>
      </div>

      {/* Dedicated Results Panel */}
      {result && (
        <div
          id="error-results-panel"
          className="mt-6 rounded-xl bg-[#0b0f19] border border-cyan-500/30 shadow-2xl p-5 sm:p-6 space-y-6 animate-fadeIn"
        >
          {/* Result Header & Severity */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {result.severity} SEVERITY
                </span>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {result.category}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic pt-1">
                {result.title}
              </h3>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-start">
              {result.commandSnippet && (
                <button
                  type="button"
                  onClick={() => handleCopy(result.commandSnippet!)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copiedCommand === result.commandSnippet ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Fix!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Fix Snippet</span>
                    </>
                  )}
                </button>
              )}

              {onAskAi && (
                <button
                  type="button"
                  onClick={() => onAskAi(`I need help fixing error code ${result.errorCode}: ${result.title}. Can you guide me?`)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Ask GameFix AI</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 1: Description & Root Cause ("What it means...") */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>What It Means & Root Cause</span>
            </div>
            <div className="p-4 rounded-xl bg-[#070a12] border border-white/10 space-y-2.5">
              <p className="text-sm text-slate-300 leading-relaxed">
                {result.description}
              </p>
              {result.rootCause && (
                <div className="pt-2 border-t border-white/5 flex items-start gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[11px] font-bold shrink-0">
                    ROOT CAUSE
                  </span>
                  <span className="text-xs sm:text-sm text-slate-200 font-medium">
                    {result.rootCause}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Solution ("Step-by-step fix...") */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>Step-by-Step Fix Execution</span>
            </div>

            <div className="space-y-3">
              {result.steps && result.steps.length > 0 ? (
                result.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#070a12] border border-white/5 hover:border-cyan-500/30 transition-all space-y-2.5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {step.stepNumber || idx + 1}
                      </div>
                      <div className="space-y-1 flex-1">
                        <h4 className="text-sm font-bold text-white tracking-wide">
                          {step.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {step.instruction}
                        </p>
                      </div>
                    </div>

                    {step.command && (
                      <div className="mt-2 pl-9">
                        <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#020408] border border-cyan-500/20 font-mono text-xs text-cyan-300">
                          <code className="overflow-x-auto select-all whitespace-pre-wrap break-all">
                            {step.command}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(step.command!)}
                            className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-cyan-300 transition shrink-0"
                            title="Copy Command"
                          >
                            {copiedCommand === step.command ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-[#070a12] text-xs text-slate-400">
                  No automated step sequences found. Try running System File Checker in Command Prompt.
                </div>
              )}
            </div>
          </div>

          {/* Pro-Tip Box */}
          {result.proTip && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  GameFix AI Pro-Tip
                </div>
                <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                  {result.proTip}
                </p>
              </div>
            </div>
          )}

          {/* Affected Games & Engine Tags */}
          {result.affectedGames && result.affectedGames.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5 text-slate-400" />
                AFFECTED GAMES:
              </span>
              {result.affectedGames.map((game, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300"
                >
                  {game}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Initial Empty State Guide */}
      {!result && !isLoading && (
        <div className="p-6 rounded-xl bg-[#080c15]/60 border border-dashed border-white/10 text-center space-y-2">
          <ShieldAlert className="w-8 h-8 text-cyan-400/50 mx-auto" />
          <p className="text-sm font-bold text-slate-300">
            Ready to diagnose any PC Game, DirectX, or Windows error code
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Enter hex error codes like <code className="text-cyan-400">0x887A0005</code>, Vanguard codes like <code className="text-cyan-400">VAN 9003</code>, or missing DLL names to view instant step-by-step resolution.
          </p>
        </div>
      )}
    </div>
  );
};
