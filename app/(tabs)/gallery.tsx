import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState, ErrorState, LoadingState, Screen } from '@/components';
import { getGalleryAlbums } from '@/services/wordpress/media';
import type { GalleryItem } from '@/types/media';
import { colors, radius, spacing } from '@/theme';
export default function Gallery() {
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [albumId, setAlbumId] = useState<number | 'all'>('all');
  const q = useQuery({
    queryKey: ['event-galleries'],
    queryFn: ({ signal }) => getGalleryAlbums(signal),
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const photos = useMemo(() => {
    const albums = q.data ?? [];
    if (albumId !== 'all') return albums.find((album) => album.id === albumId)?.photos ?? [];
    const unique = new Map<number, GalleryItem>();
    albums.forEach((album) => album.photos.forEach((photo) => unique.set(photo.id, photo)));
    return [...unique.values()];
  }, [albumId, q.data]);
  return (
    <Screen title="Gallery" refreshing={q.isRefetching} onRefresh={() => q.refetch()}>
      {q.isLoading ? (
        <LoadingState label="Loading event galleries…" />
      ) : q.isError ? (
        <ErrorState message="The gallery could not be loaded." retry={q.refetch} />
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.albums}
          >
            <AlbumChip
              label="All Photos"
              count={(q.data ?? []).reduce((total, album) => total + album.photoCount, 0)}
              active={albumId === 'all'}
              onPress={() => setAlbumId('all')}
            />
            {(q.data ?? []).map((album) => (
              <AlbumChip
                key={album.id}
                label={album.name}
                count={album.photoCount}
                active={albumId === album.id}
                onPress={() => setAlbumId(album.id)}
              />
            ))}
          </ScrollView>
          {!q.data?.length ? (
            <EmptyState message="No event galleries have been published yet." />
          ) : !photos.length ? (
            <EmptyState message="This event gallery does not contain any photos yet." />
          ) : (
            <View style={s.grid}>
              {photos.map((item) => (
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
        </>
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

function AlbumChip({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[s.albumChip, active && s.albumChipActive]}>
      <Text style={[s.albumLabel, active && s.albumLabelActive]}>{label}</Text>
      <Text style={[s.albumCount, active && s.albumLabelActive]}>{count}</Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  albums: { gap: spacing.sm, paddingRight: spacing.lg },
  albumChip: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  albumChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  albumLabel: { color: colors.primaryDark, fontWeight: '700' },
  albumLabelActive: { color: colors.white },
  albumCount: { color: colors.textMuted, fontSize: 12 },
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
