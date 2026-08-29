export type ThemeMode = 'deep-space' | 'high-contrast';

export interface UserHardwareSpecs {
  gpu: string;
  cpu: string;
  ram: string;
  os: string;
  storage: string;
  resolution: string;
  refreshRate: string;
  platform: 'PC' | 'Laptop' | 'PS5' | 'Xbox Series X/S' | 'Steam Deck' | 'Switch';
}

export interface ParsedDiagnosis {
  quickCause?: string;
  steps?: { title: string; detail: string; command?: string }[];
  proTip?: string;
  quickFix?: string;
  quickFixCommand?: string;
  performanceBoost?: string;
  rawText?: string;
  needsHardwareSpecs?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  specsAttached?: Partial<UserHardwareSpecs>;
  isResolved?: boolean;
  category?: 'performance' | 'crash' | 'network' | 'settings' | 'general';
  parsed?: ParsedDiagnosis;
}

export interface ErrorDatabaseEntry {
  id: string;
  code: string;
  title: string;
  category:
    | 'DirectX & GPU'
    | 'GPU & Drivers'
    | 'DLL & Runtime'
    | 'Anti-Cheat & Launchers'
    | 'Launchers & Stores'
    | 'Network & Ping'
    | 'Controllers & Peripherals'
    | 'Legacy & Compatibility'
    | 'Modding & Addons'
    | 'Low-End PC Optimization'
    | 'Thermal & Hardware'
    | 'Windows Tweaks';
  severity: 'Critical' | 'High' | 'Medium' | 'Optimization';
  symptoms: string;
  quickCause: string;
  steps: string[];
  commandSnippet?: string;
  proTip: string;
  affectedGames: string[];
}

export interface GamePreset {
  id: string;
  name: string;
  category: 'Shooter' | 'RPG' | 'Battle Royale' | 'Action' | 'Open World' | 'Racing';
  engine: string;
  icon: string;
  recommendedGpu: string;
  recommendedCpu: string;
  commonIssues: string[];
  secretTweaks: string[];
}

export interface SettingItem {
  category: string;
  name: string;
  value: string;
  impact: 'Low' | 'Medium' | 'High' | 'Ultra';
  tip: string;
}

export interface OptimizationResult {
  game: string;
  targetFps: string;
  estimatedFps: string;
  resolution: string;
  upscaling: string;
  settings: SettingItem[];
  launchOptions?: string;
  proTip: string;
}

export interface CrashLogResult {
  summary: string;
  rootCause: string;
  culpritModule?: string;
  steps: string[];
  proTip: string;
}

export interface ConfigTweakItem {
  parameter: string;
  value: string;
  reason: string;
}

export interface GameConfigResult {
  configFileName: string;
  configPath: string;
  engine: string;
  summary: string;
  targetGpuTier?: string;
  configContent: string;
  installationTip: string;
  keyTweaks?: ConfigTweakItem[];
}

export interface LookupStepItem {
  stepNumber: number;
  title: string;
  instruction: string;
  command?: string;
}

export interface ErrorCodeLookupResult {
  errorCode: string;
  title: string;
  description: string;
  rootCause: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: string;
  steps: LookupStepItem[];
  commandSnippet?: string;
  proTip: string;
  affectedGames?: string[];
}

