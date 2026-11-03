import { Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
export function FormField({
  label,
  error,
  helperText,
  tone = 'default',
  ...props
}: TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
  tone?: 'default' | 'dark';
}) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={{ fontWeight: '600', color: tone === 'dark' ? '#E6CBD1' : colors.primaryDark }}>
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        {...props}
        style={[
          {
            minHeight: 48,
            borderWidth: 1,
            borderColor: error ? colors.error : colors.border,
            borderRadius: radius.lg,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.surface,
            color: colors.textPrimary,
          },
          props.style,
        ]}
      />
      {error && (
        <Text accessibilityRole="alert" style={{ color: colors.error, fontSize: 12 }}>
          {error}
        </Text>
      )}
      {!error && helperText ? (
        <Text style={{ color: tone === 'dark' ? '#E6CBD1' : colors.textSecondary, fontSize: 12 }}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
