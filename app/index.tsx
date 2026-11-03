import { Redirect } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { useAuth } from '@/services/auth/AuthProvider';
import { colors } from '@/theme';

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <View style={s.screen}>
        <Image
          accessibilityLabel="TAAI logo"
          source={require('@/assets/branding/taai-splash-logo.png')}
          style={s.logo}
        />
      </View>
    );
  }
  return <Redirect href={user ? '/(tabs)' : '/auth/login?initial=1'} />;
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  logo: { width: 260, height: 260 },
});
