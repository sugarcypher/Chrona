import { Tabs } from "expo-router";
import { Activity, BarChart3, Brain, Clock, Settings, Calendar } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0EA5E9',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 6,
          letterSpacing: 0.2,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 6,
          borderBottomWidth: 0,
        },
        headerTintColor: '#1F2937',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          letterSpacing: -0.4,
        },
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
          title: "Focus",
          tabBarIcon: ({ color }) => <Activity size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mindset"
        options={{
          title: "Wellness",
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