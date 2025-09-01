import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shield, Clock, Eye, Lock, CheckCircle, ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface ConsentState {
  dataProcessing: boolean;
  temporalMetrics: boolean;
  cooperativeResearch: boolean;
  liabilityAcknowledged: boolean;
}

export default function SplashScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [currentStep, setCurrentStep] = useState(0);
  const [consent, setConsent] = useState<ConsentState>({
    dataProcessing: false,
    temporalMetrics: false,
    cooperativeResearch: false,
    liabilityAcknowledged: false,
  });

  useEffect(() => {
    checkFirstLaunch();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('chrona_has_launched');
      if (hasLaunched) {
        router.replace('/metrology');
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
      await AsyncStorage.setItem('chrona_has_launched', 'true');
      await AsyncStorage.setItem('chrona_consent', JSON.stringify({
        ...consent,
        timestamp: Date.now(),
        version: '1.0.0',
      }));
      
      router.replace('/metrology');
    } catch (error) {
      console.error('Error saving consent:', error);
    }
  };

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <View style={styles.logoContainer}>
        <Clock size={64} color="#0EA5E9" />
        <Text style={styles.logoText}>Chrona</Text>
        <Text style={styles.tagline}>Time Metrology for Human Flourishing</Text>
      </View>
      
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          Welcome to Chrona — the first time metrology platform that measures, explains, and optimizes your lived experience of time.
        </Text>
        
        <View style={styles.featureList}>
          <View style={styles.feature}>
            <Shield size={20} color="#10B981" />
            <Text style={styles.featureText}>Enterprise-grade privacy</Text>
          </View>
          <View style={styles.feature}>
            <Eye size={20} color="#10B981" />
            <Text style={styles.featureText}>Transparent algorithms</Text>
          </View>
          <View style={styles.feature}>
            <Lock size={20} color="#10B981" />
            <Text style={styles.featureText}>Local-first data</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.nextButton} 
        onPress={() => setCurrentStep(1)}
      >
        <Text style={styles.nextButtonText}>Begin Setup</Text>
        <ArrowRight size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderConsent = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Informed Consent & Cooperation</Text>
      <Text style={styles.stepSubtitle}>
        Chrona operates on principles of transparency, consent, and mutual benefit. Please review and acknowledge:
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
              <Text style={styles.consentTitle}>Data Processing Transparency</Text>
              <Text style={styles.consentText}>
                I understand that Chrona processes temporal metrics (timing, patterns, focus states) locally on my device. All processing algorithms are explainable, and I maintain full control over my data.
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
              <Text style={styles.consentTitle}>Temporal Metrics Collection</Text>
              <Text style={styles.consentText}>
                I consent to Chrona measuring my time patterns (resolution, jitter, drift, latency) to generate personalized insights. These metrics remain on my device unless I explicitly choose to share anonymized data.
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
              <Text style={styles.consentTitle}>Cooperative Research Participation</Text>
              <Text style={styles.consentText}>
                I agree to participate in advancing time metrology research through optional, anonymized data sharing. I can revoke this consent at any time and retain full ownership of my temporal patterns.
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
              <Text style={styles.consentTitle}>Liability & Responsibility</Text>
              <Text style={styles.consentText}>
                I acknowledge that Chrona is a tool for temporal awareness and optimization. I remain responsible for my time management decisions and understand that the app provides insights, not guarantees. I release Chrona from liability for productivity outcomes.
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
          {canProceed() ? 'Enter Chrona' : 'Please acknowledge all items'}
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
        {currentStep === 0 ? renderWelcome() : renderConsent()}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  descriptionContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  description: {
    fontSize: 18,
    color: '#E5E7EB',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 40,
  },
  featureList: {
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#D1D5DB',
  },
  nextButton: {
    backgroundColor: '#0EA5E9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
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
});