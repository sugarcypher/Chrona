import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('chrona_has_launched');
      if (hasLaunched) {
        router.replace('/metrology');
      } else {
        router.replace('/splash');
      }
    } catch (error) {
      console.error('Error checking initial route:', error);
      router.replace('/splash');
    }
  };

  return null;
}