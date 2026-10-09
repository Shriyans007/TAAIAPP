import { useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { AuthScaffold, Button, FormField, GoogleAuthButton } from '@/components';
import { useAuth } from '@/services/auth/AuthProvider';
import { colors, spacing } from '@/theme';

const schema = z.object({
  username: z.string().trim().min(3, 'Use at least 3 characters.'),
  email: z.email('Enter a valid email address.'),
  firstName: z.string().trim().min(1, 'Enter your first name.'),
  lastName: z.string().trim().min(1, 'Enter your last name.'),
  password: z.string().min(10, 'Use at least 10 characters.'),
});
type Values = z.infer<typeof schema>;

export default function Register() {
  const { registerAccount, loginWithGoogle } = useAuth();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', email: '', firstName: '', lastName: '', password: '' },
  });
  const showError = useCallback((message: string) => setError('root', { message }), [setError]);
  const googleSignUp = useCallback(
    async (idToken: string) => {
      await loginWithGoogle(idToken, 'register');
      router.replace('/(tabs)');
    },
    [loginWithGoogle],
  );
  const submit = handleSubmit(async (values) => {
    try {
      await registerAccount(values);
      router.replace('/(tabs)');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Your account could not be created.');
    }
  });

  return (
    <AuthScaffold
      title="Join the TAAI community"
      subtitle="Create a real TAAI website and WooCommerce customer account."
    >
      <GoogleAuthButton label="Sign up with Google" onIdToken={googleSignUp} onError={showError} />
      <Text style={s.googleHelp}>
        Sign up with Google to create and link your TAAI website account.
      </Text>
      <View style={s.dividerRow}>
        <View style={s.divider} />
        <Text style={s.or}>or create an account with email</Text>
        <View style={s.divider} />
      </View>
      <Controller
        control={control}
        name="username"
        render={({ field }) => (
          <FormField
            label="Username"
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            autoCapitalize="none"
            error={errors.username?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <FormField
            label="Email"
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email?.message}
          />
        )}
      />
      <View style={s.nameRow}>
        <View style={s.nameField}>
          <Controller
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormField
                label="First name"
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                autoComplete="given-name"
                error={errors.firstName?.message}
              />
            )}
          />
        </View>
        <View style={s.nameField}>
          <Controller
            control={control}
            name="lastName"
            render={({ field }) => (
              <FormField
                label="Last name"
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                autoComplete="family-name"
                error={errors.lastName?.message}
              />
            )}
          />
        </View>
      </View>
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <FormField
            label="Password (10+ characters)"
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            secureTextEntry
            autoComplete="new-password"
            error={errors.password?.message}
          />
        )}
      />
      {errors.root ? (
        <Text accessibilityRole="alert" style={s.error}>
          {errors.root.message}
        </Text>
      ) : null}
      <Button label="Create Account" loading={isSubmitting} onPress={submit} />
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
  googleHelp: { color: colors.textSecondary, fontSize: 11, lineHeight: 16, textAlign: 'center' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  divider: { flex: 1, height: 1, backgroundColor: '#D8D1D3' },
  or: { color: colors.textSecondary, fontSize: 11 },
  nameRow: { flexDirection: 'row', gap: spacing.md },
  nameField: { flex: 1 },
  error: { color: colors.error, fontSize: 13 },
  loginPrompt: { color: colors.textPrimary, textAlign: 'center' },
  loginLink: { color: colors.primary, fontWeight: '700' },
});
