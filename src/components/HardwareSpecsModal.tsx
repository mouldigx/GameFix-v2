import React, { useState } from 'react';
import {
  X,
  Cpu,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Zap,
  Scan,
  Laptop,
  Crosshair,
  Flame,
  Shield,
  Check,
  Terminal,
  Loader2,
} from 'lucide-react';
import { UserHardwareSpecs } from '../types';
import { COMMON_GPUS, COMMON_CPUS, DEFAULT_USER_SPECS } from '../data/gamingKnowledge';
import { evaluateHardwareRig } from '../utils/aiHelpers';
import {
  simulateSystemScan,
  PRESET_RIG_PROFILES,
  PresetRigProfile,
} from '../utils/systemScanner';

interface HardwareSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  specs: UserHardwareSpecs;
  onSaveSpecs: (updated: UserHardwareSpecs) => void;
}

export const HardwareSpecsModal: React.FC<HardwareSpecsModalProps> = ({
  isOpen,
  onClose,
  specs,
  onSaveSpecs,
}) => {
  const [form, setForm] = useState<UserHardwareSpecs>(specs);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanLog, setScanLog] = useState<string>('');
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const evaluation = evaluateHardwareRig(form);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSpecs(form);
    onClose();
  };

  const handleReset = () => {
    setForm(DEFAULT_USER_SPECS);
    setActivePresetId(null);
    setScanSuccessMessage('Reset to baseline specifications.');
  };

  const handleRunSystemScan = () => {
    setIsScanning(true);
    setScanStep(1);
    setScanLog('Probing Direct3D / WebGL Graphics Adapter...');
    setScanSuccessMessage(null);
    setActivePresetId(null);

    setTimeout(() => {
      setScanStep(2);
      setScanLog('Querying display geometry & frame pacing...');
    }, 300);

    setTimeout(() => {
      setScanStep(3);
      setScanLog('Detecting CPU thread pools & RAM memory boundaries...');
    }, 650);

    setTimeout(() => {
      const result = simulateSystemScan();
      setForm(result.specs);
      setIsScanning(false);
      setScanStep(4);
      setScanLog('System diagnostic complete.');
      setScanSuccessMessage(
        `Auto-detected: ${result.specs.gpu} • ${result.specs.cpu}`
      );
    }, 1000);
  };

  const handleApplyPreset = (preset: PresetRigProfile) => {
    setActivePresetId(preset.id);
    setIsScanning(true);
    setScanStep(1);
    setScanLog(`Loading ${preset.name} profile...`);
    setScanSuccessMessage(null);

    setTimeout(() => {
      setForm(preset.specs);
      setIsScanning(false);
      setScanStep(4);
      setScanSuccessMessage(`Applied preset: ${preset.name} (${preset.tag})`);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0c0c0e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-green-950/30 text-slate-200 p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-green-500 text-black flex items-center justify-center font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase italic flex items-center gap-2">
                Gaming Rig Profile
                <span className="text-[9px] font-mono font-normal px-2 py-0.5 rounded bg-white/5 border border-white/10 text-green-400">
                  AI Hardware Context
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                GameFix AI uses these specs to compute precision bottlenecks, frame pacing, and engine graphics settings.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* System Scan Simulation Action Card */}
        <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-[#141d17] via-[#18181b] to-[#121b14] border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.08)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 shrink-0 mt-0.5">
                <Scan className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-white tracking-wide">
                    System Scan & Auto-Detection
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-green-500/20 text-green-300 border border-green-500/40">
                    1-Click
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Scan display geometry, logical threads, and Direct3D adapter to auto-populate your rig.
                </p>
              </div>
            </div>

            <button
              id="run-system-scan-btn"
              onClick={handleRunSystemScan}
              disabled={isScanning}
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-black font-mono font-bold text-xs shadow-[0_0_12px_rgba(34,197,94,0.35)] transition cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>⚡ Scan System</span>
                </>
              )}
            </button>
          </div>

          {/* Active Scan Progress / Diagnostic Output */}
          {isScanning && (
            <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-green-400">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3 h-3" />
                  {scanLog}
                </span>
                <span>{Math.round((scanStep / 4) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-green-400 transition-all duration-300 shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                  style={{ width: `${(scanStep / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Banner */}
          {scanSuccessMessage && !isScanning && (
            <div className="mt-3 p-2 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-[11px] font-mono text-green-300 animate-fadeIn">
              <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <span className="truncate">{scanSuccessMessage}</span>
            </div>
          )}

          {/* Quick Hardware Presets */}
          <div className="mt-3 pt-2.5 border-t border-white/5">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Or quick-load common benchmark rigs:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_RIG_PROFILES.map((preset) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono border transition ${
                      isSelected
                        ? 'bg-green-500/20 border-green-500 text-green-300 font-bold shadow-[0_0_8px_rgba(34,197,94,0.2)]'
                        : 'bg-[#18181b] border-white/10 text-slate-300 hover:text-white hover:border-white/25'
                    }`}
                    title={preset.description}
                  >
                    {preset.icon === 'Crosshair' && <Crosshair className="w-3 h-3 text-cyan-400" />}
                    {preset.icon === 'Flame' && <Flame className="w-3 h-3 text-amber-400" />}
                    {preset.icon === 'Laptop' && <Laptop className="w-3 h-3 text-indigo-400" />}
                    {preset.icon === 'Shield' && <Shield className="w-3 h-3 text-slate-400" />}
                    {preset.icon === 'Zap' && <Zap className="w-3 h-3 text-green-400" />}
                    <span>{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Rig Health & Bottleneck Card */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#18181b] border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-semibold text-slate-300">Capability Score:</span>
              <span className="text-sm font-black text-green-400">{evaluation.score}/100</span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                evaluation.bottleneckRisk === 'Low (Balanced)'
                  ? 'bg-green-950 text-green-400 border border-green-500/30'
                  : 'bg-amber-950 text-amber-400 border border-amber-500/30'
              }`}
            >
              {evaluation.bottleneckRisk}
            </span>
          </div>

          <div className="text-xs font-mono text-slate-300 font-medium mb-1.5">
            Target Class: <span className="text-cyan-400">{evaluation.targetCapability}</span>
          </div>

          {evaluation.warnings.length > 0 && (
            <div className="space-y-1 mt-2">
              {evaluation.warnings.map((w, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-1.5 text-[11px] text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-500/20 font-mono"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
          {/* GPU */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 font-mono uppercase flex items-center justify-between">
              <span>Graphics Card (GPU)</span>
              <span className="text-green-400 font-bold">Key Component</span>
            </label>
            <div className="relative">
              <input
                id="spec-gpu-input"
                type="text"
                list="gpu-list"
                value={form.gpu}
                onChange={(e) => setForm({ ...form, gpu: e.target.value })}
                placeholder="e.g. NVIDIA RTX 3070 8GB"
                className="w-full px-3 py-2 text-xs bg-[#18181b] border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-green-500 font-mono"
              />
              <datalist id="gpu-list">
                {COMMON_GPUS.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </div>
          </div>

          {/* CPU */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 font-mono uppercase flex items-center justify-between">
              <span>Processor (CPU)</span>
              <span className="text-green-400 font-bold">Key Component</span>
            </label>
            <div className="relative">
              <input
                id="spec-cpu-input"
                type="text"
                list="cpu-list"
                value={form.cpu}
                onChange={(e) => setForm({ ...form, cpu: e.target.value })}
                placeholder="e.g. Intel Core i7-12700K"
                className="w-full px-3 py-2 text-xs bg-[#18181b] border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-green-500 font-mono"
              />
              <datalist id="cpu-list">
                {COMMON_CPUS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* RAM */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 font-mono uppercase">System Memory (RAM)</label>
            <select
              id="spec-ram-select"
              value={form.ram}
              onChange={(e) => setForm({ ...form, ram: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#18181b] border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:border-green-500 font-mono"
            >
              <option value="8GB DDR4 / DDR3 (Bottleneck Warning)">8GB DDR4 (Low)</option>
              <option value="16GB DDR4 3200MHz">16GB DDR4 (Standard)</option>
              <option value="32GB DDR4 3600MHz">32GB DDR4 (Heavy UE5)</option>
              <option value="16GB DDR5 5600MHz">16GB DDR5 (Modern)</option>
              <option value="32GB DDR5 @ 5200Mhz">32GB DDR5 @ 5200Mhz (High-End)</option>
              <option value="32GB DDR5 6000MHz CL30">32GB DDR5 6000MHz CL30 (Esports Top)</option>
              <option value="64GB DDR5 6000MHz">64GB DDR5 (Content + Gaming)</option>
            </select>
          </div>

          {/* Storage */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 font-mono uppercase">Game Drive Storage</label>
            <select
              id="spec-storage-select"
              value={form.storage}
              onChange={(e) => setForm({ ...form, storage: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#18181b] border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:border-green-500 font-mono"
            >
              <option value="1TB PCIe Gen4 NVMe M.2 SSD">PCIe Gen4 NVMe M.2 SSD (Fast DirectStorage)</option>
              <option value="1TB PCIe Gen3 NVMe M.2 SSD">PCIe Gen3 NVMe M.2 SSD</option>
              <option value="500GB SATA 2.5 SSD">SATA 2.5" SSD</option>
              <option value="1TB Mechanical HDD (7200 RPM)">Mechanical HDD (Texture Hitching Risk)</option>
            </select>
          </div>

          {/* Display Resolution */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 font-mono uppercase">Target Resolution</label>
            <select
              id="spec-resolution-select"
              value={form.resolution}
              onChange={(e) => setForm({ ...form, resolution: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#18181b] border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:border-green-500 font-mono"
            >
              <option value="1920x1080 (1080p FHD)">1920x1080 (1080p FHD)</option>
              <option value="2560x1440 (1440p QHD 2K)">2560x1440 (1440p QHD 2K)</option>
              <option value="3440x1440 (Ultrawide 21:9)">3440x1440 (Ultrawide 21:9)</option>
              <option value="3840x2160 (4K UHD)">3840x2160 (4K UHD)</option>
            </select>
          </div>

          {/* Monitor Refresh Rate */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 font-mono uppercase">Monitor Refresh Rate</label>
            <select
              id="spec-refresh-select"
              value={form.refreshRate}
              onChange={(e) => setForm({ ...form, refreshRate: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[#18181b] border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:border-green-500 font-mono"
            >
              <option value="60Hz">60Hz (Standard)</option>
              <option value="120Hz">120Hz</option>
              <option value="144Hz">144Hz (Esports Standard)</option>
              <option value="165Hz / 180Hz">165Hz / 180Hz</option>
              <option value="240Hz+">240Hz+ (Competitive Fast)</option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/10">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-white/5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              id="save-specs-btn"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-green-500 hover:bg-green-400 text-black shadow-[0_0_10px_rgba(34,197,94,0.4)] transition cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Save Rig Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

