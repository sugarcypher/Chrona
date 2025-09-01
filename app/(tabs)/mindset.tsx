import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useChrona } from '@/providers/ChronaProvider';
import { Heart, Droplets, Move, AlertCircle, Bell, Shield, Target, Clock } from 'lucide-react-native';
import { router } from 'expo-router';

export default function MindsetScreen() {
  const { nudgeSettings, updateNudgeSettings, addNudge, tasks, entropyBudget } = useChrona();
  const [consentedNudges, setConsentedNudges] = useState<Set<string>>(new Set());
  
  // Calculate regret minimization suggestions
  const regretMinimizationSuggestions = React.useMemo(() => {
    if (!nudgeSettings.regretMinimization) return [];
    
    const incompleteTasks = tasks.filter(t => !t.completedAt);
    const timeRemaining = entropyBudget.total - entropyBudget.used;
    
    // Sort by value density (importance/time ratio) and urgency
    return incompleteTasks
      .map(task => ({
        ...task,
        valueDensity: task.satisficingThreshold / task.estimatedMinutes,
        regretScore: task.satisficingThreshold * (1 - Math.min(1, task.estimatedMinutes / timeRemaining))
      }))
      .sort((a, b) => b.regretScore - a.regretScore)
      .slice(0, 3);
  }, [tasks, entropyBudget, nudgeSettings.regretMinimization]);

  const handleNudgeConsent = (nudgeType: string, mechanism: string, tradeoff: string) => {
    Alert.alert(
      'Consentful Nudge',
      `${mechanism}\n\nTrade-off: ${tradeoff}`,
      [
        {
          text: 'Decline',
          style: 'cancel',
        },
        {
          text: 'Accept',
          onPress: () => {
            setConsentedNudges(prev => new Set(prev).add(nudgeType));
            addNudge({
              type: nudgeType,
              timestamp: Date.now(),
              accepted: true,
              mechanism,
              tradeoff,
            });
          },
        },
      ]
    );
  };

  const nudgeTypes = [
    {
      id: 'posture',
      icon: Move,
      title: 'Posture Reset',
      description: 'Gentle reminders to adjust posture',
      mechanism: 'Uses accelerometer patterns to detect slouching. Sends haptic tap every 30 minutes during focus blocks.',
      tradeoff: 'Improves ergonomics but may briefly interrupt deep focus.',
      color: '#10B981',
    },
    {
      id: 'hydration',
      icon: Droplets,
      title: 'Hydration Nudge',
      description: 'Track water intake and remind',
      mechanism: 'Calculates optimal hydration based on activity level. Nudges between tasks to minimize disruption.',
      tradeoff: 'Better cognitive performance vs. more bathroom breaks.',
      color: '#0EA5E9',
    },
    {
      id: 'breathing',
      icon: Heart,
      title: 'Breathing Cadence',
      description: 'Box breathing prompts during stress',
      mechanism: 'Monitors typing rhythm for stress indicators. Suggests 4-4-4-4 breathing pattern.',
      tradeoff: 'Reduces stress but takes 2-3 minutes per session.',
      color: '#F59E0B',
    },
    {
      id: 'context',
      icon: AlertCircle,
      title: 'Context Switch Alert',
      description: 'Warn before expensive switches',
      mechanism: 'Calculates switch cost in minutes. Shows warning if cost > 5 minutes.',
      tradeoff: 'Preserves focus but may delay urgent tasks.',
      color: '#EF4444',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Nudge Consent Center */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Consentful Nudging</Text>
        <TouchableOpacity onPress={() => router.push('/nudge-ledger' as any)}>
          <Shield size={24} color="#0EA5E9" />
        </TouchableOpacity>
      </View>

      <View style={styles.nudgesList}>
        {nudgeTypes.map((nudge) => {
          const isConsented = consentedNudges.has(nudge.id);
          
          return (
            <TouchableOpacity
              key={nudge.id}
              style={[
                styles.nudgeCard,
                isConsented && styles.nudgeCardActive
              ]}
              onPress={() => !isConsented && handleNudgeConsent(nudge.id, nudge.mechanism, nudge.tradeoff)}
            >
              <View style={[styles.nudgeIcon, { backgroundColor: nudge.color + '20' }]}>
                <nudge.icon size={24} color={nudge.color} />
              </View>
              
              <View style={styles.nudgeContent}>
                <View style={styles.nudgeHeader}>
                  <Text style={styles.nudgeTitle}>{nudge.title}</Text>
                  {isConsented && (
                    <View style={styles.consentBadge}>
                      <Text style={styles.consentBadgeText}>Active</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.nudgeDescription}>{nudge.description}</Text>
                
                {!isConsented && (
                  <TouchableOpacity style={styles.learnMore}>
                    <Text style={styles.learnMoreText}>Tap to learn mechanism →</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Somatic Awareness */}
      <View style={styles.somaticCard}>
        <Text style={styles.cardTitle}>Somatic Awareness</Text>
        
        <View style={styles.somaticMetrics}>
          <View style={styles.somaticItem}>
            <Text style={styles.somaticLabel}>Typing Rhythm</Text>
            <View style={styles.rhythmBar}>
              <View style={[styles.rhythmFill, { width: '75%' }]} />
            </View>
            <Text style={styles.somaticValue}>Steady</Text>
          </View>
          
          <View style={styles.somaticItem}>
            <Text style={styles.somaticLabel}>Break Frequency</Text>
            <View style={styles.rhythmBar}>
              <View style={[styles.rhythmFill, { width: '40%', backgroundColor: '#F59E0B' }]} />
            </View>
            <Text style={styles.somaticValue}>Low</Text>
          </View>
          
          <View style={styles.somaticItem}>
            <Text style={styles.somaticLabel}>Focus Fatigue</Text>
            <View style={styles.rhythmBar}>
              <View style={[styles.rhythmFill, { width: '60%', backgroundColor: '#0EA5E9' }]} />
            </View>
            <Text style={styles.somaticValue}>Moderate</Text>
          </View>
        </View>
      </View>

      {/* Micro-Prompts */}
      <View style={styles.promptsCard}>
        <Text style={styles.cardTitle}>Active Micro-Prompts</Text>
        
        <View style={styles.promptsList}>
          <View style={styles.promptItem}>
            <Bell size={16} color="#10B981" />
            <Text style={styles.promptText}>Stand and stretch in 15 min</Text>
          </View>
          <View style={styles.promptItem}>
            <Bell size={16} color="#0EA5E9" />
            <Text style={styles.promptText}>Hydration check at task end</Text>
          </View>
          <View style={styles.promptItem}>
            <Bell size={16} color="#F59E0B" />
            <Text style={styles.promptText}>Eye rest: 20-20-20 rule active</Text>
          </View>
        </View>
      </View>

      {/* Regret Minimization */}
      <View style={styles.regretCard}>
        <Text style={styles.cardTitle}>Regret Minimization Mode</Text>
        <Text style={styles.regretDescription}>
          When behind schedule, suggests tasks that minimize end-of-day regret
        </Text>
        
        <TouchableOpacity 
          style={[
            styles.regretToggle,
            nudgeSettings.regretMinimization && styles.regretToggleActive
          ]}
          onPress={() => updateNudgeSettings({ regretMinimization: !nudgeSettings.regretMinimization })}
        >
          <Text style={styles.regretToggleText}>
            {nudgeSettings.regretMinimization ? 'Enabled' : 'Enable Mode'}
          </Text>
        </TouchableOpacity>
        
        {nudgeSettings.regretMinimization && regretMinimizationSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Regret-Minimizing Next Actions:</Text>
            {regretMinimizationSuggestions.map((task, index) => (
              <View key={task.id} style={styles.suggestionItem}>
                <View style={styles.suggestionRank}>
                  <Text style={styles.suggestionRankText}>{index + 1}</Text>
                </View>
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionTitle}>{task.title}</Text>
                  <Text style={styles.suggestionMeta}>
                    {task.estimatedMinutes}m • {(task.regretScore * 100).toFixed(0)}% regret reduction
                  </Text>
                </View>
                <Target size={16} color="#10B981" />
              </View>
            ))}
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  nudgesList: {
    paddingHorizontal: 16,
  },
  nudgeCard: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  nudgeCardActive: {
    borderColor: '#0EA5E9',
  },
  nudgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nudgeContent: {
    flex: 1,
  },
  nudgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nudgeTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nudgeDescription: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 8,
  },
  consentBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  consentBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  learnMore: {
    marginTop: 4,
  },
  learnMoreText: {
    color: '#0EA5E9',
    fontSize: 12,
  },
  somaticCard: {
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
  somaticMetrics: {
    gap: 16,
  },
  somaticItem: {
    marginBottom: 12,
  },
  somaticLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
  },
  rhythmBar: {
    height: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 3,
    marginVertical: 4,
  },
  rhythmFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  somaticValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  promptsCard: {
    backgroundColor: '#1A1A1A',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  promptsList: {
    gap: 12,
  },
  promptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    padding: 12,
    borderRadius: 8,
  },
  promptText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 12,
  },
  regretCard: {
    backgroundColor: '#1A1A1A',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 32,
  },
  regretDescription: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 16,
  },
  regretToggle: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 12,
    borderRadius: 8,
  },
  regretToggleActive: {
    backgroundColor: '#0EA5E9',
  },
  regretToggleText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  suggestionsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#0A0A0A',
    borderRadius: 8,
  },
  suggestionsTitle: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  suggestionRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionRankText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionMeta: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
  },
});