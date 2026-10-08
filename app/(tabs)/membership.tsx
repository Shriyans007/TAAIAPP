import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Button, ErrorState, LoadingState, Screen } from '@/components';
import { useAuth } from '@/services/auth/AuthProvider';
import { urls } from '@/services/config';
import { getMembership } from '@/services/mobile/membership';
import { colors, radius, shadows, spacing } from '@/theme';

const ACTIVE_STATUSES = ['active', 'pending-cancel'];

function formatDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function Membership() {
  const { token, user } = useAuth();
  const q = useQuery({
    queryKey: ['membership', user?.id],
    enabled: !!token,
    meta: { authRequired: true },
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: () => getMembership(token!),
  });

  if (!token)
    return (
      <Screen title="Membership">
        <Text style={s.loggedOut}>
          Log in with your existing TAAI account to see membership details.
        </Text>
        <Button label="Log In" onPress={() => router.push('/auth/login')} />
      </Screen>
    );

  return (
    <Screen title="My Membership" refreshing={q.isRefetching} onRefresh={() => q.refetch()}>
      {q.isLoading ? (
        <LoadingState label="Loading your membership…" />
      ) : q.isError ? (
        <ErrorState
          message={q.error instanceof Error ? q.error.message : 'Membership could not be loaded.'}
          retry={q.refetch}
        />
      ) : q.data?.membershipType ? (
        <View style={s.content}>
          <View style={s.digitalCard}>
            <View style={s.patternOne} />
            <View style={s.patternTwo} />
            <View style={s.brandRow}>
              <Image
                accessibilityIgnoresInvertColors
                source={require('@/assets/branding/taai-round-logo.png')}
                style={s.logo}
              />
              <View>
                <Text style={s.brand}>TAAI</Text>
                <Text style={s.organisation}>Telugu Association of Australia Inc.</Text>
              </View>
            </View>
            <View style={s.goldRule} />
            <Text style={s.membershipType}>{q.data.membershipType.toUpperCase()}</Text>
            <Text style={s.memberName}>{user?.displayName ?? 'TAAI Member'}</Text>
            <View
              style={[
                s.statusBadge,
                !ACTIVE_STATUSES.includes(q.data.status) && s.statusBadgeInactive,
              ]}
            >
              <View
                style={[
                  s.statusDot,
                  !ACTIVE_STATUSES.includes(q.data.status) && s.statusDotInactive,
                ]}
              />
              <Text style={s.statusText}>{q.data.status.replaceAll('-', ' ').toUpperCase()}</Text>
            </View>
          </View>

          <View style={s.details}>
            {q.data.startDate ? (
              <DetailRow
                icon="calendar-outline"
                label="Member since"
                value={formatDate(q.data.startDate)!}
              />
            ) : null}
            {q.data.nextPayment ? (
              <DetailRow
                icon="refresh-outline"
                label="Next renewal"
                value={formatDate(q.data.nextPayment)!}
              />
            ) : null}
            {q.data.endDate ? (
              <DetailRow
                icon="time-outline"
                label="Membership end date"
                value={formatDate(q.data.endDate)!}
              />
            ) : null}
            <DetailRow
              icon="shield-checkmark-outline"
              label="Membership status"
              value={q.data.status.replaceAll('-', ' ')}
              success={ACTIVE_STATUSES.includes(q.data.status)}
              last
            />
          </View>

          {q.data.manageUrl ? (
            <Button
              label="Manage Membership"
              onPress={() => WebBrowser.openBrowserAsync(q.data!.manageUrl!)}
            />
          ) : null}
          <Button
            label="View Membership Options"
            variant="outline"
            onPress={() =>
              WebBrowser.openBrowserAsync(`${urls.wordpress}/product-category/memberships/`)
            }
          />
          <Text style={s.note}>
            This digital card reflects the membership currently recorded in your TAAI account.
          </Text>
        </View>
      ) : (
        <View style={s.noMembership}>
          <Ionicons name="card-outline" size={42} color={colors.primary} />
          <Text style={s.noMembershipTitle}>No current membership</Text>
          <Text style={s.noMembershipText}>
            View the available TAAI membership options on the website.
          </Text>
          <Button
            label="View Membership Options"
            onPress={() =>
              WebBrowser.openBrowserAsync(`${urls.wordpress}/product-category/memberships/`)
            }
          />
        </View>
      )}
    </Screen>
  );
}

function DetailRow({
  icon,
  label,
  value,
  success = false,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  success?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[s.detailRow, last && s.detailRowLast]}>
      <Ionicons name={icon} size={23} color={colors.primary} />
      <View style={s.detailCopy}>
        <Text style={s.detailLabel}>{label}</Text>
        <Text style={[s.detailValue, success && s.detailSuccess]}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  loggedOut: { color: colors.textSecondary, lineHeight: 22 },
  content: { gap: spacing.md },
  digitalCard: {
    minHeight: 290,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    overflow: 'hidden',
    ...shadows.card,
  },
  patternOne: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderWidth: 22,
    borderColor: 'rgba(201,150,26,0.12)',
    borderRadius: 36,
    right: -70,
    top: -25,
    transform: [{ rotate: '45deg' }],
  },
  patternTwo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderWidth: 14,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 28,
    right: -42,
    bottom: -55,
    transform: [{ rotate: '45deg' }],
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logo: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.surface },
  brand: { color: colors.secondary, fontSize: 25, fontWeight: '900', letterSpacing: 1 },
  organisation: { color: '#E6CBD1', fontSize: 10, marginTop: 2 },
  goldRule: {
    width: 80,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.secondary,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  membershipType: { color: colors.secondary, fontSize: 25, fontWeight: '900' },
  memberName: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: spacing.sm },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: spacing.lg,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(47,125,74,0.78)',
  },
  statusBadgeInactive: { backgroundColor: 'rgba(180,35,24,0.78)' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#63D685' },
  statusDotInactive: { backgroundColor: '#FFB4AB' },
  statusText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  details: {
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  detailRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailCopy: { flex: 1, gap: 3 },
  detailLabel: { color: colors.textMuted, fontSize: 12 },
  detailValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  detailSuccess: { color: colors.success },
  note: { color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  noMembership: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  noMembershipTitle: { color: colors.textPrimary, fontSize: 19, fontWeight: '800' },
  noMembershipText: { color: colors.textSecondary, textAlign: 'center', lineHeight: 21 },
});
