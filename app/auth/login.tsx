import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text } from 'react-native';
import { z } from 'zod';
import { AuthScaffold, Button, FormField } from '@/components';
import { useAuth } from '@/services/auth/AuthProvider';
import { colors } from '@/theme';

const schema = z.object({
  identifier: z.string().min(1, 'Enter your username or email.'),
  password: z.string().min(1, 'Enter your password.'),
});
type Values = z.infer<typeof schema>;

export default function Login() {
  const { returnTo, initial } = useLocalSearchParams<{ returnTo?: string; initial?: string }>();
  const { login } = useAuth();
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
  const submit = handleSubmit(async (values) => {
    try {
      await login(values.identifier, values.password);
      router.replace(destination);
    } catch (error) {
      setError('root', {
        message:
          error instanceof Error
            ? error.message
            : 'Login failed. Please check your details and try again.',
      });
    }
  });

  return (
    <AuthScaffold
      title="Welcome back"
      subtitle="Use the same username/email and password as the TAAI website."
      canGoBack={initial !== '1'}
      tone="burgundy"
    >
      <Controller
        control={control}
        name="identifier"
        render={({ field }) => (
          <FormField
            label="Username or Email"
            tone="dark"
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
            tone="dark"
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
      <Button label="Log In" variant="gold" loading={isSubmitting} onPress={submit} />
      <Button
        label="Continue without logging in"
        variant="ghost"
        onPress={() => router.replace('/(tabs)')}
      />
      <Link href="/auth/forgot-password" style={s.centerLink}>
        Forgot Password?
      </Link>
      <Link href="/auth/register" style={s.createLink}>
        Create Account
      </Link>
    </AuthScaffold>
  );
}

const s = StyleSheet.create({
  passwordHelp: { color: '#E6CBD1', fontSize: 12, lineHeight: 17 },
  inlineLink: { color: colors.secondary, fontWeight: '700' },
  error: { color: '#FFB4AB', fontSize: 13 },
  centerLink: { color: '#E6CBD1', textAlign: 'center', fontWeight: '700' },
  createLink: {
    color: '#E6CBD1',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
});
