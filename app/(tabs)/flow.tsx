import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useChrona } from '@/providers/ChronaProvider';
import { TrendingUp, Zap, Target, Brain, Activity, Keyboard, Mouse, Play, Pause, RotateCcw } from 'lucide-react-native';

export default function FlowScreen() {
  const { flowState, activeTask, updateFlowState, settings } = useChrona();
  const [pulseAnim] = useState(new Animated.Value(1));
  const [microPatterns, setMicroPatterns] = useState({
    keystrokeRhythm: 0.75,
    mouseMovement: 0.6,
    pauseFrequency: 0.4,
    typingVelocity: 0.8,
  });
  
  // Simulate micro-pattern detection (in real app, this would use actual input monitoring)
  useEffect(() => {
    if (!settings.trackMicroPatterns || Platform.OS === 'web') return;
    
    const interval = setInterval(() => {
      setMicroPatterns(prev => ({
        keystrokeRhythm: Math.max(0, Math.min(1, prev.keystrokeRhythm + (Math.random() - 0.5) * 0.1)),
        mouseMovement: Math.max(0, Math.min(1, prev.mouseMovement + (Math.random() - 0.5) * 0.1)),
        pauseFrequency: Math.max(0, Math.min(1, prev.pauseFrequency + (Math.random() - 0.5) * 0.1)),
        typingVelocity: Math.max(0, Math.min(1, prev.typingVelocity + (Math.random() - 0.5) * 0.1)),
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [settings.trackMicroPatterns]);

  useEffect(() => {
    if (flowState.isInFlow) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [flowState.isInFlow]);

  const getFlowColor = () => {
    if (flowState.intensity > 0.8) return '#10B981';
    if (flowState.intensity > 0.5) return '#0EA5E9';
    if (flowState.intensity > 0.3) return '#F59E0B';
    return '#6B7280';
  };

  const getFlowStatus = () => {
    if (flowState.intensity > 0.8) return 'Deep Flow';
    if (flowState.intensity > 0.5) return 'Flow State';
    if (flowState.intensity > 0.3) return 'Building Focus';
    return 'Warming Up';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Focus</Text>
          <Text style={styles.headerSubtitle}>Your flow state insights</Text>
        </View>
        {/* Flow State Indicator */}
        <View style={styles.flowIndicator}>
          <Animated.View 
            style={[
              styles.flowCircle,
              { 
                backgroundColor: getFlowColor(),
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <Brain size={48} color="#FFFFFF" />
          </Animated.View>
          <Text style={styles.flowStatus}>{getFlowStatus()}</Text>
          <Text style={styles.flowIntensity}>
            {(flowState.intensity * 100).toFixed(0)}% Intensity
          </Text>
          
          {/* Flow Controls */}
          <View style={styles.flowControls}>
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: '#10B981' }]}>
              <Play size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: '#F59E0B' }]}>
              <Pause size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: '#6B7280' }]}>
              <RotateCcw size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Flow Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Flow Metrics</Text>
        
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: '#FEF3C7' }]}>
              <View style={[styles.metricIcon, { backgroundColor: '#F59E0B' }]}>
                <Zap size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.metricLabel}>Half-Life</Text>
              <Text style={[styles.metricValue, { color: '#F59E0B' }]}>{flowState.halfLife}m</Text>
              <Text style={styles.metricDescription}>Decay time</Text>
            </View>
            
            <View style={[styles.metricCard, { backgroundColor: '#EFF6FF' }]}>
              <View style={[styles.metricIcon, { backgroundColor: '#3B82F6' }]}>
                <TrendingUp size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.metricLabel}>Entry Speed</Text>
              <Text style={[styles.metricValue, { color: '#3B82F6' }]}>{flowState.entryVelocity.toFixed(1)}x</Text>
              <Text style={styles.metricDescription}>Flow velocity</Text>
            </View>
            
            <View style={[styles.metricCard, { backgroundColor: '#ECFDF5' }]}>
              <View style={[styles.metricIcon, { backgroundColor: '#10B981' }]}>
                <Target size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.metricLabel}>Duration</Text>
              <Text style={[styles.metricValue, { color: '#10B981' }]}>{flowState.sustainedMinutes}m</Text>
              <Text style={styles.metricDescription}>Today's flow</Text>
            </View>
          </View>
        </View>

        {/* Flow Triggers */}
        <View style={styles.triggersCard}>
          <Text style={styles.sectionTitle}>Flow Triggers</Text>
          <Text style={styles.triggerDescription}>
            Conditions that enhance your flow state
          </Text>
        
          <View style={styles.triggersList}>
            <TouchableOpacity style={styles.triggerItem}>
              <Text style={styles.triggerName}>Clear Goals</Text>
              <View style={[styles.triggerIndicator, { backgroundColor: '#10B981' }]} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.triggerItem}>
              <Text style={styles.triggerName}>Immediate Feedback</Text>
              <View style={[styles.triggerIndicator, { backgroundColor: '#3B82F6' }]} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.triggerItem}>
              <Text style={styles.triggerName}>Challenge-Skill Balance</Text>
              <View style={[styles.triggerIndicator, { backgroundColor: '#F59E0B' }]} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.triggerItem}>
              <Text style={styles.triggerName}>Deep Concentration</Text>
              <View style={[styles.triggerIndicator, { backgroundColor: '#10B981' }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Task Flow */}
        {activeTask && (
          <View style={styles.currentTaskCard}>
            <Text style={styles.sectionTitle}>Active Session</Text>
            <Text style={styles.taskName}>{activeTask.title}</Text>
            
            <View style={styles.flowProgressBar}>
              <View 
                style={[
                  styles.flowProgressFill,
                  { 
                    width: `${flowState.intensity * 100}%`,
                    backgroundColor: getFlowColor()
                  }
                ]}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.extendButton}
              onPress={() => updateFlowState({ isInFlow: true, intensity: Math.min(1, flowState.intensity + 0.1) })}
            >
              <Text style={styles.extendButtonText}>Extend Flow Block</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Micro-Pattern Detection */}
        {settings.trackMicroPatterns && (
          <View style={styles.microPatternsCard}>
            <Text style={styles.sectionTitle}>Micro-Pattern Detection</Text>
            <Text style={styles.microDescription}>
              Privacy-preserving analysis of typing and interaction patterns
            </Text>
          
            <View style={styles.patternsList}>
              <View style={styles.patternItem}>
                <View style={styles.patternIcon}>
                  <Keyboard size={16} color="#3B82F6" />
                </View>
                <View style={styles.patternContent}>
                  <Text style={styles.patternLabel}>Keystroke Rhythm</Text>
                  <View style={styles.patternBar}>
                    <View 
                      style={[
                        styles.patternFill,
                        { 
                          width: `${microPatterns.keystrokeRhythm * 100}%`,
                          backgroundColor: microPatterns.keystrokeRhythm > 0.7 ? '#10B981' : '#F59E0B'
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.patternValue}>
                    {microPatterns.keystrokeRhythm > 0.7 ? 'Steady' : 'Irregular'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.patternItem}>
                <View style={styles.patternIcon}>
                  <Mouse size={16} color="#3B82F6" />
                </View>
                <View style={styles.patternContent}>
                  <Text style={styles.patternLabel}>Mouse Precision</Text>
                  <View style={styles.patternBar}>
                    <View 
                      style={[
                        styles.patternFill,
                        { 
                          width: `${microPatterns.mouseMovement * 100}%`,
                          backgroundColor: microPatterns.mouseMovement > 0.6 ? '#10B981' : '#EF4444'
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.patternValue}>
                    {microPatterns.mouseMovement > 0.6 ? 'Focused' : 'Scattered'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.patternItem}>
                <View style={styles.patternIcon}>
                  <Activity size={16} color="#3B82F6" />
                </View>
                <View style={styles.patternContent}>
                  <Text style={styles.patternLabel}>Pause Frequency</Text>
                  <View style={styles.patternBar}>
                    <View 
                      style={[
                        styles.patternFill,
                        { 
                          width: `${microPatterns.pauseFrequency * 100}%`,
                          backgroundColor: microPatterns.pauseFrequency < 0.5 ? '#10B981' : '#F59E0B'
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.patternValue}>
                    {microPatterns.pauseFrequency < 0.5 ? 'Continuous' : 'Fragmented'}
                  </Text>
                </View>
              </View>
            </View>
          
            <View style={styles.patternInsight}>
              <Text style={styles.patternInsightText}>
                💡 {microPatterns.keystrokeRhythm > 0.7 && microPatterns.mouseMovement > 0.6 
                  ? 'Strong focus detected - consider extending this block'
                  : 'Patterns suggest fatigue - micro-break recommended'}
              </Text>
            </View>
          </View>
        )}

        {/* Flow History */}
        <View style={styles.historyCard}>
          <Text style={styles.sectionTitle}>Today's Flow Sessions</Text>
          {[
            { time: '09:00 - 10:30', intensity: 0.8, task: 'Deep Work' },
            { time: '14:00 - 15:15', intensity: 0.6, task: 'Code Review' },
            { time: '16:00 - 16:45', intensity: 0.9, task: 'Problem Solving' },
          ].map((session, index) => (
            <View key={index} style={styles.sessionItem}>
              <View style={styles.sessionTime}>
                <Text style={styles.sessionTimeText}>{session.time}</Text>
              </View>
              <View style={styles.sessionDetails}>
                <Text style={styles.sessionTask}>{session.task}</Text>
                <View style={styles.sessionIntensityBar}>
                  <View 
                    style={[
                      styles.sessionIntensityFill,
                      { 
                        width: `${session.intensity * 100}%`,
                        backgroundColor: session.intensity > 0.7 ? '#10B981' : '#3B82F6'
                      }
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  flowIndicator: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  flowCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  flowStatus: {
    color: '#1F2937',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  flowIntensity: {
    color: '#6B7280',
    fontSize: 16,
    marginBottom: 24,
  },
  flowControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  triggersCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  triggerDescription: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 16,
  },
  triggersList: {
    gap: 12,
  },
  triggerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  triggerName: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
  },
  triggerIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  currentTaskCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6366F1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  taskName: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  flowProgressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  flowProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  extendButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 8,
  },
  extendButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sessionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sessionTime: {
    width: 100,
  },
  sessionTimeText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  sessionDetails: {
    flex: 1,
  },
  sessionTask: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  sessionIntensityBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  sessionIntensityFill: {
    height: '100%',
    borderRadius: 2,
  },
  microPatternsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  microDescription: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 16,
  },
  patternsList: {
    gap: 16,
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patternIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patternContent: {
    flex: 1,
  },
  patternLabel: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  patternBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  patternFill: {
    height: '100%',
    borderRadius: 2,
  },
  patternValue: {
    color: '#6B7280',
    fontSize: 11,
  },
  patternInsight: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  patternInsightText: {
    color: '#1F2937',
    fontSize: 14,
    lineHeight: 20,
  },
});