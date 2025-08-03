import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { Bell, Camera, Droplets, Fish, Search, TrendingUp } from "lucide-react-native";
import React from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TabIconProps {
  color: string;
  size: number;
  focused: boolean;
}

const TabIcon = ({ children, focused }: { children: React.ReactNode; focused: boolean }) => {
  if (Platform.OS === 'web') {
    return (
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: focused ? '#2E7D8A' : 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ scale: focused ? 1.1 : 1 }],
        }}
      >
        {children}
      </View>
    );
  }

  return focused ? (
    <LinearGradient
      colors={['#2E7D8A', '#4A9EAB']}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ scale: 1.1 }],
        shadowColor: '#2E7D8A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      {children}
    </LinearGradient>
  ) : (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {children}
    </View>
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#8B9DC3',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : 12,
          paddingTop: 16,
          paddingHorizontal: 20,
          height: Platform.OS === 'ios' ? 92 + insets.bottom : 92,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 16,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 6,
          letterSpacing: 0.5,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Gallery",
          tabBarIcon: ({ color, size, focused }: TabIconProps) => (
            <TabIcon focused={focused}>
              <Fish color={focused ? '#FFFFFF' : color} size={focused ? 22 : size} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "Camera",
          tabBarIcon: ({ color, size, focused }: TabIconProps) => (
            <TabIcon focused={focused}>
              <Camera color={focused ? '#FFFFFF' : color} size={focused ? 22 : size} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="chart"
        options={{
          title: "Growth",
          tabBarIcon: ({ color, size, focused }: TabIconProps) => (
            <TabIcon focused={focused}>
              <TrendingUp color={focused ? '#FFFFFF' : color} size={focused ? 22 : size} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="water"
        options={{
          title: "Water",
          tabBarIcon: ({ color, size, focused }: TabIconProps) => (
            <TabIcon focused={focused}>
              <Droplets color={focused ? '#FFFFFF' : color} size={focused ? 22 : size} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="identify"
        options={{
          title: "Identify",
          tabBarIcon: ({ color, size, focused }: TabIconProps) => (
            <TabIcon focused={focused}>
              <Search color={focused ? '#FFFFFF' : color} size={focused ? 22 : size} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Reminders",
          tabBarIcon: ({ color, size, focused }: TabIconProps) => (
            <TabIcon focused={focused}>
              <Bell color={focused ? '#FFFFFF' : color} size={focused ? 22 : size} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}// Placeholder content for _layout.tsx
