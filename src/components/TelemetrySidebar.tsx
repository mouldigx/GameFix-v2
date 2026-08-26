import React, { useState, useEffect } from 'react';
import { Activity, Zap, Cpu, Sparkles, Sliders, Camera, Check, Copy, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { UserHardwareSpecs } from '../types';

interface TelemetrySidebarProps {
  userSpecs: UserHardwareSpecs;
  onOpenSpecsModal: () => void;
}

export const TelemetrySidebar: React.FC<TelemetrySidebarProps> = ({
  userSpecs,
  onOpenSpecsModal,
}) => {
  const [gpuTemp, setGpuTemp] = useState(72);
  const [cpuLoad, setCpuLoad] = useState(44);
  const [frameTime, setFrameTime] = useState(12.4);
  const [vsync, setVsync] = useState(false);
  const [gsync, setGsync] = useState(true);
  const [latencyMode, setLatencyMode] = useState<'ULTRA' | 'ON' | 'OFF'>('ULTRA');
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [copiedSnapshot, setCopiedSnapshot] = useState(false);

  // Slight realistic fluctuating metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setGpuTemp(prev => Math.min(84, Math.max(62, prev + (Math.random() * 2 - 1))));
      setCpuLoad(prev => Math.min(95, Math.max(25, Math.round(prev + (Math.random() * 6 - 3)))));
      setFrameTime(prev => Number((Math.min(18, Math.max(6.5, prev + (Math.random() * 0.8 - 0.4)))).toFixed(1)));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const estFps = Math.round(1000 / frameTime);
  const healthStatus = gpuTemp > 80 ? 'CRITICAL THERMAL' : gpuTemp > 75 ? 'WARM' : 'OPTIMAL';

  const handleCopySnapshot = () => {
    const text = `[GameFix AI - Rig Snapshot]
GPU: ${userSpecs.gpu} (${Math.round(gpuTemp)}°C)
CPU: ${userSpecs.cpu} (${cpuLoad}% Load)
Frametime: ${frameTime}ms (~${estFps} FPS)
VRR: ${gsync ? 'G-Sync Active' : 'Off'} | Reflex: ${latencyMode}
Health: ${healthStatus}`;
    navigator.clipboard.writeText(text);
    setCopiedSnapshot(true);
    setTimeout(() => setCopiedSnapshot(false), 2000);
  };

  return (
    <aside className="w-72 shrink-0 border-l border-white/10 bg-[#0c0c0e]/95 p-4 flex flex-col justify-between select-none overflow-y-auto">
      <div className="space-y-4">
        {/* Header & Quick Snapshot Toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
            Telemetry Monitor
          </h2>
          <button
            id="quick-snapshot-toggle-btn"
            onClick={() => setShowSnapshot(!showSnapshot)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold transition border cursor-pointer ${
              showSnapshot
                ? 'bg-green-500 text-black border-green-400 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                : 'bg-white/5 text-slate-300 border-white/10 hover:border-green-500/40 hover:text-green-400'
            }`}
            title="Toggle Quick Performance Snapshot Card"
          >
            <Camera className="w-2.5 h-2.5" />
            <span>SNAPSHOT</span>
          </button>
        </div>

        {/* Minimalist Visual Snapshot Card */}
        {showSnapshot && (
          <div className="p-3 rounded-xl bg-gradient-to-b from-[#131b15] via-[#0d120f] to-[#070a08] border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.12)] space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-green-500/20 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                <span className="text-[10px] font-mono font-black text-green-400 tracking-wider">
                  SYSTEM SNAPSHOT
                </span>
              </div>
              <button
                onClick={handleCopySnapshot}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/50 text-[9px] font-mono text-slate-300 hover:text-green-300 border border-white/10 hover:border-green-500/30 transition"
              >
                {copiedSnapshot ? (
                  <>
                    <Check className="w-2.5 h-2.5 text-green-400" />
                    <span className="text-green-400">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-2.5 h-2.5" />
                    <span>COPY</span>
                  </>
                )}
              </button>
            </div>

            {/* Performance Grid */}
            <div className="grid grid-cols-2 gap-1.5 text-center font-mono">
              <div className="bg-black/60 p-1.5 rounded-lg border border-white/5">
                <div className="text-[8px] text-slate-500 uppercase">Est. FPS</div>
                <div className="text-sm font-black text-green-400">{estFps}</div>
              </div>
              <div className="bg-black/60 p-1.5 rounded-lg border border-white/5">
                <div className="text-[8px] text-slate-500 uppercase">Frame Pacing</div>
                <div className="text-sm font-black text-blue-400">{frameTime}ms</div>
              </div>
              <div className="bg-black/60 p-1.5 rounded-lg border border-white/5">
                <div className="text-[8px] text-slate-500 uppercase">GPU Thermal</div>
                <div className={`text-sm font-black ${gpuTemp > 75 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {Math.round(gpuTemp)}°C
                </div>
              </div>
              <div className="bg-black/60 p-1.5 rounded-lg border border-white/5">
                <div className="text-[8px] text-slate-500 uppercase">CPU Utilization</div>
                <div className="text-sm font-black text-slate-200">{cpuLoad}%</div>
              </div>
            </div>

            {/* Status Footer */}
            <div className="flex items-center justify-between text-[9px] font-mono pt-1 text-slate-400">
              <span className="flex items-center gap-1 text-green-300">
                <CheckCircle2 className="w-2.5 h-2.5 text-green-400" />
                {healthStatus}
              </span>
              <span className="text-slate-500">{userSpecs.resolution.split(' ')[0]}</span>
            </div>
          </div>
        )}

        {/* GPU Temp */}
        <div className="bg-black/40 p-3 rounded-lg border border-white/5 space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] text-slate-400 font-bold font-mono">GPU TEMP</span>
            <span className={`text-xl font-mono font-black ${
              gpuTemp > 80 ? 'text-rose-400' : gpuTemp > 72 ? 'text-orange-400' : 'text-green-400'
            }`}>
              {Math.round(gpuTemp)}°C
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                gpuTemp > 80 ? 'bg-rose-500' : gpuTemp > 72 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, Math.round(gpuTemp))}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-500">
            <span>FAN: 62%</span>
            <span>JUNCTION: {Math.round(gpuTemp + 11)}°C</span>
          </div>
        </div>

        {/* CPU Load */}
        <div className="bg-black/40 p-3 rounded-lg border border-white/5 space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] text-slate-400 font-bold font-mono">CPU LOAD</span>
            <span className="text-xl font-mono font-black text-green-400">
              {cpuLoad}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${cpuLoad}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-500">
            <span>CLOCK: 4.8 GHz</span>
            <span>THREADS: 16/24</span>
          </div>
        </div>

        {/* Frame Time */}
        <div className="bg-black/40 p-3 rounded-lg border border-white/5 space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] text-slate-400 font-bold font-mono">FRAME TIME</span>
            <span className="text-xl font-mono font-black text-blue-400">
              {frameTime}ms
            </span>
          </div>
          <div className="flex gap-1 items-end h-10 bg-slate-950/60 p-1.5 rounded border border-white/5">
            <div className="w-2.5 bg-blue-500/50 h-4 rounded-xs"></div>
            <div className="w-2.5 bg-blue-500/50 h-6 rounded-xs"></div>
            <div className="w-2.5 bg-blue-500/50 h-8 rounded-xs"></div>
            <div className="w-2.5 bg-red-500 h-9 rounded-xs shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
            <div className="w-2.5 bg-blue-500/50 h-5 rounded-xs"></div>
            <div className="w-2.5 bg-blue-500/50 h-7 rounded-xs"></div>
            <div className="w-2.5 bg-blue-500/50 h-6 rounded-xs"></div>
            <div className="w-2.5 bg-blue-500/70 h-8 rounded-xs"></div>
          </div>
          <div className="text-[9px] font-mono text-slate-500 text-right">
            1% LOW: {(1000 / (frameTime + 6)).toFixed(0)} FPS
          </div>
        </div>

        {/* Rig Quick Check */}
        <div
          onClick={onOpenSpecsModal}
          className="bg-white/5 hover:bg-white/10 transition p-2.5 rounded-lg border border-white/5 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
            <span className="flex items-center gap-1 text-green-400">
              <Cpu className="w-3 h-3" /> Rig Profile
            </span>
            <span className="group-hover:text-green-400 font-mono text-[9px]">Edit &rarr;</span>
          </div>
          <div className="text-xs font-mono text-slate-200 font-semibold truncate">
            {userSpecs.gpu.replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '')}
          </div>
          <div className="text-[10px] font-mono text-slate-500 truncate">
            {userSpecs.cpu}
          </div>
        </div>
      </div>

      {/* Optimization Status */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2.5">
          Optimization Status
        </div>
        <div className="space-y-2 font-mono text-[10px]">
          <div
            onClick={() => setVsync(!vsync)}
            className="flex justify-between items-center p-1 rounded hover:bg-white/5 cursor-pointer"
          >
            <span className="text-slate-400">V-SYNC</span>
            <span className={`font-bold ${vsync ? 'text-green-500' : 'text-red-500'}`}>
              {vsync ? 'ON' : 'OFF'}
            </span>
          </div>

          <div
            onClick={() => setGsync(!gsync)}
            className="flex justify-between items-center p-1 rounded hover:bg-white/5 cursor-pointer"
          >
            <span className="text-slate-400">G-SYNC / VRR</span>
            <span className={`font-bold ${gsync ? 'text-green-500' : 'text-slate-500'}`}>
              {gsync ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>

          <div
            onClick={() => {
              setLatencyMode(prev => prev === 'ULTRA' ? 'ON' : prev === 'ON' ? 'OFF' : 'ULTRA');
            }}
            className="flex justify-between items-center p-1 rounded hover:bg-white/5 cursor-pointer"
          >
            <span className="text-slate-400">LATENCY MODE</span>
            <span className="font-bold text-blue-400">
              {latencyMode}
            </span>
          </div>

          <div className="flex justify-between items-center p-1 rounded text-slate-400">
            <span>RE-SIZE BAR</span>
            <span className="text-green-400 font-bold">ENABLED</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
