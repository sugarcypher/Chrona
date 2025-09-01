export interface Task {
  id: string;
  title: string;
  estimatedMinutes: number;
  actualMinutes: number;
  minMinutes: number;
  maxMinutes: number;
  powerLawExponent: number;
  contextSwitchCost: number;
  verificationCriteria: string[];
  satisficingThreshold: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  perceptionRatio?: number;
}

export interface TimeBlock {
  id: string;
  taskId: string;
  startTime: number;
  endTime: number;
  duration: number;
  flowIntensity: number;
  initiationLatency?: number;
}

export interface TimeMetrics {
  resolution: number;
  jitter: number;
  drift: number;
  latency: number;
}

export interface FlowState {
  isInFlow: boolean;
  intensity: number;
  entryTime: number | null;
  halfLife: number;
  entryVelocity: number;
  sustainedMinutes: number;
}

export interface ChronoFingerprint {
  peakFocusHour: number;
  stabilityWindow: string;
  avgResolution: number;
}

export interface Nudge {
  type: string;
  timestamp: number;
  accepted: boolean;
  mechanism: string;
  tradeoff: string;
}