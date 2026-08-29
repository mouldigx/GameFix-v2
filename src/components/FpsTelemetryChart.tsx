import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  History,
  Flame,
} from 'lucide-react';
import { UserHardwareSpecs } from '../types';

export interface FpsDataPoint {
  time: string;
  fps: number;
  frametime: number;
  event?: string;
  stage?: 'baseline' | 'stutter' | 'optimized';
}

interface FpsTelemetryChartProps {
  userSpecs?: UserHardwareSpecs;
  currentFps?: number;
}

// Preset benchmark profiles
const BENCHMARK_PROFILES: Record<
  string,
  { name: string; targetHz: number; data: FpsDataPoint[] }
> = {
  current_session: {
    name: 'Live Diagnostic Session',
    targetHz: 144,
    data: [
      { time: '00:00', fps: 74, frametime: 13.5, event: 'Game Launch', stage: 'baseline' },
      { time: '00:02', fps: 71, frametime: 14.1, stage: 'baseline' },
      { time: '00:04', fps: 42, frametime: 23.8, event: 'Shader Compilation Stutter', stage: 'stutter' },
      { time: '00:06', fps: 68, frametime: 14.7, stage: 'baseline' },
      { time: '00:08', fps: 118, frametime: 8.4, event: 'HAGS & DX11 Injected', stage: 'optimized' },
      { time: '00:10', fps: 138, frametime: 7.2, stage: 'optimized' },
      { time: '00:12', fps: 144, frametime: 6.9, event: 'Frame Cap Locked', stage: 'optimized' },
      { time: '00:14', fps: 142, frametime: 7.0, stage: 'optimized' },
      { time: '00:16', fps: 145, frametime: 6.8, stage: 'optimized' },
      { time: '00:18', fps: 144, frametime: 6.9, stage: 'optimized' },
    ],
  },
  cs2: {
    name: 'CS2 (DirectX 11 vs Vulkan)',
    targetHz: 240,
    data: [
      { time: '00:00', fps: 165, frametime: 6.0, stage: 'baseline' },
      { time: '00:02', fps: 158, frametime: 6.3, stage: 'baseline' },
      { time: '00:04', fps: 112, frametime: 8.9, event: 'Smoke Grenade Volumetrics', stage: 'stutter' },
      { time: '00:06', fps: 180, frametime: 5.5, stage: 'baseline' },
      { time: '00:08', fps: 228, frametime: 4.3, event: 'Thread Affinity Tuning', stage: 'optimized' },
      { time: '00:10', fps: 241, frametime: 4.1, stage: 'optimized' },
      { time: '00:12', fps: 239, frametime: 4.1, stage: 'optimized' },
      { time: '00:14', fps: 244, frametime: 4.0, stage: 'optimized' },
    ],
  },
  valorant: {
    name: 'Valorant (Riot Vanguard Mode)',
    targetHz: 240,
    data: [
      { time: '00:00', fps: 210, frametime: 4.7, stage: 'baseline' },
      { time: '00:02', fps: 195, frametime: 5.1, stage: 'baseline' },
      { time: '00:04', fps: 162, frametime: 6.1, event: 'Ability VFX Cluster', stage: 'stutter' },
      { time: '00:06', fps: 235, frametime: 4.2, event: 'Raw Input Buffer Enabled', stage: 'optimized' },
      { time: '00:08', fps: 255, frametime: 3.9, stage: 'optimized' },
      { time: '00:10', fps: 258, frametime: 3.8, stage: 'optimized' },
      { time: '00:12', fps: 260, frametime: 3.8, stage: 'optimized' },
    ],
  },
  cyberpunk: {
    name: 'Cyberpunk 2077 (Path Tracing / DLSS)',
    targetHz: 120,
    data: [
      { time: '00:00', fps: 54, frametime: 18.5, stage: 'baseline' },
      { time: '00:02', fps: 48, frametime: 20.8, event: 'Crowd Dense Area', stage: 'stutter' },
      { time: '00:04', fps: 52, frametime: 19.2, stage: 'baseline' },
      { time: '00:06', fps: 98, frametime: 10.2, event: 'DLSS 3.7 + Frame Gen', stage: 'optimized' },
      { time: '00:08', fps: 112, frametime: 8.9, stage: 'optimized' },
      { time: '00:10', fps: 118, frametime: 8.4, stage: 'optimized' },
      { time: '00:12', fps: 115, frametime: 8.6, stage: 'optimized' },
    ],
  },
};

export const FpsTelemetryChart: React.FC<FpsTelemetryChartProps> = ({
  userSpecs,
  currentFps = 138,
}) => {
  const [selectedProfile, setSelectedProfile] = useState<string>('current_session');
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchProgress, setBenchProgress] = useState(0);
  const [historyData, setHistoryData] = useState<FpsDataPoint[]>(
    BENCHMARK_PROFILES.current_session.data
  );

  // Parse target refresh rate from userSpecs if available (e.g. "144 Hz" -> 144)
  const targetRefresh = useMemo(() => {
    if (userSpecs?.refreshRate) {
      const match = userSpecs.refreshRate.match(/\d+/);
      if (match) return parseInt(match[0], 10);
    }
    return BENCHMARK_PROFILES[selectedProfile]?.targetHz || 144;
  }, [userSpecs, selectedProfile]);

  // When profile switches, update data
  useEffect(() => {
    if (BENCHMARK_PROFILES[selectedProfile]) {
      setHistoryData(BENCHMARK_PROFILES[selectedProfile].data);
    }
  }, [selectedProfile]);

  // Handle live benchmark simulation
  const handleRunLiveBenchmark = () => {
    if (isBenchmarking) return;
    setIsBenchmarking(true);
    setBenchProgress(0);

    const baseFps = Math.max(50, Math.round(currentFps * 0.65));
    const targetPeakFps = Math.round(currentFps * 1.15);

    const generatedSession: FpsDataPoint[] = [
      { time: '00:00', fps: baseFps, frametime: Number((1000 / baseFps).toFixed(1)), event: 'Bench Init', stage: 'baseline' },
    ];
    setHistoryData([...generatedSession]);

    let step = 1;
    const interval = setInterval(() => {
      setBenchProgress(prev => Math.min(100, prev + 20));

      let stepFps = baseFps;
      let event: string | undefined = undefined;
      let stage: 'baseline' | 'stutter' | 'optimized' = 'baseline';

      if (step === 1) {
        stepFps = Math.round(baseFps * 0.9);
      } else if (step === 2) {
        stepFps = Math.round(baseFps * 0.6);
        event = 'DirectX Asset Hitch';
        stage = 'stutter';
      } else if (step === 3) {
        stepFps = Math.round(baseFps * 1.25);
        event = 'GameFix AI Injected';
        stage = 'optimized';
      } else if (step === 4) {
        stepFps = Math.round(targetPeakFps * 0.95);
        stage = 'optimized';
      } else if (step >= 5) {
        stepFps = targetPeakFps;
        event = 'Stable Frame Pacing';
        stage = 'optimized';
      }

      const point: FpsDataPoint = {
        time: `00:0${step * 2}`,
        fps: stepFps,
        frametime: Number((1000 / stepFps).toFixed(1)),
        event,
        stage,
      };

      generatedSession.push(point);
      setHistoryData([...generatedSession]);
      step++;

      if (step > 5) {
        clearInterval(interval);
        setIsBenchmarking(false);
      }
    }, 600);
  };

  // Telemetry Calculations
  const stats = useMemo(() => {
    if (!historyData || historyData.length === 0) {
      return { avg: 0, min1Percent: 0, max: 0, stability: 100, stutters: 0 };
    }
    const fpsValues = historyData.map(d => d.fps);
    const avg = Math.round(fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length);
    const sorted = [...fpsValues].sort((a, b) => a - b);
    const min1Percent = sorted[0];
    const max = Math.max(...fpsValues);
    const stutters = historyData.filter(d => d.stage === 'stutter').length;
    const stability = Math.max(75, Math.min(100, Math.round(100 - (stutters * 8) - ((max - min1Percent) / max * 10))));

    return { avg, min1Percent, max, stability, stutters };
  }, [historyData]);

  return (
    <div className="bg-black/50 border border-white/10 rounded-xl p-3 space-y-3 min-w-0">
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-green-400" />
          <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">
            Diagnostic FPS Curve
          </span>
        </div>

        <button
          onClick={handleRunLiveBenchmark}
          disabled={isBenchmarking}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold transition border cursor-pointer ${
            isBenchmarking
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
              : 'bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-black border-green-500/30'
          }`}
          title="Run an instant 10s Diagnostic FPS pass"
        >
          <Play className="w-2.5 h-2.5 fill-current" />
          <span>{isBenchmarking ? `BENCHMARK (${benchProgress}%)` : 'TEST RUN'}</span>
        </button>
      </div>

      {/* Profile Selector Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {Object.entries(BENCHMARK_PROFILES).map(([key, prof]) => (
          <button
            key={key}
            onClick={() => setSelectedProfile(key)}
            className={`px-2 py-0.5 rounded text-[9px] font-mono whitespace-nowrap transition cursor-pointer ${
              selectedProfile === key
                ? 'bg-white/15 text-green-300 font-bold border border-green-500/30 shadow-xs'
                : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            {key === 'current_session' ? 'Live Session' : key.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Main Recharts Area Container */}
      <div className="h-36 w-full min-w-0 bg-slate-950/80 rounded-lg p-1 border border-white/5 relative" style={{ minHeight: '144px', minWidth: '0px' }}>
        <ResponsiveContainer width="100%" height={140} minWidth={0} minHeight={120} debounce={50}>
          <AreaChart
            data={historyData}
            margin={{ top: 10, right: 8, left: -26, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fpsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={8}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={8}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 15', 'dataMax + 20']}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={targetRefresh}
              stroke="#38bdf8"
              strokeDasharray="3 3"
              label={{
                value: `${targetRefresh}Hz`,
                position: 'insideTopRight',
                fill: '#38bdf8',
                fontSize: 8,
                fontFamily: 'monospace',
              }}
            />
            <Area
              type="monotone"
              dataKey="fps"
              stroke="#22c55e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#fpsGradient)"
              activeDot={{ r: 4, fill: '#4ade80', stroke: '#052e16' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Live Session Telemetry Metrics Grid */}
      <div className="grid grid-cols-4 gap-1 text-center font-mono">
        <div className="bg-black/60 p-1.5 rounded border border-white/5">
          <div className="text-[7px] text-slate-500 uppercase">AVG FPS</div>
          <div className="text-xs font-black text-green-400">{stats.avg}</div>
        </div>
        <div className="bg-black/60 p-1.5 rounded border border-white/5">
          <div className="text-[7px] text-slate-500 uppercase">1% LOW</div>
          <div className={`text-xs font-black ${stats.min1Percent < 60 ? 'text-amber-400' : 'text-slate-200'}`}>
            {stats.min1Percent}
          </div>
        </div>
        <div className="bg-black/60 p-1.5 rounded border border-white/5">
          <div className="text-[7px] text-slate-500 uppercase">MAX FPS</div>
          <div className="text-xs font-black text-emerald-400">{stats.max}</div>
        </div>
        <div className="bg-black/60 p-1.5 rounded border border-white/5">
          <div className="text-[7px] text-slate-500 uppercase">STABILITY</div>
          <div className="text-xs font-black text-cyan-400">{stats.stability}%</div>
        </div>
      </div>

      {/* Bottom Session Insight */}
      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-0.5">
        <span className="flex items-center gap-1 text-slate-300">
          <Sparkles className="w-2.5 h-2.5 text-green-400" />
          <span>Frametime Delta: {(1000 / stats.avg).toFixed(1)}ms</span>
        </span>
        <span className="text-slate-500">
          {stats.stutters > 0 ? (
            <span className="text-amber-400 flex items-center gap-0.5">
              <AlertTriangle className="w-2.5 h-2.5" />
              {stats.stutters} Stutter Hiccup
            </span>
          ) : (
            <span className="text-green-400 flex items-center gap-0.5">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Optimal Pacing
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

// Custom dark styled tooltip for Recharts
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: FpsDataPoint = payload[0].payload;
    return (
      <div className="bg-[#0f172a] border border-green-500/40 p-2 rounded shadow-xl text-[9px] font-mono z-50">
        <div className="text-green-400 font-bold flex items-center justify-between gap-3">
          <span>{data.fps} FPS</span>
          <span className="text-slate-400">{data.time}</span>
        </div>
        <div className="text-slate-300 mt-0.5">
          Frametime: <span className="text-cyan-300">{data.frametime} ms</span>
        </div>
        {data.event && (
          <div className="mt-1 pt-1 border-t border-white/10 text-amber-300 font-semibold">
            {data.event}
          </div>
        )}
      </div>
    );
  }
  return null;
};
