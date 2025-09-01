import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TourStep } from '@/components/ui/OnboardingTour';

export function useOnboardingTour() {
  const [showTour, setShowTour] = useState(false);
  const [tourSteps, setTourSteps] = useState<TourStep[]>([]);

  useEffect(() => {
    checkTourStatus();
  }, []);

  const checkTourStatus = async () => {
    try {
      const [hasLaunched, tourCompleted] = await Promise.all([
        AsyncStorage.getItem('chrona_has_launched'),
        AsyncStorage.getItem('chrona_tour_completed'),
      ]);

      if (hasLaunched && !tourCompleted) {
        // Show tour after a brief delay to let the app settle
        setTimeout(() => {
          setShowTour(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error checking tour status:', error);
    }
  };

  const startTour = (steps: TourStep[]) => {
    setTourSteps(steps);
    setShowTour(true);
  };

  const completeTour = () => {
    setShowTour(false);
    setTourSteps([]);
  };

  const skipTour = () => {
    setShowTour(false);
    setTourSteps([]);
  };

  return {
    showTour,
    tourSteps,
    startTour,
    completeTour,
    skipTour,
  };
}