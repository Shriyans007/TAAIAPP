import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader, Button, MenuList, Screen, SectionTitle } from '@/components';
import { useAuth } from '@/services/auth/AuthProvider';
import { urls } from '@/services/config';
import { getMembership } from '@/services/mobile/membership';
import { colors, radius, spacing } from '@/theme';

export default function Profile() {
  const { user, token, logout, loading } = useAuth();
  const membership = useQuery({
    queryKey: ['membership'],
    enabled: !!token,
    queryFn: () => getMembership(token!),
  });
  if (loading)
    return (
      <Screen title="Profile">
        <Text>Restoring session…</Text>
      </Screen>
    );
  if (!user)
    return (
      <Screen title="Profile">
        <Text style={s.loggedOut}>
          Log in with the same account you use on the TAAI website to access your profile,
          membership and member discounts.
        </Text>
        <Button label="Log In" onPress={() => router.push('/auth/login')} />
      </Screen>
    );
  const initials =
    `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` || user.displayName.slice(0, 2);
  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.scroll}>
        <AppHeader
          title={user.displayName}
          subtitle={user.email}
          initials={initials.toUpperCase()}
          onProfilePress={() => router.push('/profile/edit')}
        />
        <View style={s.body}>
          <Pressable onPress={() => router.push('/(tabs)/membership')} style={s.memberCard}>
            <Text style={s.memberType}>{membership.data?.membershipType ?? 'TAAI Membership'}</Text>
            <Text style={s.memberStatus}>
              {membership.isLoading
                ? 'Checking status…'
                : (membership.data?.status ?? 'No current membership').replaceAll('-', ' ')}
            </Text>
          </Pressable>
          <SectionTitle>ACCOUNT</SectionTitle>
          <MenuList
            items={[
              {
                label: 'Edit Profile',
                icon: 'create-outline',
                onPress: () => router.push('/profile/edit'),
              },
              {
                label: 'My Membership',
                icon: 'card-outline',
                value: membership.data?.status?.replaceAll('-', ' '),
                onPress: () => router.push('/(tabs)/membership'),
              },
              {
                label: 'Member Discounts',
                icon: 'pricetag-outline',
                onPress: () => router.push('/(tabs)/directory'),
              },
              {
                label: 'Gallery',
                icon: 'images-outline',
                onPress: () => router.push('/(tabs)/gallery'),
              },
            ]}
          />
          <SectionTitle>PREFERENCES</SectionTitle>
          <MenuList
            items={[
              {
                label: 'Notification Settings',
                icon: 'notifications-outline',
                onPress: () => router.push('/profile/notifications'),
              },
              {
                label: 'Account Settings',
                icon: 'settings-outline',
                onPress: () => router.push('/profile/settings'),
              },
            ]}
          />
          <SectionTitle>SUPPORT</SectionTitle>
          <MenuList
            items={[
              {
                label: 'Contact TAAI',
                icon: 'mail-outline',
                onPress: () => WebBrowser.openBrowserAsync(`${urls.wordpress}/contact-us/`),
              },
              {
                label: 'Privacy Policy',
                icon: 'document-text-outline',
                onPress: () => WebBrowser.openBrowserAsync(`${urls.wordpress}/privacy-policy/`),
              },
            ]}
          />
          <Pressable onPress={logout} style={s.logout}>
            <Text style={s.logoutText}>Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 90 },
  body: { padding: spacing.xl, gap: spacing.md },
  loggedOut: { color: colors.textSecondary, lineHeight: 22 },
  memberCard: {
    backgroundColor: colors.goldSurface,
    borderColor: colors.goldBorder,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  memberType: { color: colors.primaryDark, fontWeight: '800', fontSize: 17 },
  memberStatus: { color: colors.success, textTransform: 'capitalize', marginTop: 4 },
  logout: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E3D5D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  logoutText: { color: colors.error, fontWeight: '700' },
});
