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
  Lock,
  Key,
  Fingerprint,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
  Server,
} from 'lucide-react-native';

interface SecuritySettings {
  biometricAuth: boolean;
  autoLock: boolean;
  autoLockTimeout: number; // minutes
  encryptionLevel: 'basic' | 'advanced' | 'enterprise';
  networkSecurity: boolean;
  offlineMode: boolean;
  auditTrail: boolean;
  sessionTimeout: number; // minutes
  dataIntegrityChecks: boolean;
  secureBackup: boolean;
}

interface SecurityStatus {
  encryptionActive: boolean;
  lastSecurityScan: number;
  vulnerabilities: string[];
  complianceLevel: 'basic' | 'enterprise' | 'government';
  dataBreaches: number;
}

export default function SecuritySettings() {
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    biometricAuth: false,
    autoLock: true,
    autoLockTimeout: 5,
    encryptionLevel: 'advanced',
    networkSecurity: true,
    offlineMode: true,
    auditTrail: true,
    sessionTimeout: 30,
    dataIntegrityChecks: true,
    secureBackup: false,
  });
  
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    encryptionActive: true,
    lastSecurityScan: Date.now(),
    vulnerabilities: [],
    complianceLevel: 'enterprise',
    dataBreaches: 0,
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    loadSecuritySettings();
    performSecurityScan();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('chrona_security_settings');
      if (settings) {
        setSecuritySettings(JSON.parse(settings));
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const saveSecuritySettings = async (newSettings: SecuritySettings) => {
    try {
      await AsyncStorage.setItem('chrona_security_settings', JSON.stringify(newSettings));
      setSecuritySettings(newSettings);
    } catch (error) {
      console.error('Error saving security settings:', error);
    }
  };

  const performSecurityScan = () => {
    // Simulate security scan
    const vulnerabilities: string[] = [];
    
    if (!securitySettings.biometricAuth) {
      vulnerabilities.push('Biometric authentication disabled');
    }
    
    if (securitySettings.autoLockTimeout > 10) {
      vulnerabilities.push('Auto-lock timeout too long');
    }
    
    if (!securitySettings.networkSecurity) {
      vulnerabilities.push('Network security disabled');
    }
    
    setSecurityStatus(prev => ({
      ...prev,
      vulnerabilities,
      lastSecurityScan: Date.now(),
    }));
  };

  const handleSettingChange = (key: keyof SecuritySettings, value: boolean | number | string) => {
    const newSettings = { ...securitySettings, [key]: value };
    saveSecuritySettings(newSettings);
    
    // Re-run security scan after changes
    setTimeout(performSecurityScan, 100);
  };

  const runSecurityScan = () => {
    Alert.alert(
      'Security Scan',
      'Running comprehensive security analysis...',
      [{ text: 'OK' }]
    );
    
    setTimeout(() => {
      performSecurityScan();
      Alert.alert(
        'Scan Complete',
        `Found ${securityStatus.vulnerabilities.length} potential issues`
      );
    }, 2000);
  };

  const resetSecuritySettings = () => {
    Alert.alert(
      'Reset Security Settings',
      'This will reset all security settings to enterprise defaults.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            const defaultSettings: SecuritySettings = {
              biometricAuth: true,
              autoLock: true,
              autoLockTimeout: 2,
              encryptionLevel: 'enterprise',
              networkSecurity: true,
              offlineMode: true,
              auditTrail: true,
              sessionTimeout: 15,
              dataIntegrityChecks: true,
              secureBackup: true,
            };
            saveSecuritySettings(defaultSettings);
          },
        },
      ]
    );
  };

  const renderSecurityStatus = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Shield size={24} color={securityStatus.vulnerabilities.length === 0 ? '#10B981' : '#F59E0B'} />
        <Text style={styles.cardTitle}>Security Status</Text>
      </View>
      
      <View style={styles.statusGrid}>
        <View style={styles.statusItem}>
          <View style={[styles.statusIndicator, { backgroundColor: securityStatus.encryptionActive ? '#10B981' : '#EF4444' }]} />
          <Text style={styles.statusLabel}>Encryption</Text>
          <Text style={styles.statusValue}>{securityStatus.encryptionActive ? 'Active' : 'Inactive'}</Text>
        </View>
        
        <View style={styles.statusItem}>
          <View style={[styles.statusIndicator, { backgroundColor: '#0EA5E9' }]} />
          <Text style={styles.statusLabel}>Compliance</Text>
          <Text style={styles.statusValue}>{securityStatus.complianceLevel}</Text>
        </View>
        
        <View style={styles.statusItem}>
          <View style={[styles.statusIndicator, { backgroundColor: securityStatus.vulnerabilities.length === 0 ? '#10B981' : '#F59E0B' }]} />
          <Text style={styles.statusLabel}>Vulnerabilities</Text>
          <Text style={styles.statusValue}>{securityStatus.vulnerabilities.length}</Text>
        </View>
        
        <View style={styles.statusItem}>
          <View style={[styles.statusIndicator, { backgroundColor: securityStatus.dataBreaches === 0 ? '#10B981' : '#EF4444' }]} />
          <Text style={styles.statusLabel}>Breaches</Text>
          <Text style={styles.statusValue}>{securityStatus.dataBreaches}</Text>
        </View>
      </View>
      
      {securityStatus.vulnerabilities.length > 0 && (
        <View style={styles.vulnerabilityList}>
          <Text style={styles.vulnerabilityTitle}>Security Recommendations:</Text>
          {securityStatus.vulnerabilities.map((vuln, index) => (
            <View key={index} style={styles.vulnerabilityItem}>
              <AlertTriangle size={16} color="#F59E0B" />
              <Text style={styles.vulnerabilityText}>{vuln}</Text>
            </View>
          ))}
        </View>
      )}
      
      <TouchableOpacity style={styles.scanButton} onPress={runSecurityScan}>
        <Text style={styles.scanButtonText}>Run Security Scan</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAuthenticationSettings = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Fingerprint size={24} color="#0EA5E9" />
        <Text style={styles.cardTitle}>Authentication</Text>
      </View>
      
      <View style={styles.settingsList}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Biometric Authentication</Text>
            <Text style={styles.settingDescription}>Use fingerprint or face recognition</Text>
          </View>
          <Switch
            value={securitySettings.biometricAuth}
            onValueChange={(value) => handleSettingChange('biometricAuth', value)}
            trackColor={{ false: '#374151', true: '#0EA5E9' }}
            thumbColor={securitySettings.biometricAuth ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto-Lock</Text>
            <Text style={styles.settingDescription}>Automatically lock after inactivity</Text>
          </View>
          <Switch
            value={securitySettings.autoLock}
            onValueChange={(value) => handleSettingChange('autoLock', value)}
            trackColor={{ false: '#374151', true: '#0EA5E9' }}
            thumbColor={securitySettings.autoLock ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
        
        {securitySettings.autoLock && (
          <View style={styles.timeoutSelector}>
            <Text style={styles.timeoutLabel}>Auto-lock timeout:</Text>
            <View style={styles.timeoutOptions}>
              {[1, 2, 5, 10, 30].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.timeoutOption,
                    securitySettings.autoLockTimeout === minutes && styles.timeoutOptionSelected,
                  ]}
                  onPress={() => handleSettingChange('autoLockTimeout', minutes)}
                >
                  <Text
                    style={[
                      styles.timeoutOptionText,
                      securitySettings.autoLockTimeout === minutes && styles.timeoutOptionTextSelected,
                    ]}
                  >
                    {minutes}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderEncryptionSettings = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Lock size={24} color="#0EA5E9" />
        <Text style={styles.cardTitle}>Encryption</Text>
      </View>
      
      <View style={styles.settingsList}>
        <View style={styles.encryptionLevels}>
          <Text style={styles.encryptionLabel}>Encryption Level:</Text>
          {(['basic', 'advanced', 'enterprise'] as const).map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.encryptionOption,
                securitySettings.encryptionLevel === level && styles.encryptionOptionSelected,
              ]}
              onPress={() => handleSettingChange('encryptionLevel', level)}
            >
              <View style={styles.encryptionOptionContent}>
                <Text
                  style={[
                    styles.encryptionOptionTitle,
                    securitySettings.encryptionLevel === level && styles.encryptionOptionTitleSelected,
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
                <Text style={styles.encryptionOptionDescription}>
                  {level === 'basic' && 'AES-128 encryption'}
                  {level === 'advanced' && 'AES-256 encryption with key rotation'}
                  {level === 'enterprise' && 'AES-256 + hardware security module'}
                </Text>
              </View>
              {securitySettings.encryptionLevel === level && (
                <CheckCircle size={20} color="#0EA5E9" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Data Integrity Checks</Text>
            <Text style={styles.settingDescription}>Verify data hasn't been tampered with</Text>
          </View>
          <Switch
            value={securitySettings.dataIntegrityChecks}
            onValueChange={(value) => handleSettingChange('dataIntegrityChecks', value)}
            trackColor={{ false: '#374151', true: '#0EA5E9' }}
            thumbColor={securitySettings.dataIntegrityChecks ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
      </View>
    </View>
  );

  const renderNetworkSettings = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Wifi size={24} color="#0EA5E9" />
        <Text style={styles.cardTitle}>Network Security</Text>
      </View>
      
      <View style={styles.settingsList}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Offline Mode</Text>
            <Text style={styles.settingDescription}>Process all data locally</Text>
          </View>
          <Switch
            value={securitySettings.offlineMode}
            onValueChange={(value) => handleSettingChange('offlineMode', value)}
            trackColor={{ false: '#374151', true: '#0EA5E9' }}
            thumbColor={securitySettings.offlineMode ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Network Security</Text>
            <Text style={styles.settingDescription}>Encrypt all network communications</Text>
          </View>
          <Switch
            value={securitySettings.networkSecurity}
            onValueChange={(value) => handleSettingChange('networkSecurity', value)}
            trackColor={{ false: '#374151', true: '#0EA5E9' }}
            thumbColor={securitySettings.networkSecurity ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Audit Trail</Text>
            <Text style={styles.settingDescription}>Log all security events</Text>
          </View>
          <Switch
            value={securitySettings.auditTrail}
            onValueChange={(value) => handleSettingChange('auditTrail', value)}
            trackColor={{ false: '#374151', true: '#0EA5E9' }}
            thumbColor={securitySettings.auditTrail ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
      </View>
    </View>
  );

  const renderAdvancedSettings = () => (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardHeader}
        onPress={() => setShowAdvanced(!showAdvanced)}
      >
        <Key size={24} color="#0EA5E9" />
        <Text style={styles.cardTitle}>Advanced Security</Text>
        {showAdvanced ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
      </TouchableOpacity>
      
      {showAdvanced && (
        <View style={styles.settingsList}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Session Timeout</Text>
              <Text style={styles.settingDescription}>Minutes before requiring re-authentication</Text>
            </View>
            <View style={styles.timeoutInput}>
              <Text style={styles.timeoutValue}>{securitySettings.sessionTimeout}m</Text>
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Secure Backup</Text>
              <Text style={styles.settingDescription}>Encrypted cloud backup</Text>
            </View>
            <Switch
              value={securitySettings.secureBackup}
              onValueChange={(value) => handleSettingChange('secureBackup', value)}
              trackColor={{ false: '#374151', true: '#0EA5E9' }}
              thumbColor={securitySettings.secureBackup ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>
          
          <TouchableOpacity style={styles.resetButton} onPress={resetSecuritySettings}>
            <Text style={styles.resetButtonText}>Reset to Enterprise Defaults</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Security Settings",
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Shield size={32} color="#0EA5E9" />
          <Text style={styles.title}>Security Settings</Text>
          <Text style={styles.subtitle}>
            Enterprise-grade security for your temporal data
          </Text>
        </View>
        
        {renderSecurityStatus()}
        {renderAuthenticationSettings()}
        {renderEncryptionSettings()}
        {renderNetworkSettings()}
        {renderAdvancedSettings()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Chrona implements zero-trust security architecture with end-to-end encryption and local-first processing.
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
    flex: 1,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  statusItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  vulnerabilityList: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
  },
  vulnerabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 12,
  },
  vulnerabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  vulnerabilityText: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
  scanButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsList: {
    gap: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  timeoutSelector: {
    marginTop: 12,
  },
  timeoutLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  timeoutOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  timeoutOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#374151',
  },
  timeoutOptionSelected: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  timeoutOptionText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  timeoutOptionTextSelected: {
    color: '#FFFFFF',
  },
  encryptionLevels: {
    gap: 12,
  },
  encryptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  encryptionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  encryptionOptionSelected: {
    borderColor: '#0EA5E9',
    backgroundColor: '#0EA5E9' + '20',
  },
  encryptionOptionContent: {
    flex: 1,
  },
  encryptionOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  encryptionOptionTitleSelected: {
    color: '#0EA5E9',
  },
  encryptionOptionDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  timeoutInput: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  timeoutValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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