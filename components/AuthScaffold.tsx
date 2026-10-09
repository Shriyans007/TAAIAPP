import { PropsWithChildren } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Image,
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
}: PropsWithChildren<{ title: string; subtitle: string; canGoBack?: boolean }>) {
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
          <View style={s.hero}>
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
              source={require('../assets/branding/taai-round-logo.png')}
              style={s.logo}
            />
            <Text accessibilityRole="header" style={s.title}>
              {title}
            </Text>
            <Text style={s.subtitle}>{subtitle}</Text>
          </View>
          <View style={s.card}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  keyboard: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: spacing.xxl },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
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
});
