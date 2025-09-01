import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useChrona } from '@/providers/ChronaProvider';
import { TrendingUp, Zap, Target, Brain, Activity, Keyboard, Mouse } from 'lucide-react-native';

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
      </View>

      {/* Flow Metrics */}
      <View style={styles.metricsCard}>
        <Text style={styles.cardTitle}>Flow Metrics</Text>
        
        <View style={styles.metricRow}>
          <View style={styles.metricIcon}>
            <Zap size={20} color="#F59E0B" />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricLabel}>Flow Half-Life</Text>
            <Text style={styles.metricValue}>{flowState.halfLife} min</Text>
            <Text style={styles.metricDescription}>
              Time to decay from peak focus
            </Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricIcon}>
            <TrendingUp size={20} color="#0EA5E9" />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricLabel}>Entry Velocity</Text>
            <Text style={styles.metricValue}>{flowState.entryVelocity.toFixed(1)}x</Text>
            <Text style={styles.metricDescription}>
              Speed of entering flow state
            </Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricIcon}>
            <Target size={20} color="#10B981" />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricLabel}>Sustained Duration</Text>
            <Text style={styles.metricValue}>{flowState.sustainedMinutes} min</Text>
            <Text style={styles.metricDescription}>
              Continuous flow time today
            </Text>
          </View>
        </View>
      </View>

      {/* Flow Triggers */}
      <View style={styles.triggersCard}>
        <Text style={styles.cardTitle}>Flow Triggers</Text>
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
            <View style={[styles.triggerIndicator, { backgroundColor: '#0EA5E9' }]} />
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
          <Text style={styles.cardTitle}>Active Task Flow</Text>
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
          <Text style={styles.cardTitle}>Micro-Pattern Detection</Text>
          <Text style={styles.microDescription}>
            Privacy-preserving analysis of typing and interaction patterns
          </Text>
          
          <View style={styles.patternsList}>
            <View style={styles.patternItem}>
              <View style={styles.patternIcon}>
                <Keyboard size={16} color="#0EA5E9" />
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
                <Mouse size={16} color="#0EA5E9" />
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
                <Activity size={16} color="#0EA5E9" />
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
        <Text style={styles.cardTitle}>Today's Flow Sessions</Text>
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
                      backgroundColor: session.intensity > 0.7 ? '#10B981' : '#0EA5E9'
                    }
                  ]}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  flowIndicator: {
    alignItems: 'center',
    paddingVertical: 32,
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
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  flowIntensity: {
    color: '#6B7280',
    fontSize: 16,
  },
  metricsCard: {
    backgroundColor: '#1A1A1A',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 2,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
  },
  metricDescription: {
    color: '#4B5563',
    fontSize: 11,
  },
  triggersCard: {
    backgroundColor: '#1A1A1A',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  triggerDescription: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 16,
  },
  triggersList: {
    gap: 12,
  },
  triggerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    padding: 12,
    borderRadius: 8,
  },
  triggerName: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  triggerIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  currentTaskCard: {
    backgroundColor: '#1A1A1A',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  taskName: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
  },
  flowProgressBar: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  flowProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  extendButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 10,
    borderRadius: 8,
  },
  extendButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#1A1A1A',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 32,
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
  },
  sessionDetails: {
    flex: 1,
  },
  sessionTask: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
  },
  sessionIntensityBar: {
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  sessionIntensityFill: {
    height: '100%',
    borderRadius: 2,
  },
  microPatternsCard: {
    backgroundColor: '#1A1A1A',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  microDescription: {
    color: '#6B7280',
    fontSize: 12,
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
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patternContent: {
    flex: 1,
  },
  patternLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
  },
  patternBar: {
    height: 4,
    backgroundColor: '#2A2A2A',
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
    padding: 12,
    backgroundColor: '#0A0A0A',
    borderRadius: 8,
  },
  patternInsightText: {
    color: '#F59E0B',
    fontSize: 12,
    fontStyle: 'italic',
  },
});