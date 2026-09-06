import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components';
import { colors, radius, shadows, spacing } from '@/theme';

const initiatives = [
  {
    label: 'Aksharajyothi',
    summary: 'Telugu language education',
    icon: 'book',
    slug: 'aksharajyothi',
  },
  {
    label: 'ATCCC',
    summary: 'Telugu cultural and community centre',
    icon: 'business',
    slug: 'australia-telugu-cultural-community-centre-atccc',
  },
  {
    label: 'Benevolence Fund',
    summary: 'Community welfare support',
    icon: 'heart',
    slug: 'benevolence-fund',
  },
  {
    label: 'Community Connect',
    summary: 'Giving back to local communities',
    icon: 'people',
    slug: 'community-connect',
  },
  { label: 'Maitreya', summary: 'TAAI community initiative', icon: 'hand-left', slug: 'maitreya' },
  {
    label: 'TAAI Youth',
    summary: 'Programs for young community members',
    icon: 'sunny',
    slug: 'taai-youth',
  },
  {
    label: 'Telugu Business Network',
    summary: 'Supporting Telugu businesses',
    icon: 'briefcase',
    slug: 'telugu-business-network',
  },
  {
    label: 'TAAI Sports',
    summary: 'Community sport and participation',
    icon: 'football',
    slug: 'taai-sports',
  },
] as const;

export default function Initiatives() {
  return (
    <Screen title="TAAI Initiatives">
      <Text style={s.intro}>
        Explore TAAI programs supporting Telugu language, culture, welfare, youth and community
        connection across Victoria.
      </Text>
      <View style={s.list}>
        {initiatives.map((item, index) => (
          <Pressable
            key={item.slug}
            accessibilityRole="button"
            accessibilityLabel={`View ${item.label}`}
            onPress={() => router.push(`/initiatives/${item.slug}`)}
            style={s.card}
          >
            <View
              style={[
                s.icon,
                {
                  backgroundColor:
                    index % 3 === 0
                      ? colors.infoSurface
                      : index % 3 === 1
                        ? colors.goldSurface
                        : colors.greenSurface,
                },
              ]}
            >
              <Ionicons name={item.icon} size={25} color={colors.primary} />
            </View>
            <View style={s.copy}>
              <Text style={s.label}>{item.label}</Text>
              <Text style={s.summary}>{item.summary}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  intro: { color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.sm },
  list: { gap: spacing.md },
  card: {
    minHeight: 88,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.card,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 4 },
  label: { color: colors.textPrimary, fontWeight: '800', fontSize: 16 },
  summary: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
});
