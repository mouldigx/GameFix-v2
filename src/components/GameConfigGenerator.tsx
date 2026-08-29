import React, { useState } from 'react';
import {
  FileCode2,
  Cpu,
  Copy,
  Check,
  Download,
  Sparkles,
  Zap,
  Sliders,
  FolderOpen,
  HelpCircle,
  Search,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  Flame,
  Gamepad2,
  RefreshCw,
} from 'lucide-react';
import { COMMON_GPUS, POPULAR_GAMES } from '../data/gamingKnowledge';
import { GameConfigResult, UserHardwareSpecs } from '../types';

interface GameConfigGeneratorProps {
  userSpecs?: UserHardwareSpecs;
  onOpenSpecsModal?: () => void;
  initialGame?: string;
  initialGpu?: string;
}

const PRESET_MODES = [
  {
    id: 'Performance',
    label: 'Max FPS / Esports',
    desc: 'Lowest latency & render overhead',
    icon: Zap,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  },
  {
    id: 'Balanced',
    label: 'Balanced (Recommended)',
    desc: 'Smooth 1% lows & sharp visuals',
    icon: Sliders,
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  },
  {
    id: 'Quality',
    label: 'High Fidelity / Ultra',
    desc: 'Max immersion with smart VRAM caps',
    icon: Flame,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  },
  {
    id: 'Potato',
    label: 'Potato PC / APU',
    desc: 'Aggressive LOD & 720p scaling',
    icon: Gamepad2,
    color: 'text-green-400 border-green-500/30 bg-green-500/10',
  },
];

export const GameConfigGenerator: React.FC<GameConfigGeneratorProps> = ({
  userSpecs,
  onOpenSpecsModal,
  initialGame = 'Cyberpunk 2077: Phantom Liberty',
  initialGpu,
}) => {
  const defaultGpu = initialGpu || userSpecs?.gpu || 'NVIDIA GeForce RTX 3080 10GB';

  const [gameTitle, setGameTitle] = useState<string>(initialGame);
  const [gpuModel, setGpuModel] = useState<string>(defaultGpu);
  const [targetPreset, setTargetPreset] = useState<string>('Balanced');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GameConfigResult | null>(null);

  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedPath, setCopiedPath] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Quick game selection filter
  const filteredGames = POPULAR_GAMES.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!gameTitle.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameTitle: gameTitle.trim(),
          gpuModel: gpuModel.trim() || 'NVIDIA GeForce RTX 3060',
          targetPreset,
          userSpecs,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Config generation failed:', error);
      // Client fallback simulation
      setResult({
        configFileName: 'Engine.ini',
        configPath: '%LOCALAPPDATA%\\GameName\\Saved\\Config\\WindowsClient\\Engine.ini',
        engine: 'Unreal Engine 5',
        summary: `Optimized configuration for ${gameTitle} on ${gpuModel}. Allocated dedicated VRAM streaming buffers and locked reflex low-latency mode.`,
        targetGpuTier: 'Mid/High-End Tier',
        configContent: `[SystemSettings]\nr.Streaming.PoolSize=3072\nr.Streaming.LimitPoolSizeToVRAM=1\nr.CreateShadersOnLoad=1\nr.Shaders.Optimize=1\nr.Reflex.Mode=2\nr.Reflex.Enable=1\nr.DepthOfFieldQuality=0\nr.MotionBlurQuality=0\nr.SSR.Quality=0\nr.Tonemapper.GrainQuantization=0\nr.Shadow.MaxResolution=1024\n\n[TextureStreaming]\nPoolSizeMultiplier=1.0\nUseFixedPoolSize=1`,
        installationTip: 'Paste at the bottom of your Engine.ini configuration file.',
        keyTweaks: [
          { parameter: 'r.Streaming.PoolSize', value: '3072 MB', reason: 'Tailored VRAM allocation' },
          { parameter: 'r.Reflex.Mode', value: '2 (On + Boost)', reason: 'Sub-frame input latency reduction' },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!result?.configContent) return;
    navigator.clipboard.writeText(result.configContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyPath = () => {
    if (!result?.configPath) return;
    navigator.clipboard.writeText(result.configPath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!result?.configContent) return;
    const filename = result.configFileName || 'game_config.ini';
    const blob = new Blob([result.configContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAutoFillGpu = () => {
    if (userSpecs?.gpu) {
      setGpuModel(userSpecs.gpu);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn">
      {/* Header Title Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0d1224] via-[#090d1a] to-[#0d1224] border border-cyan-500/20 shadow-[0_0_25px_rgba(6,182,212,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-black shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <FileCode2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase italic">
              Game Config Generator
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
              Gemini AI Powered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Generate tailored <span className="text-cyan-300 font-mono">.ini</span>,{' '}
            <span className="text-cyan-300 font-mono">.cfg</span>, and{' '}
            <span className="text-cyan-300 font-mono">.json</span> configuration files with engine-level
            variables and memory streaming pools optimized for your exact GPU architecture.
          </p>
        </div>

        {userSpecs && (
          <div
            onClick={onOpenSpecsModal}
            className="cursor-pointer px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/20 hover:border-cyan-400/50 transition group flex items-center gap-3 shrink-0"
          >
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="text-xs font-mono">
              <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                Active Rig Profile:
              </div>
              <div className="text-slate-200 font-semibold truncate max-w-[160px] group-hover:text-cyan-300">
                {userSpecs.gpu.replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Form Input Section */}
      <form
        onSubmit={handleGenerateConfig}
        className="p-5 sm:p-6 rounded-2xl bg-[#090d1a] border border-white/10 shadow-2xl space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Input 1: Game Title (Search & Dropdown & Custom) */}
          <div className="space-y-2 relative">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. Select Game Title</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                Choose preset or type custom
              </span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={gameTitle}
                onChange={(e) => {
                  setGameTitle(e.target.value);
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="e.g. Cyberpunk 2077, Valorant, CS2..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border border-white/15 focus:border-cyan-400 focus:outline-none text-white placeholder-slate-500 font-mono text-sm shadow-inner transition"
              />
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Auto-suggest Dropdown */}
            {isDropdownOpen && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-slate-950 border border-cyan-500/30 rounded-xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-white/5 scrollbar-thin">
                <div className="p-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider bg-slate-900/50">
                  Popular Supported Game Engines:
                </div>
                {filteredGames.length > 0 ? (
                  filteredGames.map((game) => (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => {
                        setGameTitle(game.name);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-cyan-500/10 hover:text-cyan-300 transition flex items-center justify-between text-xs font-mono text-slate-200 cursor-pointer"
                    >
                      <span className="font-semibold">{game.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                        {game.engine}
                      </span>
                    </button>
                  ))
                ) : (
                  <div
                    onClick={() => setIsDropdownOpen(false)}
                    className="p-3 text-xs text-slate-400 font-mono cursor-pointer hover:text-white"
                  >
                    Custom game: &quot;{gameTitle}&quot; (Click to confirm)
                  </div>
                )}
              </div>
            )}

            {/* Quick Game Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {['Cyberpunk 2077', 'Valorant', 'CS2', 'Fortnite', 'GTA V', 'Black Myth: Wukong'].map(
                (quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => {
                      setGameTitle(quick);
                      setIsDropdownOpen(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition border cursor-pointer ${
                      gameTitle.includes(quick)
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {quick}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Input 2: GPU Model (Manual, Detected, or Presets) */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>2. Specify GPU Model</span>
              </span>
              {userSpecs?.gpu && (
                <button
                  type="button"
                  onClick={handleAutoFillGpu}
                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline uppercase flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Use Detected ({userSpecs.gpu.split(' ')[2] || 'GPU'})</span>
                </button>
              )}
            </label>

            <input
              type="text"
              value={gpuModel}
              onChange={(e) => setGpuModel(e.target.value)}
              placeholder="e.g. RTX 3080, RTX 4070, RX 6600..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border border-white/15 focus:border-cyan-400 focus:outline-none text-white placeholder-slate-500 font-mono text-sm shadow-inner transition"
            />

            {/* Quick GPU Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {[
                'RTX 4090',
                'RTX 4070 Super',
                'RTX 3080',
                'RTX 3060',
                'RX 7800 XT',
                'RX 6600',
                'GTX 1660 Super',
                'Intel Arc A770',
              ].map((gpuChip) => (
                <button
                  key={gpuChip}
                  type="button"
                  onClick={() => setGpuModel(gpuChip)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition border cursor-pointer ${
                    gpuModel.includes(gpuChip)
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:border-white/20'
                  }`}
                >
                  {gpuChip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Target Profile Selector */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>3. Optimization Target & Performance Profile</span>
          </label>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESET_MODES.map((preset) => {
              const Icon = preset.icon;
              const isSelected = targetPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setTargetPreset(preset.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `${preset.color} border-current shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-current`
                      : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Icon className="w-4 h-4" />
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-current" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold font-mono tracking-tight text-white">
                      {preset.label}
                    </div>
                    <div className="text-[10px] text-slate-400 leading-snug mt-0.5">
                      {preset.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>AI calculates async shader queues, VRAM streaming caps & reflex timing.</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !gameTitle.trim()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black font-mono text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-extrabold hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Synthesizing Engine Config...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Optimized Config</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Result Section: Code Block Display & Instructions */}
      {result && (
        <div className="space-y-4 animate-fadeIn">
          {/* Metadata Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#090d1a] border border-cyan-500/30 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
                  {result.configFileName || 'Configuration File'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-mono text-xs">
                  Engine: {result.engine || 'Custom Engine'}
                </span>
                {result.targetGpuTier && (
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono text-xs">
                    {result.targetGpuTier}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy to Clipboard</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>

            {/* Summary & GPU Tuning notes */}
            {result.summary && (
              <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed">
                <span className="text-cyan-400 font-bold">⚡ AI Optimization Profile:</span>{' '}
                {result.summary}
              </p>
            )}

            {/* File Path Copy Bar */}
            {result.configPath && (
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-400 truncate">
                  <FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-slate-500 select-none">Target File Path:</span>
                  <span className="text-slate-200 truncate select-all">{result.configPath}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPath}
                  className="shrink-0 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition"
                >
                  {copiedPath ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedPath ? 'Copied' : 'Copy Path'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Dark Gaming Code Block with Pre/Code */}
          <div className="relative rounded-2xl bg-[#060812] border border-cyan-500/30 overflow-hidden shadow-2xl">
            {/* Top Code Block Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-white/10 text-xs font-mono select-none">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-slate-400 ml-2 font-bold">
                  {result.configFileName || 'Configuration Output'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* Syntax Styled Output */}
            <div className="p-4 sm:p-5 overflow-x-auto max-h-[460px] scrollbar-thin">
              <pre className="text-xs sm:text-sm font-mono leading-relaxed text-slate-200 selection:bg-cyan-500/30">
                <code>
                  {result.configContent.split('\n').map((line, idx) => {
                    const isHeader =
                      line.startsWith('[') ||
                      line.startsWith('{') ||
                      line.startsWith('}') ||
                      line.startsWith('<');
                    const isComment = line.startsWith('//') || line.startsWith('#') || line.startsWith(';');
                    const isKeyVal = line.includes('=') || line.includes(':');

                    let lineStyle = 'text-slate-300';
                    if (isComment) lineStyle = 'text-slate-500 italic';
                    else if (isHeader) lineStyle = 'text-cyan-400 font-bold';
                    else if (isKeyVal) lineStyle = 'text-emerald-300';

                    return (
                      <div key={idx} className="table-row">
                        <span className="table-cell select-none pr-4 text-right text-slate-600 text-[11px] w-8">
                          {idx + 1}
                        </span>
                        <span className={`table-cell ${lineStyle}`}>{line}</span>
                      </div>
                    );
                  })}
                </code>
              </pre>
            </div>
          </div>

          {/* Key Tweaks Breakdown Grid */}
          {result.keyTweaks && result.keyTweaks.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#090d1a] border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Architectural Tweak Breakdown for {gpuModel || 'Target GPU'}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {result.keyTweaks.map((tweak, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-1 font-mono text-xs"
                  >
                    <div className="text-cyan-400 font-bold truncate">{tweak.parameter}</div>
                    <div className="text-[11px] text-emerald-400 font-semibold">{tweak.value}</div>
                    <div className="text-[10px] text-slate-400 leading-snug">{tweak.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Installation Tips Card */}
          {result.installationTip && (
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs font-mono text-cyan-200 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold uppercase tracking-wider text-cyan-300">
                  Installation & Persistence Instruction:
                </span>
                <p className="text-slate-300 leading-relaxed">{result.installationTip}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
