import { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme';
export function Screen({
  title,
  children,
  scroll = true,
}: {
  title: string;
  children: React.ReactNode;
  scroll?: boolean;
}) {
  const content = (
    <View style={s.content}>
      <Text accessibilityRole="header" style={s.title}>
        {title}
      </Text>
      {children}
    </View>
  );
  return (
    <SafeAreaView style={s.safe}>
      {scroll ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>{content}</ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text accessibilityRole="header" style={s.section}>
      {children}
    </Text>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: 24, fontWeight: '700', color: colors.primaryDark },
  section: { fontSize: 16, fontWeight: '600', color: colors.primaryDark },
});
