import { Ionicons } from '@expo/vector-icons';
import { Tabs, useFocusEffect, useSegments } from 'expo-router';
import { useCallback } from 'react';
import { StatusBar, View } from 'react-native';
import type { ColorValue } from 'react-native';
import { useAuth } from '@/services/auth/AuthProvider';
import { colors } from '@/theme';

const icon =
  (name: keyof typeof Ionicons.glyphMap) =>
  ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <View
      style={{
        width: 42,
        height: 34,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? 'rgba(255,255,255,0.16)' : colors.transparent,
      }}
    >
      <Ionicons name={name} color={color} size={size} />
    </View>
  );

const membershipIcon = ({ focused }: { focused: boolean }) => (
  <View
    style={{
      width: 52,
      height: 52,
      marginTop: -18,
      borderRadius: 26,
      borderWidth: focused ? 3 : 2,
      borderColor: focused ? colors.white : 'rgba(255,255,255,0.72)',
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primaryDeep,
      shadowOpacity: 0.2,
      shadowRadius: 7,
      shadowOffset: { width: 0, height: 3 },
      elevation: 6,
    }}
  >
    <Ionicons name="card" color={colors.white} size={25} />
  </View>
);

export default function TabLayout() {
  const segments = useSegments();
  const { user } = useAuth();
  const activeTab = segments.at(-1);
  const hasBurgundyHeader =
    activeTab === '(tabs)' || activeTab === 'index' || (activeTab === 'profile' && !!user);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(hasBurgundyHeader ? 'light-content' : 'dark-content', true);
    }, [hasBurgundyHeader]),
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.68)',
        tabBarStyle: {
          height: 74,
          paddingBottom: 8,
          paddingTop: 7,
          paddingHorizontal: 6,
          borderTopColor: colors.primary,
          backgroundColor: colors.primary,
        },
        tabBarLabelStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="events" options={{ title: 'Events', tabBarIcon: icon('calendar') }} />
      <Tabs.Screen
        name="membership"
        options={{
          title: 'My Card',
          tabBarIcon: membershipIcon,
          tabBarLabelStyle: { fontWeight: '700', marginTop: 4 },
        }}
      />
      <Tabs.Screen name="initiatives" options={{ href: null }} />
      <Tabs.Screen
        name="directory"
        options={{ title: 'Directory', tabBarIcon: icon('storefront-outline') }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person') }} />
      <Tabs.Screen name="gallery" options={{ href: null }} />
    </Tabs>
  );
}
