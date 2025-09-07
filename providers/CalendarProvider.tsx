import React, { useState, useEffect, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import CalendarService from '@/services/CalendarService';
import { CalendarEvent, CalendarIntegration, ScrapedData, SyncStatus } from '@/types/chrona';

interface CalendarContextValue {
  // Data
  integrations: CalendarIntegration[];
  events: CalendarEvent[];
  scrapedData: ScrapedData[];
  syncStatus: SyncStatus;
  
  // Loading states
  isLoading: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  
  // Integration functions
  connectGoogleCalendar: () => Promise<boolean>;
  connectOutlookCalendar: () => Promise<boolean>;
  connectAppleCalendar: () => Promise<boolean>;
  disconnectIntegration: (integrationId: string) => Promise<void>;
  toggleSync: (integrationId: string, enabled: boolean) => Promise<void>;
  
  // Event functions
  getEventsForDate: (date: Date) => CalendarEvent[];
  getEventsForDateRange: (startDate: Date, endDate: Date) => CalendarEvent[];
  addManualEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CalendarEvent>;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  
  // Scraping functions
  scrapeCalendarData: (url: string, type?: 'ical' | 'webpage') => Promise<ScrapedData | null>;
  detectEventsFromText: (text: string) => Promise<CalendarEvent[]>;
  
  // Sync functions
  syncAllCalendars: () => Promise<void>;
  
  // Utility functions
  refreshData: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

export const [CalendarContextProviderComponent, useCalendar] = createContextHook<CalendarContextValue>(() => {
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [scrapedData, setScrapedData] = useState<ScrapedData[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isRunning: false,
    lastSync: 0,
    nextSync: 0,
    errors: [],
    eventsAdded: 0,
    eventsUpdated: 0,
    eventsDeleted: 0,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const calendarService = CalendarService.getInstance();

  // Initialize calendar service
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        await calendarService.initialize();
        await refreshData();
      } catch (error) {
        console.error('Error initializing calendar service:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Auto-sync every 15 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isSyncing && integrations.some(i => i.isConnected && i.syncEnabled)) {
        await syncAllCalendars();
      }
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, [isSyncing, integrations]);

  const refreshData = useCallback(async () => {
    try {
      const [newIntegrations, newEvents, newScrapedData, newSyncStatus] = await Promise.all([
        Promise.resolve(calendarService.getIntegrations()),
        Promise.resolve(calendarService.getEvents()),
        Promise.resolve(calendarService.getScrapedData()),
        Promise.resolve(calendarService.getSyncStatus()),
      ]);

      setIntegrations(newIntegrations);
      setEvents(newEvents);
      setScrapedData(newScrapedData);
      setSyncStatus(newSyncStatus);
    } catch (error) {
      console.error('Error refreshing calendar data:', error);
    }
  }, []);

  // Integration functions
  const connectGoogleCalendar = useCallback(async (): Promise<boolean> => {
    try {
      setIsConnecting(true);
      const success = await calendarService.connectGoogleCalendar();
      if (success) {
        await refreshData();
      }
      return success;
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [refreshData]);

  const connectOutlookCalendar = useCallback(async (): Promise<boolean> => {
    try {
      setIsConnecting(true);
      const success = await calendarService.connectOutlookCalendar();
      if (success) {
        await refreshData();
      }
      return success;
    } catch (error) {
      console.error('Error connecting Outlook Calendar:', error);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [refreshData]);

  const connectAppleCalendar = useCallback(async (): Promise<boolean> => {
    try {
      setIsConnecting(true);
      const success = await calendarService.connectAppleCalendar();
      if (success) {
        await refreshData();
      }
      return success;
    } catch (error) {
      console.error('Error connecting Apple Calendar:', error);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [refreshData]);

  const disconnectIntegration = useCallback(async (integrationId: string): Promise<void> => {
    try {
      await calendarService.disconnectIntegration(integrationId);
      await refreshData();
    } catch (error) {
      console.error('Error disconnecting integration:', error);
    }
  }, [refreshData]);

  const toggleSync = useCallback(async (integrationId: string, enabled: boolean): Promise<void> => {
    try {
      await calendarService.toggleSync(integrationId, enabled);
      await refreshData();
    } catch (error) {
      console.error('Error toggling sync:', error);
    }
  }, [refreshData]);

  // Event functions
  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    return calendarService.getEventsForDate(date);
  }, []);

  const getEventsForDateRange = useCallback((startDate: Date, endDate: Date): CalendarEvent[] => {
    return calendarService.getEvents(startDate, endDate);
  }, []);

  const addManualEvent = useCallback(async (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> => {
    try {
      const newEvent = await calendarService.addManualEvent(event);
      await refreshData();
      return newEvent;
    } catch (error) {
      console.error('Error adding manual event:', error);
      throw error;
    }
  }, [refreshData]);

  const updateEvent = useCallback(async (eventId: string, updates: Partial<CalendarEvent>): Promise<void> => {
    try {
      await calendarService.updateEvent(eventId, updates);
      await refreshData();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  }, [refreshData]);

  const deleteEvent = useCallback(async (eventId: string): Promise<void> => {
    try {
      await calendarService.deleteEvent(eventId);
      await refreshData();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }, [refreshData]);

  // Scraping functions
  const scrapeCalendarData = useCallback(async (url: string, type: 'ical' | 'webpage' = 'webpage'): Promise<ScrapedData | null> => {
    try {
      const result = await calendarService.scrapeCalendarData(url, type);
      if (result) {
        await refreshData();
      }
      return result;
    } catch (error) {
      console.error('Error scraping calendar data:', error);
      return null;
    }
  }, [refreshData]);

  const detectEventsFromText = useCallback(async (text: string): Promise<CalendarEvent[]> => {
    try {
      const detectedEvents = await calendarService.detectEventsFromText(text);
      if (detectedEvents.length > 0) {
        await refreshData();
      }
      return detectedEvents;
    } catch (error) {
      console.error('Error detecting events from text:', error);
      return [];
    }
  }, [refreshData]);

  // Sync functions
  const syncAllCalendars = useCallback(async (): Promise<void> => {
    try {
      setIsSyncing(true);
      await calendarService.syncAllCalendars();
      await refreshData();
    } catch (error) {
      console.error('Error syncing calendars:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [refreshData]);

  // Utility functions
  const clearAllData = useCallback(async (): Promise<void> => {
    try {
      await calendarService.clearAllData();
      await refreshData();
    } catch (error) {
      console.error('Error clearing calendar data:', error);
    }
  }, [refreshData]);

  return {
    // Data
    integrations,
    events,
    scrapedData,
    syncStatus,
    
    // Loading states
    isLoading,
    isConnecting,
    isSyncing,
    
    // Integration functions
    connectGoogleCalendar,
    connectOutlookCalendar,
    connectAppleCalendar,
    disconnectIntegration,
    toggleSync,
    
    // Event functions
    getEventsForDate,
    getEventsForDateRange,
    addManualEvent,
    updateEvent,
    deleteEvent,
    
    // Scraping functions
    scrapeCalendarData,
    detectEventsFromText,
    
    // Sync functions
    syncAllCalendars,
    
    // Utility functions
    refreshData,
    clearAllData,
  };
});

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  return (
    <CalendarContextProviderComponent>
      {children}
    </CalendarContextProviderComponent>
  );
}