import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useChrona } from '@/providers/ChronaProvider';
import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';

interface GlyphHeaderProps {
  compact?: boolean;
}

export default function GlyphHeader({ compact = true }: GlyphHeaderProps) {
  const { tasks, timeBlocks } = useChrona();
  const [animationValue] = useState(new Animated.Value(0));
  const [selectedDate] = useState(new Date());

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animationValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animationValue, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animationValue]);

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

    const totalMinutes = dayBlocks.reduce((sum, block) => sum + block.duration, 0);
    const avgFlowIntensity = dayBlocks.length > 0 
      ? dayBlocks.reduce((sum, block) => sum + (block.flowIntensity || 0), 0) / dayBlocks.length
      : 0;
    const switchCount = dayBlocks.length - 1;
    const completedCount = dayTasks.filter(t => t.completedAt).length;
    const totalTasks = dayTasks.length;
    
    const energy = Math.min(1, totalMinutes / 480);
    const focus = avgFlowIntensity;
    const chaos = Math.min(1, switchCount / 10);
    const completion = totalTasks > 0 ? completedCount / totalTasks : 0;
    
    return {
      totalMinutes,
      energy,
      focus,
      chaos,
      completion,
      switchCount,
      completedCount,
      totalTasks,
    };
  }, [tasks, timeBlocks, selectedDate]);

  const getGlyphColor = () => {
    if (glyphData.completion > 0.8) return '#10B981';
    if (glyphData.focus > 0.7) return '#0EA5E9';
    if (glyphData.chaos > 0.6) return '#EF4444';
    if (glyphData.energy > 0.6) return '#F59E0B';
    return '#6B7280';
  };

  const getGlyphDescription = () => {
    if (glyphData.totalMinutes === 0) return 'Rest';
    if (glyphData.focus > 0.8 && glyphData.chaos < 0.3) return 'Flow';
    if (glyphData.chaos > 0.7) return 'Chaos';
    if (glyphData.completion > 0.8) return 'Done';
    if (glyphData.energy > 0.8) return 'Energy';
    return 'Active';
  };

  const renderCompactGlyph = () => {
    const size = 32;
    const centerX = size / 2;
    const centerY = size / 2;
    const baseRadius = 8 + glyphData.energy * 6;
    
    const elements = [];
    
    // Main shape
    elements.push(
      <Animated.View
        key="main-shape"
        style={[
          styles.compactGlyphShape,
          {
            left: centerX - baseRadius,
            top: centerY - baseRadius,
            width: baseRadius * 2,
            height: baseRadius * 2,
            borderRadius: baseRadius,
            backgroundColor: getGlyphColor() + '30',
            borderColor: getGlyphColor(),
            borderWidth: 1.5,
            transform: [
              {
                scale: animationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          },
        ]}
      />
    );

    // Focus indicators
    const focusPoints = Math.min(4, Math.floor(glyphData.focus * 4));
    for (let i = 0; i < focusPoints; i++) {
      const angle = (360 / 4) * i;
      const distance = baseRadius + 4;
      const x = centerX + Math.cos((angle * Math.PI) / 180) * distance;
      const y = centerY + Math.sin((angle * Math.PI) / 180) * distance;
      
      elements.push(
        <Animated.View
          key={`focus-${i}`}
          style={[
            styles.compactFocusPoint,
            {
              left: x - 1.5,
              top: y - 1.5,
              backgroundColor: getGlyphColor(),
              transform: [
                {
                  scale: animationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
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

  const handlePress = () => {
    router.push('/daily-glyph');
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.glyphContainer}>
        {renderCompactGlyph()}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.glyphTitle}>{getGlyphDescription()}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>{glyphData.completedCount}/{glyphData.totalTasks}</Text>
          <Sparkles size={10} color={getGlyphColor()} style={styles.sparkle} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F5F5F4',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 120,
  },
  glyphContainer: {
    width: 32,
    height: 32,
    position: 'relative',
    marginRight: 8,
  },
  compactGlyphShape: {
    position: 'absolute',
  },
  compactFocusPoint: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  glyphTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1917',
    letterSpacing: -0.2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  statText: {
    fontSize: 10,
    color: '#78716C',
    fontWeight: '500',
  },
  sparkle: {
    marginLeft: 4,
  },
});