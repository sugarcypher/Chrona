import { Tabs } from "expo-router";
import { Activity, BarChart3, Brain, Clock, Settings, Calendar } from "lucide-react-native";
import React from "react";
import { Platform, View } from "react-native";
import GlyphHeader from '@/components/ui/GlyphHeader';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#78716C',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F5F5F4',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.1,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2,
          borderBottomWidth: 0,
        },
        headerTintColor: '#1C1917',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 24,
          letterSpacing: -0.5,
          color: '#1C1917',
        },
        headerShadowVisible: false,
        headerTitle: () => (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <GlyphHeader />
          </View>
        ),
      }}
    >

      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => <Calendar size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="metrology"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color }) => <BarChart3 size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="flow"
        options={{
          title: "Team",
          tabBarIcon: ({ color }) => <Activity size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mindset"
        options={{
          title: "Compliance",
          tabBarIcon: ({ color }) => <Brain size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}