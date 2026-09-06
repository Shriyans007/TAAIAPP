import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import {
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppHeader, EmptyState, ErrorState, EventCard, LoadingState } from '@/components';
import { useAuth } from '@/services/auth/AuthProvider';
import { getMembership } from '@/services/mobile/membership';
import { getEvents } from '@/services/woocommerce/events';
import { colors, radius, shadows, spacing } from '@/theme';

const quickLinks = [
  ['Events', 'calendar-outline', '/(tabs)/events', colors.infoSurface],
  ['Membership', 'card-outline', '/(tabs)/membership', colors.goldSurface],
  ['Gallery', 'images-outline', '/(tabs)/gallery', colors.lilacSurface],
  ['Initiatives', 'star-outline', '/(tabs)/initiatives', colors.greenSurface],
  ['Directory', 'storefront-outline', '/(tabs)/directory', colors.infoSurface],
  ['Profile', 'person-outline', '/(tabs)/profile', colors.roseSurface],
] as const;

export default function Home() {
  const { user, token } = useAuth();
  const membership = useQuery({
    queryKey: ['membership'],
    enabled: !!token,
    staleTime: 0,
    queryFn: () => getMembership(token!),
  });
  const events = useQuery({
    queryKey: ['events'],
    queryFn: ({ signal }) => getEvents(signal),
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` || user.displayName.slice(0, 2)
    : undefined;
  const status = membership.data?.status?.replaceAll('-', ' ') ?? 'No current membership';
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl
            refreshing={events.isRefetching || membership.isRefetching}
            onRefresh={() => {
              events.refetch();
              if (token) membership.refetch();
            }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <AppHeader
          eyebrow="నమస్కారం"
          title={`Namaskaram${user?.firstName ? `, ${user.firstName}` : ''} 👋`}
          subtitle={
            user ? 'Welcome back to your TAAI community.' : 'Telugu Association of Australia Inc.'
          }
          initials={initials?.toUpperCase()}
          onProfilePress={() => router.push('/(tabs)/profile')}
        />
        {user ? (
          <Pressable onPress={() => router.push('/(tabs)/membership')} style={s.membership}>
            <View style={s.memberIcon}>
              <Ionicons name="card" size={22} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.memberLabel}>Membership Status</Text>
              <Text style={s.memberValue}>
                {membership.isLoading
                  ? 'Checking membership…'
                  : `${membership.data?.membershipType ?? 'Membership'} · ${status}`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color={colors.secondary} />
          </Pressable>
        ) : null}
        <SectionHeading title="QUICK ACCESS" />
        <View style={s.grid}>
          {quickLinks.map(([label, icon, href, background]) => (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => router.push(href)}
              style={s.quick}
            >
              <View style={[s.quickIcon, { backgroundColor: background }]}>
                <Ionicons name={icon} size={24} color={colors.primary} />
              </View>
              <Text style={s.quickLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <SectionHeading
          title="FEATURED EVENT"
          action="View All"
          onPress={() => router.push('/(tabs)/events')}
        />
        {events.isLoading ? (
          <LoadingState label="Loading featured event…" />
        ) : events.isError ? (
          <ErrorState message="Featured event could not be loaded." retry={events.refetch} />
        ) : events.data?.[0] ? (
          <EventCard
            event={events.data[0]}
            onPress={() => router.push(`/events/${events.data![0].id}`)}
          />
        ) : (
          <EmptyState message="No current events are available." />
        )}
        <SectionHeading
          title="TAAI INITIATIVES"
          action="See All"
          onPress={() => router.push('/(tabs)/initiatives')}
        />
        <View style={s.initiatives}>
          {[
            ['Aksharajyothi', 'book'],
            ['TAAI Youth', 'sunny'],
            ['Telugu Business', 'briefcase'],
          ].map(([label, icon]) => (
            <Pressable
              key={label}
              onPress={() => router.push('/(tabs)/initiatives')}
              style={s.initiative}
            >
              <View style={s.initiativeIcon}>
                <Ionicons
                  name={icon as keyof typeof Ionicons.glyphMap}
                  size={23}
                  color={colors.secondary}
                />
              </View>
              <Text style={s.initiativeLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeading({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={s.headingRow}>
      <Text style={s.heading}>{title}</Text>
      {action ? (
        <Pressable onPress={onPress}>
          <Text style={s.headingAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 98, gap: spacing.lg },
  membership: {
    marginHorizontal: spacing.xl,
    marginTop: -58,
    minHeight: 68,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(201,150,26,0.6)',
    backgroundColor: colors.burgundySurface,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  memberIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    backgroundColor: colors.goldSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberLabel: { color: '#E6CBD1', fontSize: 11 },
  memberValue: {
    color: colors.secondary,
    fontWeight: '800',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  headingRow: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: { color: colors.primaryDark, fontWeight: '800', letterSpacing: 0.8 },
  headingAction: { color: colors.accent, fontSize: 13 },
  grid: { paddingHorizontal: spacing.xl, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  quick: {
    width: '30.8%',
    minHeight: 96,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    marginTop: spacing.sm,
    fontSize: 11,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  initiatives: { paddingHorizontal: spacing.xl, flexDirection: 'row', gap: spacing.md },
  initiative: {
    flex: 1,
    minHeight: 105,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  initiativeIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.goldSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initiativeLabel: {
    marginTop: spacing.sm,
    color: colors.primaryDark,
    fontSize: 11,
    textAlign: 'center',
  },
});
