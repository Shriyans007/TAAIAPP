import { Redirect } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/services/auth/AuthProvider';
import { colors } from '@/theme';

export default function Index() {
  const { user, loading } = useAuth();
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => setMinimumElapsed(true), 1300);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => {
      clearTimeout(timer);
      animation.stop();
    };
  }, [progress]);

  if (loading || !minimumElapsed) {
    return (
      <View style={s.screen}>
        <View style={s.brand}>
          <Image
            accessibilityLabel="TAAI logo"
            source={require('@/assets/branding/taai-splash-logo.png')}
            style={s.logo}
          />
          <Text style={s.name}>TAAI</Text>
          <Text style={s.organisation}>Telugu Association of Australia Inc.</Text>
        </View>
        <View style={s.loading} accessibilityLabel="Loading TAAI app">
          <View style={s.track}>
            <Animated.View
              style={[
                s.bar,
                {
                  transform: [
                    {
                      translateX: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 96],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
          <Text style={s.loadingText}>Loading</Text>
        </View>
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
  brand: { alignItems: 'center', transform: [{ translateY: -48 }] },
  logo: { width: 212, height: 212 },
  name: { color: colors.white, fontSize: 26, fontWeight: '800', marginTop: 18 },
  organisation: { color: '#E6CBD1', fontSize: 14, marginTop: 8 },
  loading: { position: 'absolute', top: '78%', alignItems: 'center' },
  track: { width: 136, height: 6, borderRadius: 3, backgroundColor: '#884052', overflow: 'hidden' },
  bar: { width: 40, height: 6, borderRadius: 3, backgroundColor: colors.secondary },
  loadingText: { color: '#E6CBD1', fontSize: 13, marginTop: 16 },
});
