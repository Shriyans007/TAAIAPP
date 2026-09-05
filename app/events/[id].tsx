import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Button, ErrorState, LoadingState, Screen } from '@/components';
import { getEvent } from '@/services/woocommerce/events';
import { colors, radius, spacing } from '@/theme';
export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useQuery({
    queryKey: ['event', id],
    queryFn: ({ signal }) => getEvent(id!, signal),
    enabled: !!id,
  });
  if (q.isLoading)
    return (
      <Screen title="Event Details">
        <LoadingState />
      </Screen>
    );
  if (q.isError || !q.data)
    return (
      <Screen title="Event Details">
        <ErrorState message="This event is unavailable." retry={q.refetch} />
      </Screen>
    );
  const e = q.data;
  return (
    <Screen title={e.name}>
      {e.image && <Image source={{ uri: e.image }} style={s.image} />}
      <Text style={s.description}>{e.description || e.shortDescription}</Text>
      {(e.date || e.time || e.venue) && (
        <View style={s.meta}>
          {e.date && <Text>Date: {e.date}</Text>}
          {e.time && <Text>Time: {e.time}</Text>}
          {e.venue && <Text>Venue: {e.venue}</Text>}
        </View>
      )}
      <Text style={s.note}>
        Ticket choices and final pricing are confirmed securely on the TAAI website.
      </Text>
      <Button
        label="Buy Tickets"
        disabled={!e.ticketUrl || !e.isInStock}
        onPress={() =>
          WebBrowser.openBrowserAsync(e.ticketUrl, {
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
          })
        }
      />
    </Screen>
  );
}
const s = StyleSheet.create({
  image: { width: '100%', aspectRatio: 1, borderRadius: radius.xl },
  description: { color: colors.textSecondary, lineHeight: 22 },
  meta: {
    gap: spacing.sm,
    backgroundColor: colors.goldSurface,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  note: { fontSize: 12, color: colors.textSecondary },
});
