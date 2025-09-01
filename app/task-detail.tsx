import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useChrona } from '@/providers/ChronaProvider';
import { X, Plus, Brain, Zap, Target, Clock, AlertTriangle } from 'lucide-react-native';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const { tasks, updateTask } = useChrona();
  const task = tasks.find(t => t.id === id);
  const [criteria, setCriteria] = useState('');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);

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

  const generateAIInsights = async () => {
    if (!task) return;
    
    setIsGeneratingInsights(true);
    
    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a productivity expert analyzing task parameters. Provide concise, actionable insights about task optimization, time estimation accuracy, and potential improvements. Keep responses under 200 words.'
            },
            {
              role: 'user',
              content: `Analyze this task:

Title: ${task.title}
Estimated Time: ${task.estimatedMinutes} minutes
Min/Max Range: ${task.minMinutes}-${task.maxMinutes} minutes
Power Law Exponent: ${task.powerLawExponent}
Context Switch Cost: ${task.contextSwitchCost} minutes
Satisficing Threshold: ${(task.satisficingThreshold * 100).toFixed(0)}%
Verification Criteria: ${task.verificationCriteria.join(', ')}
${task.actualMinutes ? `Actual Time Spent: ${task.actualMinutes} minutes` : ''}

Provide insights on:
1. Time estimation accuracy
2. Task complexity assessment
3. Optimization suggestions
4. Potential blockers or challenges`
            }
          ]
        })
      });
      
      const data = await response.json();
      setAiInsights(data.completion);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      Alert.alert('Error', 'Failed to generate insights. Please try again.');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const optimizeTaskParameters = () => {
    if (!task) return;
    
    Alert.alert(
      'Optimize Task Parameters',
      'This will adjust time estimates and parameters based on your historical data and task complexity.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Optimize',
          onPress: () => {
            // Simple optimization logic
            const optimizedEstimate = Math.round(task.estimatedMinutes * 1.2); // Add 20% buffer
            const optimizedMin = Math.max(15, Math.round(task.estimatedMinutes * 0.7));
            const optimizedMax = Math.round(task.estimatedMinutes * 1.8);
            const optimizedSwitchCost = task.estimatedMinutes > 60 ? 8 : 5;
            
            updateTask(task.id, {
              estimatedMinutes: optimizedEstimate,
              minMinutes: optimizedMin,
              maxMinutes: optimizedMax,
              contextSwitchCost: optimizedSwitchCost,
            });
            
            Alert.alert('Optimized', 'Task parameters have been optimized based on complexity analysis.');
          },
        },
      ]
    );
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
            Define &quot;done&quot; with specific, measurable criteria
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
            {(task.satisficingThreshold * 100).toFixed(0)}% completion is &quot;good enough&quot;
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

        {/* AI Insights */}
        <View style={styles.section}>
          <View style={styles.aiHeader}>
            <Text style={styles.sectionTitle}>AI Task Analysis</Text>
            <TouchableOpacity 
              style={styles.generateInsightsButton}
              onPress={generateAIInsights}
              disabled={isGeneratingInsights}
            >
              {isGeneratingInsights ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Brain size={16} color="#FFFFFF" />
              )}
              <Text style={styles.generateInsightsText}>
                {isGeneratingInsights ? 'Analyzing...' : 'Generate Insights'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {aiInsights && (
            <View style={styles.insightsContainer}>
              <Text style={styles.insightsText}>{aiInsights}</Text>
            </View>
          )}
          
          {!aiInsights && !isGeneratingInsights && (
            <Text style={styles.description}>
              Get AI-powered insights about task complexity, time estimation, and optimization opportunities.
            </Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={optimizeTaskParameters}
            >
              <Zap size={20} color="#F59E0B" />
              <Text style={styles.actionButtonText}>Optimize Parameters</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                Alert.alert(
                  'Task Insights',
                  `Complexity Score: ${(task.powerLawExponent * task.estimatedMinutes / 60).toFixed(1)}\n\nThis task is ${task.powerLawExponent > 1.5 ? 'complex and benefits from deep focus' : 'straightforward and can be done in shorter blocks'}.\n\nRecommended block size: ${Math.round(task.estimatedMinutes * task.powerLawExponent / 2)} minutes.`
                );
              }}
            >
              <Target size={20} color="#3B82F6" />
              <Text style={styles.actionButtonText}>Complexity Analysis</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                const estimationAccuracy = task.actualMinutes 
                  ? (1 - Math.abs(task.actualMinutes - task.estimatedMinutes) / task.estimatedMinutes) * 100
                  : null;
                
                Alert.alert(
                  'Estimation History',
                  estimationAccuracy !== null 
                    ? `Estimation Accuracy: ${estimationAccuracy.toFixed(0)}%\n\nEstimated: ${task.estimatedMinutes}m\nActual: ${task.actualMinutes}m\n\n${estimationAccuracy > 80 ? 'Excellent estimation!' : estimationAccuracy > 60 ? 'Good estimation' : 'Consider adjusting estimates'}`
                    : 'No completion data available yet. Complete this task to see estimation accuracy.'
                );
              }}
            >
              <Clock size={20} color="#10B981" />
              <Text style={styles.actionButtonText}>Estimation History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                const riskFactors = [];
                if (task.estimatedMinutes > 120) riskFactors.push('Long duration task');
                if (task.contextSwitchCost > 10) riskFactors.push('High context switch cost');
                if (task.powerLawExponent > 2) riskFactors.push('High complexity');
                if (task.verificationCriteria.length < 2) riskFactors.push('Vague success criteria');
                
                Alert.alert(
                  'Risk Assessment',
                  riskFactors.length === 0 
                    ? '✅ Low risk task - well-defined and appropriately scoped'
                    : `⚠️ Risk factors identified:\n\n${riskFactors.map(r => `• ${r}`).join('\n')}\n\nConsider breaking down or refining this task.`
                );
              }}
            >
              <AlertTriangle size={20} color="#EF4444" />
              <Text style={styles.actionButtonText}>Risk Assessment</Text>
            </TouchableOpacity>
          </View>
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
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  generateInsightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  generateInsightsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  insightsContainer: {
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  insightsText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
});