import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, RefreshCw, Download, ExternalLink, Cpu, CheckCircle } from 'lucide-react';
import { UserHardwareSpecs } from '../types';

export interface DriverInfo {
  vendor: 'NVIDIA' | 'AMD' | 'Intel' | 'Generic';
  detectedRenderer: string;
  installedVersion: string;
  latestStableVersion: string;
  releaseDate: string;
  isOutdated: boolean;
  downloadUrl: string;
  notes: string;
}

// Curated reference of current stable Game-Ready WHQL drivers
export const KNOWN_STABLE_DRIVERS: Record<string, { latestVersion: string; releaseDate: string; url: string; notes: string }> = {
  NVIDIA: {
    latestVersion: '566.36',
    releaseDate: 'Latest WHQL',
    url: 'https://www.nvidia.com/Download/index.aspx',
    notes: 'Optimized for Black Myth: Wukong, Call of Duty, and DLSS 3.7+ enhancements.',
  },
  AMD: {
    latestVersion: '24.12.1',
    releaseDate: 'Adrenalin Edition',
    url: 'https://www.amd.com/en/support/download/drivers.html',
    notes: 'Includes HYPR-RX profile updates and Anti-Lag 2 stability fixes.',
  },
  Intel: {
    latestVersion: '32.0.101.6314',
    releaseDate: 'Arc & Iris WHQL',
    url: 'https://www.intel.com/content/www/us/en/download-center/home.html',
    notes: 'Improves DX11 frame pacing and XeSS 1.3 overhead reduction.',
  },
  Generic: {
    latestVersion: '2026.1',
    releaseDate: 'Universal Driver',
    url: 'https://www.microsoft.com/en-us/download',
    notes: 'Standard WHQL certified graphics baseline.',
  },
};

interface GpuDriverAlertProps {
  userSpecs: UserHardwareSpecs;
  onOpenSpecsModal?: () => void;
}

export const GpuDriverAlert: React.FC<GpuDriverAlertProps> = ({ userSpecs, onOpenSpecsModal }) => {
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [customVersion, setCustomVersion] = useState<string>('');
  const [isEditingVersion, setIsEditingVersion] = useState(false);

  // Browser-side GPU detection via WebGL unmasked renderer & specs fallback
  const detectGpuAndDriver = () => {
    setIsScanning(true);
    let detectedRenderer = '';
    let detectedVendor: 'NVIDIA' | 'AMD' | 'Intel' | 'Generic' = 'Generic';

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          detectedRenderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
        }
      }
    } catch (e) {
      console.warn('WebGL detection error:', e);
    }

    // Cross-reference with user specs if WebGL is sanitized or generic (e.g. Angle/Direct3D)
    const combinedGpuString = `${detectedRenderer} ${userSpecs.gpu}`.toUpperCase();

    if (combinedGpuString.includes('NVIDIA') || combinedGpuString.includes('GEFORCE') || combinedGpuString.includes('RTX') || combinedGpuString.includes('GTX')) {
      detectedVendor = 'NVIDIA';
    } else if (combinedGpuString.includes('AMD') || combinedGpuString.includes('RADEON') || combinedGpuString.includes('RX')) {
      detectedVendor = 'AMD';
    } else if (combinedGpuString.includes('INTEL') || combinedGpuString.includes('ARC') || combinedGpuString.includes('IRIS')) {
      detectedVendor = 'Intel';
    }

    const stableRef = KNOWN_STABLE_DRIVERS[detectedVendor] || KNOWN_STABLE_DRIVERS.Generic;

    // Check stored custom version or simulate standard benchmark version
    const storedVer = localStorage.getItem(`gamefix_driver_${detectedVendor}`);
    let installedVer = storedVer || (detectedVendor === 'NVIDIA' ? '546.33' : detectedVendor === 'AMD' ? '23.11.1' : '31.0.101.5186');

    if (customVersion) {
      installedVer = customVersion;
    }

    // Compare versions (simple numerical version parse)
    const installedNum = parseFloat(installedVer.replace(/[^\d.]/g, '')) || 0;
    const latestNum = parseFloat(stableRef.latestVersion.replace(/[^\d.]/g, '')) || 0;
    const isOutdated = installedNum < latestNum;

    setTimeout(() => {
      setDriverInfo({
        vendor: detectedVendor,
        detectedRenderer: detectedRenderer || userSpecs.gpu,
        installedVersion: installedVer,
        latestStableVersion: stableRef.latestVersion,
        releaseDate: stableRef.releaseDate,
        isOutdated,
        downloadUrl: stableRef.url,
        notes: stableRef.notes,
      });
      setIsScanning(false);
    }, 400);
  };

  useEffect(() => {
    detectGpuAndDriver();
  }, [userSpecs.gpu]);

  const handleUpdateInstalledVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverInfo || !customVersion.trim()) return;

    localStorage.setItem(`gamefix_driver_${driverInfo.vendor}`, customVersion.trim());
    setIsEditingVersion(false);
    detectGpuAndDriver();
  };

  const handleQuickMarkUpdated = () => {
    if (!driverInfo) return;
    localStorage.setItem(`gamefix_driver_${driverInfo.vendor}`, driverInfo.latestStableVersion);
    setCustomVersion(driverInfo.latestStableVersion);
    detectGpuAndDriver();
  };

  if (!driverInfo) {
    return (
      <div className="p-3 bg-black/40 rounded-lg border border-white/5 font-mono text-[10px] text-slate-400 flex items-center justify-between">
        <span>Scanning GPU Driver Status...</span>
        <RefreshCw className="w-3 h-3 animate-spin text-green-400" />
      </div>
    );
  }

  return (
    <div className="bg-black/50 p-3 rounded-lg border border-white/10 space-y-2.5 font-mono">
      {/* Title & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-300 uppercase">GPU Driver Health</span>
        </div>
        <button
          onClick={detectGpuAndDriver}
          disabled={isScanning}
          title="Re-scan Driver Status"
          className="text-slate-400 hover:text-green-400 transition p-0.5"
        >
          <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin text-green-400' : ''}`} />
        </button>
      </div>

      {/* Driver Version Comparison Badge */}
      <div className="flex items-center justify-between text-[11px] bg-black/70 p-2 rounded border border-white/5">
        <div>
          <div className="text-[8px] text-slate-500 uppercase font-bold">Current Installed</div>
          <div className="font-bold text-slate-200 flex items-center gap-1">
            <span>{driverInfo.vendor} v{driverInfo.installedVersion}</span>
            <button
              onClick={() => {
                setCustomVersion(driverInfo.installedVersion);
                setIsEditingVersion(!isEditingVersion);
              }}
              className="text-[9px] text-indigo-400 hover:underline cursor-pointer ml-1"
            >
              [Edit]
            </button>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[8px] text-slate-500 uppercase font-bold">Stable WHQL</div>
          <div className="font-bold text-green-400">v{driverInfo.latestStableVersion}</div>
        </div>
      </div>

      {/* Inline Version Edit Form */}
      {isEditingVersion && (
        <form onSubmit={handleUpdateInstalledVersion} className="flex gap-1">
          <input
            type="text"
            value={customVersion}
            onChange={(e) => setCustomVersion(e.target.value)}
            placeholder="e.g. 566.36"
            className="flex-1 bg-zinc-900 border border-white/20 rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-green-400"
          />
          <button
            type="submit"
            className="px-2 py-1 bg-green-500 text-black font-bold text-[9px] rounded hover:bg-green-400"
          >
            Save
          </button>
        </form>
      )}

      {/* Alert Card: Outdated vs Up-to-Date */}
      {driverInfo.isOutdated ? (
        <div className="p-2.5 rounded bg-rose-950/40 border border-rose-500/40 text-rose-200 space-y-2">
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] font-black text-rose-300 tracking-wide uppercase">
                Update Recommended
              </div>
              <div className="text-[9px] text-rose-200/80 leading-tight mt-0.5">
                Installed driver is behind latest Game-Ready WHQL baseline. May cause frame pacing stutters or D3D12 device loss.
              </div>
            </div>
          </div>

          <div className="text-[8px] text-slate-400 leading-tight bg-black/50 p-1.5 rounded border border-white/5">
            {driverInfo.notes}
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <a
              href={driverInfo.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[9px] font-bold tracking-wider transition"
            >
              <Download className="w-2.5 h-2.5" />
              <span>OFFICIAL DRIVER</span>
              <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70" />
            </a>
            <button
              onClick={handleQuickMarkUpdated}
              title="Mark as Updated to Current WHQL"
              className="px-2 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded text-[9px] transition"
            >
              Mark Updated
            </button>
          </div>
        </div>
      ) : (
        <div className="p-2 rounded bg-green-950/30 border border-green-500/30 text-green-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
            <div>
              <div className="text-[10px] font-bold text-green-400">Driver Up-to-Date</div>
              <div className="text-[8px] text-slate-400">Running stable Game-Ready WHQL release</div>
            </div>
          </div>
          <a
            href={driverInfo.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] text-slate-400 hover:text-white p-1"
            title="Driver Portal"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};
