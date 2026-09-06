import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMemo, useState } from 'react';
import { Button, EmptyState, ErrorState, LoadingState, Screen } from '@/components';
import { useAuth } from '@/services/auth/AuthProvider';
import { getMemberDirectory } from '@/services/mobile/directory';
import { colors, radius, shadows, spacing } from '@/theme';
import type { DirectoryBusiness } from '@/types/directory';

export default function Directory() {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const q = useQuery({
    queryKey: ['member-directory'],
    enabled: !!token,
    queryFn: ({ signal }) => getMemberDirectory(token!, signal),
  });
  const businesses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return q.data?.businesses ?? [];
    return (q.data?.businesses ?? []).filter((business) =>
      [business.name, business.category, business.description, business.discount]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [q.data, search]);

  if (!token) {
    return (
      <Screen title="Member Discounts">
        <AccessCard
          title="TAAI members only"
          message="Log in with your existing TAAI account to access participating businesses and member discounts."
          action="Log In"
          onPress={() => router.push('/auth/login?returnTo=/(tabs)/directory')}
        />
      </Screen>
    );
  }

  return (
    <Screen title="Member Discounts">
      <Text style={s.subtitle}>
        Discounts from participating businesses for eligible TAAI members.
      </Text>
      {q.isLoading ? <LoadingState label="Checking membership and loading discounts…" /> : null}
      {q.isError ? (
        <AccessCard
          title="Active membership required"
          message="This directory is available to active TAAI members. Check your membership status or renew to access member discounts."
          action="View Membership"
          onPress={() => router.push('/(tabs)/membership')}
        />
      ) : null}
      {q.data ? (
        <>
          <View style={s.notice}>
            <Ionicons name="card" size={24} color={colors.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={s.noticeTitle}>Show your TAAI membership</Text>
              <Text style={s.noticeText}>{q.data.instructions}</Text>
            </View>
          </View>
          <View style={s.search}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              accessibilityLabel="Search member discount businesses"
              value={search}
              onChangeText={setSearch}
              placeholder="Search businesses or services…"
              placeholderTextColor={colors.textMuted}
              style={s.input}
            />
          </View>
          {!businesses.length ? (
            <EmptyState
              message={
                search
                  ? 'No businesses match your search.'
                  : 'No member discounts have been published yet.'
              }
            />
          ) : (
            <View style={{ gap: spacing.md }}>
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </View>
          )}
        </>
      ) : null}
    </Screen>
  );
}

function AccessCard({
  title,
  message,
  action,
  onPress,
}: {
  title: string;
  message: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View style={s.access}>
      <View style={s.lock}>
        <Ionicons name="lock-closed" size={26} color={colors.secondary} />
      </View>
      <Text style={s.accessTitle}>{title}</Text>
      <Text style={s.accessText}>{message}</Text>
      <Button label={action} onPress={onPress} />
    </View>
  );
}

function BusinessCard({ business }: { business: DirectoryBusiness }) {
  return (
    <View style={s.business}>
      <View style={s.businessIcon}>
        <Ionicons name="storefront" size={23} color={colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={s.businessName}>{business.name}</Text>
        <Text style={s.category}>
          {business.category}
          {business.address ? ` · ${business.address}` : ''}
        </Text>
        {business.description ? <Text style={s.description}>{business.description}</Text> : null}
        <View style={s.discount}>
          <Ionicons name="pricetag" size={14} color={colors.primary} />
          <Text style={s.discountText}>{business.discount}</Text>
        </View>
        <View style={s.actions}>
          {business.phone ? (
            <Pressable onPress={() => Linking.openURL(`tel:${business.phone}`)}>
              <Text style={s.action}>Call</Text>
            </Pressable>
          ) : null}
          {business.directionsUrl ? (
            <Pressable onPress={() => WebBrowser.openBrowserAsync(business.directionsUrl!)}>
              <Text style={s.action}>Directions</Text>
            </Pressable>
          ) : null}
          {business.website ? (
            <Pressable onPress={() => WebBrowser.openBrowserAsync(business.website!)}>
              <Text style={s.action}>Website</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  subtitle: { color: colors.textSecondary, marginTop: -spacing.sm },
  access: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.card,
  },
  lock: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.goldSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessTitle: { color: colors.primaryDark, fontSize: 20, fontWeight: '800' },
  accessText: { color: colors.textSecondary, lineHeight: 21, textAlign: 'center' },
  notice: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.goldSurface,
    borderColor: colors.goldBorder,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  noticeTitle: { color: colors.primaryDark, fontWeight: '800', marginBottom: 3 },
  noticeText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  search: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E3D5D8',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
  },
  input: { flex: 1, color: colors.textPrimary, fontSize: 15 },
  business: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  businessIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessName: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
  category: { color: colors.textMuted, fontSize: 12 },
  description: { color: colors.textSecondary, lineHeight: 19, fontSize: 13 },
  discount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.goldSurface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: 3,
  },
  discountText: { color: colors.primaryDark, fontWeight: '700', fontSize: 13, flex: 1 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.lg, marginTop: 4 },
  action: { color: colors.accent, fontWeight: '700', fontSize: 13 },
});
