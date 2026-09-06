import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows, spacing } from '@/theme';

export type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value?: string;
  onPress: () => void;
};

export function MenuList({ items }: { items: MenuItem[] }) {
  return (
    <View style={s.card}>
      {items.map((item, index) => (
        <Pressable
          key={item.label}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          onPress={item.onPress}
          style={[s.row, index < items.length - 1 && s.border]}
        >
          <Ionicons
            name={item.icon}
            size={21}
            color={index % 2 ? colors.accent : colors.secondary}
          />
          <Text style={s.label}>{item.label}</Text>
          {item.value ? <Text style={s.value}>{item.value}</Text> : null}
          <Ionicons name="chevron-forward" size={17} color="#D4B8BE" />
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  row: {
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  border: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  label: { flex: 1, color: colors.textPrimary, fontSize: 15 },
  value: { color: colors.textMuted, fontSize: 13 },
});
