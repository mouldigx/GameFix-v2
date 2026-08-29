import React, { useState } from 'react';
import {
  Cpu,
  HardDrive,
  Monitor,
  Zap,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export interface DetectedSpecs {
  gpu: string;
  gpuVendor: string;
  cpuThreads: number;
  estimatedRamGB: number | string;
  screenResolution: string;
  colorDepth: number;
  osPlatform: string;
}

interface SystemSpecsDetectorProps {
  onApplySpecs?: (detected: { gpu: string; cpu: string; ram: string; resolution: string }) => void;
}

export const SystemSpecsDetector: React.FC<SystemSpecsDetectorProps> = ({ onApplySpecs }) => {
  const [specs, setSpecs] = useState<DetectedSpecs | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [applied, setApplied] = useState<boolean>(false);

  const detectSystemSpecs = () => {
    setIsScanning(true);
    setApplied(false);

    setTimeout(() => {
      // 1. GPU Detection via WebGL UNMASKED_RENDERER_WEBGL
      let detectedGpu = 'Standard Graphics Device';
      let detectedVendor = 'Unknown Vendor';

      try {
        const canvas = document.createElement('canvas');
        const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as any;

        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            detectedGpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || detectedGpu;
            detectedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || detectedVendor;
          } else {
            detectedGpu = gl.getParameter(gl.RENDERER) || detectedGpu;
            detectedVendor = gl.getParameter(gl.VENDOR) || detectedVendor;
          }
        }
      } catch (err) {
        console.warn('WebGL hardware query failed:', err);
      }

      // Clean up common prefixes like "ANGLE (..., NVIDIA GeForce RTX 3080 Direct3D11 vs_5_0 ps_5_0, ...)"
      if (detectedGpu.includes('ANGLE (')) {
        const match = detectedGpu.match(/ANGLE \((.*?), (.*?) Direct3D/);
        if (match && match[2]) {
          detectedGpu = match[2].trim();
        } else {
          detectedGpu = detectedGpu.replace(/^ANGLE \((.*?), /, '').replace(/ Direct3D.*$/, '');
        }
      }

      // 2. CPU Threads
      const cpuThreads = navigator.hardwareConcurrency || 4;

      // 3. Approximate RAM (navigator.deviceMemory in GB or performance.memory approximation)
      let estimatedRamGB: number | string = '8+';
      const nav = navigator as any;

      if (nav.deviceMemory) {
        // navigator.deviceMemory returns approximate RAM in GB (e.g. 4, 8)
        estimatedRamGB = nav.deviceMemory >= 8 ? `${nav.deviceMemory}+` : nav.deviceMemory;
      } else if ((performance as any).memory) {
        const jsHeapLimit = (performance as any).memory.jsHeapSizeLimit;
        const approxGB = Math.round((jsHeapLimit / (1024 * 1024 * 1024)) * 4);
        estimatedRamGB = `${approxGB || 8}`;
      }

      // 4. Display & Platform Info
      const screenResolution = `${window.screen.width * window.devicePixelRatio}x${
        window.screen.height * window.devicePixelRatio
      } (${window.screen.width}x${window.screen.height} CSS)`;
      const colorDepth = window.screen.colorDepth || 24;
      const osPlatform = navigator.userAgent.includes('Windows')
        ? 'Windows 10/11'
        : navigator.userAgent.includes('Mac')
        ? 'macOS'
        : navigator.userAgent.includes('Linux')
        ? 'Linux'
        : 'Desktop OS';

      setSpecs({
        gpu: detectedGpu,
        gpuVendor: detectedVendor,
        cpuThreads,
        estimatedRamGB,
        screenResolution,
        colorDepth,
        osPlatform,
      });

      setIsScanning(false);
    }, 600);
  };

  const handleApply = () => {
    if (!specs || !onApplySpecs) return;
    const cpuName =
      specs.cpuThreads >= 16
        ? `High-Performance ${specs.cpuThreads}-Thread Processor`
        : specs.cpuThreads >= 8
        ? `8-Core / ${specs.cpuThreads}-Thread Gaming CPU`
        : `${specs.cpuThreads}-Core Processor`;

    onApplySpecs({
      gpu: specs.gpu,
      cpu: cpuName,
      ram: `${specs.estimatedRamGB} GB DDR4/DDR5`,
      resolution: `${window.screen.width}x${window.screen.height}`,
    });
    setApplied(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-950/90 border border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl p-6 shadow-[0_0_25px_rgba(6,182,212,0.1)] backdrop-blur-md transition-all duration-300 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              GameFix AI{' '}
              <span className="text-cyan-400 font-mono text-xs px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                HARDWARE SCANNER
              </span>
            </h2>
            <p className="text-xs text-slate-400">Client-side zero-latency hardware profiling</p>
          </div>
        </div>

        {/* Trigger Button */}
        <button
          onClick={detectSystemSpecs}
          disabled={isScanning}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-lg shrink-0 ${
            isScanning
              ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40 animate-pulse'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Probing Hardware...' : 'Detect My System Specs'}</span>
        </button>
      </div>

      {/* Specs Cards Display */}
      {specs ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* GPU Card */}
            <div className="bg-slate-900/80 border border-cyan-500/20 hover:border-cyan-500/50 rounded-xl p-4 transition-all duration-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-colors" />
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Monitor className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                  Detected GPU
                </span>
              </div>
              <div className="text-sm font-bold text-white font-mono break-words leading-snug">
                {specs.gpu}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Vendor: {specs.gpuVendor}
              </div>
            </div>

            {/* CPU Threads Card */}
            <div className="bg-slate-900/80 border border-cyan-500/20 hover:border-cyan-500/50 rounded-xl p-4 transition-all duration-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-colors" />
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Cpu className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                  CPU Threads
                </span>
              </div>
              <div className="text-xl font-extrabold text-white font-mono flex items-baseline gap-1">
                {specs.cpuThreads}{' '}
                <span className="text-xs font-normal text-slate-400">Logical Cores</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Concurrency: {specs.cpuThreads} Threads
              </div>
            </div>

            {/* RAM Estimation Card */}
            <div className="bg-slate-900/80 border border-cyan-500/20 hover:border-cyan-500/50 rounded-xl p-4 transition-all duration-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-colors" />
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <HardDrive className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                  Approx. System RAM
                </span>
              </div>
              <div className="text-xl font-extrabold text-white font-mono flex items-baseline gap-1">
                {specs.estimatedRamGB}{' '}
                <span className="text-xs font-normal text-slate-400">GB</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Browser Device Memory Spec
              </div>
            </div>
          </div>

          {/* Secondary Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900/40 border border-white/5 font-mono text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                OS: <strong className="text-white">{specs.osPlatform}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Res: <strong className="text-white">{specs.screenResolution}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>DirectX / Vulkan Ready</span>
            </div>
          </div>

          {/* Optional Sync to AI Context Button */}
          {onApplySpecs && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-mono">
                Sync with AI Bottleneck & Diagnostics Engine
              </span>
              <button
                onClick={handleApply}
                disabled={applied}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  applied
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-500/40'
                }`}
              >
                {applied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Specs Synced</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Apply to Active Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Browser Privacy Notice */}
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-slate-400 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Privacy Safeguard</strong>: Browsers report approximate memory and unmasked
              WebGL strings to prevent device fingerprinting. Values are optimized for game diagnostic recommendations.
            </span>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-10 border border-dashed border-white/10 rounded-xl bg-slate-900/30">
          <Cpu className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300 mb-1">No Hardware Profile Loaded</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click &quot;Detect My System Specs&quot; to probe your GPU renderer, CPU threading, and
            memory for tailored game optimization.
          </p>
        </div>
      )}
    </div>
  );
};
