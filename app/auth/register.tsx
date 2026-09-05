import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, FormField, Screen } from '@/components';
import { urls } from '@/services/config';
import { requestJson } from '@/services/http';
import { spacing } from '@/theme';
export default function Register() {
  const [v, setV] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [message, setMessage] = useState('');
  const set = (k: keyof typeof v) => (x: string) => setV({ ...v, [k]: x });
  return (
    <Screen title="Create Account">
      <View style={{ gap: spacing.md }}>
        <Text>This creates a real TAAI website/WooCommerce customer account.</Text>
        <FormField
          label="Username"
          value={v.username}
          onChangeText={set('username')}
          autoCapitalize="none"
        />
        <FormField
          label="Email"
          value={v.email}
          onChangeText={set('email')}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormField label="First name" value={v.firstName} onChangeText={set('firstName')} />
        <FormField label="Last name" value={v.lastName} onChangeText={set('lastName')} />
        <FormField
          label="Password (10+ characters)"
          value={v.password}
          onChangeText={set('password')}
          secureTextEntry
        />
        <Button
          label="Create Account"
          onPress={async () => {
            await requestJson(`${urls.mobile}/register`, {
              method: 'POST',
              body: JSON.stringify(v),
            });
            setMessage('Account created. You can now log in on the app or website.');
          }}
        />
        {!!message && <Text>{message}</Text>}
      </View>
    </Screen>
  );
}
