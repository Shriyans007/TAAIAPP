import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { colors } from '@/theme';

const icon =
  (name: keyof typeof Ionicons.glyphMap) =>
  ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
  );
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.68)',
        tabBarActiveBackgroundColor: colors.primaryDark,
        tabBarStyle: {
          height: 68,
          paddingBottom: 8,
          paddingTop: 7,
          borderTopColor: colors.primary,
          backgroundColor: colors.primary,
        },
        tabBarItemStyle: { borderRadius: 12 },
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
