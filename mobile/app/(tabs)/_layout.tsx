import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 3,
          borderTopColor: '#000',
          height: 90,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Courier', // Will replace with project font later
          fontWeight: '900',
          fontSize: 10,
          textTransform: 'uppercase',
          marginTop: 4,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pets',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="vetbook"
        options={{
          title: 'VetBook',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="map.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="chatbot"
        options={{
          title: 'Ask AI',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="bubble.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
