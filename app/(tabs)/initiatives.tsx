import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components';
import { urls } from '@/services/config';
import { colors, radius, shadows, spacing } from '@/theme';

const initiatives = [
  { label: 'Aksharajyothi', icon: 'book', path: '/aksharajyothi/' },
  { label: 'TAAI Youth', icon: 'sunny', path: '/taai-youth/' },
  { label: 'Telugu Business', icon: 'briefcase', path: '/telugu-business-network/' },
  { label: 'Community', icon: 'people', path: '/' },
] as const;

export default function Initiatives() {
  return (
    <Screen title="TAAI Initiatives">
      <Text style={s.intro}>
        Explore TAAI programs supporting Telugu language, culture, youth and community connection.
      </Text>
      <View style={s.grid}>
        {initiatives.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => WebBrowser.openBrowserAsync(`${urls.wordpress}${item.path}`)}
            style={s.card}
          >
            <View style={s.icon}>
              <Ionicons name={item.icon} size={26} color={colors.primary} />
            </View>
            <Text style={s.label}>{item.label}</Text>
            <Text style={s.link}>Learn more</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  intro: { color: colors.textSecondary, lineHeight: 21 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    width: '48%',
    minHeight: 154,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.goldSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: colors.primaryDark, fontWeight: '800', fontSize: 15 },
  link: { color: colors.accent, fontSize: 13 },
});
