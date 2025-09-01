import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import {
  Shield,
  Lock,
  Eye,
  Database,
  Bell,
  Palette,
  HelpCircle,
  Info,
  ChevronRight,
  User,
  Settings as SettingsIcon,
} from 'lucide-react-native';
import { useChrona } from '@/providers/ChronaProvider';

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
  badge?: string;
}

export default function SettingsScreen() {
  const { settings, updateSettings } = useChrona();

  const settingsSections: SettingsSection[] = [
    {
      title: 'Security & Privacy',
      items: [
        {
          icon: <Shield size={24} color="#0EA5E9" />,
          title: 'Privacy Dashboard',
          description: 'Data inventory, consent management, and transparency controls',
          onPress: () => router.push('/privacy-dashboard'),
          badge: 'Enterprise',
        },
        {
          icon: <Lock size={24} color="#10B981" />,
          title: 'Security Settings',
          description: 'Encryption, authentication, and access controls',
          onPress: () => router.push('/security-settings'),
        },
        {
          icon: <Eye size={24} color="#F59E0B" />,
          title: 'Nudge Ledger',
          description: 'Review all algorithmic interventions and their rationale',
          onPress: () => router.push('/nudge-ledger'),
        },
      ],
    },
    {
      title: 'Time Metrology',
      items: [
        {
          icon: <Database size={24} color="#8B5CF6" />,
          title: 'Data Retention',
          description: 'Configure how long temporal metrics are stored',
          onPress: () => {},
        },
        {
          icon: <SettingsIcon size={24} color="#EF4444" />,
          title: 'Measurement Precision',
          description: 'Adjust resolution, jitter, and drift sensitivity',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Experience',
      items: [
        {
          icon: <Bell size={24} color="#06B6D4" />,
          title: 'Notifications',
          description: 'Flow alerts, nudges, and system notifications',
          onPress: () => {},
        },
        {
          icon: <Palette size={24} color="#EC4899" />,
          title: 'Daily Glyph',
          description: 'Customize your temporal visualization style',
          onPress: () => router.push('/daily-glyph'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: <HelpCircle size={24} color="#84CC16" />,
          title: 'Help & Documentation',
          description: 'Learn about time metrology and Chrona features',
          onPress: () => {},
        },
        {
          icon: <Info size={24} color="#6B7280" />,
          title: 'About Chrona',
          description: 'Version info, credits, and philosophy',
          onPress: () => {},
        },
      ],
    },
  ];

  const renderSettingsSection = (section: SettingsSection) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.settingsItem,
              index === section.items.length - 1 && styles.settingsItemLast,
            ]}
            onPress={item.onPress}
          >
            <View style={styles.settingsItemIcon}>
              {item.icon}
            </View>
            <View style={styles.settingsItemContent}>
              <View style={styles.settingsItemHeader}>
                <Text style={styles.settingsItemTitle}>{item.title}</Text>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.settingsItemDescription}>{item.description}</Text>
            </View>
            <ChevronRight size={20} color="#6B7280" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Configure your productivity experience
          </Text>
        </View>
        
        {settingsSections.map(renderSettingsSection)}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Chrona v1.0.0 • Productivity Platform
          </Text>
          <Text style={styles.footerSubtext}>
            Built with mindfulness and transparency
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsItemLast: {
    borderBottomWidth: 0,
  },
  settingsItemIcon: {
    marginRight: 16,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  badge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsItemDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});