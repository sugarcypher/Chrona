import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Shield, 
  Eye, 
  Lock, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  Target, 
  Zap, 
  BarChart3,
  Sparkles,
  Timer,
  Brain,
  TrendingUp
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/design';



interface ConsentState {
  dataProcessing: boolean;
  temporalMetrics: boolean;
  cooperativeResearch: boolean;
  liabilityAcknowledged: boolean;
}

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [consent, setConsent] = useState<ConsentState>({
    dataProcessing: false,
    temporalMetrics: false,
    cooperativeResearch: false,
    liabilityAcknowledged: false,
  });
  
  const particleAnims = useRef(Array.from({ length: 12 }, () => ({
    x: new Animated.Value(Math.random() * width),
    y: new Animated.Value(Math.random() * height),
    opacity: new Animated.Value(Math.random() * 0.6 + 0.2),
    scale: new Animated.Value(Math.random() * 0.5 + 0.5),
  }))).current;

  useEffect(() => {
    checkFirstLaunch();
    
    // Main entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Continuous rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();
    
    // Floating particles animation
    const animateParticles = () => {
      particleAnims.forEach((particle, index) => {
        const animateParticle = () => {
          Animated.parallel([
            Animated.timing(particle.y, {
              toValue: -100,
              duration: 8000 + Math.random() * 4000,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(particle.opacity, {
                toValue: 0.8,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(particle.opacity, {
                toValue: 0,
                duration: 6000,
                useNativeDriver: true,
              }),
            ]),
          ]).start(() => {
            particle.y.setValue(height + 100);
            particle.x.setValue(Math.random() * width);
            particle.opacity.setValue(Math.random() * 0.6 + 0.2);
            animateParticle();
          });
        };
        
        setTimeout(() => animateParticle(), index * 1000);
      });
    };
    
    animateParticles();
    
    return () => {
      rotateAnimation.stop();
    };
  }, [fadeAnim, slideAnim, scaleAnim, rotateAnim]);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('workflow_has_launched');
      if (hasLaunched) {
        router.replace('/(tabs)/tasks');
      }
    } catch (error) {
      console.error('Error checking first launch:', error);
    }
  };

  const handleConsentChange = (key: keyof ConsentState) => {
    setConsent(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const canProceed = () => {
    return Object.values(consent).every(value => value === true);
  };

  const handleProceed = async () => {
    if (!canProceed()) return;
    
    try {
      await AsyncStorage.setItem('workflow_consent', JSON.stringify({
        ...consent,
        timestamp: Date.now(),
        version: '1.0.0',
      }));
      
      setCurrentStep(2); // Move to onboarding
    } catch (error) {
      console.error('Error saving consent:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('workflow_has_launched', 'true');
      await AsyncStorage.setItem('workflow_onboarding_completed', 'true');
      router.replace('/(tabs)/tasks');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const onboardingSteps = [
    {
      icon: Clock,
      title: 'Work Time Tracking',
      description: 'Monitor work hours, break patterns, and productivity cycles. Ensure compliance with company policies while optimizing personal efficiency.',
    },
    {
      icon: Target,
      title: 'Task Management',
      description: 'Organize and prioritize work tasks with enterprise integration. Track progress, deadlines, and deliverables with team visibility.',
    },
    {
      icon: Zap,
      title: 'Productivity Insights',
      description: 'Analyze work patterns, identify bottlenecks, and optimize workflows. Get actionable insights to improve team performance.',
    },
    {
      icon: BarChart3,
      title: 'Team Analytics',
      description: 'Access comprehensive dashboards showing team productivity, collaboration patterns, and performance metrics for management oversight.',
    },
  ];

  const renderOnboarding = () => {
    const currentOnboardingStep = onboardingSteps[onboardingStep];
    const IconComponent = currentOnboardingStep.icon;
    
    return (
      <View style={styles.onboardingContainer}>
        <View style={styles.onboardingHeader}>
          <Text style={styles.onboardingTitle}>Welcome to WorkFlow Manager</Text>
          <Text style={styles.onboardingSubtitle}>
            Let&apos;s explore how WorkFlow Manager optimizes your work-from-home experience
          </Text>
        </View>
        
        <View style={styles.onboardingContent}>
          <View style={styles.onboardingFeatureCard}>
            <View style={styles.featureIcon}>
              <IconComponent size={28} color="#0EA5E9" />
            </View>
            <Text style={styles.onboardingFeatureTitle}>{currentOnboardingStep.title}</Text>
            <Text style={styles.featureDescription}>{currentOnboardingStep.description}</Text>
          </View>
        </View>
        
        <View style={styles.onboardingNavigation}>
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={completeOnboarding}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          
          <View style={styles.progressContainer}>
            {onboardingSteps.map((_, index) => (
              <View 
                key={index}
                style={[
                  styles.progressDot,
                  index === onboardingStep && styles.progressDotActive
                ]}
              />
            ))}
          </View>
          
          {onboardingStep < onboardingSteps.length - 1 ? (
            <TouchableOpacity 
              style={styles.nextOnboardingButton}
              onPress={() => setOnboardingStep(prev => prev + 1)}
            >
              <Text style={styles.nextOnboardingButtonText}>Next</Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.getStartedButton}
              onPress={completeOnboarding}
            >
              <Text style={styles.getStartedButtonText}>Get Started</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderParticles = () => (
    <View style={styles.particleContainer}>
      {particleAnims.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        >
          <Sparkles size={4} color={Colors.accent[400]} />
        </Animated.View>
      ))}
    </View>
  );

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      {renderParticles()}
      
      <LinearGradient
        colors={['rgba(168, 85, 247, 0.1)', 'rgba(124, 58, 237, 0.05)', 'transparent']}
        style={styles.gradientOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <View style={styles.logoContainer}>
        <Animated.View style={[
          styles.logoWrapper,
          {
            transform: [
              { scale: scaleAnim },
            ],
            opacity: fadeAnim,
          }
        ]}>
          <View style={styles.logoImageContainer}>
            <Image 
              source={require('@/assets/images/icon.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.logoGlow} />
          </View>
          
          <View style={styles.logoRing} />
          <View style={[styles.logoRing, styles.logoRingOuter]} />
        </Animated.View>
        
        <Animated.View style={[
          styles.brandContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}>
          <Text style={styles.logoText}>WorkFlow Manager</Text>
          <Text style={styles.tagline}>Enterprise Work-From-Home Management</Text>
        </Animated.View>
      </View>
      
      <Animated.View style={[
        styles.descriptionContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}>
        <Text style={styles.description}>
          Comprehensive work-from-home management solution for enterprise teams. Monitor productivity, optimize workflows, and ensure compliance across distributed workforces.
        </Text>
        
        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Shield size={24} color={Colors.success[500]} strokeWidth={1.5} />
            </View>
            <Text style={styles.featureTitle}>Device Management</Text>
            <Text style={styles.featureSubtitle}>Secure monitoring</Text>
          </View>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Brain size={24} color={Colors.info[500]} strokeWidth={1.5} />
            </View>
            <Text style={styles.featureTitle}>Productivity Analytics</Text>
            <Text style={styles.featureSubtitle}>Real-time insights</Text>
          </View>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <TrendingUp size={24} color={Colors.accent[500]} strokeWidth={1.5} />
            </View>
            <Text style={styles.featureTitle}>Team Coordination</Text>
            <Text style={styles.featureSubtitle}>Seamless collaboration</Text>
          </View>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Lock size={24} color={Colors.warning[500]} strokeWidth={1.5} />
            </View>
            <Text style={styles.featureTitle}>Compliance Ready</Text>
            <Text style={styles.featureSubtitle}>Audit trails</Text>
          </View>
        </View>
      </Animated.View>
      
      <Animated.View style={[
        styles.ctaContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => setCurrentStep(1)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.accent[500], Colors.accent[700]]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.primaryButtonText}>Begin Enterprise Setup</Text>
            <ArrowRight size={20} color={Colors.background.primary} strokeWidth={2} />
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Version 1.0.0 • Enterprise Work-From-Home Manager</Text>
      </Animated.View>
    </View>
  );

  const renderConsent = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Enterprise Policy Agreement</Text>
      <Text style={styles.stepSubtitle}>
        WorkFlow Manager operates under enterprise security and compliance standards. Please review and acknowledge:
      </Text>
      
      <ScrollView style={styles.consentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.consentSection}>
          <TouchableOpacity 
            style={styles.consentItem}
            onPress={() => handleConsentChange('dataProcessing')}
          >
            <View style={[styles.checkbox, consent.dataProcessing && styles.checkboxChecked]}>
              {consent.dataProcessing && <CheckCircle size={16} color="#FFFFFF" />}
            </View>
            <View style={styles.consentContent}>
              <Text style={styles.consentTitle}>Work Activity Monitoring</Text>
              <Text style={styles.consentText}>
                I understand that WorkFlow Manager monitors work activities, productivity metrics, and application usage for enterprise compliance and optimization purposes. Data is processed according to company policy.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.consentSection}>
          <TouchableOpacity 
            style={styles.consentItem}
            onPress={() => handleConsentChange('temporalMetrics')}
          >
            <View style={[styles.checkbox, consent.temporalMetrics && styles.checkboxChecked]}>
              {consent.temporalMetrics && <CheckCircle size={16} color="#FFFFFF" />}
            </View>
            <View style={styles.consentContent}>
              <Text style={styles.consentTitle}>Productivity Data Collection</Text>
              <Text style={styles.consentText}>
                I consent to WorkFlow Manager collecting productivity metrics, task completion data, and work patterns to optimize team performance and ensure compliance with company policies.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.consentSection}>
          <TouchableOpacity 
            style={styles.consentItem}
            onPress={() => handleConsentChange('cooperativeResearch')}
          >
            <View style={[styles.checkbox, consent.cooperativeResearch && styles.checkboxChecked]}>
              {consent.cooperativeResearch && <CheckCircle size={16} color="#FFFFFF" />}
            </View>
            <View style={styles.consentContent}>
              <Text style={styles.consentTitle}>Enterprise Analytics Participation</Text>
              <Text style={styles.consentText}>
                I agree to participate in enterprise-wide productivity analytics to improve team efficiency and identify optimization opportunities. Data sharing follows company data governance policies.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.consentSection}>
          <TouchableOpacity 
            style={styles.consentItem}
            onPress={() => handleConsentChange('liabilityAcknowledged')}
          >
            <View style={[styles.checkbox, consent.liabilityAcknowledged && styles.checkboxChecked]}>
              {consent.liabilityAcknowledged && <CheckCircle size={16} color="#FFFFFF" />}
            </View>
            <View style={styles.consentContent}>
              <Text style={styles.consentTitle}>Enterprise Compliance & Responsibility</Text>
              <Text style={styles.consentText}>
                I acknowledge that WorkFlow Manager is an enterprise productivity tool. I agree to use it in accordance with company policies and understand that monitoring data may be used for performance evaluation and compliance purposes.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <TouchableOpacity 
        style={[styles.proceedButton, !canProceed() && styles.proceedButtonDisabled]}
        onPress={handleProceed}
        disabled={!canProceed()}
      >
        <Text style={[styles.proceedButtonText, !canProceed() && styles.proceedButtonTextDisabled]}>
          {canProceed() ? 'Begin Work Session' : 'Please acknowledge all items'}
        </Text>
        {canProceed() && <ArrowRight size={20} color="#FFFFFF" />}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {currentStep === 0 ? renderWelcome() : 
         currentStep === 1 ? renderConsent() : 
         renderOnboarding()}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary[900],
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Spacing['2xl'],
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    zIndex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.lg,
    zIndex: 2,
  },
  logoWrapper: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: Spacing['2xl'],
  },
  logoImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    position: 'relative',
    ...Shadows.xl,
  },
  logoImage: {
    width: 80,
    height: 80,
    zIndex: 2,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.accent[500],
    opacity: 0.1,
    zIndex: 1,
  },
  logoRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: `${Colors.accent[400]}30`,
  },
  logoRingOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderColor: `${Colors.accent[300]}15`,
  },
  brandContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.text.inverse,
    letterSpacing: -0.8,
    textAlign: 'center' as const,
    marginBottom: Spacing.sm,
    lineHeight: 40,
  },
  tagline: {
    fontSize: 14,
    color: Colors.primary[300],
    textAlign: 'center' as const,
    letterSpacing: 0.3,
    fontWeight: '400' as const,
    lineHeight: 18,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xs,
  },
  descriptionContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    zIndex: 2,
  },
  description: {
    fontSize: 16,
    color: Colors.primary[200],
    lineHeight: 24,
    textAlign: 'center' as const,
    marginBottom: Spacing['3xl'],
    fontWeight: '400' as const,
    paddingHorizontal: Spacing['2xl'],
    letterSpacing: 0.1,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.lg,
  },
  featureCard: {
    width: (width - Spacing['2xl'] * 2 - Spacing.lg) / 2,
    backgroundColor: `${Colors.background.primary}08`,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${Colors.accent[400]}20`,
    ...Shadows.sm,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.background.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.inverse,
    textAlign: 'center' as const,
    marginBottom: Spacing.xs,
    lineHeight: 16,
  },
  featureSubtitle: {
    fontSize: 11,
    color: Colors.primary[400],
    textAlign: 'center' as const,
    lineHeight: 14,
    fontWeight: '400' as const,
  },
  ctaContainer: {
    alignItems: 'center',
    zIndex: 2,
  },
  primaryButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing['3xl'],
    gap: Spacing.md,
  },
  primaryButtonText: {
    color: Colors.background.primary,
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  versionText: {
    fontSize: 13,
    color: Colors.primary[500],
    marginTop: Spacing.xl,
    fontWeight: '400' as const,
    textAlign: 'center' as const,
    letterSpacing: 0.3,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    marginTop: 20,
    letterSpacing: -0.3,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center' as const,
    marginTop: 12,
    lineHeight: 22,
    fontWeight: '400' as const,
    paddingHorizontal: Spacing.lg,
  },
  consentContainer: {
    flex: 1,
    marginTop: 32,
    marginBottom: 24,
  },
  consentSection: {
    marginBottom: 24,
  },
  consentItem: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#111111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  consentContent: {
    flex: 1,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  consentText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  proceedButton: {
    backgroundColor: '#0EA5E9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  proceedButtonDisabled: {
    backgroundColor: '#374151',
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  proceedButtonTextDisabled: {
    color: '#9CA3AF',
  },
  onboardingContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  onboardingHeader: {
    alignItems: 'center',
    marginTop: 40,
  },
  onboardingTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  onboardingSubtitle: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  onboardingContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  onboardingFeatureCard: {
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.2)',
  },
  onboardingFeatureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 22,
  },
  onboardingNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#374151',
  },
  progressDotActive: {
    backgroundColor: '#0EA5E9',
    width: 24,
  },
  nextOnboardingButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextOnboardingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  getStartedButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});