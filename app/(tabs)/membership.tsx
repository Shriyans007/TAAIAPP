import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Text, View } from 'react-native';
import { Button, Card, ErrorState, LoadingState, Screen } from '@/components';
import { useAuth } from '@/services/auth/AuthProvider';
import { urls } from '@/services/config';
import { getMembership } from '@/services/mobile/membership';
import { colors, spacing } from '@/theme';
export default function Membership() {
  const { token } = useAuth();
  const q = useQuery({
    queryKey: ['membership'],
    enabled: !!token,
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: () => getMembership(token!),
  });
  if (!token)
    return (
      <Screen title="Membership">
        <Text>Log in with your existing TAAI account to see membership details.</Text>
        <Button label="Log In" onPress={() => router.push('/auth/login')} />
      </Screen>
    );
  return (
    <Screen title="My Membership">
      {q.isLoading ? (
        <LoadingState />
      ) : q.isError ? (
        <ErrorState
          message={q.error instanceof Error ? q.error.message : 'Membership could not be loaded.'}
          retry={q.refetch}
        />
      ) : (
        <Card>
          <View style={{ gap: spacing.md }}>
            <Text
              style={{
                alignSelf: 'flex-start',
                backgroundColor: colors.goldSurface,
                color: colors.primary,
                fontWeight: '700',
                padding: 8,
              }}
            >
              {(q.data?.status ?? 'none').replaceAll('-', ' ').toUpperCase()}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.primaryDark }}>
              {q.data?.membershipType ?? 'No current membership'}
            </Text>
            {q.data?.startDate && <Text>Member since {q.data.startDate}</Text>}
            {q.data?.nextPayment && <Text>Next renewal {q.data.nextPayment}</Text>}
            {q.data?.manageUrl && (
              <Button
                label="Manage Membership"
                onPress={() => WebBrowser.openBrowserAsync(q.data!.manageUrl!)}
              />
            )}
            <Button
              label="View Membership Options"
              variant="outline"
              onPress={() =>
                WebBrowser.openBrowserAsync(`${urls.wordpress}/product-category/memberships/`)
              }
            />
          </View>
        </Card>
      )}
    </Screen>
  );
}
