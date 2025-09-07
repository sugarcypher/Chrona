import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import { X, ArrowRight, ArrowLeft, Sparkles, Target, Calendar, BarChart3, Brain } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetComponent?: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface OnboardingTourProps {
  steps: TourStep[];
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTour({ steps, visible, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible, fadeAnim, scaleAnim]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('chrona_tour_completed', 'true');
      onComplete();
    } catch (error) {
      console.error('Error saving tour completion:', error);
      onComplete();
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('chrona_tour_completed', 'true');
      onSkip();
    } catch (error) {
      console.error('Error saving tour skip:', error);
      onSkip();
    }
  };

  if (!visible || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Spotlight effect */}
        <View style={styles.spotlightContainer}>
          <View 
            style={[
              styles.spotlight,
              {
                left: currentStepData.position.x - 10,
                top: currentStepData.position.y - 10,
                width: currentStepData.position.width + 20,
                height: currentStepData.position.height + 20,
              }
            ]}
          />
        </View>

        {/* Tour content */}
        <Animated.View 
          style={[
            styles.tourCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              top: currentStepData.position.y + currentStepData.position.height + 20 > height - 200 
                ? currentStepData.position.y - 180
                : currentStepData.position.y + currentStepData.position.height + 20,
            }
          ]}
        >
          <View style={styles.tourHeader}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepText}>
                {currentStep + 1} of {steps.length}
              </Text>
            </View>
            <TouchableOpacity onPress={handleSkip} style={styles.closeButton}>
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={styles.tourIconContainer}>
            {currentStepData.id === 'welcome' && <Sparkles size={24} color="#0EA5E9" />}
            {currentStepData.id === 'tasks' && <Target size={24} color="#10B981" />}
            {currentStepData.id === 'calendar' && <Calendar size={24} color="#8B5CF6" />}
            {currentStepData.id === 'analytics' && <BarChart3 size={24} color="#F59E0B" />}
            {currentStepData.id === 'focus' && <Brain size={24} color="#EC4899" />}
            {!['welcome', 'tasks', 'calendar', 'analytics', 'focus'].includes(currentStepData.id) && <Sparkles size={24} color="#0EA5E9" />}
          </View>
          <Text style={styles.tourTitle}>{currentStepData.title}</Text>
          <Text style={styles.tourDescription}>{currentStepData.description}</Text>

          <View style={styles.tourNavigation}>
            <TouchableOpacity 
              onPress={handlePrevious}
              style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
              disabled={currentStep === 0}
            >
              <ArrowLeft size={16} color={currentStep === 0 ? '#6B7280' : '#FFFFFF'} />
              <Text style={[styles.navButtonText, currentStep === 0 && styles.navButtonTextDisabled]}>
                Previous
              </Text>
            </TouchableOpacity>

            <View style={styles.progressContainer}>
              {steps.map((_, index) => (
                <View 
                  key={index}
                  style={[
                    styles.progressDot,
                    index === currentStep && styles.progressDotActive,
                    index < currentStep && styles.progressDotCompleted,
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity 
              onPress={handleNext}
              style={[styles.navButton, styles.nextButton]}
            >
              <Text style={styles.navButtonText}>
                {isLastStep ? 'Finish' : 'Next'}
              </Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  spotlightContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  spotlight: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderRadius: 12,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(14, 165, 233, 0.6)',
  },
  tourCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  tourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepIndicator: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  stepText: {
    color: '#0EA5E9',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  tourIconContainer: {
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  tourTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  tourDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 28,
    textAlign: 'center',
  },
  tourNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  nextButton: {
    backgroundColor: '#0EA5E9',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: '#9CA3AF',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  progressDotActive: {
    backgroundColor: '#0EA5E9',
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  progressDotCompleted: {
    backgroundColor: '#10B981',
  },
});

export { OnboardingTour };
export type { TourStep };