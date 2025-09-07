import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TourStep } from '@/components/ui/OnboardingTour';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export function useOnboardingTour() {
  const [showTour, setShowTour] = useState(false);
  const [tourSteps, setTourSteps] = useState<TourStep[]>([]);

  const startDefaultTour = useCallback(() => {
    const defaultSteps: TourStep[] = [
      {
        id: 'welcome',
        title: 'Welcome to Chrona',
        description: 'Your enterprise-grade time management companion. Chrona uses advanced analytics and calendar integration to optimize your productivity.',
        position: { x: 20, y: 120, width: width - 40, height: 80 }
      },
      {
        id: 'tasks',
        title: 'Smart Task Management',
        description: 'Create, track, and optimize your tasks with power-law estimation, context switching costs, and satisficing thresholds for maximum efficiency.',
        position: { x: 20, y: 200, width: width - 40, height: 100 }
      },
      {
        id: 'calendar',
        title: 'Calendar Integration',
        description: 'Connect Google Calendar, Outlook, or Apple Calendar to sync events, detect conflicts, and optimize your schedule around existing commitments.',
        position: { x: 20, y: 320, width: width - 40, height: 100 }
      },
      {
        id: 'analytics',
        title: 'Advanced Analytics',
        description: 'View real-time insights about your productivity patterns, including meeting overhead, focus time blocks, and interruption rates.',
        position: { x: 20, y: 440, width: width - 40, height: 100 }
      },
      {
        id: 'focus',
        title: 'Flow State Tracking',
        description: 'Monitor your focus intensity, track flow triggers, and optimize your work environment for sustained deep work sessions.',
        position: { x: 20, y: 560, width: width - 40, height: 100 }
      },
      {
        id: 'privacy',
        title: 'Privacy-First Design',
        description: 'All your data stays on your device. Micro-pattern detection and analytics work locally without compromising your privacy.',
        position: { x: 20, y: height - 200, width: width - 40, height: 80 }
      }
    ];
    
    setTourSteps(defaultSteps);
    setShowTour(true);
  }, []);

  const checkTourStatus = useCallback(async () => {
    try {
      const [hasLaunched, tourCompleted] = await Promise.all([
        AsyncStorage.getItem('chrona_has_launched'),
        AsyncStorage.getItem('chrona_tour_completed'),
      ]);

      if (!hasLaunched || !tourCompleted) {
        // Mark as launched and show tour after a brief delay
        await AsyncStorage.setItem('chrona_has_launched', 'true');
        setTimeout(() => {
          startDefaultTour();
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking tour status:', error);
    }
  }, [startDefaultTour]);

  useEffect(() => {
    checkTourStatus();
  }, [checkTourStatus]);

  const startTour = (steps: TourStep[]) => {
    setTourSteps(steps);
    setShowTour(true);
  };

  const completeTour = async () => {
    try {
      await AsyncStorage.setItem('chrona_tour_completed', 'true');
      setShowTour(false);
      setTourSteps([]);
    } catch (error) {
      console.error('Error completing tour:', error);
    }
  };

  const skipTour = async () => {
    try {
      await AsyncStorage.setItem('chrona_tour_completed', 'true');
      setShowTour(false);
      setTourSteps([]);
    } catch (error) {
      console.error('Error skipping tour:', error);
    }
  };

  return {
    showTour,
    tourSteps,
    startTour,
    startDefaultTour,
    completeTour,
    skipTour,
  };
}