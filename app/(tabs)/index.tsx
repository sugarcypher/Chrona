import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { Plus, Play, Pause, CheckCircle, AlertCircle, Zap, Eye } from 'lucide-react-native';
import { useChrona } from '@/providers/ChronaProvider';
import { Task, TimeBlock } from '@/types/chrona';
import { router } from 'expo-router';
import { calculatePowerLawAllocation, calculateConeOfSlippage, calculateSwitchCost } from '@/utils/timeAllocation';
import { formatDuration } from '@/utils/formatters';

export default function TimelineScreen() {
  const { 
    tasks, 
    activeTask, 
    addTask, 
    startTask, 
    pauseTask, 
    completeTask,
    currentMetrics,
    entropyBudget,
    addTimeBlock,
    timeBlocks
  } = useChrona();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [showSwitchCosts, setShowSwitchCosts] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Calculate daily switch cost
  const dailySwitchCost = React.useMemo(() => {
    const today = new Date().toDateString();
    const todayBlocks = timeBlocks.filter(block => 
      new Date(block.startTime).toDateString() === today
    );
    
    let totalCost = 0;
    for (let i = 1; i < todayBlocks.length; i++) {
      const prevTask = tasks.find(t => t.id === todayBlocks[i-1].taskId);
      const currTask = tasks.find(t => t.id === todayBlocks[i].taskId);
      if (prevTask && currTask && prevTask.id !== currTask.id) {
        totalCost += calculateSwitchCost(prevTask, currTask);
      }
    }
    return totalCost;
  }, [timeBlocks, tasks]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const minutes = parseInt(estimatedMinutes) || 30;
    const allocation = calculatePowerLawAllocation(minutes, tasks.length + 1);
    
    addTask({
      title: newTaskTitle,
      estimatedMinutes: allocation.optimal,
      minMinutes: allocation.min,
      maxMinutes: allocation.max,
      powerLawExponent: allocation.exponent,
      contextSwitchCost: 5,
      verificationCriteria: [],
      satisficingThreshold: 0.8,
    });
    
    setNewTaskTitle('');
    setEstimatedMinutes('');
  };

  const handleTaskPress = (task: Task) => {
    if (activeTask?.id === task.id) {
      pauseTask();
    } else {
      startTask(task.id);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    Alert.alert(
      'Complete Task',
      'How did the time feel?',
      [
        { text: 'Faster than expected', onPress: () => completeWithPerception(taskId, 0.8) },
        { text: 'About right', onPress: () => completeWithPerception(taskId, 1.0) },
        { text: 'Slower than expected', onPress: () => completeWithPerception(taskId, 1.2) },
      ]
    );
  };

  const completeWithPerception = (taskId: string, perceptionRatio: number) => {
    completeTask(taskId, perceptionRatio);
  };

  const getTaskStatus = (task: Task) => {
    if (task.completedAt) return 'completed';
    if (activeTask?.id === task.id) return 'active';
    if (task.startedAt) return 'paused';
    return 'pending';
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Daily Glyph */}
        <TouchableOpacity 
          style={styles.glyphCard}
          onPress={() => router.push('/daily-glyph' as any)}
        >
          <View style={styles.glyphHeader}>
            <Eye size={20} color="#0EA5E9" />
            <Text style={styles.glyphTitle}>Today's Glyph</Text>
            <Text style={styles.glyphSubtitle}>Visual signature of your day</Text>
          </View>
          <View style={styles.glyphPreview}>
            <DailyGlyphPreview tasks={tasks} timeBlocks={timeBlocks} />
          </View>
        </TouchableOpacity>

        {/* Entropy Budget Indicator */}
        <View style={styles.entropyCard}>
          <View style={styles.entropyHeader}>
            <Zap size={20} color="#F59E0B" />
            <Text style={styles.entropyTitle}>Entropy Budget</Text>
          </View>
          <View style={styles.entropyBar}>
            <View 
              style={[
                styles.entropyFill, 
                { width: `${(entropyBudget.used / entropyBudget.total) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.entropyText}>
            {entropyBudget.used} / {entropyBudget.total} min chaos allowance
          </Text>
        </View>

        {/* Current Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Jitter</Text>
            <Text style={styles.metricValue}>{currentMetrics.jitter.toFixed(1)}m</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Drift</Text>
            <Text style={styles.metricValue}>{currentMetrics.drift.toFixed(1)}m</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Latency</Text>
            <Text style={styles.metricValue}>{currentMetrics.latency.toFixed(1)}m</Text>
          </View>
        </View>

        {/* Switch Cost Bill */}
        <TouchableOpacity 
          style={styles.switchCostCard}
          onPress={() => setShowSwitchCosts(!showSwitchCosts)}
        >
          <View style={styles.switchCostHeader}>
            <AlertCircle size={20} color="#EF4444" />
            <Text style={styles.switchCostTitle}>Switch Cost Bill</Text>
            <Text style={styles.switchCostValue}>{dailySwitchCost.toFixed(0)}m lost today</Text>
          </View>
          {showSwitchCosts && (
            <View style={styles.switchCostDetails}>
              <Text style={styles.switchCostDescription}>
                Context switching fragments focus and reduces cognitive performance.
                Each switch carries a "setup cost" as your brain reorients.
              </Text>
              <View style={styles.switchCostBar}>
                <View 
                  style={[
                    styles.switchCostFill,
                    { width: `${Math.min(100, (dailySwitchCost / 60) * 100)}%` }
                  ]}
                />
              </View>
              <Text style={styles.switchCostTip}>
                💡 Group similar tasks to minimize switching penalties
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Add Task */}
        <View style={styles.addTaskCard}>
          <TextInput
            style={styles.taskInput}
            placeholder="What needs focus?"
            placeholderTextColor="#6B7280"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
          />
          <TextInput
            style={styles.minutesInput}
            placeholder="Min"
            placeholderTextColor="#6B7280"
            value={estimatedMinutes}
            onChangeText={setEstimatedMinutes}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tasks */}
        <View style={styles.tasksContainer}>
          {tasks.map((task) => {
            const status = getTaskStatus(task);
            const isActive = status === 'active';
            
            return (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskCard,
                  status === 'completed' && styles.taskCompleted,
                  isActive && styles.taskActive,
                ]}
                onPress={() => handleTaskPress(task)}
                onLongPress={() => router.push(`/task-detail?id=${task.id}` as any)}
              >
                <View style={styles.taskHeader}>
                  <Text style={[
                    styles.taskTitle,
                    status === 'completed' && styles.taskTitleCompleted
                  ]}>
                    {task.title}
                  </Text>
                  {isActive ? (
                    <Pause size={20} color="#0EA5E9" />
                  ) : status === 'completed' ? (
                    <CheckCircle size={20} color="#10B981" />
                  ) : (
                    <Play size={20} color="#6B7280" />
                  )}
                </View>
                
                <View style={styles.taskMeta}>
                  <Text style={styles.taskTime}>
                    {formatDuration(task.actualMinutes || 0)} / {formatDuration(task.estimatedMinutes)}
                  </Text>
                  {task.powerLawExponent > 1 && (
                    <View style={styles.powerLawBadge}>
                      <Text style={styles.powerLawText}>b={task.powerLawExponent.toFixed(1)}</Text>
                    </View>
                  )}
                </View>

                {/* Cone of Slippage */}
                {(() => {
                  const completedTasks = tasks.filter(t => t.completedAt && t.actualMinutes);
                  const accuracy = completedTasks.length > 0 
                    ? completedTasks.reduce((sum, t) => {
                        const error = Math.abs(t.actualMinutes! - t.estimatedMinutes) / t.estimatedMinutes;
                        return sum + (1 - Math.min(1, error));
                      }, 0) / completedTasks.length
                    : 0.7;
                  
                  const cone = calculateConeOfSlippage(task.estimatedMinutes, accuracy);
                  
                  return (
                    <View style={styles.coneContainer}>
                      <Text style={styles.coneLabel}>Cone of Slippage ({(cone.confidence * 100).toFixed(0)}% confidence)</Text>
                      <View style={styles.coneBar}>
                        <View style={styles.coneRange}>
                          <Text style={styles.coneText}>{cone.lower}m</Text>
                          <View style={styles.coneFill} />
                          <Text style={styles.coneText}>{cone.upper}m</Text>
                        </View>
                      </View>
                    </View>
                  );
                })()}

                {isActive && (
                  <TouchableOpacity 
                    style={styles.completeButton}
                    onPress={() => handleCompleteTask(task.id)}
                  >
                    <Text style={styles.completeButtonText}>Complete</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

// Daily Glyph Preview Component
function DailyGlyphPreview({ tasks, timeBlocks }: { tasks: Task[], timeBlocks: TimeBlock[] }) {
  const glyphData = React.useMemo(() => {
    const today = new Date().toDateString();
    const todayBlocks = timeBlocks.filter(block => 
      new Date(block.startTime).toDateString() === today
    );
    
    // Generate glyph parameters based on day's data
    const totalMinutes = todayBlocks.reduce((sum, block) => sum + block.duration, 0);
    const avgFlowIntensity = todayBlocks.length > 0 
      ? todayBlocks.reduce((sum, block) => sum + (block.flowIntensity || 0), 0) / todayBlocks.length
      : 0;
    const switchCount = todayBlocks.length - 1;
    const completedTasks = tasks.filter(t => t.completedAt && 
      new Date(t.completedAt).toDateString() === today
    ).length;
    
    return {
      radius: Math.max(20, Math.min(40, totalMinutes / 10)),
      smoothness: avgFlowIntensity,
      fragments: switchCount,
      completion: completedTasks / Math.max(1, tasks.length),
      energy: Math.min(1, totalMinutes / 480) // 8 hours = full energy
    };
  }, [tasks, timeBlocks]);
  
  return (
    <View style={styles.glyphContainer}>
      <View 
        style={[
          styles.glyphShape,
          {
            width: glyphData.radius * 2,
            height: glyphData.radius * 2,
            borderRadius: glyphData.smoothness > 0.5 ? glyphData.radius : glyphData.radius * 0.7,
            backgroundColor: `rgba(14, 165, 233, ${0.2 + glyphData.energy * 0.3})`,
            borderWidth: 2,
            borderColor: glyphData.completion > 0.7 ? '#10B981' : glyphData.completion > 0.4 ? '#F59E0B' : '#EF4444',
          }
        ]}
      >
        {/* Fragment indicators */}
        {Array.from({ length: Math.min(8, glyphData.fragments) }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.glyphFragment,
              {
                transform: [
                  { rotate: `${(360 / Math.min(8, glyphData.fragments)) * i}deg` },
                  { translateY: -glyphData.radius * 0.6 }
                ]
              }
            ]}
          />
        ))}
        
        {/* Center dot for focus */}
        <View 
          style={[
            styles.glyphCenter,
            {
              backgroundColor: glyphData.smoothness > 0.6 ? '#10B981' : '#6B7280',
              width: 4 + glyphData.smoothness * 6,
              height: 4 + glyphData.smoothness * 6,
            }
          ]}
        />
      </View>
      
      <View style={styles.glyphStats}>
        <Text style={styles.glyphStatText}>
          {glyphData.smoothness > 0.7 ? 'Flowing' : glyphData.fragments > 6 ? 'Fragmented' : 'Balanced'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
  },
  entropyCard: {
    backgroundColor: '#1A1A1A',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  entropyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  entropyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  entropyBar: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  entropyFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  entropyText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  metricLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: '#0EA5E9',
    fontSize: 18,
    fontWeight: '600',
  },
  addTaskCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  taskInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 8,
  },
  minutesInput: {
    width: 50,
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#0EA5E9',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasksContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  taskCard: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  taskActive: {
    borderColor: '#0EA5E9',
    backgroundColor: '#0A1929',
  },
  taskCompleted: {
    opacity: 0.6,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTime: {
    color: '#6B7280',
    fontSize: 14,
  },
  powerLawBadge: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  powerLawText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  completeButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  switchCostCard: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  switchCostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchCostTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  switchCostValue: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  switchCostDetails: {
    marginTop: 12,
  },
  switchCostDescription: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 8,
  },
  switchCostBar: {
    height: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 8,
  },
  switchCostFill: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 3,
  },
  switchCostTip: {
    color: '#F59E0B',
    fontSize: 11,
    fontStyle: 'italic',
  },
  coneContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#0A0A0A',
    borderRadius: 6,
  },
  coneLabel: {
    color: '#6B7280',
    fontSize: 10,
    marginBottom: 4,
  },
  coneBar: {
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  coneRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  coneFill: {
    flex: 1,
    height: 2,
    backgroundColor: '#F59E0B',
    marginHorizontal: 4,
  },
  coneText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '600',
  },
  glyphCard: {
    backgroundColor: '#1A1A1A',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  glyphHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  glyphTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  glyphSubtitle: {
    color: '#6B7280',
    fontSize: 12,
  },
  glyphPreview: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  glyphContainer: {
    alignItems: 'center',
  },
  glyphShape: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glyphFragment: {
    position: 'absolute',
    width: 3,
    height: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 1.5,
  },
  glyphCenter: {
    borderRadius: 5,
  },
  glyphStats: {
    marginTop: 8,
  },
  glyphStatText: {
    color: '#0EA5E9',
    fontSize: 12,
    fontWeight: '500',
  },
});