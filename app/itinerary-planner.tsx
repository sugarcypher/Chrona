import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { useChrona } from '@/providers/ChronaProvider';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Move,
  AlertCircle,

  Zap,
  Target,
  BarChart3,
  Settings,
  Shuffle,
  Save,
} from 'lucide-react-native';

interface ItineraryItem {
  id: string;
  taskId?: string;
  title: string;
  startTime: Date;
  duration: number;
  type: 'task' | 'break' | 'meeting' | 'custom';
  priority: 'low' | 'medium' | 'high';
  flexible: boolean;
}

export default function ItineraryPlannerScreen() {
  const { tasks, addTask } = useChrona();
  const [selectedDate] = useState(new Date());
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [workingHours, setWorkingHours] = useState({ start: 9, end: 17 });
  const [breakDuration, setBreakDuration] = useState(15);
  
  const [newItem, setNewItem] = useState<{
    title: string;
    duration: number;
    type: 'task' | 'break' | 'meeting' | 'custom';
    priority: 'low' | 'medium' | 'high';
    flexible: boolean;
  }>({
    title: '',
    duration: 60,
    type: 'task',
    priority: 'medium',
    flexible: true,
  });

  const availableTasks = useMemo(() => {
    return tasks.filter(task => !task.completedAt && !task.startedAt);
  }, [tasks]);

  const totalScheduledTime = useMemo(() => {
    return itinerary.reduce((sum, item) => sum + item.duration, 0);
  }, [itinerary]);

  const workingHoursMinutes = (workingHours.end - workingHours.start) * 60;
  const utilizationRate = (totalScheduledTime / workingHoursMinutes) * 100;

  const generateOptimalSchedule = () => {
    if (availableTasks.length === 0) {
      Alert.alert('No Tasks', 'Add some tasks first to generate a schedule.');
      return;
    }

    const newItinerary: ItineraryItem[] = [];
    let currentTime = new Date(selectedDate);
    currentTime.setHours(workingHours.start, 0, 0, 0);

    // Sort tasks by priority and estimated time
    const sortedTasks = [...availableTasks].sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      // Assuming tasks don't have priority, we'll use estimation time as proxy
      const aPriority = a.estimatedMinutes > 60 ? 'high' : a.estimatedMinutes > 30 ? 'medium' : 'low';
      const bPriority = b.estimatedMinutes > 60 ? 'high' : b.estimatedMinutes > 30 ? 'medium' : 'low';
      
      return (priorityWeight[bPriority] - priorityWeight[aPriority]) || 
             (a.estimatedMinutes - b.estimatedMinutes);
    });

    sortedTasks.forEach((task, index) => {
      // Add task
      newItinerary.push({
        id: `task-${task.id}`,
        taskId: task.id,
        title: task.title,
        startTime: new Date(currentTime),
        duration: task.estimatedMinutes,
        type: 'task',
        priority: task.estimatedMinutes > 60 ? 'high' : task.estimatedMinutes > 30 ? 'medium' : 'low',
        flexible: true,
      });

      currentTime.setMinutes(currentTime.getMinutes() + task.estimatedMinutes);

      // Add break after task (except for the last one)
      if (index < sortedTasks.length - 1 && task.estimatedMinutes >= 30) {
        newItinerary.push({
          id: `break-${index}`,
          title: 'Break',
          startTime: new Date(currentTime),
          duration: breakDuration,
          type: 'break',
          priority: 'low',
          flexible: true,
        });

        currentTime.setMinutes(currentTime.getMinutes() + breakDuration);
      }

      // Check if we're exceeding working hours
      if (currentTime.getHours() >= workingHours.end) {
        Alert.alert(
          'Schedule Overflow',
          `Some tasks extend beyond working hours (${workingHours.end}:00). Consider adjusting your schedule.`
        );
      }
    });

    setItinerary(newItinerary);
  };

  const addCustomItem = () => {
    if (!newItem.title.trim()) {
      Alert.alert('Error', 'Please enter a title for the item.');
      return;
    }

    const startTime = new Date(selectedDate);
    startTime.setHours(workingHours.start, 0, 0, 0);
    
    // Find next available slot
    if (itinerary.length > 0) {
      const lastItem = itinerary[itinerary.length - 1];
      startTime.setTime(lastItem.startTime.getTime() + lastItem.duration * 60000);
    }

    const newItineraryItem: ItineraryItem = {
      id: Date.now().toString(),
      title: newItem.title,
      startTime,
      duration: newItem.duration,
      type: newItem.type,
      priority: newItem.priority,
      flexible: newItem.flexible,
    };

    setItinerary(prev => [...prev, newItineraryItem]);
    setNewItem({
      title: '',
      duration: 60,
      type: 'task',
      priority: 'medium',
      flexible: true,
    });
    setShowAddModal(false);
  };

  const removeItem = (id: string) => {
    setItinerary(prev => prev.filter(item => item.id !== id));
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const index = itinerary.findIndex(item => item.id === id);
    if (index === -1) return;

    const newItinerary = [...itinerary];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newItinerary.length) {
      [newItinerary[index], newItinerary[targetIndex]] = [newItinerary[targetIndex], newItinerary[index]];
      
      // Update start times
      let currentTime = new Date(selectedDate);
      currentTime.setHours(workingHours.start, 0, 0, 0);
      
      newItinerary.forEach(item => {
        item.startTime = new Date(currentTime);
        currentTime.setMinutes(currentTime.getMinutes() + item.duration);
      });
      
      setItinerary(newItinerary);
    }
  };

  const saveItinerary = () => {
    // Convert itinerary items to tasks if they're not already tasks
    itinerary.forEach(item => {
      if (item.type === 'custom' && !item.taskId) {
        addTask({
          title: item.title,
          estimatedMinutes: item.duration,
          minMinutes: Math.max(15, item.duration - 15),
          maxMinutes: item.duration + 30,
          powerLawExponent: 1.5,
          contextSwitchCost: 5,
          verificationCriteria: ['Complete the planned activity'],
          satisficingThreshold: 0.8,
        });
      }
    });

    Alert.alert(
      'Itinerary Saved',
      'Your itinerary has been saved and tasks have been created.',
      [{ text: 'OK', onPress: () => setItinerary([]) }]
    );
  };

  const getItemColor = (item: ItineraryItem) => {
    switch (item.type) {
      case 'task':
        return item.priority === 'high' ? '#EF4444' : item.priority === 'medium' ? '#F59E0B' : '#10B981';
      case 'break':
        return '#6B7280';
      case 'meeting':
        return '#3B82F6';
      case 'custom':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const renderItineraryItem = (item: ItineraryItem, index: number) => (
    <View key={item.id} style={[styles.itineraryItem, { borderLeftColor: getItemColor(item) }]}>
      <View style={styles.itemHeader}>
        <View style={styles.itemTime}>
          <Text style={styles.timeText}>
            {item.startTime.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}
          </Text>
          <Text style={styles.durationText}>{item.duration}m</Text>
        </View>
        
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <View style={styles.itemMeta}>
            <Text style={[styles.itemType, { color: getItemColor(item) }]}>
              {item.type.toUpperCase()}
            </Text>
            {item.priority !== 'medium' && (
              <Text style={styles.itemPriority}>
                {item.priority.toUpperCase()}
              </Text>
            )}
            {item.flexible && (
              <Text style={styles.flexibleTag}>FLEXIBLE</Text>
            )}
          </View>
        </View>
        
        <View style={styles.itemActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => moveItem(item.id, 'up')}
            disabled={index === 0}
          >
            <Move size={16} color={index === 0 ? '#D1D5DB' : '#6B7280'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => removeItem(item.id)}
          >
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Itinerary Planner</Text>
          <Text style={styles.headerSubtitle}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Settings size={20} color="#6366F1" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color="#6366F1" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Schedule Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.sectionTitle}>Schedule Overview</Text>
          
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Clock size={20} color="#3B82F6" />
              <Text style={styles.overviewValue}>{Math.round(totalScheduledTime / 60 * 10) / 10}h</Text>
              <Text style={styles.overviewLabel}>Scheduled</Text>
            </View>
            
            <View style={styles.overviewStat}>
              <Target size={20} color="#10B981" />
              <Text style={styles.overviewValue}>{itinerary.length}</Text>
              <Text style={styles.overviewLabel}>Items</Text>
            </View>
            
            <View style={styles.overviewStat}>
              <BarChart3 size={20} color="#F59E0B" />
              <Text style={styles.overviewValue}>{Math.round(utilizationRate)}%</Text>
              <Text style={styles.overviewLabel}>Utilization</Text>
            </View>
          </View>
          
          {utilizationRate > 100 && (
            <View style={styles.warningBanner}>
              <AlertCircle size={16} color="#EF4444" />
              <Text style={styles.warningText}>
                Schedule exceeds working hours. Consider reducing tasks or extending work time.
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={generateOptimalSchedule}
            >
              <Zap size={20} color="#6366F1" />
              <Text style={styles.quickActionText}>Auto Schedule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => {
                if (itinerary.length === 0) {
                  Alert.alert('No Schedule', 'Create a schedule first to optimize it.');
                  return;
                }
                
                Alert.alert(
                  'Optimize Schedule',
                  'Choose optimization strategy:',
                  [
                    { 
                      text: 'Minimize Context Switches', 
                      onPress: () => {
                        // Group similar tasks together
                        const optimized = [...itinerary].sort((a, b) => {
                          if (a.type !== b.type) return a.type.localeCompare(b.type);
                          return a.priority === b.priority ? 0 : a.priority === 'high' ? -1 : 1;
                        });
                        
                        // Update start times
                        let currentTime = new Date(selectedDate);
                        currentTime.setHours(workingHours.start, 0, 0, 0);
                        
                        optimized.forEach(item => {
                          item.startTime = new Date(currentTime);
                          currentTime.setMinutes(currentTime.getMinutes() + item.duration);
                        });
                        
                        setItinerary(optimized);
                        Alert.alert('Optimized', 'Schedule optimized to minimize context switches.');
                      }
                    },
                    { 
                      text: 'Energy-Based Ordering', 
                      onPress: () => {
                        // High energy tasks first, then medium, then low
                        const optimized = [...itinerary].sort((a, b) => {
                          const priorityOrder = { high: 3, medium: 2, low: 1 };
                          return priorityOrder[b.priority] - priorityOrder[a.priority];
                        });
                        
                        // Update start times
                        let currentTime = new Date(selectedDate);
                        currentTime.setHours(workingHours.start, 0, 0, 0);
                        
                        optimized.forEach(item => {
                          item.startTime = new Date(currentTime);
                          currentTime.setMinutes(currentTime.getMinutes() + item.duration);
                        });
                        
                        setItinerary(optimized);
                        Alert.alert('Optimized', 'Schedule optimized based on energy levels.');
                      }
                    },
                    { 
                      text: 'Time-Based Optimization', 
                      onPress: () => {
                        // Shortest tasks first to build momentum
                        const optimized = [...itinerary].sort((a, b) => a.duration - b.duration);
                        
                        // Update start times
                        let currentTime = new Date(selectedDate);
                        currentTime.setHours(workingHours.start, 0, 0, 0);
                        
                        optimized.forEach(item => {
                          item.startTime = new Date(currentTime);
                          currentTime.setMinutes(currentTime.getMinutes() + item.duration);
                        });
                        
                        setItinerary(optimized);
                        Alert.alert('Optimized', 'Schedule optimized by task duration.');
                      }
                    },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }}
            >
              <Shuffle size={20} color="#6366F1" />
              <Text style={styles.quickActionText}>Optimize</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => {
                Alert.alert(
                  'Schedule Templates',
                  'Choose a pre-built schedule template:',
                  [
                    {
                      text: 'Deep Work Day',
                      onPress: () => {
                        const template: ItineraryItem[] = [
                          {
                            id: 'template-1',
                            title: 'Morning Deep Work Block',
                            startTime: new Date(selectedDate.setHours(9, 0, 0, 0)),
                            duration: 120,
                            type: 'task',
                            priority: 'high',
                            flexible: false,
                          },
                          {
                            id: 'template-2',
                            title: 'Break & Movement',
                            startTime: new Date(selectedDate.setHours(11, 0, 0, 0)),
                            duration: 15,
                            type: 'break',
                            priority: 'low',
                            flexible: true,
                          },
                          {
                            id: 'template-3',
                            title: 'Administrative Tasks',
                            startTime: new Date(selectedDate.setHours(11, 15, 0, 0)),
                            duration: 45,
                            type: 'task',
                            priority: 'medium',
                            flexible: true,
                          },
                          {
                            id: 'template-4',
                            title: 'Lunch Break',
                            startTime: new Date(selectedDate.setHours(12, 0, 0, 0)),
                            duration: 60,
                            type: 'break',
                            priority: 'low',
                            flexible: false,
                          },
                          {
                            id: 'template-5',
                            title: 'Afternoon Focus Block',
                            startTime: new Date(selectedDate.setHours(13, 0, 0, 0)),
                            duration: 90,
                            type: 'task',
                            priority: 'high',
                            flexible: false,
                          },
                        ];
                        setItinerary(template);
                        Alert.alert('Template Applied', 'Deep Work Day template has been applied.');
                      }
                    },
                    {
                      text: 'Meeting Heavy Day',
                      onPress: () => {
                        const template: ItineraryItem[] = [
                          {
                            id: 'template-1',
                            title: 'Morning Prep',
                            startTime: new Date(selectedDate.setHours(9, 0, 0, 0)),
                            duration: 30,
                            type: 'task',
                            priority: 'medium',
                            flexible: true,
                          },
                          {
                            id: 'template-2',
                            title: 'Team Standup',
                            startTime: new Date(selectedDate.setHours(9, 30, 0, 0)),
                            duration: 30,
                            type: 'meeting',
                            priority: 'high',
                            flexible: false,
                          },
                          {
                            id: 'template-3',
                            title: 'Project Review Meeting',
                            startTime: new Date(selectedDate.setHours(10, 30, 0, 0)),
                            duration: 60,
                            type: 'meeting',
                            priority: 'high',
                            flexible: false,
                          },
                          {
                            id: 'template-4',
                            title: 'Quick Tasks',
                            startTime: new Date(selectedDate.setHours(11, 30, 0, 0)),
                            duration: 30,
                            type: 'task',
                            priority: 'medium',
                            flexible: true,
                          },
                          {
                            id: 'template-5',
                            title: 'Client Call',
                            startTime: new Date(selectedDate.setHours(14, 0, 0, 0)),
                            duration: 45,
                            type: 'meeting',
                            priority: 'high',
                            flexible: false,
                          },
                        ];
                        setItinerary(template);
                        Alert.alert('Template Applied', 'Meeting Heavy Day template has been applied.');
                      }
                    },
                    {
                      text: 'Balanced Productivity',
                      onPress: () => {
                        const template: ItineraryItem[] = [
                          {
                            id: 'template-1',
                            title: 'Morning Focus Time',
                            startTime: new Date(selectedDate.setHours(9, 0, 0, 0)),
                            duration: 90,
                            type: 'task',
                            priority: 'high',
                            flexible: false,
                          },
                          {
                            id: 'template-2',
                            title: 'Coffee Break',
                            startTime: new Date(selectedDate.setHours(10, 30, 0, 0)),
                            duration: 15,
                            type: 'break',
                            priority: 'low',
                            flexible: true,
                          },
                          {
                            id: 'template-3',
                            title: 'Email & Communications',
                            startTime: new Date(selectedDate.setHours(10, 45, 0, 0)),
                            duration: 30,
                            type: 'task',
                            priority: 'medium',
                            flexible: true,
                          },
                          {
                            id: 'template-4',
                            title: 'Creative Work',
                            startTime: new Date(selectedDate.setHours(11, 15, 0, 0)),
                            duration: 75,
                            type: 'task',
                            priority: 'high',
                            flexible: true,
                          },
                          {
                            id: 'template-5',
                            title: 'Lunch & Walk',
                            startTime: new Date(selectedDate.setHours(12, 30, 0, 0)),
                            duration: 45,
                            type: 'break',
                            priority: 'low',
                            flexible: false,
                          },
                          {
                            id: 'template-6',
                            title: 'Afternoon Tasks',
                            startTime: new Date(selectedDate.setHours(13, 15, 0, 0)),
                            duration: 60,
                            type: 'task',
                            priority: 'medium',
                            flexible: true,
                          },
                        ];
                        setItinerary(template);
                        Alert.alert('Template Applied', 'Balanced Productivity template has been applied.');
                      }
                    },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }}
            >
              <Calendar size={20} color="#6366F1" />
              <Text style={styles.quickActionText}>Templates</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={saveItinerary}
              disabled={itinerary.length === 0}
            >
              <Save size={20} color={itinerary.length === 0 ? '#D1D5DB' : '#6366F1'} />
              <Text style={[
                styles.quickActionText,
                { color: itinerary.length === 0 ? '#D1D5DB' : '#6366F1' }
              ]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Schedule Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Auto-schedule tasks</Text>
            <Switch
              value={autoSchedule}
              onValueChange={setAutoSchedule}
              trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Working Hours</Text>
              <View style={styles.timeInputs}>
                <TextInput
                  style={styles.timeInput}
                  value={workingHours.start.toString()}
                  onChangeText={(text) => setWorkingHours(prev => ({ 
                    ...prev, 
                    start: parseInt(text) || 9 
                  }))}
                  keyboardType="numeric"
                  placeholder="9"
                />
                <Text style={styles.timeSeparator}>to</Text>
                <TextInput
                  style={styles.timeInput}
                  value={workingHours.end.toString()}
                  onChangeText={(text) => setWorkingHours(prev => ({ 
                    ...prev, 
                    end: parseInt(text) || 17 
                  }))}
                  keyboardType="numeric"
                  placeholder="17"
                />
              </View>
            </View>
            
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Break Duration</Text>
              <TextInput
                style={styles.durationInput}
                value={breakDuration.toString()}
                onChangeText={(text) => setBreakDuration(parseInt(text) || 15)}
                keyboardType="numeric"
                placeholder="15"
              />
              <Text style={styles.durationUnit}>min</Text>
            </View>
          </View>
        </View>

        {/* Itinerary */}
        <View style={styles.itineraryCard}>
          <Text style={styles.sectionTitle}>Today&apos;s Itinerary</Text>
          
          {itinerary.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No items scheduled</Text>
              <Text style={styles.emptyDescription}>
                Add tasks manually or use auto-schedule to generate an optimal itinerary
              </Text>
              <TouchableOpacity 
                style={styles.emptyActionButton}
                onPress={generateOptimalSchedule}
              >
                <Zap size={16} color="#FFFFFF" />
                <Text style={styles.emptyActionText}>Auto Schedule</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.itineraryList}>
              {itinerary.map((item, index) => renderItineraryItem(item, index))}
            </View>
          )}
        </View>

        {/* Available Tasks */}
        {availableTasks.length > 0 && (
          <View style={styles.availableTasksCard}>
            <Text style={styles.sectionTitle}>Available Tasks</Text>
            <Text style={styles.sectionDescription}>
              Tap to add to your itinerary
            </Text>
            
            <View style={styles.tasksList}>
              {availableTasks.slice(0, 5).map(task => (
                <TouchableOpacity 
                  key={task.id} 
                  style={styles.availableTask}
                  onPress={() => {
                    const startTime = new Date(selectedDate);
                    startTime.setHours(workingHours.start, 0, 0, 0);
                    
                    if (itinerary.length > 0) {
                      const lastItem = itinerary[itinerary.length - 1];
                      startTime.setTime(lastItem.startTime.getTime() + lastItem.duration * 60000);
                    }

                    const newItem: ItineraryItem = {
                      id: `task-${task.id}`,
                      taskId: task.id,
                      title: task.title,
                      startTime,
                      duration: task.estimatedMinutes,
                      type: 'task',
                      priority: task.estimatedMinutes > 60 ? 'high' : 'medium',
                      flexible: true,
                    };

                    setItinerary(prev => [...prev, newItem]);
                  }}
                >
                  <Text style={styles.availableTaskTitle}>{task.title}</Text>
                  <Text style={styles.availableTaskTime}>{task.estimatedMinutes}m</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add Item Modal */}
      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Item</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title</Text>
              <TextInput
                style={styles.formInput}
                value={newItem.title}
                onChangeText={(text) => setNewItem(prev => ({ ...prev, title: text }))}
                placeholder="Enter item title..."
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Duration (min)</Text>
                <TextInput
                  style={styles.formInput}
                  value={newItem.duration.toString()}
                  onChangeText={(text) => setNewItem(prev => ({ 
                    ...prev, 
                    duration: parseInt(text) || 60 
                  }))}
                  keyboardType="numeric"
                  placeholder="60"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Type</Text>
                <View style={styles.typeButtons}>
                  {(['task', 'break', 'meeting', 'custom'] as const).map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        newItem.type === type && styles.activeTypeButton
                      ]}
                      onPress={() => setNewItem(prev => ({ ...prev, type }))}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        newItem.type === type && styles.activeTypeButtonText
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSaveButton}
                onPress={addCustomItem}
              >
                <Text style={styles.modalSaveText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#EF4444',
    lineHeight: 20,
  },
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366F1',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  settingRow: {
    flexDirection: 'row',
    gap: 20,
  },
  settingGroup: {
    flex: 1,
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  timeInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
    minWidth: 50,
  },
  timeSeparator: {
    fontSize: 14,
    color: '#6B7280',
  },
  durationInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 8,
    minWidth: 60,
  },
  durationUnit: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    marginLeft: 8,
  },
  itineraryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  itineraryList: {
    gap: 12,
  },
  itineraryItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTime: {
    width: 80,
    marginRight: 12,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  itemType: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  itemPriority: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  flexibleTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  availableTasksCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tasksList: {
    gap: 8,
  },
  availableTask: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  availableTaskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  availableTaskTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeTypeButton: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  activeTypeButtonText: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});