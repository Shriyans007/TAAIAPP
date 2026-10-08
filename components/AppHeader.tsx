import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme';

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
      <View style={s.copy}>
        {eyebrow ? <Text style={s.eyebrow}>{eyebrow}</Text> : null}
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    minHeight: 292,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    padding: spacing.xxl,
    paddingTop: spacing.lg,
    // Reserve room for cards that overlap the bottom of the header. Keeping
    // this as padding lets the header grow when text wraps or fonts scale.
    paddingBottom: 84,
    overflow: 'hidden',
    alignItems: 'center',
  },
  orb: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 74,
    top: -4,
    alignSelf: 'center',
    backgroundColor: 'rgba(201,150,26,0.09)',
  },
  copy: { width: '100%', alignItems: 'center', gap: 3, marginTop: spacing.sm },
  eyebrow: { color: '#E6CBD1', fontSize: 14, textAlign: 'center' },
  title: {
    color: colors.white,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: { color: '#E6CBD1', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  profile: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: colors.secondary,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: { color: colors.white, fontSize: 26, fontWeight: '800' },
  profileImage: { width: '100%', height: '100%', borderRadius: 48 },
});
