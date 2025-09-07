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

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: number;
  endTime: number;
  location?: string;
  attendees?: string[];
  source: 'google' | 'outlook' | 'apple' | 'manual' | 'scraped';
  sourceId?: string;
  isAllDay: boolean;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: number;
  };
  reminders?: {
    method: 'popup' | 'email';
    minutes: number;
  }[];
  status: 'confirmed' | 'tentative' | 'cancelled';
  visibility: 'public' | 'private';
  createdAt: number;
  updatedAt: number;
}

export interface CalendarIntegration {
  id: string;
  provider: 'google' | 'outlook' | 'apple' | 'ical';
  name: string;
  email?: string;
  isConnected: boolean;
  lastSync: number;
  syncEnabled: boolean;
  calendarIds: string[];
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface ScrapedData {
  id: string;
  source: string;
  url?: string;
  type: 'calendar' | 'schedule' | 'agenda' | 'meeting';
  data: any;
  extractedEvents: CalendarEvent[];
  scrapedAt: number;
  confidence: number;
  status: 'pending' | 'processed' | 'failed';
}

export interface SyncStatus {
  isRunning: boolean;
  lastSync: number;
  nextSync: number;
  errors: string[];
  eventsAdded: number;
  eventsUpdated: number;
  eventsDeleted: number;
}