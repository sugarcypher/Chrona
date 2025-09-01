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
  TrendingUp,
  Activity,
  MoreHorizontal,
} from 'lucide-react-native';
import { Task } from '@/types/chrona';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout } from '@/constants/design';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

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
    const isActive = activeTask?.id === task.id;
    const isCompleted = !!task.completedAt;
    const isOverdue = progress > 1.2;

    return (
      <Card key={task.id} style={[styles.taskCard, isActive && styles.activeTaskCard]}>
        <View style={styles.taskHeader}>
          <TouchableOpacity
            style={[styles.taskStatus, { backgroundColor: statusColor }]}
            onPress={() => handleTaskAction(task)}
          >
            <StatusIcon size={16} color={Colors.text.inverse} />
          </TouchableOpacity>
          
          <View style={styles.taskTitleContainer}>
            <Text style={[styles.taskTitle, isCompleted && styles.completedTask]}>
              {task.title}
            </Text>
            <View style={styles.taskBadges}>
              {isActive && <Badge text="Active" variant="primary" size="sm" />}
              {isCompleted && <Badge text="Completed" variant="success" size="sm" />}
              {isOverdue && !isCompleted && <Badge text="Overdue" variant="error" size="sm" />}
            </View>
          </View>
          
          <TouchableOpacity style={styles.taskMenu}>
            <MoreHorizontal size={16} color={Colors.neutral[400]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.taskMeta}>
          <View style={styles.taskMetaItem}>
            <Clock size={12} color={Colors.neutral[500]} />
            <Text style={styles.taskMetaText}>
              {task.estimatedMinutes}m estimated
            </Text>
          </View>
          
          {task.actualMinutes > 0 && (
            <View style={styles.taskMetaItem}>
              <Timer size={12} color={Colors.neutral[500]} />
              <Text style={styles.taskMetaText}>
                {task.actualMinutes}m actual
              </Text>
            </View>
          )}
          
          <View style={styles.taskMetaItem}>
            <Target size={12} color={Colors.neutral[500]} />
            <Text style={styles.taskMetaText}>
              {Math.round(task.satisficingThreshold * 100)}% threshold
            </Text>
          </View>
        </View>
        
        {task.actualMinutes > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min(progress * 100, 100)}%`,
                    backgroundColor: isOverdue ? Colors.error[500] : progress > 0.8 ? Colors.success[500] : Colors.primary[500]
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        )}
        
        <View style={styles.taskActions}>
          {!isCompleted && (
            <>
              <Button
                title={isActive ? "Pause" : "Start"}
                onPress={() => handleTaskAction(task)}
                variant={isActive ? "secondary" : "primary"}
                size="sm"
                icon={isActive ? <Pause size={14} color={Colors.text.primary} /> : <Play size={14} color={Colors.text.inverse} />}
              />
              {task.startedAt && (
                <Button
                  title="Complete"
                  onPress={() => handleCompleteTask(task)}
                  variant="outline"
                  size="sm"
                  icon={<CheckCircle size={14} color={Colors.success[500]} />}
                />
              )}
            </>
          )}
          
          <TouchableOpacity 
            style={styles.taskDetailButton}
            onPress={() => router.push(`/task-detail?id=${task.id}`)}
          >
            <Text style={styles.taskDetailText}>Details</Text>
            <TrendingUp size={12} color={Colors.primary[500]} />
          </TouchableOpacity>
        </View>
      </Card>
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
            <CalendarDays size={20} color={Colors.primary[500]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color={Colors.primary[500]} />
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
    backgroundColor: Colors.background.secondary,
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
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    letterSpacing: Typography.letterSpacing.tight,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.tertiary,
    fontWeight: Typography.fontWeight.normal,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  activeFilterChip: {
    backgroundColor: Colors.accent[600],
    borderColor: Colors.accent[600],
  },
  filterText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  activeFilterText: {
    color: Colors.text.inverse,
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
    backgroundColor: Colors.background.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    fontWeight: Typography.fontWeight.medium,
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
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: Colors.text.tertiary,
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
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    fontWeight: Typography.fontWeight.medium,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    flex: 1,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  completeButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.base,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent[600],
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  createButtonText: {
    color: Colors.text.inverse,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
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
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.accent[600],
    gap: Spacing.sm,
  },
  planButtonText: {
    color: Colors.accent[600],
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  quickActions: {
    marginTop: 24,
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: Colors.background.primary,
    padding: Spacing.xl,
    borderRadius: BorderRadius['2xl'],
    ...Shadows.lg,
  },
  quickActionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  quickActionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  
  // New Task Card Styles
  taskCard: {
    marginBottom: Spacing.lg,
  },
  activeTaskCard: {
    borderWidth: 2,
    borderColor: Colors.accent[500],
    ...Shadows.md,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  taskTitleContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  taskBadges: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  taskMenu: {
    padding: Spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  progressText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    minWidth: 35,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  taskDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  taskDetailText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.accent[600],
  },
});