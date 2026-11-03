import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { AuthProvider } from '@/services/auth/AuthProvider';
import { colors } from '@/theme';

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 5 * 60_000, retry: 2, refetchOnReconnect: true } },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: '600' },
            headerBackButtonDisplayMode: 'minimal',
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
              animation: 'none',
              contentStyle: { backgroundColor: colors.primary },
            }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="events/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="initiatives/[slug]" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/login"
            options={{
              headerShown: false,
              presentation: 'card',
              animation: 'fade',
              contentStyle: { backgroundColor: colors.primary },
            }}
          />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen name="auth/forgot-password" options={{ title: 'Reset Password' }} />
          <Stack.Screen name="profile/edit" options={{ title: 'Edit Profile' }} />
          <Stack.Screen name="profile/settings" options={{ title: 'Account Settings' }} />
          <Stack.Screen name="contact" options={{ title: 'Contact TAAI' }} />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
