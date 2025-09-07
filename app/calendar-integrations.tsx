import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Switch,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useCalendar } from '@/providers/CalendarProvider';
import {
  Calendar,
  Plus,
  Download,
  Send,
  Settings,
  Globe,
  Link,
  Smartphone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { router } from 'expo-router';

export default function CalendarIntegrationsScreen() {
  const {
    integrations,
    events,
    scrapedData,
    syncStatus,
    isLoading,
    isConnecting,
    isSyncing,
    connectGoogleCalendar,
    connectOutlookCalendar,
    connectAppleCalendar,
    disconnectIntegration,
    toggleSync,
    scrapeCalendarData,
    detectEventsFromText,
    syncAllCalendars,
    refreshData,
    clearAllData,
  } = useCalendar();

  const [activeTab, setActiveTab] = useState<'integrations' | 'scraping' | 'events'>('integrations');
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scrapeText, setScrapeText] = useState('');
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [isDetectingText, setIsDetectingText] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleConnectGoogle = async () => {
    const success = await connectGoogleCalendar();
    if (success) {
      Alert.alert('Success', 'Google Calendar connected successfully!');
    } else {
      Alert.alert('Error', 'Failed to connect Google Calendar. Please try again.');
    }
  };

  const handleConnectOutlook = async () => {
    const success = await connectOutlookCalendar();
    if (success) {
      Alert.alert('Success', 'Outlook Calendar connected successfully!');
    } else {
      Alert.alert('Error', 'Failed to connect Outlook Calendar. Please try again.');
    }
  };

  const handleConnectApple = async () => {
    const success = await connectAppleCalendar();
    if (success) {
      Alert.alert('Success', 'Apple Calendar connected successfully!');
    } else {
      Alert.alert('Error', 'Failed to connect Apple Calendar. Please try again.');
    }
  };

  const handleDisconnect = (integration: any) => {
    Alert.alert(
      'Disconnect Calendar',
      `Are you sure you want to disconnect ${integration.name}? This will remove all synced events.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => disconnectIntegration(integration.id),
        },
      ]
    );
  };

  const handleScrapeUrl = async () => {
    if (!scrapeUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    setIsScrapingUrl(true);
    try {
      const result = await scrapeCalendarData(scrapeUrl, 'webpage');
      if (result) {
        Alert.alert(
          'Success',
          `Successfully scraped ${result.extractedEvents.length} events from the webpage!`
        );
        setScrapeUrl('');
      } else {
        Alert.alert('Error', 'Failed to scrape calendar data from the URL');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while scraping the URL');
    } finally {
      setIsScrapingUrl(false);
    }
  };

  const handleDetectText = async () => {
    if (!scrapeText.trim()) {
      Alert.alert('Error', 'Please enter some text to analyze');
      return;
    }

    setIsDetectingText(true);
    try {
      const detectedEvents = await detectEventsFromText(scrapeText);
      if (detectedEvents.length > 0) {
        Alert.alert(
          'Success',
          `Detected ${detectedEvents.length} potential events from the text!`
        );
        setScrapeText('');
      } else {
        Alert.alert('No Events Found', 'No calendar events were detected in the provided text');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while analyzing the text');
    } finally {
      setIsDetectingText(false);
    }
  };

  const handleSync = async () => {
    await syncAllCalendars();
    Alert.alert('Sync Complete', 'All connected calendars have been synchronized');
  };

  const renderIntegrationsTab = () => (
    <View style={styles.tabContent}>
      {/* Connected Integrations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connected Calendars</Text>
        {integrations.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>No calendars connected</Text>
            <Text style={styles.emptyStateSubtext}>
              Connect your calendars to sync events automatically
            </Text>
          </View>
        ) : (
          integrations.map((integration) => (
            <View key={integration.id} style={styles.integrationCard}>
              <View style={styles.integrationHeader}>
                <View style={styles.integrationInfo}>
                  <View style={styles.integrationIcon}>
                    {integration.provider === 'google' && <Mail size={20} color="#EA4335" />}
                    {integration.provider === 'outlook' && <Mail size={20} color="#0078D4" />}
                    {integration.provider === 'apple' && <Smartphone size={20} color="#007AFF" />}
                  </View>
                  <View>
                    <Text style={styles.integrationName}>{integration.name}</Text>
                    {integration.email && (
                      <Text style={styles.integrationEmail}>{integration.email}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.integrationStatus}>
                  {integration.isConnected ? (
                    <CheckCircle size={20} color="#10B981" />
                  ) : (
                    <XCircle size={20} color="#EF4444" />
                  )}
                </View>
              </View>
              
              <View style={styles.integrationDetails}>
                <Text style={styles.integrationDetailText}>
                  Last sync: {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
                </Text>
                <View style={styles.integrationControls}>
                  <View style={styles.syncToggle}>
                    <Text style={styles.syncToggleText}>Auto-sync</Text>
                    <Switch
                      value={integration.syncEnabled}
                      onValueChange={(enabled) => toggleSync(integration.id, enabled)}
                      trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
                      thumbColor={integration.syncEnabled ? '#FFFFFF' : '#9CA3AF'}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.disconnectButton}
                    onPress={() => handleDisconnect(integration)}
                  >
                    <Trash2 size={16} color="#EF4444" />
                    <Text style={styles.disconnectButtonText}>Disconnect</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Add New Integration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Calendar</Text>
        <View style={styles.integrationOptions}>
          <TouchableOpacity
            style={styles.integrationOption}
            onPress={handleConnectGoogle}
            disabled={isConnecting}
          >
            <Mail size={24} color="#EA4335" />
            <Text style={styles.integrationOptionText}>Google Calendar</Text>
            {isConnecting && <ActivityIndicator size="small" color="#6366F1" />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.integrationOption}
            onPress={handleConnectOutlook}
            disabled={isConnecting}
          >
            <Mail size={24} color="#0078D4" />
            <Text style={styles.integrationOptionText}>Outlook Calendar</Text>
            {isConnecting && <ActivityIndicator size="small" color="#6366F1" />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.integrationOption}
            onPress={handleConnectApple}
            disabled={isConnecting}
          >
            <Smartphone size={24} color="#007AFF" />
            <Text style={styles.integrationOptionText}>Apple Calendar</Text>
            {isConnecting && <ActivityIndicator size="small" color="#6366F1" />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Sync Status */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sync Status</Text>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={16} color="#FFFFFF" />
            )}
            <Text style={styles.syncButtonText}>
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.syncStatusCard}>
          <View style={styles.syncStatusRow}>
            <Text style={styles.syncStatusLabel}>Last Sync:</Text>
            <Text style={styles.syncStatusValue}>
              {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'Never'}
            </Text>
          </View>
          <View style={styles.syncStatusRow}>
            <Text style={styles.syncStatusLabel}>Events Added:</Text>
            <Text style={styles.syncStatusValue}>{syncStatus.eventsAdded}</Text>
          </View>
          <View style={styles.syncStatusRow}>
            <Text style={styles.syncStatusLabel}>Events Updated:</Text>
            <Text style={styles.syncStatusValue}>{syncStatus.eventsUpdated}</Text>
          </View>
          {syncStatus.errors.length > 0 && (
            <View style={styles.syncErrors}>
              <Text style={styles.syncErrorsTitle}>Errors:</Text>
              {syncStatus.errors.map((error, index) => (
                <Text key={index} style={styles.syncError}>{error}</Text>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderScrapingTab = () => (
    <View style={styles.tabContent}>
      {/* URL Scraping */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scrape Calendar from URL</Text>
        <Text style={styles.sectionDescription}>
          Extract calendar events from websites, iCal feeds, or online calendars
        </Text>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter URL (e.g., https://example.com/calendar)"
            value={scrapeUrl}
            onChangeText={setScrapeUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
          <TouchableOpacity
            style={[styles.actionButton, isScrapingUrl && styles.actionButtonDisabled]}
            onPress={handleScrapeUrl}
            disabled={isScrapingUrl}
          >
            {isScrapingUrl ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Download size={16} color="#FFFFFF" />
            )}
            <Text style={styles.actionButtonText}>
              {isScrapingUrl ? 'Scraping...' : 'Scrape URL'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Text Analysis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detect Events from Text</Text>
        <Text style={styles.sectionDescription}>
          Paste text containing dates, times, or meeting information to automatically detect events
        </Text>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Paste text here (e.g., emails, messages, documents)..."
            value={scrapeText}
            onChangeText={setScrapeText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.actionButton, isDetectingText && styles.actionButtonDisabled]}
            onPress={handleDetectText}
            disabled={isDetectingText}
          >
            {isDetectingText ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <AlertCircle size={16} color="#FFFFFF" />
            )}
            <Text style={styles.actionButtonText}>
              {isDetectingText ? 'Analyzing...' : 'Detect Events'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scraped Data History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scraping History</Text>
        {scrapedData.length === 0 ? (
          <View style={styles.emptyState}>
            <Globe size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>No scraped data</Text>
            <Text style={styles.emptyStateSubtext}>
              Scraped calendar data will appear here
            </Text>
          </View>
        ) : (
          scrapedData.map((data) => (
            <View key={data.id} style={styles.scrapedDataCard}>
              <View style={styles.scrapedDataHeader}>
                <View>
                  <Text style={styles.scrapedDataSource}>{data.source}</Text>
                  <Text style={styles.scrapedDataDate}>
                    {new Date(data.scrapedAt).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.scrapedDataStatus}>
                  {data.status === 'processed' && <CheckCircle size={16} color="#10B981" />}
                  {data.status === 'pending' && <Clock size={16} color="#F59E0B" />}
                  {data.status === 'failed' && <XCircle size={16} color="#EF4444" />}
                </View>
              </View>
              <Text style={styles.scrapedDataEvents}>
                {data.extractedEvents.length} events extracted
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );

  const renderEventsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Events</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/calendar-view')}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Event</Text>
          </TouchableOpacity>
        </View>
        
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>No events found</Text>
            <Text style={styles.emptyStateSubtext}>
              Connect calendars or add events manually
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
            {events.slice(0, 20).map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={[styles.eventSource, { backgroundColor: getSourceColor(event.source) }]}>
                    <Text style={styles.eventSourceText}>{event.source}</Text>
                  </View>
                </View>
                
                <Text style={styles.eventTime}>
                  {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}
                </Text>
                
                {event.description && (
                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {event.description}
                  </Text>
                )}
                
                {event.location && (
                  <Text style={styles.eventLocation}>{event.location}</Text>
                )}
              </View>
            ))}
            
            {events.length > 20 && (
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={() => router.push('/calendar-view')}
              >
                <Text style={styles.viewMoreText}>View All Events</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'google': return '#EA4335';
      case 'outlook': return '#0078D4';
      case 'apple': return '#007AFF';
      case 'scraped': return '#10B981';
      case 'manual': return '#6366F1';
      default: return '#9CA3AF';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading calendar integrations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar Integration</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            Alert.alert(
              'Clear All Data',
              'This will remove all calendar integrations, events, and scraped data. This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear All',
                  style: 'destructive',
                  onPress: clearAllData,
                },
              ]
            );
          }}
        >
          <Trash2 size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'integrations' && styles.activeTab]}
          onPress={() => setActiveTab('integrations')}
        >
          <Link size={16} color={activeTab === 'integrations' ? '#6366F1' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'integrations' && styles.activeTabText]}>
            Integrations
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'scraping' && styles.activeTab]}
          onPress={() => setActiveTab('scraping')}
        >
          <Globe size={16} color={activeTab === 'scraping' ? '#6366F1' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'scraping' && styles.activeTabText]}>
            Scraping
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Calendar size={16} color={activeTab === 'events' ? '#6366F1' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
            Events ({events.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'integrations' && renderIntegrationsTab()}
        {activeTab === 'scraping' && renderScrapingTab()}
        {activeTab === 'events' && renderEventsTab()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  clearButton: {
    padding: 8,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366F1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#6366F1',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  integrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  integrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  integrationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  integrationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  integrationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  integrationEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  integrationStatus: {},
  integrationDetails: {
    gap: 12,
  },
  integrationDetailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  integrationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncToggleText: {
    fontSize: 14,
    color: '#374151',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  disconnectButtonText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  integrationOptions: {
    gap: 12,
  },
  integrationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  integrationOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  syncStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  syncStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  syncStatusLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  syncStatusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  syncErrors: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  syncErrorsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
    marginBottom: 4,
  },
  syncError: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 2,
  },
  inputGroup: {
    gap: 12,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  scrapedDataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scrapedDataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  scrapedDataSource: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  scrapedDataDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  scrapedDataStatus: {},
  scrapedDataEvents: {
    fontSize: 12,
    color: '#6B7280',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  eventsList: {
    maxHeight: 400,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 12,
  },
  eventSource: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventSourceText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  eventTime: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  viewMoreButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366F1',
  },
});