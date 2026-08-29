import React, { useState } from 'react';
import { Wifi, RefreshCw, Activity, Zap, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface PingResult {
  ping: number;
  jitter: number;
  packetLoss: number;
  status: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
  ratingText: string;
}

export const GamingNetworkWidget: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<PingResult | null>({
    ping: 28,
    jitter: 3,
    packetLoss: 0,
    status: 'EXCELLENT',
    ratingText: 'ESPORTS READY (Ultra Low Delay)',
  });
  const [currentPingSample, setCurrentPingSample] = useState<number | null>(null);

  const runPingBenchmark = async () => {
    setTesting(true);
    setCurrentPingSample(null);

    const endpoints = [
      'https://1.1.1.1/cdn-cgi/trace',
      'https://www.cloudflare.com/cdn-cgi/trace',
      'https://www.google.com/generate_204',
    ];

    const samples: number[] = [];
    const totalPings = 6;
    let failedCount = 0;

    for (let i = 0; i < totalPings; i++) {
      const url = `${endpoints[i % endpoints.length]}?t=${Date.now()}`;
      const start = performance.now();
      try {
        await fetch(url, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store',
        });
        const latency = Math.round(performance.now() - start);
        samples.push(latency);
        setCurrentPingSample(latency);
      } catch (err) {
        failedCount++;
      }
      await new Promise(r => setTimeout(r, 100));
    }

    if (samples.length === 0) {
      setResult({
        ping: 999,
        jitter: 0,
        packetLoss: 100,
        status: 'POOR',
        ratingText: 'OFFLINE / CONNECTION BLOCKED',
      });
      setTesting(false);
      return;
    }

    samples.sort((a, b) => a - b);
    const medianPing = samples[Math.floor(samples.length / 2)];

    let totalJitter = 0;
    for (let i = 1; i < samples.length; i++) {
      totalJitter += Math.abs(samples[i] - samples[i - 1]);
    }
    const avgJitter = Math.round(totalJitter / Math.max(1, samples.length - 1));
    const loss = Math.round((failedCount / totalPings) * 100);

    let status: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR' = 'EXCELLENT';
    let ratingText = 'ESPORTS READY (Tournament Grade)';

    if (medianPing <= 35) {
      status = 'EXCELLENT';
      ratingText = 'ESPORTS READY (Tournament Grade)';
    } else if (medianPing <= 65) {
      status = 'GOOD';
      ratingText = 'SMOOTH (Low Input Delay)';
    } else if (medianPing <= 120) {
      status = 'MODERATE';
      ratingText = 'MODERATE (Playable Casual)';
    } else {
      status = 'POOR';
      ratingText = 'HIGH PING (Rubberbanding Risk)';
    }

    setResult({
      ping: medianPing,
      jitter: avgJitter,
      packetLoss: loss,
      status,
      ratingText,
    });
    setTesting(false);
    setCurrentPingSample(null);
  };

  const getStatusColor = (status: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR') => {
    switch (status) {
      case 'EXCELLENT':
        return 'text-green-400 border-green-500/40 bg-green-950/30';
      case 'GOOD':
        return 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30';
      case 'MODERATE':
        return 'text-amber-400 border-amber-500/40 bg-amber-950/30';
      case 'POOR':
        return 'text-rose-400 border-rose-500/40 bg-rose-950/30';
    }
  };

  const getPingColor = (ping: number) => {
    if (ping <= 35) return 'text-green-400';
    if (ping <= 65) return 'text-cyan-400';
    if (ping <= 120) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="bg-black/50 p-3 rounded-lg border border-white/10 space-y-2.5 font-mono">
      {/* Title & Trigger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
            Live Network & Ping
          </span>
        </div>
        <button
          id="run-ping-test-btn"
          onClick={runPingBenchmark}
          disabled={testing}
          title="Run Real-Time Ping Benchmark"
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/10 hover:border-cyan-400/40 transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-2.5 h-2.5 ${testing ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{testing ? 'TESTING' : 'PING TEST'}</span>
        </button>
      </div>

      {/* Primary Ping Metric Display */}
      <div className="bg-black/70 p-2.5 rounded border border-white/5 flex items-center justify-between">
        <div>
          <div className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">
            {testing ? 'Sampling Packets...' : 'RTT Latency (Edge)'}
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-2xl font-black ${testing && currentPingSample ? getPingColor(currentPingSample) : result ? getPingColor(result.ping) : 'text-slate-400'}`}>
              {testing ? (currentPingSample ?? '...') : (result ? result.ping : '--')}
            </span>
            <span className="text-[10px] text-slate-500 font-bold">ms</span>
          </div>
        </div>

        {/* Small badge status */}
        {result && !testing && (
          <div className={`px-2 py-1 rounded text-[9px] font-bold border uppercase tracking-wider ${getStatusColor(result.status)}`}>
            {result.status}
          </div>
        )}
      </div>

      {/* Sub metrics: Jitter & Packet Loss */}
      {result && (
        <div className="grid grid-cols-2 gap-1.5 text-[9px]">
          <div className="bg-black/40 p-1.5 rounded border border-white/5">
            <div className="text-[8px] text-slate-500 uppercase font-semibold">Jitter (Variance)</div>
            <div className="font-bold text-slate-200 mt-0.5 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-amber-400" />
              <span>{result.jitter} ms</span>
            </div>
          </div>
          <div className="bg-black/40 p-1.5 rounded border border-white/5">
            <div className="text-[8px] text-slate-500 uppercase font-semibold">Loss / Drop</div>
            <div className={`font-bold mt-0.5 flex items-center gap-1 ${result.packetLoss === 0 ? 'text-green-400' : 'text-rose-400'}`}>
              {result.packetLoss === 0 ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
              <span>{result.packetLoss}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation text */}
      {result && !testing && (
        <div className="text-[8px] text-slate-400 bg-white/5 p-1.5 rounded border border-white/5 leading-tight flex items-center justify-between">
          <span className="truncate">{result.ratingText}</span>
          <span className="text-cyan-400 text-[7px] font-bold uppercase shrink-0 ml-1">Cloudflare Edge</span>
        </div>
      )}
    </div>
  );
};
