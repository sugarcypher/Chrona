import React, { useState, useEffect, useMemo } from 'react';
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
import { TrendingUp, Zap, Target, Brain, Activity, Keyboard, Mouse, Play, Pause, RotateCcw, Album } from 'lucide-react-native';
import { Alert as AlertDialog } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout } from '@/constants/design';

export default function FlowScreen() {
  const { flowState, activeTask, updateFlowState, settings, startTour, getAnalyticsWithCalendar } = useChrona();
  const analytics = useMemo(() => getAnalyticsWithCalendar(), [getAnalyticsWithCalendar]);
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
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: '#10B981' }]}
              onPress={() => {
                updateFlowState({ 
                  isInFlow: true, 
                  intensity: Math.min(1, flowState.intensity + 0.2),
                  entryTime: Date.now()
                });
              }}
            >
              <Play size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: '#F59E0B' }]}
              onPress={() => {
                updateFlowState({ 
                  isInFlow: false, 
                  intensity: Math.max(0, flowState.intensity - 0.3)
                });
              }}
            >
              <Pause size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: '#6B7280' }]}
              onPress={() => {
                updateFlowState({ 
                  isInFlow: false, 
                  intensity: 0,
                  entryTime: null,
                  sustainedMinutes: 0
                });
              }}
            >
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
            <TouchableOpacity 
              style={styles.triggerItem}
              onPress={() => {
                AlertDialog.alert(
                  'Clear Goals Trigger',
                  'This trigger activates when you have well-defined, specific objectives. Current status: Active',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={styles.triggerName}>Clear Goals</Text>
              <View style={[styles.triggerIndicator, { backgroundColor: '#10B981' }]} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.triggerItem}
              onPress={() => {
                AlertDialog.alert(
                  'Immediate Feedback Trigger',
                  'This trigger activates when you receive quick feedback on your progress. Current status: Active',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={styles.triggerName}>Immediate Feedback</Text>
              <View style={[styles.triggerIndicator, { backgroundColor: '#3B82F6' }]} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.triggerItem}
              onPress={() => {
                AlertDialog.alert(
                  'Challenge-Skill Balance',
                  'This trigger activates when task difficulty matches your skill level. Current status: Moderate',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={styles.triggerName}>Challenge-Skill Balance</Text>
              <View style={[styles.triggerIndicator, { backgroundColor: '#F59E0B' }]} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.triggerItem}
              onPress={() => {
                AlertDialog.alert(
                  'Deep Concentration Trigger',
                  'This trigger activates during sustained focus periods. Current status: Active',
                  [{ text: 'OK' }]
                );
              }}
            >
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

        {/* Focus Analytics */}
        <View style={styles.analyticsCard}>
          <Text style={styles.sectionTitle}>Focus Analytics</Text>
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsLabel}>Focus Blocks</Text>
              <Text style={styles.analyticsValue}>{analytics.focusTimeBlocks}</Text>
              <Text style={styles.analyticsDescription}>Deep work sessions</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsLabel}>Interruption Rate</Text>
              <Text style={styles.analyticsValue}>{Math.round(analytics.interruptionRate * 100)}%</Text>
              <Text style={styles.analyticsDescription}>Task overruns</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsLabel}>Meeting Overhead</Text>
              <Text style={styles.analyticsValue}>{Math.round(analytics.meetingOverhead)}m</Text>
              <Text style={styles.analyticsDescription}>Non-productive time</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsLabel}>Work Time</Text>
              <Text style={styles.analyticsValue}>{Math.round(analytics.actualWorkTime)}m</Text>
              <Text style={styles.analyticsDescription}>Productive time</Text>
            </View>
          </View>
        </View>
        
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
          
          <TouchableOpacity 
            style={styles.tourButton}
            onPress={() => {
              const focusTourSteps = [
                {
                  id: 'flow-state',
                  title: 'Flow State Monitoring',
                  description: 'Track your focus intensity in real-time. The larger circle indicates deeper flow states.',
                  position: { x: 20, y: 200, width: 300, height: 200 }
                },
                {
                  id: 'flow-controls',
                  title: 'Flow Controls',
                  description: 'Use these controls to manually adjust your flow state or reset when taking breaks.',
                  position: { x: 20, y: 420, width: 300, height: 80 }
                },
                {
                  id: 'micro-patterns',
                  title: 'Micro-Pattern Detection',
                  description: 'Privacy-preserving analysis of your typing and interaction patterns to optimize focus.',
                  position: { x: 20, y: 520, width: 300, height: 120 }
                }
              ];
              startTour(focusTourSteps);
            }}
          >
            <Text style={styles.tourButtonText}>Learn About Focus Tracking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
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
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    letterSpacing: Typography.letterSpacing.tight,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.tertiary,
    fontWeight: Typography.fontWeight.normal,
  },
  flowIndicator: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  flowCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.xl,
  },
  flowStatus: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  flowIntensity: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.lg,
    marginBottom: Spacing['2xl'],
  },
  flowControls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  metricLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  metricValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  metricDescription: {
    fontSize: 10,
    color: Colors.text.quaternary,
    textAlign: 'center',
  },

  triggersCard: {
    backgroundColor: Colors.background.primary,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.xl,
    padding: Spacing['2xl'],
    borderRadius: BorderRadius['2xl'],
    ...Shadows.lg,
  },
  triggerDescription: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.lg,
  },
  triggersList: {
    gap: 12,
  },
  triggerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  triggerName: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  triggerIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  currentTaskCard: {
    backgroundColor: Colors.background.primary,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.xl,
    padding: Spacing['2xl'],
    borderRadius: BorderRadius['2xl'],
    borderWidth: 2,
    borderColor: Colors.accent[500],
    ...Shadows.lg,
  },
  taskName: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  flowProgressBar: {
    height: 8,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  flowProgressFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  extendButton: {
    backgroundColor: Colors.accent[600],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  extendButtonText: {
    color: Colors.text.inverse,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
  historyCard: {
    backgroundColor: Colors.background.primary,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing['4xl'],
    padding: Spacing['2xl'],
    borderRadius: BorderRadius['2xl'],
    ...Shadows.lg,
  },
  sessionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sessionTime: {
    width: 100,
  },
  sessionTimeText: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionTask: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  sessionIntensityBar: {
    height: 6,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  sessionIntensityFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  microPatternsCard: {
    backgroundColor: Colors.background.primary,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.xl,
    padding: Spacing['2xl'],
    borderRadius: BorderRadius['2xl'],
    ...Shadows.lg,
  },
  microDescription: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.lg,
  },
  patternsList: {
    gap: 16,
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patternIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.info[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  patternContent: {
    flex: 1,
  },
  patternLabel: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  patternBar: {
    height: 6,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  patternFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  patternValue: {
    color: Colors.text.tertiary,
    fontSize: 11,
  },
  patternInsight: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.info[50],
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info[600],
  },
  patternInsightText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  
  // Analytics card
  analyticsCard: {
    backgroundColor: Colors.background.primary,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.xl,
    padding: Spacing['2xl'],
    borderRadius: BorderRadius['2xl'],
    ...Shadows.lg,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  analyticsItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  analyticsLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  analyticsValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  analyticsDescription: {
    fontSize: 10,
    color: Colors.text.quaternary,
    textAlign: 'center',
  },
  
  // Tour button
  tourButton: {
    backgroundColor: Colors.accent[600],
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    ...Shadows.sm,
  },
  tourButtonText: {
    color: Colors.text.inverse,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
});