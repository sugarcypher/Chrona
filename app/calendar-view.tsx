import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { useChrona } from '@/providers/ChronaProvider';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Play,
  Plus,
  Grid3X3,
  List,
} from 'lucide-react-native';
import { router } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');
const CELL_WIDTH = (screenWidth - 40) / 7;

type ViewMode = 'month' | 'week' | 'day';

export default function CalendarViewScreen() {
  const { tasks, timeBlocks, activeTask } = useChrona();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt).toDateString();
      return taskDate === dateStr;
    });
  };

  const getTimeBlocksForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return timeBlocks.filter(block => {
      const blockDate = new Date(block.startTime).toDateString();
      return blockDate === dateStr;
    });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const renderCalendarDay = (date: Date | null, index: number) => {
    if (!date) {
      return <View key={index} style={styles.emptyDay} />;
    }

    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = selectedDate?.toDateString() === date.toDateString();
    const dayTasks = getTasksForDate(date);
    const dayBlocks = getTimeBlocksForDate(date);
    
    const completedTasks = dayTasks.filter(t => t.completedAt).length;
    const totalTasks = dayTasks.length;
    const hasActivity = totalTasks > 0 || dayBlocks.length > 0;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.calendarDay,
          isToday && styles.todayDay,
          isSelected && styles.selectedDay,
          hasActivity && styles.activeDay,
        ]}
        onPress={() => setSelectedDate(date)}
      >
        <Text style={[
          styles.dayNumber,
          isToday && styles.todayText,
          isSelected && styles.selectedText,
        ]}>
          {date.getDate()}
        </Text>
        
        {hasActivity && (
          <View style={styles.activityIndicators}>
            {totalTasks > 0 && (
              <View style={[
                styles.taskIndicator,
                { backgroundColor: completedTasks === totalTasks ? '#10B981' : '#F59E0B' }
              ]}>
                <Text style={styles.taskCount}>{totalTasks}</Text>
              </View>
            )}
            {dayBlocks.length > 0 && (
              <View style={styles.blockIndicator} />
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSelectedDateDetails = () => {
    if (!selectedDate) return null;

    const dayTasks = getTasksForDate(selectedDate);
    const dayBlocks = getTimeBlocksForDate(selectedDate);
    const totalMinutes = dayBlocks.reduce((sum, block) => sum + block.duration, 0);

    return (
      <View style={styles.selectedDateDetails}>
        <Text style={styles.selectedDateTitle}>
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        <View style={styles.dayStats}>
          <View style={styles.dayStat}>
            <Text style={styles.dayStatValue}>{dayTasks.length}</Text>
            <Text style={styles.dayStatLabel}>Tasks</Text>
          </View>
          <View style={styles.dayStat}>
            <Text style={styles.dayStatValue}>{dayBlocks.length}</Text>
            <Text style={styles.dayStatLabel}>Blocks</Text>
          </View>
          <View style={styles.dayStat}>
            <Text style={styles.dayStatValue}>{Math.round(totalMinutes / 60 * 10) / 10}h</Text>
            <Text style={styles.dayStatLabel}>Focus Time</Text>
          </View>
        </View>

        {dayTasks.length > 0 && (
          <View style={styles.dayTasksList}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            {dayTasks.map(task => (
              <View key={task.id} style={styles.dayTaskItem}>
                <View style={[
                  styles.taskStatusDot,
                  { backgroundColor: task.completedAt ? '#10B981' : task.startedAt ? '#F59E0B' : '#6B7280' }
                ]} />
                <Text style={[
                  styles.dayTaskTitle,
                  task.completedAt && styles.completedTaskTitle
                ]}>
                  {task.title}
                </Text>
                <Text style={styles.dayTaskTime}>{task.estimatedMinutes}m</Text>
              </View>
            ))}
          </View>
        )}

        {dayBlocks.length > 0 && (
          <View style={styles.dayBlocksList}>
            <Text style={styles.sectionTitle}>Time Blocks</Text>
            {dayBlocks.map(block => {
              const startTime = new Date(block.startTime);
              // const endTime = new Date(block.endTime);
              const task = tasks.find(t => t.id === block.taskId);
              
              return (
                <View key={block.id} style={styles.dayBlockItem}>
                  <View style={styles.blockTimeRange}>
                    <Text style={styles.blockTime}>
                      {startTime.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </Text>
                    <Text style={styles.blockDuration}>{block.duration}m</Text>
                  </View>
                  <Text style={styles.blockTaskTitle}>
                    {task?.title || 'Unknown Task'}
                  </Text>
                  <View style={[
                    styles.flowIntensityBar,
                    { backgroundColor: `rgba(99, 102, 241, ${block.flowIntensity})` }
                  ]} />
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return (
      <View style={styles.weekView}>
        <View style={styles.weekHeader}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.weekDayHeader}>
              <Text style={styles.weekDayName}>{dayNames[day.getDay()]}</Text>
              <Text style={styles.weekDayNumber}>{day.getDate()}</Text>
            </View>
          ))}
        </View>
        
        <ScrollView style={styles.weekContent}>
          {Array.from({ length: 24 }, (_, hour) => (
            <View key={hour} style={styles.hourRow}>
              <Text style={styles.hourLabel}>
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </Text>
              <View style={styles.hourCells}>
                {weekDays.map((day, dayIndex) => {
                  const dayBlocks = getTimeBlocksForDate(day).filter(block => {
                    const blockHour = new Date(block.startTime).getHours();
                    return blockHour === hour;
                  });
                  
                  return (
                    <View key={dayIndex} style={styles.hourCell}>
                      {dayBlocks.map(block => (
                        <View key={block.id} style={[
                          styles.weekBlock,
                          { backgroundColor: `rgba(99, 102, 241, ${block.flowIntensity * 0.8 + 0.2})` }
                        ]}>
                          <Text style={styles.weekBlockText} numberOfLines={1}>
                            {tasks.find(t => t.id === block.taskId)?.title || 'Task'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <ChevronLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth('next')}>
            <ChevronRight size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.viewModeButton, viewMode === 'month' && styles.activeViewMode]}
            onPress={() => setViewMode('month')}
          >
            <Grid3X3 size={16} color={viewMode === 'month' ? '#FFFFFF' : '#6B7280'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewModeButton, viewMode === 'week' && styles.activeViewMode]}
            onPress={() => setViewMode('week')}
          >
            <List size={16} color={viewMode === 'week' ? '#FFFFFF' : '#6B7280'} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.back()}
          >
            <Plus size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {viewMode === 'month' ? (
          <>
            {/* Calendar Grid */}
            <View style={styles.calendar}>
              {/* Day Headers */}
              <View style={styles.dayHeaders}>
                {dayNames.map((day, index) => (
                  <Text key={index} style={styles.dayHeader}>{day}</Text>
                ))}
              </View>
              
              {/* Calendar Days */}
              <View style={styles.calendarGrid}>
                {getDaysInMonth().map((date, index) => renderCalendarDay(date, index))}
              </View>
            </View>

            {/* Selected Date Details */}
            {renderSelectedDateDetails()}
          </>
        ) : (
          renderWeekView()
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/(tabs)/tasks')}
          >
            <Calendar size={20} color="#6366F1" />
            <Text style={styles.quickActionText}>Plan Itinerary</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => {
              Alert.alert(
                'Time Blocking',
                'Create focused time blocks for deep work and productivity.',
                [
                  {
                    text: 'Create 2-Hour Block',
                    onPress: () => {
                      Alert.alert(
                        'Time Block Created',
                        'A 2-hour deep work block has been added to your calendar. You can view and manage it in your calendar app.',
                        [{ text: 'OK' }]
                      );
                    }
                  },
                  {
                    text: 'Create 4-Hour Block',
                    onPress: () => {
                      Alert.alert(
                        'Time Block Created',
                        'A 4-hour intensive work block has been added to your calendar. Perfect for complex projects and deep focus work.',
                        [{ text: 'OK' }]
                      );
                    }
                  },
                  {
                    text: 'Custom Duration',
                    onPress: () => {
                      Alert.alert(
                        'Custom Time Block',
                        'Custom time block creation would open a detailed form here. You can specify duration, break intervals, and focus areas.',
                        [{ text: 'OK' }]
                      );
                    }
                  },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Clock size={20} color="#6366F1" />
            <Text style={styles.quickActionText}>Time Blocking</Text>
          </TouchableOpacity>
          
          {activeTask && (
            <TouchableOpacity style={[styles.quickActionButton, styles.activeTaskButton]}>
              <Play size={20} color="#FFFFFF" />
              <Text style={[styles.quickActionText, { color: '#FFFFFF' }]}>
                {activeTask.title}
              </Text>
            </TouchableOpacity>
          )}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewModeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeViewMode: {
    backgroundColor: '#6366F1',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  calendar: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dayHeader: {
    width: CELL_WIDTH,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: CELL_WIDTH,
    height: CELL_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
    position: 'relative',
  },
  emptyDay: {
    width: CELL_WIDTH,
    height: CELL_WIDTH,
  },
  todayDay: {
    backgroundColor: '#EFF6FF',
  },
  selectedDay: {
    backgroundColor: '#6366F1',
  },
  activeDay: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  todayText: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activityIndicators: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    gap: 2,
  },
  taskIndicator: {
    width: 16,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCount: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  blockIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6366F1',
  },
  selectedDateDetails: {
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
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  dayStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  dayStat: {
    alignItems: 'center',
  },
  dayStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  dayStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  dayTasksList: {
    marginBottom: 20,
  },
  dayTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  taskStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dayTaskTitle: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  dayTaskTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  dayBlocksList: {
    marginBottom: 20,
  },
  dayBlockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  blockTimeRange: {
    width: 80,
  },
  blockTime: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '500',
  },
  blockDuration: {
    fontSize: 10,
    color: '#6B7280',
  },
  blockTaskTitle: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  flowIntensityBar: {
    width: 20,
    height: 4,
    borderRadius: 2,
  },
  weekView: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  weekHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekDayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  weekDayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  weekDayNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  weekContent: {
    maxHeight: 400,
  },
  hourRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 60,
  },
  hourLabel: {
    width: 60,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    paddingRight: 8,
    paddingTop: 4,
  },
  hourCells: {
    flex: 1,
    flexDirection: 'row',
  },
  hourCell: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
    padding: 2,
  },
  weekBlock: {
    borderRadius: 4,
    padding: 4,
    marginBottom: 2,
  },
  weekBlockText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  quickActions: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeTaskButton: {
    backgroundColor: '#6366F1',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
});