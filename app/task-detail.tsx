import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useChrona } from '@/providers/ChronaProvider';
import { X, Plus } from 'lucide-react-native';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const { tasks, updateTask } = useChrona();
  const task = tasks.find(t => t.id === id);
  const [criteria, setCriteria] = useState('');

  if (!task) {
    return null;
  }

  const handleAddCriteria = () => {
    if (!criteria.trim()) return;
    
    updateTask(task.id, {
      verificationCriteria: [...task.verificationCriteria, criteria]
    });
    setCriteria('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Task Configuration</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{task.title}</Text>
          
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Estimated</Text>
              <Text style={styles.metricValue}>{task.estimatedMinutes}m</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Min</Text>
              <Text style={styles.metricValue}>{task.minMinutes}m</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Max</Text>
              <Text style={styles.metricValue}>{task.maxMinutes}m</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Power-Law Allocation</Text>
          <Text style={styles.description}>
            Exponent: b = {task.powerLawExponent.toFixed(2)}
          </Text>
          <Text style={styles.description}>
            {task.powerLawExponent > 1 
              ? 'This task benefits from longer uninterrupted blocks'
              : 'This task can be done in shorter intervals'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification Criteria</Text>
          <Text style={styles.description}>
            Define "done" with specific, measurable criteria
          </Text>
          
          {task.verificationCriteria.map((criterion, index) => (
            <View key={index} style={styles.criterionItem}>
              <Text style={styles.criterionText}>• {criterion}</Text>
            </View>
          ))}
          
          <View style={styles.addCriteriaRow}>
            <TextInput
              style={styles.criteriaInput}
              placeholder="Add verification criterion"
              placeholderTextColor="#6B7280"
              value={criteria}
              onChangeText={setCriteria}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddCriteria}>
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Satisficing Threshold</Text>
          <Text style={styles.description}>
            {(task.satisficingThreshold * 100).toFixed(0)}% completion is "good enough"
          </Text>
          
          <View style={styles.thresholdBar}>
            <View 
              style={[
                styles.thresholdFill,
                { width: `${task.satisficingThreshold * 100}%` }
              ]}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Context Switch Cost</Text>
          <Text style={styles.description}>
            Estimated {task.contextSwitchCost} minutes lost when switching to/from this task
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#1A1A1A',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: '#0EA5E9',
    fontSize: 20,
    fontWeight: '600',
  },
  criterionItem: {
    paddingVertical: 4,
  },
  criterionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  addCriteriaRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  criteriaInput: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    color: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
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
  thresholdBar: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  thresholdFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
});