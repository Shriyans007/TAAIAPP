import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { Button, FormField, Screen } from '@/components';
import { useAuth } from '@/services/auth/AuthProvider';
import { urls } from '@/services/config';
import { requestJson } from '@/services/http';
import { colors, spacing } from '@/theme';
export default function Settings() {
  const { token, logout } = useAuth();
  const [password, setPassword] = useState('');
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
