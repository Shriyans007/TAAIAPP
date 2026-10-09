import { useCallback, useState } from 'react';
import { router } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { Button, FormField, GoogleAuthButton, Screen } from '@/components';
import { useAuth } from '@/services/auth/AuthProvider';
import { urls } from '@/services/config';
import { requestJson } from '@/services/http';
import { colors, spacing } from '@/theme';
export default function Settings() {
  const { token, user, linkGoogle, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [googleMessage, setGoogleMessage] = useState('');
  const linkGoogleAccount = useCallback(
    async (idToken: string) => {
      await linkGoogle(idToken);
      setGoogleMessage('Google is now linked to your TAAI website account.');
    },
    [linkGoogle],
  );
  const erase = () =>
    Alert.alert(
      'Delete TAAI account?',
      'Your profile will be anonymised and login disabled. Financial transaction records may be retained where legally required.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            await requestJson(`${urls.mobile}/account`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
              body: JSON.stringify({ password }),
            });
            await logout();
            router.replace('/');
          },
        },
      ],
    );
  return (
    <Screen title="Account Settings">
      <View style={{ gap: spacing.lg }}>
        <Text style={{ fontWeight: '700', color: colors.primaryDark }}>Google Login</Text>
        <Text>
          {user?.googleLinked
            ? 'Google is linked to this TAAI website account. You can use Continue with Google next time.'
            : 'Link Google after signing in normally so future Google logins open this same TAAI website account.'}
        </Text>
        {!user?.googleLinked ? (
          <GoogleAuthButton
            label="Link Google Account"
            onIdToken={linkGoogleAccount}
            onError={setGoogleMessage}
          />
        ) : null}
        {!!googleMessage && (
          <Text style={{ color: user?.googleLinked ? colors.success : colors.error }}>
            {googleMessage}
          </Text>
        )}
        <View style={{ height: 1, backgroundColor: colors.border }} />
        <Text style={{ fontWeight: '700', color: colors.error }}>Delete Account</Text>
        <Text>
          Enter your current password, then confirm deletion. Administrator accounts cannot be
          deleted in the app.
        </Text>
        <FormField
          label="Current password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Button label="Delete Account" variant="danger" disabled={!password} onPress={erase} />
      </View>
    </Screen>
  );
}
