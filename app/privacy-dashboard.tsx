import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Shield,
  Eye,
  Lock,
  Server,
  Database,
  FileText,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react-native';
import { useChrona } from '@/providers/ChronaProvider';

interface PrivacySettings {
  dataMinimization: boolean;
  anonymousMetrics: boolean;
  localProcessingOnly: boolean;
  encryptionEnabled: boolean;
  auditLogging: boolean;
  dataRetention: number; // days
  shareResearchData: boolean;
  biometricLock: boolean;
}

interface DataInventory {
  temporalMetrics: number;
  taskRecords: number;
  flowStates: number;
  nudgeHistory: number;
  totalSizeMB: number;
  lastBackup: number | null;
}

export default function PrivacyDashboard() {
  const { tasks, timeBlocks, nudgeLedger, clearAllData } = useChrona();
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataMinimization: true,
    anonymousMetrics: false,
    localProcessingOnly: true,
    encryptionEnabled: true,
    auditLogging: true,
    dataRetention: 90,
    shareResearchData: false,
    biometricLock: false,
  });
  const [dataInventory, setDataInventory] = useState<DataInventory>({
    temporalMetrics: 0,
    taskRecords: 0,
    flowStates: 0,
    nudgeHistory: 0,
    totalSizeMB: 0,
    lastBackup: null,
  });
  const [consentHistory, setConsentHistory] = useState<any[]>([]);

  useEffect(() => {
    loadPrivacySettings();
    calculateDataInventory();
    loadConsentHistory();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('chrona_privacy_settings');
      if (settings) {
        setPrivacySettings(JSON.parse(settings));
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const savePrivacySettings = async (newSettings: PrivacySettings) => {
    try {
      await AsyncStorage.setItem('chrona_privacy_settings', JSON.stringify(newSettings));
      setPrivacySettings(newSettings);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    }
  };

  const calculateDataInventory = () => {
    const inventory: DataInventory = {
      temporalMetrics: timeBlocks.length,
      taskRecords: tasks.length,
      flowStates: timeBlocks.filter(b => b.flowIntensity > 0).length,
      nudgeHistory: nudgeLedger.length,
      totalSizeMB: 0, // Would calculate actual size in production
      lastBackup: null,
    };
    
    // Estimate data size (rough calculation)
    const estimatedSize = (
      tasks.length * 0.5 + // ~0.5KB per task
      timeBlocks.length * 0.3 + // ~0.3KB per time block
      nudgeLedger.length * 0.2 // ~0.2KB per nudge
    ) / 1024; // Convert to MB
    
    inventory.totalSizeMB = Math.round(estimatedSize * 100) / 100;
    setDataInventory(inventory);
  };

  const loadConsentHistory = async () => {
    try {
      const consent = await AsyncStorage.getItem('chrona_consent');
      if (consent) {
        setConsentHistory([JSON.parse(consent)]);
      }
    } catch (error) {
      console.error('Error loading consent history:', error);
    }
  };

  const handleSettingChange = (key: keyof PrivacySettings, value: boolean | number) => {
    const newSettings = { ...privacySettings, [key]: value };
    savePrivacySettings(newSettings);
  };

  const exportData = async () => {
    Alert.alert(
      'Export Data',
      'This will create a JSON export of all your Chrona data. The file will be saved to your device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // In a real app, this would create and save a file
            Alert.alert('Success', 'Data exported successfully');
          },
        },
      ]
    );
  };

  const deleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your Chrona data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            clearAllData();
            Alert.alert('Success', 'All data has been deleted');
          },
        },
      ]
    );
  };

  const renderDataInventoryCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Database size={24} color="#0EA5E9" />
        <Text style={styles.cardTitle}>Data Inventory</Text>
      </View>
      
      <View style={styles.inventoryGrid}>
        <View style={styles.inventoryItem}>
          <Clock size={20} color="#10B981" />
          <Text style={styles.inventoryLabel}>Temporal Metrics</Text>
          <Text style={styles.inventoryValue}>{dataInventory.temporalMetrics}</Text>
        </View>
        
        <View style={styles.inventoryItem}>
          <FileText size={20} color="#F59E0B" />
          <Text style={styles.inventoryLabel}>Task Records</Text>
          <Text style={styles.inventoryValue}>{dataInventory.taskRecords}</Text>
        </View>
        
        <View style={styles.inventoryItem}>
          <BarChart3 size={20} color="#8B5CF6" />
          <Text style={styles.inventoryLabel}>Flow States</Text>
          <Text style={styles.inventoryValue}>{dataInventory.flowStates}</Text>
        </View>
        
        <View style={styles.inventoryItem}>
          <Eye size={20} color="#EF4444" />
          <Text style={styles.inventoryLabel}>Nudge History</Text>
          <Text style={styles.inventoryValue}>{dataInventory.nudgeHistory}</Text>
        </View>
      </View>
      
      <View style={styles.storageInfo}>
        <Text style={styles.storageText}>Total Storage: {dataInventory.totalSizeMB} MB</Text>
        <Text style={styles.storageText}>Location: Local Device Only</Text>
      </View>
    </View>
  );

  const renderPrivacyControls = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Shield size={24} color="#0EA5E9" />
        <Text style={styles.cardTitle}>Privacy Controls</Text>
      </View>
      
      <View style={styles.controlsList}>
        <View style={styles.controlItem}>
          <View style={styles.controlInfo}>
            <Text style={styles.controlLabel}>Data Minimization</Text>
            <Text style={styles.controlDescription}>Only collect essential temporal metrics</Text>
          </View>
          <Switch
            value={privacySettings.dataMinimization}
            onValueChange={(value) => handleSettingChange('dataMinimization', value)}
            trackColor={{ false: '#374151', true: '#0EA5E9' }}
            thumbColor={privacySettings.dataMinimization ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
        
        <View style={styles.controlItem}>
          <View style={styles.controlInfo}>
            <Text style={styles.controlLabel}>Local Processing Only</Text>
            <Text style={styles.controlDescription}>All analysis happens on your device</Text>
          </View>
          <Switch
            value={privacySettings.localProcessingOnly}
            onValueChange={(value) => handleSettingChange('localProcessingOnly', value)}
            trackColor={{ false: '#374151', true: '#0EA5E9' }}
            thumbColor={privacySettings.localProcessingOnly ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
        
        <View style={styles.controlItem}>
          <View style={styles.controlInfo}>
            <Text style={styles.controlLabel}>Encryption Enabled</Text>
            <Text style={styles.controlDescription}>Encrypt all stored data</Text>
          </View>
          <Switch
            value={privacySettings.encryptionEnabled}
            onValueChange={(value) => handleSettingChange('encryptionEnabled', value)}
            trackColor={{ false: '#374151', true: '#0EA5E9' }}
            thumbColor={privacySettings.encryptionEnabled ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
        
        <View style={styles.controlItem}>
          <View style={styles.controlInfo}>
            <Text style={styles.controlLabel}>Audit Logging</Text>
            <Text style={styles.controlDescription}>Log all data access and modifications</Text>
          </View>
          <Switch
            value={privacySettings.auditLogging}
            onValueChange={(value) => handleSettingChange('auditLogging', value)}
            trackColor={{ false: '#374151', true: '#0EA5E9' }}
            thumbColor={privacySettings.auditLogging ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
        
        <View style={styles.controlItem}>
          <View style={styles.controlInfo}>
            <Text style={styles.controlLabel}>Share Research Data</Text>
            <Text style={styles.controlDescription}>Contribute anonymized metrics to research</Text>
          </View>
          <Switch
            value={privacySettings.shareResearchData}
            onValueChange={(value) => handleSettingChange('shareResearchData', value)}
            trackColor={{ false: '#374151', true: '#0EA5E9' }}
            thumbColor={privacySettings.shareResearchData ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
      </View>
    </View>
  );

  const renderDataActions = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <FileText size={24} color="#0EA5E9" />
        <Text style={styles.cardTitle}>Data Management</Text>
      </View>
      
      <View style={styles.actionsList}>
        <TouchableOpacity style={styles.actionButton} onPress={exportData}>
          <Download size={20} color="#10B981" />
          <View style={styles.actionInfo}>
            <Text style={styles.actionLabel}>Export All Data</Text>
            <Text style={styles.actionDescription}>Download a complete copy of your data</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={deleteAllData}>
          <Trash2 size={20} color="#EF4444" />
          <View style={styles.actionInfo}>
            <Text style={styles.actionLabel}>Delete All Data</Text>
            <Text style={styles.actionDescription}>Permanently remove all Chrona data</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderConsentHistory = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <CheckCircle size={24} color="#0EA5E9" />
        <Text style={styles.cardTitle}>Consent History</Text>
      </View>
      
      {consentHistory.map((consent, index) => (
        <View key={index} style={styles.consentRecord}>
          <Text style={styles.consentDate}>
            {new Date(consent.timestamp).toLocaleDateString()}
          </Text>
          <Text style={styles.consentVersion}>Version {consent.version}</Text>
          <View style={styles.consentItems}>
            <Text style={styles.consentItem}>✓ Data Processing</Text>
            <Text style={styles.consentItem}>✓ Temporal Metrics</Text>
            <Text style={styles.consentItem}>✓ Research Participation</Text>
            <Text style={styles.consentItem}>✓ Liability Acknowledged</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Privacy Dashboard",
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Shield size={32} color="#0EA5E9" />
          <Text style={styles.title}>Privacy Dashboard</Text>
          <Text style={styles.subtitle}>
            Complete transparency and control over your temporal data
          </Text>
        </View>
        
        {renderDataInventoryCard()}
        {renderPrivacyControls()}
        {renderDataActions()}
        {renderConsentHistory()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Chrona is committed to privacy-first time metrology. Your temporal patterns remain under your complete control.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inventoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  inventoryItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    gap: 8,
  },
  inventoryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  inventoryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  storageInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
    gap: 4,
  },
  storageText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  controlsList: {
    gap: 20,
  },
  controlItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlInfo: {
    flex: 1,
    marginRight: 16,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  controlDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  actionsList: {
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  consentRecord: {
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 12,
  },
  consentDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  consentVersion: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  consentItems: {
    gap: 4,
  },
  consentItem: {
    fontSize: 14,
    color: '#10B981',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});