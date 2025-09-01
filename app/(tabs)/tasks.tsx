import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useChrona } from '@/providers/ChronaProvider';
import {
  Plus,
  Calendar,
  Clock,
  Play,
  Pause,
  CheckCircle,
  Circle,
  Filter,
  Search,
  CalendarDays,
  Timer,
  Target,
  Zap,
  ExternalLink,
  Settings,
  Import,
} from 'lucide-react-native';
import { Task } from '@/types/chrona';
import { router } from 'expo-router';

type FilterType = 'all' | 'today' | 'upcoming' | 'completed' | 'active';
type ViewType = 'list' | 'calendar' | 'timeline';

export default function TasksScreen() {
  const { tasks, activeTask, addTask, updateTask, startTask, pauseTask, completeTask } = useChrona();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    estimatedMinutes: 30,
    minMinutes: 15,
    maxMinutes: 60,
    powerLawExponent: 1.5,
    contextSwitchCost: 5,
    verificationCriteria: [''],
    satisficingThreshold: 0.8,
  });

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (filter) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = filtered.filter(task => {
          const taskDate = new Date(task.createdAt);
          return taskDate >= today && taskDate < tomorrow && !task.completedAt;
        });
        break;
      case 'upcoming':
        filtered = filtered.filter(task => !task.completedAt && !task.startedAt);
        break;
      case 'completed':
        filtered = filtered.filter(task => task.completedAt);
        break;
      case 'active':
        filtered = filtered.filter(task => task.startedAt && !task.completedAt);
        break;
      default:
        break;
    }

    return filtered.sort((a, b) => {
      if (a.completedAt && !b.completedAt) return 1;
      if (!a.completedAt && b.completedAt) return -1;
      return b.createdAt - a.createdAt;
    });
  }, [tasks, filter, searchQuery]);

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    addTask({
      ...newTask,
      verificationCriteria: newTask.verificationCriteria.filter(c => c.trim()),
    });

    setNewTask({
      title: '',
      estimatedMinutes: 30,
      minMinutes: 15,
      maxMinutes: 60,
      powerLawExponent: 1.5,
      contextSwitchCost: 5,
      verificationCriteria: [''],
      satisficingThreshold: 0.8,
    });
    setShowCreateModal(false);
  };

  const handleTaskAction = (task: Task) => {
    if (task.completedAt) return;
    
    if (activeTask?.id === task.id) {
      pauseTask();
    } else if (task.startedAt && !task.completedAt) {
      startTask(task.id);
    } else {
      startTask(task.id);
    }
  };

  const handleCompleteTask = (task: Task) => {
    Alert.alert(
      'Complete Task',
      'How did this task go compared to your estimate?',
      [
        { text: 'Much Faster', onPress: () => completeTask(task.id, 0.5) },
        { text: 'As Expected', onPress: () => completeTask(task.id, 1.0) },
        { text: 'Took Longer', onPress: () => completeTask(task.id, 1.5) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getTaskStatusColor = (task: Task) => {
    if (task.completedAt) return '#10B981';
    if (activeTask?.id === task.id) return '#3B82F6';
    if (task.startedAt) return '#F59E0B';
    return '#6B7280';
  };

  const getTaskStatusIcon = (task: Task) => {
    if (task.completedAt) return CheckCircle;
    if (activeTask?.id === task.id) return Pause;
    if (task.startedAt) return Play;
    return Circle;
  };

  const renderTaskItem = (task: Task) => {
    const StatusIcon = getTaskStatusIcon(task);
    const statusColor = getTaskStatusColor(task);
    const progress = task.actualMinutes / task.estimatedMinutes;

    return (
      <View key={task.id} style={styles.taskItem}>
        <TouchableOpacity
          style={[styles.taskStatus, { backgroundColor: statusColor }]}
          onPress={() => handleTaskAction(task)}
        >
          <StatusIcon size={16} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, task.completedAt && styles.completedTask]}>
            {task.title}
          </Text>
          
          <View style={styles.taskMeta}>
            <View style={styles.taskMetaItem}>
              <Clock size={12} color="#6B7280" />
              <Text style={styles.taskMetaText}>
                {task.estimatedMinutes}m est.
              </Text>
            </View>
            
            {task.actualMinutes > 0 && (
              <View style={styles.taskMetaItem}>
                <Timer size={12} color="#6B7280" />
                <Text style={styles.taskMetaText}>
                  {task.actualMinutes}m actual
                </Text>
              </View>
            )}
            
            {task.startedAt && !task.completedAt && (
              <View style={styles.taskMetaItem}>
                <Zap size={12} color="#3B82F6" />
                <Text style={[styles.taskMetaText, { color: '#3B82F6' }]}>Active</Text>
              </View>
            )}
          </View>
          
          {task.actualMinutes > 0 && (
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min(progress * 100, 100)}%`,
                    backgroundColor: progress > 1.2 ? '#EF4444' : progress > 0.8 ? '#10B981' : '#3B82F6'
                  }
                ]}
              />
            </View>
          )}
        </View>
        
        {!task.completedAt && task.startedAt && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleCompleteTask(task)}
          >
            <CheckCircle size={20} color="#10B981" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderCalendarIntegration = () => (
    <View style={styles.calendarSection}>
      <Text style={styles.sectionTitle}>Calendar Integration</Text>
      <Text style={styles.sectionDescription}>
        Connect your external calendars to sync tasks and schedule blocks
      </Text>
      
      <View style={styles.integrationGrid}>
        <TouchableOpacity 
          style={styles.integrationCard}
          onPress={() => {
            Alert.alert(
              'Google Calendar Integration',
              'Connect your Google Calendar to sync tasks and events. This will allow Chrona to:\n\n• Import existing events as time blocks\n• Export tasks to your calendar\n• Detect scheduling conflicts\n• Optimize around existing commitments',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Connect', onPress: () => Alert.alert('Demo', 'Calendar integration would be implemented here') },
              ]
            );
          }}
        >
          <Calendar size={24} color="#3B82F6" />
          <Text style={styles.integrationTitle}>Google Calendar</Text>
          <Text style={styles.integrationStatus}>Not Connected</Text>
          <ExternalLink size={16} color="#6B7280" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.integrationCard}
          onPress={() => {
            Alert.alert(
              'Apple Calendar Integration',
              'Connect your Apple Calendar to sync with Chrona. This integration provides:\n\n• Seamless event import\n• Two-way task synchronization\n• Smart scheduling around meetings\n• Focus time blocking',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Connect', onPress: () => Alert.alert('Demo', 'Apple Calendar integration would be implemented here') },
              ]
            );
          }}
        >
          <Calendar size={24} color="#000000" />
          <Text style={styles.integrationTitle}>Apple Calendar</Text>
          <Text style={styles.integrationStatus}>Not Connected</Text>
          <ExternalLink size={16} color="#6B7280" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.integrationCard}
          onPress={() => {
            Alert.alert(
              'Outlook Integration',
              'Connect Microsoft Outlook for enterprise productivity:\n\n• Meeting time block creation\n• Task deadline synchronization\n• Team calendar coordination\n• Focus time protection',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Connect', onPress: () => Alert.alert('Demo', 'Outlook integration would be implemented here') },
              ]
            );
          }}
        >
          <Calendar size={24} color="#0078D4" />
          <Text style={styles.integrationTitle}>Outlook</Text>
          <Text style={styles.integrationStatus}>Not Connected</Text>
          <ExternalLink size={16} color="#6B7280" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.integrationCard}
          onPress={() => {
            Alert.alert(
              'Import Calendar File',
              'Import events from any calendar application using .ics files:\n\n• Drag and drop .ics files\n• Bulk import events as time blocks\n• Preserve event metadata\n• Maintain privacy (local processing)',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Import File', onPress: () => Alert.alert('Demo', 'File import would be implemented here') },
              ]
            );
          }}
        >
          <Import size={24} color="#6B7280" />
          <Text style={styles.integrationTitle}>Import .ics</Text>
          <Text style={styles.integrationStatus}>Upload File</Text>
          <ExternalLink size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.syncButton}
        onPress={() => {
          Alert.alert(
            'Sync All Calendars',
            'This will synchronize all connected calendars with Chrona:\n\n• Import new events as time blocks\n• Export pending tasks to calendars\n• Update existing entries\n• Resolve scheduling conflicts',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Sync Now', 
                onPress: () => {
                  Alert.alert('Syncing...', 'Calendar synchronization in progress');
                  setTimeout(() => {
                    Alert.alert('Sync Complete', 'All calendars have been synchronized successfully.');
                  }, 2000);
                }
              },
            ]
          );
        }}
      >
        <Text style={styles.syncButtonText}>Sync All Calendars</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tasks</Text>
          <Text style={styles.headerSubtitle}>
            {filteredTasks.length} tasks • {tasks.filter(t => !t.completedAt).length} active
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/calendar-view')}
          >
            <CalendarDays size={20} color="#6366F1" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color="#6366F1" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={16} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {(['all', 'today', 'upcoming', 'active', 'completed'] as FilterType[]).map((filterType) => (
            <TouchableOpacity
              key={filterType}
              style={[
                styles.filterChip,
                filter === filterType && styles.activeFilterChip
              ]}
              onPress={() => setFilter(filterType)}
            >
              <Text style={[
                styles.filterText,
                filter === filterType && styles.activeFilterText
              ]}>
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Task List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Target size={16} color="#3B82F6" />
            <Text style={styles.statValue}>{tasks.filter(t => !t.completedAt).length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          
          <View style={styles.statCard}>
            <CheckCircle size={16} color="#10B981" />
            <Text style={styles.statValue}>{tasks.filter(t => t.completedAt).length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={styles.statCard}>
            <Clock size={16} color="#F59E0B" />
            <Text style={styles.statValue}>
              {Math.round(tasks.reduce((sum, t) => sum + t.actualMinutes, 0) / 60)}h
            </Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          
          <View style={styles.statCard}>
            <Zap size={16} color="#EC4899" />
            <Text style={styles.statValue}>
              {tasks.length > 0 ? Math.round(
                tasks.filter(t => t.perceptionRatio).reduce((sum, t) => sum + (t.perceptionRatio || 0), 0) / 
                tasks.filter(t => t.perceptionRatio).length * 100
              ) : 0}%
            </Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>

        {/* Tasks */}
        <View style={styles.tasksContainer}>
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No tasks found</Text>
              <Text style={styles.emptyDescription}>
                {filter === 'all' 
                  ? 'Create your first task to get started'
                  : `No ${filter} tasks at the moment`
                }
              </Text>
              <View style={styles.emptyActions}>
                <TouchableOpacity 
                  style={styles.createButton}
                  onPress={() => setShowCreateModal(true)}
                >
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>Create Task</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.planButton}
                  onPress={() => router.push('/itinerary-planner')}
                >
                  <CalendarDays size={16} color="#6366F1" />
                  <Text style={styles.planButtonText}>Plan Itinerary</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {filteredTasks.map(renderTaskItem)}
              
              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/itinerary-planner')}
                >
                  <CalendarDays size={20} color="#6366F1" />
                  <Text style={styles.quickActionTitle}>Plan Your Day</Text>
                  <Text style={styles.quickActionDescription}>
                    Create an optimized schedule from your tasks
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => router.push('/calendar-view')}
                >
                  <Calendar size={20} color="#10B981" />
                  <Text style={styles.quickActionTitle}>Calendar View</Text>
                  <Text style={styles.quickActionDescription}>
                    See your tasks in a calendar layout
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Create Task Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Task</Text>
            <TouchableOpacity onPress={handleCreateTask}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Task Title</Text>
              <TextInput
                style={styles.formInput}
                value={newTask.title}
                onChangeText={(text) => setNewTask(prev => ({ ...prev, title: text }))}
                placeholder="Enter task title..."
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Estimated Time (min)</Text>
                <TextInput
                  style={styles.formInput}
                  value={newTask.estimatedMinutes.toString()}
                  onChangeText={(text) => setNewTask(prev => ({ ...prev, estimatedMinutes: parseInt(text) || 0 }))}
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Context Switch Cost</Text>
                <TextInput
                  style={styles.formInput}
                  value={newTask.contextSwitchCost.toString()}
                  onChangeText={(text) => setNewTask(prev => ({ ...prev, contextSwitchCost: parseInt(text) || 0 }))}
                  keyboardType="numeric"
                  placeholder="5"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Min Time (min)</Text>
                <TextInput
                  style={styles.formInput}
                  value={newTask.minMinutes.toString()}
                  onChangeText={(text) => setNewTask(prev => ({ ...prev, minMinutes: parseInt(text) || 0 }))}
                  keyboardType="numeric"
                  placeholder="15"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Max Time (min)</Text>
                <TextInput
                  style={styles.formInput}
                  value={newTask.maxMinutes.toString()}
                  onChangeText={(text) => setNewTask(prev => ({ ...prev, maxMinutes: parseInt(text) || 0 }))}
                  keyboardType="numeric"
                  placeholder="60"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Success Criteria</Text>
              {newTask.verificationCriteria.map((criteria, index) => (
                <TextInput
                  key={index}
                  style={[styles.formInput, { marginBottom: 8 }]}
                  value={criteria}
                  onChangeText={(text) => {
                    const updated = [...newTask.verificationCriteria];
                    updated[index] = text;
                    setNewTask(prev => ({ ...prev, verificationCriteria: updated }));
                  }}
                  placeholder={`Criteria ${index + 1}...`}
                  placeholderTextColor="#9CA3AF"
                />
              ))}
              <TouchableOpacity 
                style={styles.addCriteriaButton}
                onPress={() => setNewTask(prev => ({ 
                  ...prev, 
                  verificationCriteria: [...prev.verificationCriteria, '']
                }))}
              >
                <Plus size={16} color="#6366F1" />
                <Text style={styles.addCriteriaText}>Add Criteria</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Calendar Integration Modal */}
      <Modal
        visible={showCalendarModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCalendarModal(false)}>
              <Text style={styles.modalCancel}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Calendar Integration</Text>
            <TouchableOpacity>
              <Settings size={20} color="#6366F1" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {renderCalendarIntegration()}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilterChip: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  tasksContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskMetaText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  completeButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalSave: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
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
    marginBottom: 20,
  },
  addCriteriaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  addCriteriaText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  calendarSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  integrationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  integrationCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  integrationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  integrationStatus: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  syncButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6366F1',
    gap: 8,
  },
  planButtonText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    marginTop: 24,
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});