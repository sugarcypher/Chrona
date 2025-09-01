import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useChrona } from '@/providers/ChronaProvider';
import { router } from 'expo-router';
import { X, CheckCircle, XCircle, AlertTriangle, Info, Clock } from 'lucide-react-native';
import { Alert } from 'react-native';

export default function NudgeLedgerScreen() {
  const { nudgeLedger, addNudge } = useChrona();
  
  const handleReverseNudge = (nudge: any, index: number) => {
    Alert.alert(
      'Reverse Nudge',
      `Are you sure you want to reverse this ${nudge.type} nudge? This will undo its effects and log the reversal.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reverse',
          style: 'destructive',
          onPress: () => {
            addNudge({
              type: `${nudge.type}_reversal`,
              timestamp: Date.now(),
              accepted: true,
              mechanism: `Reversed previous ${nudge.type} nudge at user request`,
              tradeoff: 'User autonomy prioritized over algorithmic suggestion',
            });
            Alert.alert('Success', 'Nudge has been reversed and logged.');
          },
        },
      ]
    );
  };
  
  const generateSampleNudges = () => {
    const sampleNudges = [
      {
        type: 'posture_reminder',
        timestamp: Date.now() - 3600000,
        accepted: true,
        mechanism: 'Detected prolonged sitting via accelerometer patterns',
        tradeoff: 'Brief interruption for long-term ergonomic health',
      },
      {
        type: 'hydration_prompt',
        timestamp: Date.now() - 7200000,
        accepted: false,
        mechanism: 'Calculated optimal hydration timing based on activity',
        tradeoff: 'Cognitive performance vs. workflow interruption',
      },
      {
        type: 'context_switch_warning',
        timestamp: Date.now() - 1800000,
        accepted: true,
        mechanism: 'High context switch cost detected (8 minutes)',
        tradeoff: 'Focus preservation vs. task urgency',
      },
    ];
    
    sampleNudges.forEach(nudge => addNudge(nudge));
  };
  
  if (nudgeLedger.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Nudge Ledger</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.emptyState}>
          <Info size={64} color="#6B7280" />
          <Text style={styles.emptyTitle}>No Nudges Yet</Text>
          <Text style={styles.emptyDescription}>
            Your nudge history will appear here as you interact with Chrona&apos;s mindful suggestions.
          </Text>
          
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={generateSampleNudges}
          >
            <Text style={styles.generateButtonText}>Generate Sample Data</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nudge Ledger</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>
        Complete audit trail of all nudges. Every prompt is recorded, reversible, and transparent.
      </Text>

      <ScrollView style={styles.ledgerList} showsVerticalScrollIndicator={false}>
        {nudgeLedger.slice().reverse().map((nudge, index) => (
          <View key={index} style={styles.ledgerItem}>
            <View style={styles.ledgerHeader}>
              {nudge.accepted ? (
                <CheckCircle size={16} color="#10B981" />
              ) : (
                <XCircle size={16} color="#EF4444" />
              )}
              <Text style={styles.ledgerType}>{nudge.type}</Text>
              <Text style={styles.ledgerTime}>
                {new Date(nudge.timestamp).toLocaleTimeString()}
              </Text>
            </View>
            
            <Text style={styles.ledgerMechanism}>{nudge.mechanism}</Text>
            <Text style={styles.ledgerTradeoff}>Trade-off: {nudge.tradeoff}</Text>
            
            {nudge.accepted && (
              <TouchableOpacity 
                style={styles.reverseButton}
                onPress={() => handleReverseNudge(nudge, index)}
              >
                <Text style={styles.reverseButtonText}>Reverse</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
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
  description: {
    color: '#6B7280',
    fontSize: 14,
    padding: 16,
  },
  ledgerList: {
    flex: 1,
    padding: 16,
  },
  ledgerItem: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  ledgerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ledgerType: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  ledgerTime: {
    color: '#6B7280',
    fontSize: 12,
  },
  ledgerMechanism: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
  },
  ledgerTradeoff: {
    color: '#6B7280',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  reverseButton: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  reverseButtonText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  generateButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});