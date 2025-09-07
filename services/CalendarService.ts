import { CalendarEvent, CalendarIntegration, ScrapedData, SyncStatus } from '@/types/chrona';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

class CalendarService {
  private static instance: CalendarService;
  private integrations: CalendarIntegration[] = [];
  private events: CalendarEvent[] = [];
  private scrapedData: ScrapedData[] = [];
  private syncStatus: SyncStatus = {
    isRunning: false,
    lastSync: 0,
    nextSync: 0,
    errors: [],
    eventsAdded: 0,
    eventsUpdated: 0,
    eventsDeleted: 0,
  };

  static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  async initialize() {
    await this.loadData();
  }

  private async loadData() {
    try {
      const [integrationsData, eventsData, scrapedDataData, syncStatusData] = await Promise.all([
        AsyncStorage.getItem('calendar_integrations'),
        AsyncStorage.getItem('calendar_events'),
        AsyncStorage.getItem('scraped_data'),
        AsyncStorage.getItem('sync_status'),
      ]);

      if (integrationsData) this.integrations = JSON.parse(integrationsData);
      if (eventsData) this.events = JSON.parse(eventsData);
      if (scrapedDataData) this.scrapedData = JSON.parse(scrapedDataData);
      if (syncStatusData) this.syncStatus = JSON.parse(syncStatusData);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
  }

  private async saveData() {
    try {
      await Promise.all([
        AsyncStorage.setItem('calendar_integrations', JSON.stringify(this.integrations)),
        AsyncStorage.setItem('calendar_events', JSON.stringify(this.events)),
        AsyncStorage.setItem('scraped_data', JSON.stringify(this.scrapedData)),
        AsyncStorage.setItem('sync_status', JSON.stringify(this.syncStatus)),
      ]);
    } catch (error) {
      console.error('Error saving calendar data:', error);
    }
  }

  // Google Calendar Integration
  async connectGoogleCalendar(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // Web OAuth flow
        const clientId = 'your-google-client-id';
        const redirectUri = window.location.origin + '/auth/google/callback';
        const scope = 'https://www.googleapis.com/auth/calendar.readonly';
        
        const authUrl = `https://accounts.google.com/oauth/authorize?` +
          `client_id=${clientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=${encodeURIComponent(scope)}&` +
          `response_type=code&` +
          `access_type=offline`;

        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
        
        if (result.type === 'success' && result.url) {
          const code = new URL(result.url).searchParams.get('code');
          if (code) {
            return await this.exchangeGoogleCode(code);
          }
        }
      } else {
        // Mobile OAuth flow - would use expo-auth-session in real implementation
        console.log('Mobile Google Calendar auth not implemented in demo');
        // For demo purposes, create a mock integration
        return await this.createMockGoogleIntegration();
      }
      return false;
    } catch (error) {
      console.error('Google Calendar connection error:', error);
      return false;
    }
  }

  private async createMockGoogleIntegration(): Promise<boolean> {
    const integration: CalendarIntegration = {
      id: Date.now().toString(),
      provider: 'google',
      name: 'Google Calendar',
      email: 'user@gmail.com',
      isConnected: true,
      lastSync: Date.now(),
      syncEnabled: true,
      calendarIds: ['primary'],
    };

    this.integrations.push(integration);
    await this.saveData();
    
    // Add some mock events
    await this.addMockGoogleEvents();
    
    return true;
  }

  private async addMockGoogleEvents() {
    const mockEvents: CalendarEvent[] = [
      {
        id: 'google-1',
        title: 'Team Standup',
        description: 'Daily team synchronization meeting',
        startTime: Date.now() + 2 * 60 * 60 * 1000, // 2 hours from now
        endTime: Date.now() + 2.5 * 60 * 60 * 1000,
        location: 'Conference Room A',
        attendees: ['team@company.com'],
        source: 'google',
        sourceId: 'google-event-1',
        isAllDay: false,
        status: 'confirmed',
        visibility: 'public',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'google-2',
        title: 'Project Review',
        description: 'Quarterly project review and planning session',
        startTime: Date.now() + 24 * 60 * 60 * 1000, // Tomorrow
        endTime: Date.now() + 25 * 60 * 60 * 1000,
        source: 'google',
        sourceId: 'google-event-2',
        isAllDay: false,
        status: 'confirmed',
        visibility: 'public',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    this.events.push(...mockEvents);
    await this.saveData();
  }

  private async exchangeGoogleCode(code: string): Promise<boolean> {
    // In a real implementation, this would exchange the code for tokens
    console.log('Exchanging Google OAuth code:', code);
    return await this.createMockGoogleIntegration();
  }

  // Outlook Calendar Integration
  async connectOutlookCalendar(): Promise<boolean> {
    try {
      // For demo purposes, create a mock integration
      const integration: CalendarIntegration = {
        id: Date.now().toString(),
        provider: 'outlook',
        name: 'Outlook Calendar',
        email: 'user@outlook.com',
        isConnected: true,
        lastSync: Date.now(),
        syncEnabled: true,
        calendarIds: ['primary'],
      };

      this.integrations.push(integration);
      await this.saveData();
      
      // Add some mock Outlook events
      const mockEvents: CalendarEvent[] = [
        {
          id: 'outlook-1',
          title: 'Client Meeting',
          description: 'Quarterly business review with key client',
          startTime: Date.now() + 4 * 60 * 60 * 1000, // 4 hours from now
          endTime: Date.now() + 5 * 60 * 60 * 1000,
          location: 'Client Office',
          source: 'outlook',
          sourceId: 'outlook-event-1',
          isAllDay: false,
          status: 'confirmed',
          visibility: 'public',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      this.events.push(...mockEvents);
      await this.saveData();
      
      return true;
    } catch (error) {
      console.error('Outlook Calendar connection error:', error);
      return false;
    }
  }

  // Apple Calendar Integration (iCal)
  async connectAppleCalendar(): Promise<boolean> {
    try {
      // For demo purposes, create a mock integration
      const integration: CalendarIntegration = {
        id: Date.now().toString(),
        provider: 'apple',
        name: 'Apple Calendar',
        isConnected: true,
        lastSync: Date.now(),
        syncEnabled: true,
        calendarIds: ['primary'],
      };

      this.integrations.push(integration);
      await this.saveData();
      
      return true;
    } catch (error) {
      console.error('Apple Calendar connection error:', error);
      return false;
    }
  }

  // Data Scraping Functions
  async scrapeCalendarData(url: string, type: 'ical' | 'webpage' = 'webpage'): Promise<ScrapedData | null> {
    try {
      const scrapedData: ScrapedData = {
        id: Date.now().toString(),
        source: url,
        url,
        type: 'calendar',
        data: {},
        extractedEvents: [],
        scrapedAt: Date.now(),
        confidence: 0.8,
        status: 'pending',
      };

      if (type === 'ical') {
        // Scrape iCal data
        const events = await this.parseICalData(url);
        scrapedData.extractedEvents = events;
        scrapedData.status = 'processed';
      } else {
        // Scrape webpage for calendar data
        const events = await this.scrapeWebpageCalendar(url);
        scrapedData.extractedEvents = events;
        scrapedData.status = 'processed';
      }

      this.scrapedData.push(scrapedData);
      this.events.push(...scrapedData.extractedEvents);
      await this.saveData();

      return scrapedData;
    } catch (error) {
      console.error('Calendar scraping error:', error);
      return null;
    }
  }

  private async parseICalData(url: string): Promise<CalendarEvent[]> {
    try {
      // In a real implementation, this would fetch and parse iCal data
      console.log('Parsing iCal data from:', url);
      
      // Mock parsed events
      return [
        {
          id: 'ical-1',
          title: 'Conference Call',
          startTime: Date.now() + 6 * 60 * 60 * 1000,
          endTime: Date.now() + 7 * 60 * 60 * 1000,
          source: 'scraped',
          isAllDay: false,
          status: 'confirmed',
          visibility: 'public',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
    } catch (error) {
      console.error('iCal parsing error:', error);
      return [];
    }
  }

  private async scrapeWebpageCalendar(url: string): Promise<CalendarEvent[]> {
    try {
      // In a real implementation, this would use AI to extract calendar data from webpages
      console.log('Scraping calendar data from webpage:', url);
      
      // Mock AI extraction using the AI API
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Extract calendar events from the provided webpage content. Return events in JSON format with title, startTime, endTime, description, and location fields.',
            },
            {
              role: 'user',
              content: `Please extract calendar events from this URL: ${url}. For demo purposes, generate 2-3 realistic events.`,
            },
          ],
        }),
      });

      await response.json();
      
      // Parse AI response and convert to CalendarEvent format
      // For demo, return mock events
      return [
        {
          id: 'scraped-1',
          title: 'Workshop: Time Management',
          description: 'Learn advanced time management techniques',
          startTime: Date.now() + 48 * 60 * 60 * 1000, // 2 days from now
          endTime: Date.now() + 50 * 60 * 60 * 1000,
          location: 'Online',
          source: 'scraped',
          isAllDay: false,
          status: 'confirmed',
          visibility: 'public',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
    } catch (error) {
      console.error('Webpage scraping error:', error);
      return [];
    }
  }

  // Smart Event Detection
  async detectEventsFromText(text: string): Promise<CalendarEvent[]> {
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
              content: 'Extract calendar events from the provided text. Look for dates, times, meeting mentions, appointments, deadlines, etc. Return events in JSON format.',
            },
            {
              role: 'user',
              content: `Extract calendar events from this text: "${text}"`,
            },
          ],
        }),
      });

      await response.json();
      
      // Parse AI response and convert to CalendarEvent format
      // For demo, return mock events based on text analysis
      const events: CalendarEvent[] = [];
      
      if (text.toLowerCase().includes('meeting')) {
        events.push({
          id: 'detected-' + Date.now(),
          title: 'Detected Meeting',
          description: 'Auto-detected from text input',
          startTime: Date.now() + 24 * 60 * 60 * 1000,
          endTime: Date.now() + 25 * 60 * 60 * 1000,
          source: 'manual',
          isAllDay: false,
          status: 'tentative',
          visibility: 'private',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      
      return events;
    } catch (error) {
      console.error('Event detection error:', error);
      return [];
    }
  }

  // Sync Functions
  async syncAllCalendars(): Promise<void> {
    if (this.syncStatus.isRunning) return;

    this.syncStatus.isRunning = true;
    this.syncStatus.errors = [];
    this.syncStatus.eventsAdded = 0;
    this.syncStatus.eventsUpdated = 0;
    this.syncStatus.eventsDeleted = 0;

    try {
      for (const integration of this.integrations) {
        if (integration.isConnected && integration.syncEnabled) {
          await this.syncIntegration(integration);
        }
      }

      this.syncStatus.lastSync = Date.now();
      this.syncStatus.nextSync = Date.now() + 15 * 60 * 1000; // Next sync in 15 minutes
    } catch (error) {
      console.error('Sync error:', error);
      this.syncStatus.errors.push(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.syncStatus.isRunning = false;
      await this.saveData();
    }
  }

  private async syncIntegration(integration: CalendarIntegration): Promise<void> {
    try {
      console.log(`Syncing ${integration.provider} calendar...`);
      
      // In a real implementation, this would fetch events from the provider's API
      // For demo purposes, we'll simulate adding a new event
      const newEvent: CalendarEvent = {
        id: `${integration.provider}-sync-${Date.now()}`,
        title: `Synced Event from ${integration.name}`,
        startTime: Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000, // Random time in next week
        endTime: Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000,
        source: integration.provider as 'google' | 'outlook' | 'apple' | 'manual' | 'scraped',
        sourceId: `sync-${Date.now()}`,
        isAllDay: false,
        status: 'confirmed',
        visibility: 'public',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      this.events.push(newEvent);
      this.syncStatus.eventsAdded++;
      
      integration.lastSync = Date.now();
    } catch (error) {
      console.error(`Error syncing ${integration.provider}:`, error);
      this.syncStatus.errors.push(`${integration.provider}: ${error}`);
    }
  }

  // Getters
  getIntegrations(): CalendarIntegration[] {
    return this.integrations;
  }

  getEvents(startDate?: Date, endDate?: Date): CalendarEvent[] {
    let events = this.events;
    
    if (startDate || endDate) {
      events = events.filter(event => {
        const eventStart = new Date(event.startTime);
        if (startDate && eventStart < startDate) return false;
        if (endDate && eventStart > endDate) return false;
        return true;
      });
    }
    
    return events.sort((a, b) => a.startTime - b.startTime);
  }

  getEventsForDate(date: Date): CalendarEvent[] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return this.events.filter(event => {
      const eventStart = new Date(event.startTime);
      return eventStart >= startOfDay && eventStart <= endOfDay;
    });
  }

  getScrapedData(): ScrapedData[] {
    return this.scrapedData;
  }

  getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }

  // Utility Functions
  async disconnectIntegration(integrationId: string): Promise<void> {
    const index = this.integrations.findIndex(i => i.id === integrationId);
    if (index !== -1) {
      this.integrations[index].isConnected = false;
      this.integrations[index].syncEnabled = false;
      
      // Remove events from this integration
      this.events = this.events.filter(event => 
        event.source !== this.integrations[index].provider
      );
      
      await this.saveData();
    }
  }

  async toggleSync(integrationId: string, enabled: boolean): Promise<void> {
    const integration = this.integrations.find(i => i.id === integrationId);
    if (integration) {
      integration.syncEnabled = enabled;
      await this.saveData();
    }
  }

  async addManualEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    this.events.push(newEvent);
    await this.saveData();
    
    return newEvent;
  }

  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<void> {
    const index = this.events.findIndex(e => e.id === eventId);
    if (index !== -1) {
      this.events[index] = {
        ...this.events[index],
        ...updates,
        updatedAt: Date.now(),
      };
      await this.saveData();
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    this.events = this.events.filter(e => e.id !== eventId);
    await this.saveData();
  }

  async clearAllData(): Promise<void> {
    this.integrations = [];
    this.events = [];
    this.scrapedData = [];
    this.syncStatus = {
      isRunning: false,
      lastSync: 0,
      nextSync: 0,
      errors: [],
      eventsAdded: 0,
      eventsUpdated: 0,
      eventsDeleted: 0,
    };
    
    await AsyncStorage.multiRemove([
      'calendar_integrations',
      'calendar_events',
      'scraped_data',
      'sync_status',
    ]);
  }
}

export default CalendarService;