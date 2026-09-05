import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '@/theme';
export function Button({
  label,
  onPress,
  loading = false,
  variant = 'primary',
  disabled = false,
}: {
  label: string;
  onPress(): void;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'danger';
  disabled?: boolean;
}) {
  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
        ? colors.error
        : colors.transparent;
  const fg = variant === 'outline' ? colors.primary : colors.white;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        s.base,
        {
          backgroundColor: bg,
          borderColor: variant === 'outline' ? colors.primary : bg,
          opacity: pressed || disabled ? 0.7 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[s.text, { color: fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}
const s = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  text: { fontSize: 15, fontWeight: '600' },
});
