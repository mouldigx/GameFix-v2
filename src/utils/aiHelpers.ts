import confetti from 'canvas-confetti';
import { ParsedDiagnosis, UserHardwareSpecs } from '../types';

/**
 * Parses GameFix AI markdown output into structured segments:
 * 1. Quick Cause Assessment
 * 2. Step-by-Step Fix
 * 3. Pro-Tip / Optimization Note
 */
export function parseAiResponse(text: string): ParsedDiagnosis {
  const result: ParsedDiagnosis = {
    rawText: text,
    steps: [],
  };

  // Check if hardware specs were requested
  const lower = text.toLowerCase();
  if (
    lower.includes('what are your specs') ||
    lower.includes('what gpu') ||
    lower.includes('hardware details') ||
    lower.includes('gpu/cpu') ||
    lower.includes('chnowa el config') ||
    lower.includes('quelle est votre configuration')
  ) {
    result.needsHardwareSpecs = true;
  }

  // Parse new GameFix AI V2 format:
  // 1. ⚡ Quick Fix: ...
  const quickFixMatch = text.match(/(?:1\.\s*)?(?:⚡\s*)?Quick Fix:?\s*([\s\S]*?)(?=(?:2\.\s*)?(?:🚀\s*)?Performance Boost|$)/i);
  if (quickFixMatch && quickFixMatch[1]) {
    let qfText = quickFixMatch[1].trim();
    // Extract a command surrounded by backticks if present
    const codeMatch = qfText.match(/`([^`]+)`/);
    if (codeMatch) {
      result.quickFixCommand = codeMatch[1];
      // Keep the command in the text or extract it, but keeping it is fine.
    }
    result.quickFix = qfText;
  }

  // Parse new GameFix AI V2 format:
  // 2. 🚀 Performance Boost: ...
  const boostMatch = text.match(/(?:2\.\s*)?(?:🚀\s*)?Performance Boost:?\s*([\s\S]*?)$/i);
  if (boostMatch && boostMatch[1]) {
    result.performanceBoost = boostMatch[1].trim();
  }

  // Extract Quick / Root Cause
  const causeMatch = text.match(/\*\*(?:Root Cause|Quick Cause Assessment|Root Cause Assessment|Cause|Diagnostic|Problème)\*\*:\s*([\s\S]*?)(?=\n\n\*\*|\n\*\*Step|\n\*\*Pro-Tip|$)/i) ||
    text.match(/1\.\s*\*\*(?:Root Cause|Quick Cause Assessment)\*\*:\s*([\s\S]*?)(?=\n\n|\n2\.|$)/i) ||
    text.match(/(?:Root Cause|Quick Cause Assessment|Cause|Diagnosis|Diagnostic|Problème):\s*([\s\S]*?)(?=\n\n|\n\*\*|$)/i);

  if (causeMatch && causeMatch[1]) {
    result.quickCause = causeMatch[1].trim();
  }

  // Extract Pro-Tip / Performance Boost
  const proTipMatch = text.match(/\*\*(?:Pro-Tip|Pro Tip|Performance Boost|Optimization Note|Conseil Pro|Astuce)\*\*:\s*([\s\S]*?)$/i) ||
    text.match(/3\.\s*\*\*(?:Pro-Tip|Pro Tip|Optimization Note)\*\*:\s*([\s\S]*?)$/i);

  if (proTipMatch && proTipMatch[1]) {
    result.proTip = proTipMatch[1].trim();
  }

  // Extract Step-by-Step Fix
  const stepsSectionMatch = text.match(/\*\*(?:Step-by-Step Fix|Step-by-Step|Steps|Solutions?|Étapes de résolution)\*\*:\s*([\s\S]*?)(?=\n\n\*\*(?:Pro-Tip|Pro Tip|Performance Boost)|$)/i);
  
  const stepText = stepsSectionMatch ? stepsSectionMatch[1] : (!result.quickFix ? text : '');
  
  // Look for numbered or bullet points: 1. **Title**: detail or - **Title**: detail
  const stepRegex = /(?:^|\n)(?:\d+\.|\-|\*)\s*(?:\*\*(.*?)\*\*[:\s]*)?([\s\S]*?)(?=(?:\n(?:\d+\.|\-|\*)\s|\n\n\*\*|$))/g;
  let match;
  while ((match = stepRegex.exec(stepText)) !== null) {
    const rawTitle = match[1] ? match[1].trim() : `Step ${result.steps!.length + 1}`;
    let rawDetail = match[2] ? match[2].trim() : '';

    // Remove any trailing pro-tip artifact if matched
    if (rawDetail.toLowerCase().includes('pro-tip') || rawDetail.toLowerCase().includes('pro tip')) {
      rawDetail = rawDetail.split(/\*\*(?:Pro-Tip|Pro Tip)/i)[0].trim();
    }

    // Look for code or command snippets
    const codeMatch = rawDetail.match(/`([^`]+)`/);
    const command = codeMatch ? codeMatch[1] : undefined;

    if (rawDetail || rawTitle) {
      result.steps!.push({
        title: rawTitle,
        detail: rawDetail,
        command,
      });
    }
  }

  return result;
}

/**
 * Triggers gamer celebration confetti when an issue is solved!
 */
export function fireResolvedConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#3b82f6'],
    });
  } catch (e) {
    console.log('Confetti triggered', e);
  }
}

/**
 * Text-to-Speech audio reader using Web Speech API
 */
export function speakText(text: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) return null;

  window.speechSynthesis.cancel();

  // Strip markdown formatting for cleaner speech
  const clean = text
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/#/g, '')
    .replace(/\n+/g, '. ');

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  // Try to pick a clear English or regional voice if available
  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Microsoft'))) || voices[0];
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Bottleneck & Capability Evaluator for User's Rig
 */
export function evaluateHardwareRig(specs: UserHardwareSpecs) {
  let score = 75;
  let bottleneckRisk: 'Low (Balanced)' | 'Moderate' | 'High Bottleneck' = 'Low (Balanced)';
  let targetCapability = '1080p Ultra / 1440p High Gaming';
  const warnings: string[] = [];
  const strengths: string[] = [];

  const gpuLower = specs.gpu.toLowerCase();
  const cpuLower = specs.cpu.toLowerCase();
  const ramLower = specs.ram.toLowerCase();

  // GPU Tier detection
  const isTopTierGpu = gpuLower.includes('4090') || gpuLower.includes('4080') || gpuLower.includes('7900 xtx') || gpuLower.includes('4070 ti');
  const isMidHighGpu = gpuLower.includes('4070') || gpuLower.includes('3080') || gpuLower.includes('7800 xt') || gpuLower.includes('3070') || gpuLower.includes('6800');
  const isBudgetGpu = gpuLower.includes('1660') || gpuLower.includes('1060') || gpuLower.includes('580') || gpuLower.includes('3050') || gpuLower.includes('iris') || gpuLower.includes('integrated');

  // CPU Tier detection
  const isTopCpu = cpuLower.includes('7800x3d') || cpuLower.includes('9800x3d') || cpuLower.includes('14900') || cpuLower.includes('13900') || cpuLower.includes('7950');
  const isOlderCpu = cpuLower.includes('3600') || cpuLower.includes('10400') || cpuLower.includes('10700') || cpuLower.includes('12100') || cpuLower.includes('8400') || cpuLower.includes('7700k');

  if (isTopTierGpu) {
    score = 95;
    targetCapability = '4K Ultra & High-Refresh 1440p Esports (Ray Tracing Max)';
    strengths.push('Elite GPU tier capable of full Path Tracing & DLSS 3 Frame Generation.');
    if (isOlderCpu) {
      bottleneckRisk = 'High Bottleneck';
      warnings.push('Your CPU is likely holding back your ultra-tier GPU at 1080p/1440p (CPU bottleneck).');
    }
  } else if (isMidHighGpu) {
    score = 85;
    targetCapability = '1440p High 100+ FPS / 1080p 144+ FPS';
    strengths.push('Solid 1440p gaming setup with modern DX12 and DLSS/FSR support.');
  } else if (isBudgetGpu) {
    score = 55;
    targetCapability = '1080p Competitive / 720p Esports (FSR Recommended)';
    warnings.push('GPU has limited VRAM (6GB or less). Avoid Ultra textures in modern UE5 games.');
  }

  // RAM analysis
  if (ramLower.includes('8gb')) {
    score -= 15;
    warnings.push('8GB RAM is severely limiting in modern 2024-2026 games. Upgrading to 16GB/32GB will stop micro-stutters.');
  } else if (ramLower.includes('32gb') || ramLower.includes('64gb')) {
    strengths.push('Generous RAM capacity eliminates background paging and hitching.');
  }

  // Storage
  if (specs.storage.toLowerCase().includes('hdd')) {
    warnings.push('Mechanical HDD detected: DirectStorage games will suffer heavy texture pop-in.');
  } else {
    strengths.push('Fast NVMe / SSD ensures fast shader caching and asset streaming.');
  }

  return {
    score: Math.min(100, Math.max(30, score)),
    bottleneckRisk,
    targetCapability,
    warnings,
    strengths,
  };
}
