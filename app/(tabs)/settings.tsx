import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useChrona } from '@/providers/ChronaProvider';
import { Sliders, Database, Shield, Bell, Info } from 'lucide-react-native';

export default function SettingsScreen() {
  const { 
    settings, 
    updateSettings, 
    entropyBudget, 
    updateEntropyBudget,
    clearAllData 
  } = useChrona();

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all tasks, metrics, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: clearAllData
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Entropy Budget */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Sliders size={20} color="#F59E0B" />
          <Text style={styles.sectionTitle}>Entropy Budget</Text>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Daily Chaos Allowance</Text>
          <Text style={styles.settingValue}>{entropyBudget.total} min</Text>
        </View>
        
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>15</Text>
          <View style={styles.slider}>
            <View 
              style={[
                styles.sliderFill,
                { width: `${((entropyBudget.total - 15) / 105) * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.sliderLabel}>120</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.adjustButton}
          onPress={() => {
            const newTotal = entropyBudget.total === 120 ? 30 : entropyBudget.total + 15;
            updateEntropyBudget({ total: newTotal });
          }}
        >
          <Text style={styles.adjustButtonText}>Adjust Budget</Text>
        </TouchableOpacity>
      </View>

      {/* Time Metrology */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Database size={20} color="#0EA5E9" />
          <Text style={styles.sectionTitle}>Time Metrology</Text>
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Track Micro-Patterns</Text>
          <Switch
            value={settings.trackMicroPatterns}
            onValueChange={(value) => updateSettings({ trackMicroPatterns: value })}
            trackColor={{ true: '#0EA5E9', false: '#4B5563' }}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Auto-Detect Flow State</Text>
          <Switch
            value={settings.autoDetectFlow}
            onValueChange={(value) => updateSettings({ autoDetectFlow: value })}
            trackColor={{ true: '#0EA5E9', false: '#4B5563' }}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Power-Law Allocation</Text>
          <Switch
            value={settings.usePowerLaw}
            onValueChange={(value) => updateSettings({ usePowerLaw: value })}
            trackColor={{ true: '#0EA5E9', false: '#4B5563' }}
          />
        </View>
      </View>

      {/* Privacy */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={20} color="#10B981" />
          <Text style={styles.sectionTitle}>Privacy</Text>
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>On-Device Processing</Text>
          <Switch
            value={true}
            disabled
            trackColor={{ true: '#10B981', false: '#4B5563' }}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Anonymous Metrics</Text>
          <Switch
            value={settings.anonymousMetrics}
            onValueChange={(value) => updateSettings({ anonymousMetrics: value })}
            trackColor={{ true: '#10B981', false: '#4B5563' }}
          />
        </View>
        
        <TouchableOpacity style={styles.infoRow}>
          <Info size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            All data is processed locally. No keystroke data leaves your device.
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Bell size={20} color="#EF4444" />
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Nudge Notifications</Text>
          <Switch
            value={settings.nudgeNotifications}
            onValueChange={(value) => updateSettings({ nudgeNotifications: value })}
            trackColor={{ true: '#0EA5E9', false: '#4B5563' }}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Flow State Alerts</Text>
          <Switch
            value={settings.flowAlerts}
            onValueChange={(value) => updateSettings({ flowAlerts: value })}
            trackColor={{ true: '#0EA5E9', false: '#4B5563' }}
          />
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.aboutSection}>
        <Text style={styles.aboutTitle}>Chrona v1.0.0</Text>
        <Text style={styles.aboutText}>
          Consentful, Antifragile Time Metrology
        </Text>
        <Text style={styles.aboutSubtext}>
          Built with transparency and user agency in mind
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  section: {
    backgroundColor: '#1A1A1A',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  settingValue: {
    color: '#0EA5E9',
    fontSize: 15,
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  slider: {
    flex: 1,
    height: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 3,
    marginHorizontal: 12,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  sliderLabel: {
    color: '#6B7280',
    fontSize: 12,
  },
  adjustButton: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  adjustButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoText: {
    color: '#6B7280',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  dangerButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
  },
  dangerButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  aboutSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  aboutTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  aboutText: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 4,
  },
  aboutSubtext: {
    color: '#4B5563',
    fontSize: 12,
    fontStyle: 'italic',
  },
});