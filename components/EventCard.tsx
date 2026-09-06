import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { TAAIEvent } from '@/types/event';
import { colors, radius, shadows, spacing } from '@/theme';

export function EventCard({ event, onPress }: { event: TAAIEvent; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${event.name}`}
      onPress={onPress}
      style={s.card}
    >
      {event.thumbnail ? (
        <Image source={{ uri: event.thumbnail }} style={s.image} resizeMode="cover" />
      ) : (
        <View style={[s.image, s.placeholder]}>
          <Ionicons name="calendar" size={38} color={colors.secondary} />
        </View>
      )}
      <View style={s.copy}>
        <Text style={s.name}>{event.name}</Text>
        {event.date ? <Meta icon="calendar-outline" text={event.date} /> : null}
        {event.time ? <Meta icon="time-outline" text={event.time} /> : null}
        {event.venue ? <Meta icon="location-outline" text={event.venue} /> : null}
        {!event.date && !event.time && !event.venue ? (
          <Text numberOfLines={2} style={s.description}>
            {event.shortDescription ||
              event.description ||
              'View event details on the TAAI website.'}
          </Text>
        ) : null}
        <Text style={s.action}>{event.isInStock ? 'View event and tickets' : 'View event'}</Text>
      </View>
    </Pressable>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={s.meta}>
      <Ionicons name={icon} size={14} color={colors.accent} />
      <Text style={s.metaText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  image: { width: '100%', height: 176, backgroundColor: colors.surfaceMuted },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldSurface,
  },
  copy: { padding: spacing.lg, gap: 6 },
  name: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginBottom: 3 },
  description: { color: colors.textSecondary, lineHeight: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  metaText: { color: colors.textSecondary, fontSize: 13, flex: 1 },
  action: { color: colors.primary, fontWeight: '700', marginTop: spacing.sm },
});
