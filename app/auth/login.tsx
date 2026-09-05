import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { z } from 'zod';
import { Button, FormField, Screen } from '@/components';
import { useAuth } from '@/services/auth/AuthProvider';
import { colors, spacing } from '@/theme';
const schema = z.object({
  identifier: z.string().min(1, 'Enter your username or email.'),
  password: z.string().min(1, 'Enter your password.'),
});
type Values = z.infer<typeof schema>;
export default function Login() {
  const { login } = useAuth();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: '', password: '' },
  });
  const submit = handleSubmit(async (v) => {
    try {
      await login(v.identifier, v.password);
      router.replace('/(tabs)');
    } catch (e) {
      setError('root', {
        message:
          e instanceof Error ? e.message : 'Login failed. Please check your details and try again.',
      });
    }
  });
  return (
    <Screen title="Welcome back">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ gap: spacing.lg }}>
          <Text style={{ color: colors.textSecondary }}>
            Use the same username/email and password as the TAAI website.
          </Text>
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
          {errors.root && (
            <Text accessibilityRole="alert" style={{ color: colors.error }}>
              {errors.root.message}
            </Text>
          )}
          <Button label="Log In" loading={isSubmitting} onPress={submit} />
          <Link href="/auth/forgot-password" style={{ color: colors.primary, textAlign: 'center' }}>
            Forgot Password?
          </Link>
          <Link href="/auth/register" style={{ color: colors.primary, textAlign: 'center' }}>
            Create Account
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
