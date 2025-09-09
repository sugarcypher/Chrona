import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  StatusBar,
  ScrollView,
} from 'react-native';
import { ArrowRight, ArrowLeft, Sparkles, Target, Calendar, BarChart3, Brain, Users, Shield, Clock, TrendingUp } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon?: string;
  features?: string[];
}

interface OnboardingTourProps {
  steps: TourStep[];
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTour({ steps, visible, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible, slideAnim]);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentStep, slideAnim, visible]);

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

  const getStepIcon = (stepId: string, iconName?: string) => {
    const iconProps = { size: 32, color: '#FFFFFF' };
    
    if (iconName) {
      switch (iconName) {
        case 'users': return <Users {...iconProps} />;
        case 'shield': return <Shield {...iconProps} />;
        case 'clock': return <Clock {...iconProps} />;
        case 'trending-up': return <TrendingUp {...iconProps} />;
        case 'calendar': return <Calendar {...iconProps} />;
        case 'target': return <Target {...iconProps} />;
        case 'bar-chart': return <BarChart3 {...iconProps} />;
        case 'brain': return <Brain {...iconProps} />;
        default: return <Sparkles {...iconProps} />;
      }
    }

    switch (stepId) {
      case 'welcome': return <Sparkles {...iconProps} />;
      case 'tasks': return <Target {...iconProps} />;
      case 'calendar': return <Calendar {...iconProps} />;
      case 'analytics': return <BarChart3 {...iconProps} />;
      case 'focus': return <Brain {...iconProps} />;
      case 'team': return <Users {...iconProps} />;
      case 'privacy': return <Shield {...iconProps} />;
      default: return <Sparkles {...iconProps} />;
    }
  };

  if (!visible || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>
              {currentStep + 1} of {steps.length}
            </Text>
          </View>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: slideAnim,
              transform: [{
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                })
              }]
            }
          ]}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              {getStepIcon(currentStepData.id, currentStepData.icon)}
            </View>
            
            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.description}>{currentStepData.description}</Text>
            
            {currentStepData.features && currentStepData.features.length > 0 && (
              <View style={styles.featuresContainer}>
                {currentStepData.features.map((feature, index) => (
                  <View key={`feature-${currentStepData.id}-${index}`} style={styles.featureItem}>
                    <View style={styles.featureBullet} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </Animated.View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <View style={styles.progressContainer}>
            {steps.map((step, index) => (
              <View 
                key={`progress-${step.id}-${index}`}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  index < currentStep && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>
          
          <View style={styles.navigationButtons}>
            <TouchableOpacity 
              onPress={handlePrevious}
              style={[styles.navButton, styles.prevButton, currentStep === 0 && styles.navButtonDisabled]}
              disabled={currentStep === 0}
            >
              <ArrowLeft size={16} color={currentStep === 0 ? '#64748B' : '#475569'} />
              <Text style={[styles.prevButtonText, currentStep === 0 && styles.navButtonTextDisabled]}>
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleNext}
              style={[styles.navButton, styles.nextButton]}
            >
              <Text style={styles.nextButtonText}>
                {isLastStep ? 'Get Started' : 'Next'}
              </Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  stepIndicator: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  stepText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  description: {
    fontSize: 18,
    color: '#CBD5E1',
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresContainer: {
    marginTop: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginTop: 8,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: '#E2E8F0',
    lineHeight: 24,
  },
  navigation: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#475569',
  },
  progressDotActive: {
    backgroundColor: '#3B82F6',
    width: 32,
    height: 8,
    borderRadius: 4,
  },
  progressDotCompleted: {
    backgroundColor: '#10B981',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  prevButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#475569',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  prevButtonText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: '#64748B',
  },
});

export { OnboardingTour };
export type { TourStep };