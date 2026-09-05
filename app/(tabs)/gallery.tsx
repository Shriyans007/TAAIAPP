import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState, ErrorState, LoadingState, Screen } from '@/components';
import { getGallery } from '@/services/wordpress/media';
import type { GalleryItem } from '@/types/media';
import { colors, radius, spacing } from '@/theme';
export default function Gallery() {
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const q = useQuery({ queryKey: ['gallery'], queryFn: ({ signal }) => getGallery(1, signal) });
  return (
    <Screen title="Gallery">
      {q.isLoading ? (
        <LoadingState label="Loading gallery…" />
      ) : q.isError ? (
        <ErrorState message="The gallery could not be loaded." retry={q.refetch} />
      ) : !q.data?.length ? (
        <EmptyState message="No gallery images are available." />
      ) : (
        <View style={s.grid}>
          {q.data.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="imagebutton"
              accessibilityLabel={item.title || 'Open gallery image'}
              onPress={() => setSelected(item)}
              style={s.cell}
            >
              <Image source={{ uri: item.thumbnail }} style={s.thumb} />
            </Pressable>
          ))}
        </View>
      )}
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={s.modal} onPress={() => setSelected(null)}>
          {selected && (
            <>
              <Image source={{ uri: selected.full }} resizeMode="contain" style={s.full} />
              <Text style={s.caption}>{selected.caption || selected.title}</Text>
            </>
          )}
        </Pressable>
      </Modal>
    </Screen>
  );
}
const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  thumb: { width: '100%', height: '100%' },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(26,10,16,0.94)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  full: { width: '100%', height: '75%' },
  caption: { color: colors.white, textAlign: 'center', marginTop: spacing.md },
});
