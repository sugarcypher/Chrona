import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ChronaProvider } from "@/providers/ChronaProvider";
import { CalendarProvider } from "@/providers/CalendarProvider";
import { StatusBar } from "expo-status-bar";
import GlyphHeader from '@/components/ui/GlyphHeader';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      } as any,
      headerTintColor: '#1C1917',
      headerTitleStyle: {
        fontWeight: '700',
        fontSize: 20,
        letterSpacing: -0.4,
        color: '#1C1917',
      },
      contentStyle: {
        backgroundColor: '#FAFAF9'
      },
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="nudge-ledger" 
        options={{ 
          title: "Nudge Ledger",
          presentation: "modal",
          headerTitle: () => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <GlyphHeader />
            </View>
          ),
        }} 
      />
      <Stack.Screen 
        name="task-detail" 
        options={{ 
          title: "Task Configuration",
          presentation: "modal",
          headerTitle: () => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <GlyphHeader />
            </View>
          ),
        }} 
      />
      <Stack.Screen 
        name="daily-glyph" 
        options={{ 
          title: "Daily Glyph",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="privacy-dashboard" 
        options={{ 
          title: "Privacy Dashboard",
          presentation: "modal",
          headerTitle: () => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <GlyphHeader />
            </View>
          ),
        }} 
      />
      <Stack.Screen 
        name="security-settings" 
        options={{ 
          title: "Security Settings",
          presentation: "modal",
          headerTitle: () => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <GlyphHeader />
            </View>
          ),
        }} 
      />
      <Stack.Screen 
        name="calendar-view" 
        options={{ 
          title: "Calendar View",
          presentation: "modal",
          headerTitle: () => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <GlyphHeader />
            </View>
          ),
        }} 
      />
      <Stack.Screen 
        name="itinerary-planner" 
        options={{ 
          title: "Itinerary Planner",
          presentation: "modal",
          headerTitle: () => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <GlyphHeader />
            </View>
          ),
        }} 
      />
      <Stack.Screen 
        name="calendar-integrations" 
        options={{ 
          title: "Calendar Integration",
          presentation: "modal",
          headerTitle: () => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <GlyphHeader />
            </View>
          ),
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Keep splash screen visible while we prepare
        await SplashScreen.preventAutoHideAsync();
      } catch (error) {
        console.error('Error preventing splash screen:', error);
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ChronaProvider>
          <CalendarProvider>
            <StatusBar style="dark" />
            <RootLayoutNav />
          </CalendarProvider>
        </ChronaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}