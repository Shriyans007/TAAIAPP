import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import type { ColorValue } from 'react-native';
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
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.68)',
        tabBarStyle: {
          height: 68,
          paddingBottom: 8,
          paddingTop: 7,
          borderTopColor: colors.primary,
          backgroundColor: colors.primary,
        },
        tabBarLabelStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="events" options={{ title: 'Events', tabBarIcon: icon('calendar') }} />
      <Tabs.Screen
        name="initiatives"
        options={{ title: 'Initiatives', tabBarIcon: icon('star-outline') }}
      />
      <Tabs.Screen
        name="directory"
        options={{ title: 'Directory', tabBarIcon: icon('search-circle-outline') }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person') }} />
      <Tabs.Screen name="gallery" options={{ href: null }} />
      <Tabs.Screen name="membership" options={{ href: null }} />
    </Tabs>
  );
}
