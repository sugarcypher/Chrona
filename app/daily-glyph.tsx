import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useChrona } from '@/providers/ChronaProvider';
import { Calendar, Download, Share2, Palette, RotateCcw, Info } from 'lucide-react-native';
import { formatDuration } from '@/utils/formatters';

const { width: screenWidth } = Dimensions.get('window');

export default function DailyGlyphScreen() {
  const { tasks, timeBlocks } = useChrona();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [glyphStyle, setGlyphStyle] = useState<'organic' | 'geometric' | 'minimal'>('organic');
  const [animationValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [selectedDate, glyphStyle, animationValue]);

  const glyphData = React.useMemo(() => {
    const dateString = selectedDate.toDateString();
    const dayBlocks = timeBlocks.filter(block => 
      new Date(block.startTime).toDateString() === dateString
    );
    const dayTasks = tasks.filter(task => {
      if (task.completedAt) {
        return new Date(task.completedAt).toDateString() === dateString;
      }
      if (task.startedAt) {
        return new Date(task.startedAt).toDateString() === dateString;
      }
      return false;
    });

    // Core metrics for glyph generation
    const totalMinutes = dayBlocks.reduce((sum, block) => sum + block.duration, 0);
    const avgFlowIntensity = dayBlocks.length > 0 
      ? dayBlocks.reduce((sum, block) => sum + (block.flowIntensity || 0), 0) / dayBlocks.length
      : 0;
    const switchCount = dayBlocks.length - 1;
    const completedCount = dayTasks.filter(t => t.completedAt).length;
    const totalTasks = dayTasks.length;
    
    // Advanced glyph parameters
    const energy = Math.min(1, totalMinutes / 480); // 8 hours = full energy
    const focus = avgFlowIntensity;
    const chaos = Math.min(1, switchCount / 10); // Normalize switch count
    const completion = totalTasks > 0 ? completedCount / totalTasks : 0;
    const balance = 1 - Math.abs(0.5 - (totalMinutes % 60) / 60); // Time distribution balance
    
    // Temporal rhythm (how evenly distributed the work was)
    const hourlyDistribution = Array(24).fill(0);
    dayBlocks.forEach(block => {
      const hour = new Date(block.startTime).getHours();
      hourlyDistribution[hour] += block.duration;
    });
    const workingHours = hourlyDistribution.filter(h => h > 0).length;
    const rhythm = workingHours > 0 ? 1 - (Math.max(...hourlyDistribution) - Math.min(...hourlyDistribution.filter(h => h > 0))) / Math.max(...hourlyDistribution) : 0;

    return {
      totalMinutes,
      energy,
      focus,
      chaos,
      completion,
      balance,
      rhythm,
      switchCount,
      completedCount,
      totalTasks,
      dayBlocks,
      dayTasks,
      hourlyDistribution,
    };
  }, [tasks, timeBlocks, selectedDate]);

  const getGlyphColor = () => {
    if (glyphData.completion > 0.8) return '#10B981'; // Green for high completion
    if (glyphData.focus > 0.7) return '#0EA5E9'; // Blue for high focus
    if (glyphData.chaos > 0.6) return '#EF4444'; // Red for high chaos
    if (glyphData.energy > 0.6) return '#F59E0B'; // Orange for high energy
    return '#6B7280'; // Gray for low activity
  };

  const getGlyphDescription = () => {
    if (glyphData.totalMinutes === 0) return 'Rest Day';
    if (glyphData.focus > 0.8 && glyphData.chaos < 0.3) return 'Deep Flow';
    if (glyphData.chaos > 0.7) return 'Fragmented';
    if (glyphData.completion > 0.8) return 'Productive';
    if (glyphData.energy > 0.8) return 'High Energy';
    if (glyphData.rhythm > 0.7) return 'Rhythmic';
    return 'Balanced';
  };

  const renderGlyph = () => {
    const centerX = screenWidth / 2;
    const centerY = 200;
    const baseRadius = 60 + glyphData.energy * 40;
    
    switch (glyphStyle) {
      case 'organic':
        return renderOrganicGlyph(centerX, centerY, baseRadius);
      case 'geometric':
        return renderGeometricGlyph(centerX, centerY, baseRadius);
      case 'minimal':
        return renderMinimalGlyph(centerX, centerY, baseRadius);
      default:
        return renderOrganicGlyph(centerX, centerY, baseRadius);
    }
  };

  const renderOrganicGlyph = (centerX: number, centerY: number, radius: number) => {
    const elements = [];
    
    // Main shape - varies based on focus and chaos
    const shapeRadius = radius * (0.7 + glyphData.focus * 0.3);
    const irregularity = glyphData.chaos * 20;
    
    elements.push(
      <Animated.View
        key="main-shape"
        style={[
          styles.glyphMainShape,
          {
            left: centerX - shapeRadius,
            top: centerY - shapeRadius,
            width: shapeRadius * 2,
            height: shapeRadius * 2,
            borderRadius: shapeRadius - irregularity,
            backgroundColor: getGlyphColor() + '40',
            borderColor: getGlyphColor(),
            borderWidth: 2 + glyphData.energy * 3,
            transform: [
              {
                scale: animationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              },
              {
                rotate: animationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', `${glyphData.rhythm * 360}deg`],
                }),
              },
            ],
          },
        ]}
      />
    );

    // Flow tendrils - represent sustained focus periods
    const flowTendrils = Math.min(8, Math.floor(glyphData.focus * 8));
    for (let i = 0; i < flowTendrils; i++) {
      const angle = (360 / flowTendrils) * i;
      const tendrilLength = 20 + glyphData.focus * 30;
      const x = centerX + Math.cos((angle * Math.PI) / 180) * (shapeRadius + 10);
      const y = centerY + Math.sin((angle * Math.PI) / 180) * (shapeRadius + 10);
      
      elements.push(
        <Animated.View
          key={`tendril-${i}`}
          style={[
            styles.glyphTendril,
            {
              left: x - 2,
              top: y - tendrilLength / 2,
              height: tendrilLength,
              backgroundColor: getGlyphColor(),
              transform: [
                { rotate: `${angle + 90}deg` },
                {
                  scaleY: animationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            },
          ]}
        />
      );
    }

    // Chaos fragments - represent context switches
    const fragments = Math.min(12, glyphData.switchCount);
    for (let i = 0; i < fragments; i++) {
      const angle = Math.random() * 360;
      const distance = shapeRadius + 20 + Math.random() * 40;
      const x = centerX + Math.cos((angle * Math.PI) / 180) * distance;
      const y = centerY + Math.sin((angle * Math.PI) / 180) * distance;
      
      elements.push(
        <Animated.View
          key={`fragment-${i}`}
          style={[
            styles.glyphFragment,
            {
              left: x - 3,
              top: y - 3,
              backgroundColor: '#F59E0B',
              transform: [
                {
                  scale: animationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            },
          ]}
        />
      );
    }

    // Completion rings
    const completionRings = Math.floor(glyphData.completion * 3);
    for (let i = 0; i < completionRings; i++) {
      const ringRadius = shapeRadius + 15 + i * 10;
      elements.push(
        <Animated.View
          key={`ring-${i}`}
          style={[
            styles.glyphRing,
            {
              left: centerX - ringRadius,
              top: centerY - ringRadius,
              width: ringRadius * 2,
              height: ringRadius * 2,
              borderRadius: ringRadius,
              borderColor: '#10B981',
              borderWidth: 2,
              transform: [
                {
                  scale: animationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        />
      );
    }

    return elements;
  };

  const renderGeometricGlyph = (centerX: number, centerY: number, radius: number) => {
    // Simplified geometric version
    const elements = [];
    
    elements.push(
      <Animated.View
        key="geometric-shape"
        style={[
          styles.glyphGeometric,
          {
            left: centerX - radius,
            top: centerY - radius,
            width: radius * 2,
            height: radius * 2,
            backgroundColor: getGlyphColor() + '30',
            borderColor: getGlyphColor(),
            borderWidth: 3,
            transform: [
              {
                scale: animationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ],
          },
        ]}
      />
    );
    
    return elements;
  };

  const renderMinimalGlyph = (centerX: number, centerY: number, radius: number) => {
    // Ultra-minimal dot-based representation
    const elements = [];
    const dotSize = 8 + glyphData.energy * 12;
    
    elements.push(
      <Animated.View
        key="minimal-dot"
        style={[
          styles.glyphMinimal,
          {
            left: centerX - dotSize / 2,
            top: centerY - dotSize / 2,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: getGlyphColor(),
            transform: [
              {
                scale: animationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 1],
                }),
              },
            ],
          },
        ]}
      />
    );
    
    return elements;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.dateSelector}>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
          >
            <RotateCcw size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric' 
            })}
          </Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setSelectedDate(new Date())}
          >
            <Calendar size={20} color="#0EA5E9" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.styleSelector}>
          {(['organic', 'geometric', 'minimal'] as const).map((style) => (
            <TouchableOpacity
              key={style}
              style={[
                styles.styleButton,
                glyphStyle === style && styles.styleButtonActive
              ]}
              onPress={() => setGlyphStyle(style)}
            >
              <Text style={[
                styles.styleButtonText,
                glyphStyle === style && styles.styleButtonTextActive
              ]}>
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Glyph Canvas */}
      <View style={styles.glyphCanvas}>
        <View style={styles.glyphContainer}>
          {renderGlyph()}
        </View>
        
        <View style={styles.glyphInfo}>
          <Text style={styles.glyphTitle}>{getGlyphDescription()}</Text>
          <Text style={styles.glyphSubtitle}>
            {formatDuration(glyphData.totalMinutes)} • {glyphData.completedCount}/{glyphData.totalTasks} tasks
          </Text>
        </View>
      </View>

      {/* Glyph Metrics */}
      <View style={styles.metricsCard}>
        <Text style={styles.cardTitle}>Glyph Composition</Text>
        
        <View style={styles.metricsList}>
          <View style={styles.metricItem}>
            <View style={[styles.metricDot, { backgroundColor: getGlyphColor() }]} />
            <Text style={styles.metricLabel}>Energy</Text>
            <View style={styles.metricBar}>
              <View style={[styles.metricFill, { width: `${glyphData.energy * 100}%`, backgroundColor: getGlyphColor() }]} />
            </View>
            <Text style={styles.metricValue}>{(glyphData.energy * 100).toFixed(0)}%</Text>
          </View>
          
          <View style={styles.metricItem}>
            <View style={[styles.metricDot, { backgroundColor: '#0EA5E9' }]} />
            <Text style={styles.metricLabel}>Focus</Text>
            <View style={styles.metricBar}>
              <View style={[styles.metricFill, { width: `${glyphData.focus * 100}%`, backgroundColor: '#0EA5E9' }]} />
            </View>
            <Text style={styles.metricValue}>{(glyphData.focus * 100).toFixed(0)}%</Text>
          </View>
          
          <View style={styles.metricItem}>
            <View style={[styles.metricDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.metricLabel}>Chaos</Text>
            <View style={styles.metricBar}>
              <View style={[styles.metricFill, { width: `${glyphData.chaos * 100}%`, backgroundColor: '#F59E0B' }]} />
            </View>
            <Text style={styles.metricValue}>{(glyphData.chaos * 100).toFixed(0)}%</Text>
          </View>
          
          <View style={styles.metricItem}>
            <View style={[styles.metricDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.metricLabel}>Completion</Text>
            <View style={styles.metricBar}>
              <View style={[styles.metricFill, { width: `${glyphData.completion * 100}%`, backgroundColor: '#10B981' }]} />
            </View>
            <Text style={styles.metricValue}>{(glyphData.completion * 100).toFixed(0)}%</Text>
          </View>
          
          <View style={styles.metricItem}>
            <View style={[styles.metricDot, { backgroundColor: '#8B5CF6' }]} />
            <Text style={styles.metricLabel}>Rhythm</Text>
            <View style={styles.metricBar}>
              <View style={[styles.metricFill, { width: `${glyphData.rhythm * 100}%`, backgroundColor: '#8B5CF6' }]} />
            </View>
            <Text style={styles.metricValue}>{(glyphData.rhythm * 100).toFixed(0)}%</Text>
          </View>
        </View>
      </View>

      {/* Glyph Legend */}
      <View style={styles.legendCard}>
        <View style={styles.legendHeader}>
          <Info size={20} color="#6B7280" />
          <Text style={styles.cardTitle}>Reading Your Glyph</Text>
        </View>
        
        <View style={styles.legendList}>
          <Text style={styles.legendItem}>• <Text style={styles.legendBold}>Size</Text> = Total energy/time invested</Text>
          <Text style={styles.legendItem}>• <Text style={styles.legendBold}>Smoothness</Text> = Flow state intensity</Text>
          <Text style={styles.legendItem}>• <Text style={styles.legendBold}>Fragments</Text> = Context switches</Text>
          <Text style={styles.legendItem}>• <Text style={styles.legendBold}>Rings</Text> = Task completion rate</Text>
          <Text style={styles.legendItem}>• <Text style={styles.legendBold}>Color</Text> = Dominant characteristic</Text>
          <Text style={styles.legendItem}>• <Text style={styles.legendBold}>Tendrils</Text> = Sustained focus periods</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsCard}>
        <TouchableOpacity style={styles.actionButton}>
          <Download size={20} color="#0EA5E9" />
          <Text style={styles.actionButtonText}>Save Glyph</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Share2 size={20} color="#0EA5E9" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Palette size={20} color="#0EA5E9" />
          <Text style={styles.actionButtonText}>Customize</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    padding: 16,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateButton: {
    padding: 8,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  styleSelector: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 4,
  },
  styleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  styleButtonActive: {
    backgroundColor: '#0EA5E9',
  },
  styleButtonText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  styleButtonTextActive: {
    color: '#FFFFFF',
  },
  glyphCanvas: {
    height: 400,
    margin: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    position: 'relative',
  },
  glyphContainer: {
    flex: 1,
    position: 'relative',
  },
  glyphMainShape: {
    position: 'absolute',
  },
  glyphTendril: {
    position: 'absolute',
    width: 4,
    borderRadius: 2,
  },
  glyphFragment: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  glyphRing: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  glyphGeometric: {
    position: 'absolute',
  },
  glyphMinimal: {
    position: 'absolute',
  },
  glyphInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  glyphTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  glyphSubtitle: {
    color: '#6B7280',
    fontSize: 14,
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
    marginLeft: 8,
  },
  metricsList: {
    gap: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  metricLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    width: 80,
  },
  metricBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    marginHorizontal: 12,
  },
  metricFill: {
    height: '100%',
    borderRadius: 2,
  },
  metricValue: {
    color: '#6B7280',
    fontSize: 12,
    width: 40,
    textAlign: 'right',
  },
  legendCard: {
    backgroundColor: '#1A1A1A',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendList: {
    gap: 8,
  },
  legendItem: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  legendBold: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionsCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#0A0A0A',
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#0EA5E9',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});