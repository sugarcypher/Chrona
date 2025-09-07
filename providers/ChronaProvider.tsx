import React, { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, TimeBlock, FlowState, ChronoFingerprint, Nudge, TimeMetrics, CalendarEvent } from '@/types/chrona';
import { TourStep } from '@/components/ui/OnboardingTour';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import { useCalendar } from '@/providers/CalendarProvider';

interface ChronaContextValue {
  tasks: Task[];
  activeTask: Task | null;
  timeBlocks: TimeBlock[];
  flowState: FlowState;
  currentMetrics: TimeMetrics;
  chronoFingerprint: ChronoFingerprint;
  entropyBudget: { total: number; used: number };
  nudgeLedger: Nudge[];
  nudgeSettings: any;
  settings: any;
  
  // Calendar integration
  calendarEvents: CalendarEvent[];
  getTasksWithCalendarContext: () => (Task & { calendarEvents: CalendarEvent[]; conflictScore: number })[];
  createTaskFromEvent: (event: CalendarEvent) => void;
  getAnalyticsWithCalendar: () => {
    totalScheduledTime: number;
    actualWorkTime: number;
    meetingOverhead: number;
    focusTimeBlocks: number;
    interruptionRate: number;
  };
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'actualMinutes'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  startTask: (taskId: string) => void;
  pauseTask: () => void;
  completeTask: (taskId: string, perceptionRatio: number) => void;
  
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => void;
  updateFlowState: (updates: Partial<FlowState>) => void;
  updateEntropyBudget: (budget: { total: number }) => void;
  
  addNudge: (nudge: Nudge) => void;
  updateNudgeSettings: (settings: any) => void;
  updateSettings: (settings: any) => void;
  clearAllData: () => void;
  
  // Onboarding tour
  startTour: (steps: TourStep[]) => void;
  startDefaultTour: () => void;
  showTour: boolean;
}

export const [ChronaContextProviderComponent, useChrona] = createContextHook<ChronaContextValue>(() => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [flowState, setFlowState] = useState<FlowState>({
    isInFlow: false,
    intensity: 0,
    entryTime: null,
    halfLife: 25,
    entryVelocity: 1.0,
    sustainedMinutes: 0,
  });
  const [entropyBudget, setEntropyBudget] = useState({ total: 60, used: 0 });
  const [nudgeLedger, setNudgeLedger] = useState<Nudge[]>([]);
  const [nudgeSettings, setNudgeSettings] = useState({
    regretMinimization: false,
  });
  const [settings, setSettings] = useState({
    trackMicroPatterns: true,
    autoDetectFlow: true,
    usePowerLaw: true,
    anonymousMetrics: false,
    nudgeNotifications: true,
    flowAlerts: true,
  });
  
  // Calendar integration
  const calendarContext = useCalendar();
  const calendarEvents = useMemo(() => {
    if (!calendarContext || !calendarContext.events) {
      return [];
    }
    return calendarContext.events;
  }, [calendarContext]);

  // Load data from AsyncStorage
  useEffect(() => {
    loadData();
  }, []);

  const saveData = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem('workflow_tasks', JSON.stringify(tasks)),
        AsyncStorage.setItem('workflow_blocks', JSON.stringify(timeBlocks)),
        AsyncStorage.setItem('workflow_entropy', JSON.stringify(entropyBudget)),
        AsyncStorage.setItem('workflow_nudges', JSON.stringify(nudgeLedger)),
        AsyncStorage.setItem('workflow_settings', JSON.stringify(settings)),
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [tasks, timeBlocks, entropyBudget, nudgeLedger, settings]);

  // Save data to AsyncStorage
  useEffect(() => {
    saveData();
  }, [saveData]);

  const loadData = async () => {
    try {
      const [tasksData, blocksData, budgetData, nudgesData, settingsData] = await Promise.all([
        AsyncStorage.getItem('workflow_tasks'),
        AsyncStorage.getItem('workflow_blocks'),
        AsyncStorage.getItem('workflow_entropy'),
        AsyncStorage.getItem('workflow_nudges'),
        AsyncStorage.getItem('workflow_settings'),
      ]);

      if (tasksData) setTasks(JSON.parse(tasksData));
      if (blocksData) setTimeBlocks(JSON.parse(blocksData));
      if (budgetData) setEntropyBudget(JSON.parse(budgetData));
      if (nudgesData) setNudgeLedger(JSON.parse(nudgesData));
      if (settingsData) setSettings(JSON.parse(settingsData));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };



  const currentMetrics = useMemo<TimeMetrics>(() => {
    if (timeBlocks.length === 0) {
      return { resolution: 5, jitter: 0, drift: 0, latency: 0 };
    }

    const recentBlocks = timeBlocks.slice(-20);
    
    // Resolution: smallest time unit
    const resolution = Math.min(...recentBlocks.map(b => b.duration));
    
    // Jitter: variance in timing
    const avgDuration = recentBlocks.reduce((sum, b) => sum + b.duration, 0) / recentBlocks.length;
    const variance = recentBlocks.reduce((sum, b) => sum + Math.pow(b.duration - avgDuration, 2), 0) / recentBlocks.length;
    const jitter = Math.sqrt(variance);
    
    // Drift: deviation from plan
    const drift = tasks.reduce((sum, task) => {
      if (task.actualMinutes) {
        return sum + Math.abs(task.actualMinutes - task.estimatedMinutes);
      }
      return sum;
    }, 0) / Math.max(1, tasks.filter(t => t.actualMinutes).length);
    
    // Latency: start delay
    const latency = recentBlocks.reduce((sum, b) => sum + (b.initiationLatency || 0), 0) / recentBlocks.length;
    
    return { resolution, jitter, drift, latency };
  }, [timeBlocks, tasks]);

  const chronoFingerprint = useMemo<ChronoFingerprint>(() => {
    // Analyze time blocks to find patterns
    const hourlyFocus = Array(24).fill(0);
    timeBlocks.forEach(block => {
      const hour = new Date(block.startTime).getHours();
      if (block.flowIntensity) {
        hourlyFocus[hour] += block.flowIntensity;
      }
    });
    
    const peakHour = hourlyFocus.indexOf(Math.max(...hourlyFocus));
    
    return {
      peakFocusHour: peakHour,
      stabilityWindow: '2-4pm',
      avgResolution: currentMetrics.resolution,
    };
  }, [timeBlocks, currentMetrics]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'actualMinutes'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: Date.now(),
      actualMinutes: 0,
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  const addTimeBlock = useCallback((block: Omit<TimeBlock, 'id'>) => {
    const newBlock: TimeBlock = {
      ...block,
      id: Date.now().toString(),
    };
    setTimeBlocks(prev => [...prev, newBlock]);
  }, []);

  const startTask = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    setActiveTask(task);
    updateTask(taskId, { startedAt: Date.now() });
    
    // Create time block
    addTimeBlock({
      taskId,
      startTime: Date.now(),
      endTime: Date.now(),
      duration: 0,
      flowIntensity: 0,
      initiationLatency: task.startedAt ? Date.now() - task.startedAt : 0,
    });
  }, [tasks, updateTask, addTimeBlock]);

  const pauseTask = useCallback(() => {
    if (!activeTask) return;
    
    const duration = activeTask.startedAt ? 
      Math.floor((Date.now() - activeTask.startedAt) / 60000) : 0;
    
    updateTask(activeTask.id, {
      actualMinutes: (activeTask.actualMinutes || 0) + duration,
    });
    
    setActiveTask(null);
  }, [activeTask, updateTask]);

  const completeTask = useCallback((taskId: string, perceptionRatio: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    updateTask(taskId, {
      completedAt: Date.now(),
      perceptionRatio,
    });
    
    if (activeTask?.id === taskId) {
      setActiveTask(null);
    }
  }, [tasks, activeTask, updateTask]);



  const updateFlowState = useCallback((updates: Partial<FlowState>) => {
    setFlowState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateEntropyBudget = useCallback((budget: { total: number }) => {
    setEntropyBudget(prev => ({ ...prev, ...budget }));
  }, []);

  const addNudge = useCallback((nudge: Nudge) => {
    setNudgeLedger(prev => [...prev, nudge]);
  }, []);

  const updateNudgeSettings = useCallback((newSettings: any) => {
    setNudgeSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const updateSettings = useCallback((newSettings: any) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Calendar integration functions
  const getTasksWithCalendarContext = useCallback(() => {
    return tasks.map(task => {
      const taskStart = task.startedAt || task.createdAt;
      const taskEnd = taskStart + (task.estimatedMinutes * 60 * 1000);
      
      // Find overlapping calendar events
      const overlappingEvents = calendarEvents.filter(event => {
        return (event.startTime <= taskEnd && event.endTime >= taskStart);
      });
      
      // Calculate conflict score based on overlaps
      const conflictScore = overlappingEvents.reduce((score, event) => {
        const overlapStart = Math.max(taskStart, event.startTime);
        const overlapEnd = Math.min(taskEnd, event.endTime);
        const overlapDuration = Math.max(0, overlapEnd - overlapStart);
        return score + (overlapDuration / (task.estimatedMinutes * 60 * 1000));
      }, 0);
      
      return {
        ...task,
        calendarEvents: overlappingEvents,
        conflictScore: Math.min(1, conflictScore),
      };
    });
  }, [tasks, calendarEvents]);
  
  const createTaskFromEvent = useCallback((event: CalendarEvent) => {
    const estimatedMinutes = Math.round((event.endTime - event.startTime) / (60 * 1000));
    
    addTask({
      title: event.title,
      estimatedMinutes,
      minMinutes: Math.max(15, Math.round(estimatedMinutes * 0.7)),
      maxMinutes: Math.round(estimatedMinutes * 1.5),
      powerLawExponent: 1.5,
      contextSwitchCost: 5,
      verificationCriteria: event.description ? [event.description] : [],
      satisficingThreshold: 0.8,
    });
  }, [addTask]);
  
  const getAnalyticsWithCalendar = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayEvents = calendarEvents.filter(event => 
      event.startTime >= today.getTime() && event.startTime < tomorrow.getTime()
    );
    
    const todayTasks = tasks.filter(task => 
      task.createdAt >= today.getTime() && task.createdAt < tomorrow.getTime()
    );
    
    const totalScheduledTime = todayEvents.reduce((total, event) => 
      total + (event.endTime - event.startTime), 0
    ) / (60 * 1000); // Convert to minutes
    
    const actualWorkTime = todayTasks.reduce((total, task) => 
      total + task.actualMinutes, 0
    );
    
    const meetingEvents = todayEvents.filter(event => 
      event.title.toLowerCase().includes('meeting') || 
      event.title.toLowerCase().includes('call') ||
      (event.attendees && event.attendees.length > 1)
    );
    
    const meetingOverhead = meetingEvents.reduce((total, event) => 
      total + (event.endTime - event.startTime), 0
    ) / (60 * 1000);
    
    const focusTimeBlocks = timeBlocks.filter(block => 
      block.startTime >= today.getTime() && 
      block.startTime < tomorrow.getTime() &&
      block.flowIntensity > 0.6
    ).length;
    
    const interruptionRate = todayTasks.length > 0 ? 
      todayTasks.filter(task => task.actualMinutes > task.estimatedMinutes * 1.2).length / todayTasks.length : 0;
    
    return {
      totalScheduledTime,
      actualWorkTime,
      meetingOverhead,
      focusTimeBlocks,
      interruptionRate,
    };
  }, [calendarEvents, tasks, timeBlocks]);

  const clearAllData = useCallback(async () => {
    setTasks([]);
    setTimeBlocks([]);
    setEntropyBudget({ total: 60, used: 0 });
    setNudgeLedger([]);
    setActiveTask(null);
    
    await AsyncStorage.multiRemove([
      'workflow_tasks',
      'workflow_blocks',
      'workflow_entropy',
      'workflow_nudges',
      'workflow_settings',
    ]);
  }, []);

  const { startTour, startDefaultTour, showTour } = useOnboardingTour();

  return useMemo(() => ({
    tasks,
    activeTask,
    timeBlocks,
    flowState,
    currentMetrics,
    chronoFingerprint,
    entropyBudget,
    nudgeLedger,
    nudgeSettings,
    settings,
    
    // Calendar integration
    calendarEvents,
    getTasksWithCalendarContext,
    createTaskFromEvent,
    getAnalyticsWithCalendar,
    
    addTask,
    updateTask,
    startTask,
    pauseTask,
    completeTask,
    
    addTimeBlock,
    updateFlowState,
    updateEntropyBudget,
    
    addNudge,
    updateNudgeSettings,
    updateSettings,
    clearAllData,
    
    startTour,
    startDefaultTour,
    showTour,
  }), [
    tasks,
    activeTask,
    timeBlocks,
    flowState,
    currentMetrics,
    chronoFingerprint,
    entropyBudget,
    nudgeLedger,
    nudgeSettings,
    settings,
    calendarEvents,
    getTasksWithCalendarContext,
    createTaskFromEvent,
    getAnalyticsWithCalendar,
    addTask,
    updateTask,
    startTask,
    pauseTask,
    completeTask,
    addTimeBlock,
    updateFlowState,
    updateEntropyBudget,
    addNudge,
    updateNudgeSettings,
    updateSettings,
    clearAllData,
    startTour,
    startDefaultTour,
    showTour,
  ]);
});

function OnboardingTourWrapper() {
  const { showTour } = useChrona();
  const { tourSteps, completeTour, skipTour } = useOnboardingTour();
  
  if (!showTour) return null;
  
  const OnboardingTourComponent = React.lazy(() => import('@/components/ui/OnboardingTour').then(module => ({ default: module.default })));
  
  return (
    <React.Suspense fallback={null}>
      <OnboardingTourComponent
        visible={showTour}
        steps={tourSteps}
        onComplete={completeTour}
        onSkip={skipTour}
      />
    </React.Suspense>
  );
}

export function ChronaProvider({ children }: { children: React.ReactNode }) {
  return (
    <ChronaContextProviderComponent>
      {children}
      <OnboardingTourWrapper />
    </ChronaContextProviderComponent>
  );
}