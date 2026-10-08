import { useState } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, FormField, Screen } from '@/components';
import { useAuth } from '@/services/auth/AuthProvider';
import { urls } from '@/services/config';
import { requestJson } from '@/services/http';
import { spacing } from '@/theme';
export default function EditProfile() {
  const { user, token, refresh, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [v, setV] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address1: user?.billing?.address1 ?? '',
    city: user?.billing?.city ?? '',
    postcode: user?.billing?.postcode ?? '',
    state: user?.billing?.state ?? '',
    country: user?.billing?.country ?? '',
  });
  const set = (k: keyof typeof v) => (x: string) => setV({ ...v, [k]: x });
  if (!user)
    return (
      <Screen title="Edit Profile">
        <Text>Please log in first.</Text>
      </Screen>
    );
  return (
    <Screen title="Edit Profile">
      <View style={{ gap: spacing.md }}>
        {Object.entries(v).map(([k, value]) => (
          <FormField
            key={k}
            label={k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
            value={value}
            onChangeText={set(k as keyof typeof v)}
          />
        ))}
        {v.email.trim().toLowerCase() !== user.email.trim().toLowerCase() ? (
          <FormField
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            textContentType="password"
            autoCapitalize="none"
            helperText="Required to securely change your account email."
          />
        ) : null}
        <Button
          label="Save Changes"
          onPress={async () => {
            const emailChanged = v.email.trim().toLowerCase() !== user.email.trim().toLowerCase();
            await requestJson(`${urls.mobile}/profile`, {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${token}` },
              body: JSON.stringify({ ...v, currentPassword }),
            });
            if (emailChanged) {
              await logout();
              router.replace('/auth/login');
              return;
            }
            await refresh();
          }}
        />
      </View>
    </Screen>
  );
}
