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
  ['Gallery', 'images-outline', '/(tabs)/gallery'],
  ['Initiatives', 'star-outline', '/(tabs)/initiatives'],
  ['Directory', 'storefront-outline', '/(tabs)/directory'],
  ['Profile', 'person-outline', '/(tabs)/profile'],
] as const;

const ACTIVE_MEMBERSHIP_STATUSES = ['active', 'pending-cancel'];

function formatMembershipDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default function Home() {
  const { user, token } = useAuth();
  const membership = useQuery({
    queryKey: ['membership', user?.id],
    enabled: !!token,
    meta: { authRequired: true },
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
  const membershipStatus = membership.data?.status ?? 'none';
  const isActiveMembership = ACTIVE_MEMBERSHIP_STATUSES.includes(membershipStatus);
  const membershipDestination = token
    ? '/(tabs)/membership'
    : '/auth/login?returnTo=/(tabs)/membership';
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl
            refreshing={events.isRefetching || membership.isRefetching}
            onRefresh={() => {
              events.refetch();
              if (token) membership.refetch();
            }}
            tintColor={colors.white}
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
          profileImageUrl={user?.avatarUrl}
          onProfilePress={() => router.push('/(tabs)/profile')}
        />
        <View style={s.mainContent}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View membership card"
            onPress={() => router.push(membershipDestination)}
            style={s.membership}
          >
            <View style={s.memberAccent} />
            <View style={s.memberIcon}>
              <Ionicons name="people" size={30} color={colors.white} />
            </View>
            <View style={s.memberContent}>
              <View style={s.memberTopRow}>
                <View style={s.memberTitleCopy}>
                  <Text style={s.memberLabel}>MEMBERSHIP STATUS</Text>
                  <Text numberOfLines={2} style={s.memberValue}>
                    {!user
                      ? 'TAAI Membership'
                      : membership.isLoading
                        ? 'Checking membership…'
                        : (membership.data?.membershipType ?? 'No current membership')}
                  </Text>
                </View>
                {!membership.isLoading ? (
                  <View style={[s.statusBadge, !isActiveMembership && s.statusBadgeInactive]}>
                    <View style={[s.statusDot, !isActiveMembership && s.statusDotInactive]} />
                    <Text style={[s.statusText, !isActiveMembership && s.statusTextInactive]}>
                      {user ? membershipStatus.replaceAll('-', ' ') : 'Log in'}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={s.memberDivider} />
              <View style={s.memberBottomRow}>
                {membership.data?.startDate ? (
                  <View style={s.memberMeta}>
                    <Ionicons name="calendar-outline" size={22} color={colors.primary} />
                    <View>
                      <Text style={s.memberMetaLabel}>Member since</Text>
                      <Text style={s.memberMetaValue}>
                        {formatMembershipDate(membership.data.startDate)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={s.memberMetaSpacer} />
                )}
                <View style={s.memberBottomDivider} />
                <View style={s.viewCard}>
                  <Ionicons name="id-card-outline" size={24} color={colors.primary} />
                  <Text style={s.viewCardText}>View card</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                </View>
              </View>
            </View>
          </Pressable>
          <SectionHeading title="QUICK ACCESS" />
          <View style={s.grid}>
            {quickLinks.map(([label, icon, href]) => (
              <Pressable
                key={label}
                accessibilityRole="button"
                accessibilityLabel={label}
                onPress={() => router.push(href)}
                style={s.quick}
              >
                <Ionicons name={icon} size={31} color={colors.primary} />
                <Text style={s.quickLabel}>{label}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
          <SectionHeading
            title="FEATURED EVENT"
            action="View All"
            onPress={() => router.push('/(tabs)/events')}
          />
          <View style={s.featuredContent}>
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
              <EmptyState icon="calendar-outline" message="No current events are available." />
            )}
          </View>
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
  safe: { flex: 1, backgroundColor: colors.primary },
  scroll: { backgroundColor: colors.primary },
  content: { paddingBottom: 0 },
  mainContent: { paddingBottom: 98, gap: spacing.lg, backgroundColor: colors.background },
  membership: {
    marginHorizontal: spacing.xl,
    marginTop: -54,
    minHeight: 168,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    overflow: 'hidden',
    ...shadows.floating,
  },
  memberAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 7,
    backgroundColor: colors.primary,
  },
  memberIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberContent: { flex: 1, alignSelf: 'stretch', justifyContent: 'center' },
  memberTopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  memberTitleCopy: { flex: 1, gap: 3 },
  memberLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
  memberValue: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: '#E0F4E5',
  },
  statusBadgeInactive: { backgroundColor: colors.surfaceMuted },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  statusDotInactive: { backgroundColor: colors.textMuted },
  statusText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  statusTextInactive: { color: colors.textSecondary },
  memberDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  memberBottomRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center' },
  memberMeta: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  memberMetaSpacer: { flex: 1 },
  memberMetaLabel: { color: colors.textSecondary, fontSize: 11 },
  memberMetaValue: { color: colors.primaryDark, fontSize: 13, fontWeight: '800', marginTop: 2 },
  memberBottomDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#DCC7CC',
    marginHorizontal: spacing.sm,
  },
  viewCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  viewCardText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  headingRow: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: { color: colors.primaryDark, fontWeight: '800', letterSpacing: 0.8 },
  headingAction: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  grid: {
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quick: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 78,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.card,
  },
  quickLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.primary,
    fontWeight: '700',
  },
  featuredContent: { marginHorizontal: spacing.xl },
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
