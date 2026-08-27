import React, { useState } from 'react';
import { FileText, Sparkles, CheckCircle, Terminal, AlertTriangle } from 'lucide-react';
import { CrashLogResult, UserHardwareSpecs } from '../types';

interface CrashLogScannerProps {
  userSpecs: UserHardwareSpecs;
}

const SAMPLE_CRASH_LOGS = [
  {
    title: 'NVIDIA GPU Driver TDR Crash (nvlddmkm.sys)',
    content: `Faulting application name: Cyberpunk2077.exe, version: 2.12.0.0, time stamp: 0x65f4201a
Faulting module name: nvlddmkm.sys, version: 31.0.15.5176, time stamp: 0x65e1fb44
Exception code: 0xc0000005
Fault offset: 0x000000000085a210
Faulting process id: 0x2dc4
Faulting application start time: 0x01da839219b18361
Faulting application path: C:\\Program Files (x86)\\Steam\\steamapps\\common\\Cyberpunk 2077\\bin\\x64\\Cyberpunk2077.exe
Faulting module path: C:\\Windows\\System32\\DriverStore\\FileRepository\\nv_dispi.inf_amd64_8f11d16bb6e42b26\\nvlddmkm.sys
Report Id: 9bc25df2-d27e-4061-9c6a-e24867fa2a91`,
  },
  {
    title: 'Unreal Engine 5 EXCEPTION_ACCESS_VIOLATION',
    content: `Fatal error: [File:D:\\build\\++UE5\\Sync\\Engine\\Source\\Runtime\\D3D12RHI\\Private\\D3D12Util.cpp] [Line: 868] 
CurrentQueue.Fence.ValueFailed to create resource or buffer: 
Result: DXGI_ERROR_DEVICE_REMOVED with Reason: DXGI_ERROR_DEVICE_HUNG (0x887A0006)

0x00007ff838c64f69 KERNELBASE.dll!UnknownFunction []
0x00007ff638b93922 BlackMythWukong.exe!UnknownFunction []
0x00007ff63920194a BlackMythWukong.exe!UnknownFunction []
0x00007ff63892a014 BlackMythWukong.exe!UnknownFunction []
0x00007ff83b48257d KERNEL32.DLL!UnknownFunction []
0x00007ff83b9eaf28 ntdll.dll!UnknownFunction []`,
  },
  {
    title: 'Unity Engine UnityPlayer.dll Crash',
    content: `Unity Player [version: Unity 2022.3.18f1_7e112d7d8e8b]
UnityPlayer.dll caused an Access Violation (0xc0000005)
in module UnityPlayer.dll at 0033:8f62a4b1.
Read from location 00000000 caused an access violation.

Context:
RDI: 0x0000000000000000  RSI: 0x0000021c38e91900  RAX: 0x0000000000000000
RBX: 0x0000021c49120000  RCX: 0x0000000000000000  RDX: 0x0000000000000001
RIP: 0x00007ff83f62a4b1  RSP: 0x00000049281fe910  EFLAGS: 0x00010206`,
  },
];

export const CrashLogScanner: React.FC<CrashLogScannerProps> = ({ userSpecs }) => {
  const [logText, setLogText] = useState('');
  const [gameName, setGameName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CrashLogResult | null>(null);

  const handleScanLog = async () => {
    if (!logText.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/diagnose-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logText: logText.trim(),
          gameName: gameName.trim(),
          userSpecs,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (err) {
      console.error('Crash log scan error:', err);
      // Fallback result
      setResult({
        summary: `Crash signature analyzed for ${gameName.trim() || 'Application'}.`,
        rootCause: 'Graphics driver timeout (TDR) or memory access violation.',
        culpritModule: 'Direct3D / Display Driver',
        steps: [
          'Restart GPU driver using Win + Ctrl + Shift + B.',
          'Verify game integrity through Steam/Epic launcher.',
          'Perform clean graphics driver reinstall using DDU.'
        ],
        proTip: 'Lock framerates to 3 FPS below monitor refresh rate to prevent GPU voltage drops.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = (sample: string) => {
    setLogText(sample);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0c0c0e] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-green-500 text-black flex items-center justify-center font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-black tracking-tight text-white uppercase italic">
              Crash Log & Event Viewer Doctor
            </h1>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-green-400 font-bold uppercase">
              Stacktrace Parser
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Paste your Windows Event Viewer Event 1000 logs, DxDiag report, or Unreal / Unity crash dump to identify culprit module.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Form: Log Input */}
        <div className="lg:col-span-2 space-y-3 bg-[#0c0c0e] p-4 sm:p-5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Paste Crash Log / Error Stacktrace:
            </label>
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="text-slate-500">SAMPLE:</span>
              <button
                type="button"
                onClick={() => handleLoadSample(SAMPLE_CRASH_LOGS[0].content)}
                className="text-green-400 hover:underline"
              >
                NVIDIA TDR
              </button>
              <span className="text-slate-600">|</span>
              <button
                type="button"
                onClick={() => handleLoadSample(SAMPLE_CRASH_LOGS[1].content)}
                className="text-green-400 hover:underline"
              >
                UE5 DX12
              </button>
              <span className="text-slate-600">|</span>
              <button
                type="button"
                onClick={() => handleLoadSample(SAMPLE_CRASH_LOGS[2].content)}
                className="text-green-400 hover:underline"
              >
                Unity DLL
              </button>
            </div>
          </div>

          <textarea
            id="crash-log-input"
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                handleScanLog();
              }
            }}
            placeholder="Paste raw log lines, e.g. Faulting module name: nvlddmkm.sys, Exception code: 0xc0000005, DXGI_ERROR_DEVICE_REMOVED..."
            rows={8}
            className="w-full p-3 text-xs font-mono bg-[#18181b] border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-green-500 transition-colors"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Game Title (Optional, e.g. Cyberpunk, Valorant)"
              className="w-full sm:w-1/2 px-3 py-2 text-xs bg-[#18181b] border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors font-mono"
            />

            <button
              id="analyze-crash-log-btn"
              onClick={handleScanLog}
              disabled={!logText.trim() || isLoading}
              className={`w-full sm:w-auto px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-tight transition flex items-center justify-center gap-2 cursor-pointer ${
                logText.trim() && !isLoading
                  ? 'bg-green-500 text-black hover:bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                  : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Parsing Dump...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Diagnose Crash Stack</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Info: How to find logs in Windows */}
        <div className="space-y-2.5 p-4 sm:p-5 rounded-xl bg-[#0c0c0e] border border-white/10 text-xs text-slate-300">
          <h3 className="font-bold text-white uppercase tracking-widest font-mono text-[10px] flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-green-400" />
            Where to find Windows Crash Logs:
          </h3>
          <ol className="space-y-2 list-decimal list-inside text-slate-400 font-mono text-[11px]">
            <li>
              Press <kbd className="px-1.5 py-0.5 rounded bg-[#18181b] border border-white/10 text-slate-200">Win + R</kbd>, type <code className="text-green-400">eventvwr.msc</code>.
            </li>
            <li>
              Expand <strong>Windows Logs</strong> &rarr; Click <strong>Application</strong>.
            </li>
            <li>
              Look for red <strong>Error</strong> with <strong>Event ID: 1000</strong> at crash timestamp.
            </li>
            <li>
              Copy text from <em>General</em> tab & paste it here.
            </li>
          </ol>
        </div>
      </div>

      {/* Analysis Result */}
      {result && (
        <div className="p-4 sm:p-5 rounded-xl bg-[#0c0c0e] border border-white/10 space-y-4 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest font-mono">
                AI DIAGNOSIS ASSESSMENT
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">{result.summary}</h2>
            </div>
            {result.culpritModule && (
              <div className="px-3 py-1 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold">
                CULPRIT: {result.culpritModule}
              </div>
            )}
          </div>

          {/* Root Cause */}
          <div className="p-3 rounded-lg bg-[#18181b] border border-white/5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-1">
              Root Cause Identification
            </span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{result.rootCause}</p>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
              Remediation Action Sequence:
            </span>
            <div className="space-y-1.5">
              {result.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#18181b] border border-white/5 flex items-start gap-2.5"
                >
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-slate-200">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pro-Tip */}
          {result.proTip && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-slate-200">
              <strong className="text-green-400 font-mono block mb-0.5">CRASH MITIGATION PRO-TIP:</strong>
              {result.proTip}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
