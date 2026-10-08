import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';

export function AppHeader({
  eyebrow,
  title,
  subtitle,
  initials,
  profileImageUrl,
  onProfilePress,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  initials?: string;
  profileImageUrl?: string | null;
  onProfilePress?: () => void;
}) {
  return (
    <View style={s.header}>
      <View style={s.orb} />
      <View style={s.copy}>
        {eyebrow ? <Text style={s.eyebrow}>{eyebrow}</Text> : null}
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>
      {onProfilePress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={onProfilePress}
          style={s.profile}
        >
          {profileImageUrl ? (
            <Image source={{ uri: profileImageUrl }} style={s.profileImage} />
          ) : initials ? (
            <Text style={s.initials}>{initials}</Text>
          ) : (
            <Ionicons name="person" size={20} color={colors.white} />
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    minHeight: 164,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    padding: spacing.xxl,
    paddingTop: spacing.xl,
    // Reserve room for cards that overlap the bottom of the header. Keeping
    // this as padding lets the header grow when text wraps or fonts scale.
    paddingBottom: 84,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  orb: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    right: -42,
    top: -36,
    backgroundColor: 'rgba(201,150,26,0.09)',
  },
  copy: { flex: 1, gap: 3, paddingRight: spacing.md },
  eyebrow: { color: '#E6CBD1', fontSize: 14 },
  title: { color: colors.white, fontSize: 23, lineHeight: 29, fontWeight: '800' },
  subtitle: { color: '#E6CBD1', fontSize: 13, lineHeight: 19 },
  profile: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: colors.white, fontWeight: '800' },
  profileImage: { width: '100%', height: '100%', borderRadius: radius.lg },
});
