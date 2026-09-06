import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { EmptyState, ErrorState, EventCard, LoadingState, Screen } from '@/components';
import { getEvents } from '@/services/woocommerce/events';
import { colors, radius, spacing } from '@/theme';

export default function Events() {
  const [search, setSearch] = useState('');
  const q = useQuery({ queryKey: ['events'], queryFn: ({ signal }) => getEvents(signal) });
  const events = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term
      ? (q.data ?? []).filter((e) =>
          [e.name, e.description, e.venue].join(' ').toLowerCase().includes(term),
        )
      : (q.data ?? []);
  }, [q.data, search]);
  return (
    <Screen title="Events">
      <View style={s.search}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search events, venues…"
          placeholderTextColor={colors.textMuted}
          style={s.input}
          accessibilityLabel="Search events"
        />
      </View>
      {q.isLoading ? (
        <LoadingState label="Loading TAAI events…" />
      ) : q.isError ? (
        <ErrorState message="Events could not be loaded." retry={q.refetch} />
      ) : !events.length ? (
        <EmptyState
          message={search ? 'No events match your search.' : 'No current events are available.'}
        />
      ) : (
        <View style={{ gap: spacing.lg }}>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => router.push(`/events/${event.id}`)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
const s = StyleSheet.create({
  search: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E3D5D8',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
  },
  input: { flex: 1, color: colors.textPrimary },
});
