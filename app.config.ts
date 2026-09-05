import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'TAAI APP',
  slug: 'taai-app',
  scheme: 'taai',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  ios: { bundleIdentifier: 'au.net.taai.app', supportsTablet: true, buildNumber: '1' },
  android: { package: 'au.net.taai.app', versionCode: 1, adaptiveIcon: { backgroundColor: '#6B1D2E' } },
  plugins: ['expo-router', 'expo-secure-store', ['expo-notifications', { color: '#6B1D2E' }]],
  experiments: { typedRoutes: true },
  extra: { wordpressUrl: process.env.EXPO_PUBLIC_WORDPRESS_URL ?? 'https://taai.net.au', eas: { projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID } }
};

export default config;

