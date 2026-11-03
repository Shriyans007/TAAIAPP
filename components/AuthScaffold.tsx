import { PropsWithChildren, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Image,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadows, spacing } from '@/theme';

export function AuthScaffold({
  title,
  subtitle,
  children,
  canGoBack = true,
  tone = 'default',
}: PropsWithChildren<{
  title: string;
  subtitle: string;
  canGoBack?: boolean;
  tone?: 'default' | 'burgundy';
}>) {
  const reveal = useRef(new Animated.Value(tone === 'burgundy' ? 0 : 1)).current;
  useEffect(() => {
    if (tone !== 'burgundy') return;
    const animation = Animated.timing(reveal, {
      toValue: 1,
      duration: 440,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [reveal, tone]);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.keyboard}
      >
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.scrollContent}
        >
          <Animated.View
            style={[
              s.content,
              tone === 'burgundy' && {
                opacity: reveal,
                transform: [
                  { translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
                ],
              },
            ]}
          >
            <View style={[s.hero, tone === 'burgundy' && s.heroBurgundy]}>
              {canGoBack ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  hitSlop={12}
                  onPress={() => router.back()}
                  style={s.back}
                >
                  <Ionicons name="chevron-back" color={colors.white} size={24} />
                </Pressable>
              ) : null}
              <Image
                accessibilityLabel="TAAI logo"
                source={require('../assets/branding/taai-splash-logo.png')}
                style={s.logo}
              />
              <Text accessibilityRole="header" style={s.title}>
                {title}
              </Text>
              <Text style={s.subtitle}>{subtitle}</Text>
            </View>
            <View style={[s.card, tone === 'burgundy' && s.cardBurgundy]}>{children}</View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  keyboard: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: spacing.xxl },
  content: { flexGrow: 1 },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroBurgundy: { paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  back: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  logo: { width: 108, height: 108, borderRadius: 54, marginBottom: spacing.md },
  title: {
    color: colors.white,
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 340,
    marginTop: spacing.sm,
    color: '#E6CBD1',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  card: {
    flex: 1,
    marginHorizontal: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.background,
    gap: spacing.md,
    ...shadows.floating,
  },
  cardBurgundy: {
    flexGrow: 0,
    backgroundColor: colors.primaryDark,
    marginHorizontal: spacing.xl,
    borderRadius: 26,
    padding: spacing.xl,
    shadowOpacity: 0,
    elevation: 0,
  },
});
