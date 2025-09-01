import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ChronaProvider } from "@/providers/ChronaProvider";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: '#FAFAFA',
      },
      headerTintColor: '#1F2937',
      headerTitleStyle: {
        fontWeight: '600',
        fontSize: 18,
      },
      contentStyle: {
        backgroundColor: '#FAFAFA'
      }
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="nudge-ledger" 
        options={{ 
          title: "Nudge Ledger",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="task-detail" 
        options={{ 
          title: "Task Configuration",
          presentation: "modal"
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
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="security-settings" 
        options={{ 
          title: "Security Settings",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="calendar-view" 
        options={{ 
          title: "Calendar View",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="itinerary-planner" 
        options={{ 
          title: "Itinerary Planner",
          presentation: "modal"
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
          <StatusBar style="dark" />
          <RootLayoutNav />
        </ChronaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}