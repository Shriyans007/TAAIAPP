import { Text, View } from 'react-native';
import { Button } from './Button';
import { colors, spacing } from '@/theme';
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
export function EmptyState({ message }: { message: string }) {
  return (
    <View style={{ padding: spacing.xxl }}>
      <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>{message}</Text>
    </View>
  );
}
