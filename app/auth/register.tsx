import { useState } from 'react';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AuthScaffold, Button, FormField } from '@/components';
import { urls } from '@/services/config';
import { requestJson } from '@/services/http';
import { colors, spacing } from '@/theme';

export default function Register() {
  const [values, setValues] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const set = (key: keyof typeof values) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    setError('');
    setMessage('');
    if (
      !values.username.trim() ||
      !values.email.trim() ||
      !values.firstName.trim() ||
      !values.lastName.trim()
    ) {
      setError('Complete all account details before continuing.');
      return;
    }
    if (values.password.length < 10) {
      setError('Use a password with at least 10 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await requestJson(`${urls.mobile}/register`, {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setMessage('Account created. You can now log in on the app or website.');
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Your account could not be created.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScaffold
      title="Join the TAAI community"
      subtitle="Create a real TAAI website and WooCommerce customer account."
    >
      <FormField
        label="Username"
        value={values.username}
        onChangeText={set('username')}
        autoCapitalize="none"
        autoComplete="username-new"
      />
      <FormField
        label="Email"
        value={values.email}
        onChangeText={set('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <View style={s.nameRow}>
        <View style={s.nameField}>
          <FormField
            label="First name"
            value={values.firstName}
            onChangeText={set('firstName')}
            autoComplete="given-name"
          />
        </View>
        <View style={s.nameField}>
          <FormField
            label="Last name"
            value={values.lastName}
            onChangeText={set('lastName')}
            autoComplete="family-name"
          />
        </View>
      </View>
      <FormField
        label="Password (10+ characters)"
        value={values.password}
        onChangeText={set('password')}
        secureTextEntry
        autoComplete="new-password"
      />
      {error ? (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      ) : null}
      {message ? <Text style={s.success}>{message}</Text> : null}
      <Button label="Create Account" loading={submitting} onPress={submit} />
      <Text style={s.loginPrompt}>
        Already have an account?{' '}
        <Link href="/auth/login" style={s.loginLink}>
          Log In
        </Link>
      </Text>
    </AuthScaffold>
  );
}

const s = StyleSheet.create({
  nameRow: { flexDirection: 'row', gap: spacing.md },
  nameField: { flex: 1 },
  error: { color: colors.error, fontSize: 13 },
  success: { color: colors.success, fontSize: 13 },
  loginPrompt: { color: colors.textPrimary, textAlign: 'center' },
  loginLink: { color: colors.primary, fontWeight: '700' },
});
