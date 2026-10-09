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
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
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
      <Link href="/auth/register" style={s.createLink}>
        Create Account
      </Link>
    </AuthScaffold>
  );
}

const s = StyleSheet.create({
  passwordHelp: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  inlineLink: { color: colors.primary, fontWeight: '700' },
  error: { color: colors.error, fontSize: 13 },
  centerLink: { color: colors.primary, textAlign: 'center', fontWeight: '700' },
  createLink: {
    color: colors.primary,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
});
