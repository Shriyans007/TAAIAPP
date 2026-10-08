import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { colors, radius, spacing } from '@/theme';
export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View accessibilityLiveRegion="polite" style={{ padding: spacing.xxl }}>
      <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}
export function ErrorState({
  message = 'Something went wrong.',
  retry,
}: {
  message?: string;
  retry?(): void;
}) {
  return (
    <View style={{ padding: spacing.xxl, gap: spacing.md }}>
      <Text accessibilityRole="alert" style={{ color: colors.error, textAlign: 'center' }}>
        {message}
      </Text>
      {retry && <Button label="Try Again" variant="outline" onPress={retry} />}
    </View>
  );
}
export function EmptyState({
  message,
  icon = 'file-tray-outline',
}: {
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Ionicons name={icon} size={25} color={colors.primary} />
      </View>
      <Text style={s.emptyText}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  empty: {
    padding: spacing.xxl,
    gap: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
