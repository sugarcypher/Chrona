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
import { X, CheckCircle, XCircle } from 'lucide-react-native';

export default function NudgeLedgerScreen() {
  const { nudgeLedger } = useChrona();

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
        {nudgeLedger.map((nudge, index) => (
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
              <TouchableOpacity style={styles.reverseButton}>
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
});