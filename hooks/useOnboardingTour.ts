import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TourStep } from '@/components/ui/OnboardingTour';

export function useOnboardingTour() {
  const [showTour, setShowTour] = useState(false);
  const [tourSteps, setTourSteps] = useState<TourStep[]>([]);

  const startDefaultTour = useCallback(() => {
    const defaultSteps: TourStep[] = [
      {
        id: 'welcome',
        title: 'Welcome to Chrona',
        description: 'Your enterprise work-from-home management solution. Gain insights into remote team productivity and optimize distributed work patterns.',
        icon: 'users',
        features: [
          'Monitor remote team productivity patterns',
          'Track work-from-home efficiency metrics',
          'Optimize distributed team collaboration'
        ]
      },
      {
        id: 'calendar',
        title: 'Calendar Integration',
        description: 'Connect employee calendars to understand meeting patterns, availability, and work-life balance in remote settings.',
        icon: 'calendar',
        features: [
          'Sync Google Calendar, Outlook, and Apple Calendar',
          'Detect meeting fatigue and overload',
          'Analyze focus time vs. collaboration time',
          'Track cross-timezone coordination efficiency'
        ]
      },
      {
        id: 'tasks',
        title: 'Task & Project Tracking',
        description: 'Monitor task completion rates, project velocity, and identify bottlenecks in remote work environments.',
        icon: 'target',
        features: [
          'Track individual and team task completion',
          'Measure project delivery timelines',
          'Identify productivity blockers',
          'Optimize task allocation across time zones'
        ]
      },
      {
        id: 'analytics',
        title: 'Productivity Analytics',
        description: 'Get comprehensive insights into remote work patterns, team performance, and areas for improvement.',
        icon: 'bar-chart',
        features: [
          'Real-time productivity dashboards',
          'Team performance comparisons',
          'Work pattern analysis and trends',
          'Custom reporting for management'
        ]
      },
      {
        id: 'focus',
        title: 'Focus & Well-being',
        description: 'Monitor deep work sessions, break patterns, and ensure healthy work-life balance for remote employees.',
        icon: 'brain',
        features: [
          'Track focus time and interruption patterns',
          'Monitor work-life balance indicators',
          'Identify burnout risk factors',
          'Promote healthy remote work habits'
        ]
      },
      {
        id: 'privacy',
        title: 'Enterprise Security',
        description: 'All employee data is processed securely with enterprise-grade privacy controls and compliance standards.',
        icon: 'shield',
        features: [
          'GDPR and SOC 2 compliant data handling',
          'Local data processing where possible',
          'Anonymized team insights',
          'Configurable privacy settings'
        ]
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
        await AsyncStorage.setItem('chrona_has_launched', 'true');
        setTimeout(() => {
          startDefaultTour();
        }, 1500);
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
      setShowTour(false);
      setTourSteps([]);
    }
  };

  const skipTour = async () => {
    try {
      await AsyncStorage.setItem('chrona_tour_completed', 'true');
      setShowTour(false);
      setTourSteps([]);
    } catch (error) {
      console.error('Error skipping tour:', error);
      setShowTour(false);
      setTourSteps([]);
    }
  };

  const resetTour = async () => {
    try {
      await AsyncStorage.removeItem('chrona_tour_completed');
      startDefaultTour();
    } catch (error) {
      console.error('Error resetting tour:', error);
    }
  };

  return {
    showTour,
    tourSteps,
    startTour,
    startDefaultTour,
    completeTour,
    skipTour,
    resetTour,
  };
}