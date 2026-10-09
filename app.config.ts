import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'TAAI APP',
  slug: 'taai-app',
  scheme: ['taai', 'au.net.taai.app'],
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  ios: { bundleIdentifier: 'au.net.taai.app', supportsTablet: true, buildNumber: '1' },
  android: {
    package: 'au.net.taai.app',
    versionCode: 1,
    adaptiveIcon: { backgroundColor: '#6B1D2E' },
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    ['expo-notifications', { color: '#6B1D2E' }],
    'expo-splash-screen',
    'expo-web-browser',
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow TAAI APP to access a photo you choose for your profile.',
        cameraPermission: 'Allow TAAI APP to take a photo for your profile.',
        microphonePermission: false,
      },
    ],
  ],
  experiments: { typedRoutes: true },
  extra: {
    wordpressUrl: process.env.EXPO_PUBLIC_WORDPRESS_URL ?? 'https://taai.net.au',
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
    googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    eas: { projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID },
  },
};

export default config;
