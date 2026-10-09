import { useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { AuthScaffold, Button, FormField, GoogleAuthButton } from '@/components';
import { useAuth } from '@/services/auth/AuthProvider';
import { colors, spacing } from '@/theme';

const schema = z.object({
  identifier: z.string().min(1, 'Enter your username or email.'),
  password: z.string().min(1, 'Enter your password.'),
});
type Values = z.infer<typeof schema>;

export default function Login() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { login, loginWithGoogle } = useAuth();
  const destination =
    returnTo === '/(tabs)/directory' || returnTo === '/(tabs)/membership' ? returnTo : '/(tabs)';
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: '', password: '' },
  });
  const showError = useCallback((message: string) => setError('root', { message }), [setError]);
  const completeGoogleLogin = useCallback(
    async (idToken: string) => {
      await loginWithGoogle(idToken, 'login');
      router.replace(destination);
    },
    [destination, loginWithGoogle],
  );
  const submit = handleSubmit(async (values) => {
    try {
      await login(values.identifier, values.password);
      router.replace(destination);
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : 'Login failed. Please check your details and try again.',
      );
    }
  });

  return (
    <AuthScaffold
      title="Welcome back"
      subtitle="Use the same username/email and password as the TAAI website."
    >
      <Controller
        control={control}
        name="identifier"
        render={({ field }) => (
          <FormField
            label="Username or Email"
            autoCapitalize="none"
            autoComplete="username"
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            error={errors.identifier?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <FormField
            label="Password"
            secureTextEntry
            autoComplete="current-password"
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            error={errors.password?.message}
          />
        )}
      />
      <Text style={s.passwordHelp}>
        Don&apos;t have a password yet?{' '}
        <Link href="/auth/forgot-password" style={s.inlineLink}>
          Create or reset it here.
        </Link>
      </Text>
      {errors.root ? (
        <Text accessibilityRole="alert" style={s.error}>
          {errors.root.message}
        </Text>
      ) : null}
      <Button label="Log In" loading={isSubmitting} onPress={submit} />
      <Link href="/auth/forgot-password" style={s.centerLink}>
        Forgot Password?
      </Link>
      <View style={s.dividerRow}>
        <View style={s.divider} />
        <Text style={s.or}>or</Text>
        <View style={s.divider} />
      </View>
      <GoogleAuthButton
        label="Continue with Google"
        onIdToken={completeGoogleLogin}
        onError={showError}
      />
      <Link href="/auth/register" style={s.createLink}>
        Create Account
      </Link>
      <Text style={s.finePrint}>
        Google login is available after you first sign in normally and link Google to your TAAI
        account in Account Settings.
      </Text>
    </AuthScaffold>
  );
}

const s = StyleSheet.create({
  passwordHelp: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  inlineLink: { color: colors.primary, fontWeight: '700' },
  error: { color: colors.error, fontSize: 13 },
  centerLink: { color: colors.primary, textAlign: 'center', fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  divider: { flex: 1, height: 1, backgroundColor: '#D8D1D3' },
  or: { color: colors.textSecondary },
  createLink: {
    color: colors.primary,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  finePrint: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});
