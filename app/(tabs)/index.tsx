import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Screen, SectionTitle } from '@/components';
import { useAuth } from '@/services/auth/AuthProvider';
import { getMembership } from '@/services/mobile/membership';
import { colors, radius, spacing } from '@/theme';
const links = [
  ['Events', 'calendar', '/(tabs)/events'],
  ['Membership', 'card', '/(tabs)/membership'],
  ['Gallery', 'images', '/(tabs)/gallery'],
  ['Profile', 'person', '/(tabs)/profile'],
] as const;
export default function Home() {
  const { user, token } = useAuth();
  const membership = useQuery({
    queryKey: ['membership'],
    enabled: !!token,
    staleTime: 0,
    queryFn: () => getMembership(token!),
  });
  return (
    <Screen title={`Namaskaram${user?.firstName ? `, ${user.firstName}` : ''} 👋`}>
      <View style={s.hero}>
        <Text style={s.telugu}>నమస్కారం</Text>
        <Text style={s.heroTitle}>Telugu Association of Australia</Text>
        <Text style={s.heroText}>Bringing Telugu families together in Victoria since 1992.</Text>
      </View>
      {user && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View membership details"
          onPress={() => router.push('/(tabs)/membership')}
        >
          <Card>
            <View style={s.membershipRow}>
              <View style={s.membershipIcon}>
                <Ionicons name="card" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.membershipLabel}>Membership Status</Text>
                <Text style={s.membershipValue}>
                  {membership.isLoading
                    ? 'Checking membership…'
                    : membership.isError
                      ? 'Unable to load membership'
                      : `${membership.data?.membershipType ?? 'No current membership'} · ${(
                          membership.data?.status ?? 'none'
                        ).replaceAll('-', ' ')}`}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </Card>
        </Pressable>
      )}
      <SectionTitle>Quick Access</SectionTitle>
      <View style={s.grid}>
        {links.map(([label, icon, href]) => (
          <Pressable
            key={label}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => router.push(href)}
            style={s.quick}
          >
            <View style={s.icon}>
              <Ionicons name={icon} size={24} color={colors.primary} />
            </View>
            <Text style={s.quickLabel}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <SectionTitle>Welcome to TAAI</SectionTitle>
      <Card>
        <Text style={s.body}>
          TAAI supports Telugu language, culture, community connection and welfare across Melbourne
          and Victoria.
        </Text>
      </Card>
      <SectionTitle>TAAI Initiatives</SectionTitle>
      <View style={{ gap: spacing.sm }}>
        {[
          'Aksharajyothi',
          'TAAI Youth',
          'Telugu Business Network',
          'Community Connect',
          'TAAI Sports',
        ].map((x) => (
          <Card key={x}>
            <Text style={s.initiative}>{x}</Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
const s = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    overflow: 'hidden',
  },
  telugu: { color: colors.secondary, fontSize: 14 },
  heroTitle: { color: colors.white, fontSize: 22, fontWeight: '700', marginTop: 4 },
  heroText: { color: '#E2D5D8', fontSize: 13, lineHeight: 20, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  quick: {
    width: '47%',
    minHeight: 105,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.goldSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { color: colors.textPrimary, fontSize: 12, marginTop: 8, fontWeight: '500' },
  body: { color: colors.textSecondary, lineHeight: 22 },
  initiative: { fontWeight: '600', color: colors.primaryDark },
  membershipRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  membershipIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldSurface,
  },
  membershipLabel: { color: colors.textSecondary, fontSize: 12 },
  membershipValue: { color: colors.primaryDark, fontWeight: '600', textTransform: 'capitalize' },
});
