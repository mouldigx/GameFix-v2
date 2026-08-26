import { UserHardwareSpecs } from '../types';
import { COMMON_GPUS, COMMON_CPUS } from '../data/gamingKnowledge';

export interface ScanLogStep {
  step: number;
  message: string;
  detail: string;
}

export interface PresetRigProfile {
  id: string;
  name: string;
  tag: string;
  icon: string;
  description: string;
  specs: UserHardwareSpecs;
}

export const PRESET_RIG_PROFILES: PresetRigProfile[] = [
  {
    id: 'sweetspot-1440p',
    name: '1440p Sweetspot Beast',
    tag: 'Recommended',
    icon: 'Zap',
    description: 'High-FPS 1440p gaming with DLSS 3 & Ray Tracing headroom.',
    specs: {
      gpu: 'NVIDIA GeForce RTX 4070 Super 12GB',
      cpu: 'AMD Ryzen 7 7800X3D (8C/16T)',
      ram: '32GB DDR5 6000MHz CL30',
      os: 'Windows 11 64-bit (23H2)',
      storage: '1TB PCIe Gen4 NVMe M.2 SSD',
      resolution: '2560x1440 (1440p QHD 2K)',
      refreshRate: '165Hz / 180Hz',
      platform: 'PC',
    },
  },
  {
    id: 'esports-1080p',
    name: 'Esports 240Hz Speedster',
    tag: 'Max Competitive FPS',
    icon: 'Crosshair',
    description: 'Ultra-low input latency tuned for Valorant, CS2 & Apex.',
    specs: {
      gpu: 'NVIDIA GeForce RTX 4060 8GB',
      cpu: 'AMD Ryzen 5 7600X (6C/12T)',
      ram: '16GB DDR5 5600MHz',
      os: 'Windows 11 64-bit (23H2)',
      storage: '1TB PCIe Gen4 NVMe M.2 SSD',
      resolution: '1920x1080 (1080p FHD)',
      refreshRate: '240Hz+',
      platform: 'PC',
    },
  },
  {
    id: 'ultra-4k',
    name: '4K Ultra Enthusiast',
    tag: 'God-Tier Rig',
    icon: 'Flame',
    description: 'Max settings Path Tracing in Cyberpunk & Black Myth Wukong.',
    specs: {
      gpu: 'NVIDIA GeForce RTX 4090 24GB',
      cpu: 'Intel Core i9-14900K (24C/32T)',
      ram: '64GB DDR5 6000MHz',
      os: 'Windows 11 64-bit (23H2)',
      storage: '1TB PCIe Gen4 NVMe M.2 SSD',
      resolution: '3840x2160 (4K UHD)',
      refreshRate: '144Hz',
      platform: 'PC',
    },
  },
  {
    id: 'gaming-laptop',
    name: 'RTX 4070 Mobile Laptop',
    tag: 'Portable Power',
    icon: 'Laptop',
    description: 'High power mobile gaming with dynamic thermal pacing.',
    specs: {
      gpu: 'NVIDIA GeForce RTX 4070 8GB',
      cpu: 'Intel Core i7-13700K (16C/24T)',
      ram: '16GB DDR5 5600MHz',
      os: 'Windows 11 64-bit (23H2)',
      storage: '1TB PCIe Gen4 NVMe M.2 SSD',
      resolution: '2560x1440 (1440p QHD 2K)',
      refreshRate: '165Hz / 180Hz',
      platform: 'Laptop',
    },
  },
  {
    id: 'budget-potato',
    name: 'Budget / Entry Rig',
    tag: 'Optimized Potato',
    icon: 'Shield',
    description: 'Value gaming build needing FSR & performance mode tweaks.',
    specs: {
      gpu: 'NVIDIA GeForce GTX 1660 Super 6GB',
      cpu: 'AMD Ryzen 5 3600 (6C/12T)',
      ram: '8GB DDR4 / DDR3 (Bottleneck Warning)',
      os: 'Windows 10 / 11 64-bit',
      storage: '500GB SATA 2.5 SSD',
      resolution: '1920x1080 (1080p FHD)',
      refreshRate: '60Hz',
      platform: 'PC',
    },
  },
];

/**
 * Probes browser WebGL, display geometry, and hardware concurrency
 * to synthesize a realistic gaming rig profile.
 */
export function simulateSystemScan(): { specs: UserHardwareSpecs; detectedGpuRaw: string; detectedDetails: string[] } {
  const detectedDetails: string[] = [];
  let detectedGpu = 'NVIDIA GeForce RTX 3070 8GB';
  let detectedGpuRaw = 'Generic GPU Device';

  // 1. Probe WebGL unmasked renderer
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (renderer && typeof renderer === 'string') {
          detectedGpuRaw = renderer;
          detectedDetails.push(`DirectX/OpenGL Device: ${renderer.slice(0, 40)}...`);

          // Match known GPU names
          const lower = renderer.toLowerCase();
          if (lower.includes('4090')) detectedGpu = 'NVIDIA GeForce RTX 4090 24GB';
          else if (lower.includes('4080')) detectedGpu = 'NVIDIA GeForce RTX 4080 Super 16GB';
          else if (lower.includes('4070')) detectedGpu = 'NVIDIA GeForce RTX 4070 Super 12GB';
          else if (lower.includes('4060')) detectedGpu = 'NVIDIA GeForce RTX 4060 8GB';
          else if (lower.includes('3080')) detectedGpu = 'NVIDIA GeForce RTX 3080 10GB/12GB';
          else if (lower.includes('3070')) detectedGpu = 'NVIDIA GeForce RTX 3070 8GB';
          else if (lower.includes('3060')) detectedGpu = 'NVIDIA GeForce RTX 3060 12GB';
          else if (lower.includes('7900')) detectedGpu = 'AMD Radeon RX 7900 XTX 24GB';
          else if (lower.includes('7800')) detectedGpu = 'AMD Radeon RX 7800 XT 16GB';
          else if (lower.includes('6700')) detectedGpu = 'AMD Radeon RX 6700 XT 12GB';
          else if (lower.includes('apple') || lower.includes('m1') || lower.includes('m2') || lower.includes('m3')) {
            detectedGpu = 'NVIDIA GeForce RTX 4070 Super 12GB'; // Default to solid gaming tier for web emulation
          } else if (lower.includes('intel') && (lower.includes('iris') || lower.includes('uhd'))) {
            detectedGpu = 'Integrated Intel Iris Xe / AMD Radeon 680M/780M';
          }
        }
      }
    }
  } catch (e) {
    console.debug('WebGL scan fallback', e);
  }

  // 2. Probe CPU Cores (logical concurrency)
  let detectedCpu = 'AMD Ryzen 5 5600X (6C/12T)';
  const cores = navigator.hardwareConcurrency || 8;
  detectedDetails.push(`CPU Logical Threads: ${cores} Cores`);

  if (cores >= 24) {
    detectedCpu = 'Intel Core i9-14900K (24C/32T)';
  } else if (cores >= 16) {
    detectedCpu = 'AMD Ryzen 7 7800X3D (8C/16T)';
  } else if (cores >= 12) {
    detectedCpu = 'AMD Ryzen 5 7600X (6C/12T)';
  } else if (cores >= 8) {
    detectedCpu = 'AMD Ryzen 5 5600X (6C/12T)';
  } else {
    detectedCpu = 'Intel Core i3-12100F (4C/8T)';
  }

  // 3. Probe Display Resolution
  const width = window.screen.width || 1920;
  const height = window.screen.height || 1080;
  let detectedRes = '1920x1080 (1080p FHD)';
  detectedDetails.push(`Screen Dimensions: ${width}x${height}`);

  if (width >= 3840 || height >= 2160) {
    detectedRes = '3840x2160 (4K UHD)';
  } else if (width === 3440 || (width / height > 2.0 && width > 2560)) {
    detectedRes = '3440x1440 (Ultrawide 21:9)';
  } else if (width >= 2560 || height >= 1440) {
    detectedRes = '2560x1440 (1440p QHD 2K)';
  } else {
    detectedRes = '1920x1080 (1080p FHD)';
  }

  // 4. Memory estimation
  const deviceMem = (navigator as any).deviceMemory || 16;
  let detectedRam = '16GB DDR4 3200MHz';
  if (deviceMem >= 32) {
    detectedRam = '32GB DDR5 6000MHz CL30';
  } else if (deviceMem >= 16) {
    detectedRam = '16GB DDR5 5600MHz';
  } else if (deviceMem <= 4) {
    detectedRam = '8GB DDR4 / DDR3 (Bottleneck Warning)';
  }

  // 5. Refresh rate heuristic
  let detectedRefresh = '144Hz';
  if (detectedRes.includes('4K')) {
    detectedRefresh = '144Hz';
  } else if (detectedRes.includes('1440p')) {
    detectedRefresh = '165Hz / 180Hz';
  } else {
    detectedRefresh = '144Hz';
  }

  const scannedSpecs: UserHardwareSpecs = {
    gpu: detectedGpu,
    cpu: detectedCpu,
    ram: detectedRam,
    os: 'Windows 11 64-bit (23H2)',
    storage: '1TB PCIe Gen4 NVMe M.2 SSD',
    resolution: detectedRes,
    refreshRate: detectedRefresh,
    platform: 'PC',
  };

  return {
    specs: scannedSpecs,
    detectedGpuRaw,
    detectedDetails,
  };
}
