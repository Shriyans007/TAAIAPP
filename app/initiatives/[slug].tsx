import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, ErrorState, LoadingState } from '@/components';
import { getPageBySlug } from '@/services/wordpress/pages';
import { colors, radius, shadows, spacing } from '@/theme';

export default function InitiativeDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const page = useQuery({
    queryKey: ['wordpress-page', slug],
    enabled: !!slug,
    queryFn: ({ signal }) => getPageBySlug(slug!, signal),
  });
  if (page.isLoading)
    return (
      <SafeAreaView style={s.safe}>
        <LoadingState label="Loading initiative…" />
      </SafeAreaView>
    );
  if (page.isError || !page.data)
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.error}>
          <ErrorState
            message={
              page.error instanceof Error ? page.error.message : 'This initiative is unavailable.'
            }
            retry={page.refetch}
          />
          <Button label="Go Back" variant="outline" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  const initiative = page.data;
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.hero}>
          {initiative.image ? (
            <Image
              source={{ uri: initiative.image }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, s.fallback]}>
              <Ionicons name="sparkles" size={64} color="rgba(255,255,255,0.22)" />
            </View>
          )}
          <View style={s.shade} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={s.back}
          >
            <Ionicons name="chevron-back" size={25} color={colors.white} />
          </Pressable>
          <View style={s.heroCopy}>
            <Text style={s.eyebrow}>TAAI INITIATIVE</Text>
            <Text style={s.title}>{initiative.title}</Text>
          </View>
        </View>
        <View style={s.body}>
          {initiative.blocks.length ? (
            initiative.blocks.map((block, index) =>
              block.type === 'heading' ? (
                <Text key={`${block.type}-${index}`} style={s.heading}>
                  {block.text}
                </Text>
              ) : (
                <Text key={`${block.type}-${index}`} style={s.paragraph}>
                  {block.text}
                </Text>
              ),
            )
          ) : (
            <View style={s.empty}>
              <Ionicons name="information-circle-outline" size={28} color={colors.secondary} />
              <Text style={s.emptyText}>
                TAAI has not published additional information for this initiative yet.
              </Text>
            </View>
          )}
          <View style={s.source}>
            <Ionicons name="sync-outline" size={18} color={colors.accent} />
            <Text style={s.sourceText}>
              This information is loaded from the TAAI website and updates when WordPress is
              updated.
            </Text>
          </View>
          <Button
            label="View on TAAI Website"
            variant="outline"
            onPress={() => WebBrowser.openBrowserAsync(initiative.url)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  error: { padding: spacing.xl, gap: spacing.lg },
  hero: { height: 222, backgroundColor: colors.primary, overflow: 'hidden' },
  fallback: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: spacing.xxxl,
    backgroundColor: colors.primary,
  },
  shade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(26,10,16,0.38)',
  },
  back: {
    position: 'absolute',
    left: spacing.lg,
    top: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    bottom: spacing.lg,
    gap: 4,
  },
  eyebrow: { color: '#F0D8DE', fontSize: 12, fontWeight: '700', letterSpacing: 0.7 },
  title: { color: colors.white, fontSize: 25, lineHeight: 31, fontWeight: '900' },
  body: { padding: spacing.xl, gap: spacing.md },
  heading: { color: colors.textPrimary, fontWeight: '800', fontSize: 18, marginTop: spacing.md },
  paragraph: { color: colors.textSecondary, fontSize: 15, lineHeight: 23 },
  empty: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.card,
  },
  emptyText: { color: colors.textSecondary, textAlign: 'center', lineHeight: 21 },
  source: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.infoSurface,
    marginTop: spacing.md,
  },
  sourceText: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, flex: 1 },
});
