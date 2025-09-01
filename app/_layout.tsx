import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
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
        backgroundColor: '#0A0A0A',
      },
      headerTintColor: '#FFFFFF',
      contentStyle: {
        backgroundColor: '#0A0A0A'
      }
    }}>
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
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ChronaProvider>
          <StatusBar style="light" />
          <RootLayoutNav />
        </ChronaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}