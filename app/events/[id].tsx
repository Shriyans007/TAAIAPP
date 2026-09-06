import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, ErrorState, LoadingState } from '@/components';
import { getEvent } from '@/services/woocommerce/events';
import { colors, radius, shadows, spacing } from '@/theme';

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useQuery({
    queryKey: ['event', id],
    queryFn: ({ signal }) => getEvent(id!, signal),
    enabled: !!id,
  });
  if (q.isLoading)
    return (
      <SafeAreaView style={s.safe}>
        <LoadingState label="Loading event…" />
      </SafeAreaView>
    );
  if (q.isError || !q.data)
    return (
      <SafeAreaView style={s.safe}>
        <ErrorState message="This event is unavailable." retry={q.refetch} />
      </SafeAreaView>
    );
  const event = q.data;
  const mapUrl = event.venue
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`
    : null;
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.hero}>
          {event.image ? (
            <Image
              source={{ uri: event.image }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, s.heroFallback]} />
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
            <View style={s.badge}>
              <Text style={s.badgeText}>TAAI Event</Text>
            </View>
            <Text style={s.heroTitle}>{event.name}</Text>
          </View>
        </View>
        {event.date || event.time || event.venue || event.organiser || event.organiserEmail ? (
          <View style={s.details}>
            {event.date || event.time ? (
              <Detail
                icon="calendar"
                label="Date & Time"
                value={[event.date, event.time].filter(Boolean).join(' · ')}
              />
            ) : null}
            {event.venue ? <Detail icon="location" label="Venue" value={event.venue} /> : null}
            {event.organiser || event.organiserEmail ? (
              <Detail
                icon="person"
                label="Organiser"
                value={[event.organiser, event.organiserEmail].filter(Boolean).join(' · ')}
              />
            ) : null}
          </View>
        ) : null}
        <Text style={s.heading}>About This Event</Text>
        <Text style={s.description}>
          {event.description ||
            event.shortDescription ||
            'Full event information is available on the TAAI website.'}
        </Text>
        {mapUrl ? (
          <Pressable onPress={() => WebBrowser.openBrowserAsync(mapUrl)} style={s.map}>
            <Ionicons name="map" size={25} color={colors.accent} />
            <Text style={s.mapText}>View Map</Text>
          </Pressable>
        ) : null}
        <Text style={s.heading}>Ticket Options</Text>
        <View style={s.ticketInfo}>
          <Ionicons name="ticket" size={23} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={s.ticketTitle}>Tickets on the TAAI website</Text>
            <Text style={s.ticketText}>
              View current ticket types, availability and final prices securely through WooCommerce.
            </Text>
          </View>
        </View>
        <View style={s.actions}>
          <Button
            label="Share Event"
            variant="outline"
            onPress={() =>
              Share.share({
                title: event.name,
                message: `${event.name}\n${event.ticketUrl}`,
                url: event.ticketUrl,
              })
            }
          />
        </View>
        <View style={s.actions}>
          <Button
            label={event.isInStock ? 'Book Tickets →' : 'View Event on Website'}
            disabled={!event.ticketUrl}
            onPress={() =>
              WebBrowser.openBrowserAsync(event.ticketUrl, {
                presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
              })
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={s.detail}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={s.detailLabel}>{label}</Text>
        <Text style={s.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl, gap: spacing.lg },
  hero: { height: 278, backgroundColor: colors.primary, overflow: 'hidden' },
  heroFallback: { backgroundColor: colors.primary },
  shade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(26,10,16,0.25)',
  },
  back: {
    position: 'absolute',
    left: spacing.lg,
    top: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    bottom: spacing.xl,
    gap: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  heroTitle: { color: colors.white, fontSize: 24, lineHeight: 30, fontWeight: '900' },
  details: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    ...shadows.card,
  },
  detail: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 3 },
  detailValue: { color: colors.textPrimary, lineHeight: 20, fontWeight: '600' },
  heading: {
    marginHorizontal: spacing.xl,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  description: { marginHorizontal: spacing.xl, color: colors.textSecondary, lineHeight: 23 },
  map: {
    marginHorizontal: spacing.xl,
    minHeight: 82,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#B9E4F3',
    backgroundColor: colors.infoSurface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  mapText: { color: colors.accent, fontWeight: '700' },
  ticketInfo: {
    marginHorizontal: spacing.xl,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ticketTitle: { color: colors.textPrimary, fontWeight: '800', marginBottom: 4 },
  ticketText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  actions: { marginHorizontal: spacing.xl },
});
