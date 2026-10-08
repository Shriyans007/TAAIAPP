import { useState } from 'react';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { Button, FormField, Screen } from '@/components';
import { useAuth } from '@/services/auth/AuthProvider';
import { urls } from '@/services/config';
import { requestJson } from '@/services/http';
import { uploadAvatar } from '@/services/mobile/avatar';
import { colors, radius, spacing } from '@/theme';
export default function EditProfile() {
  const { user, token, refresh, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [v, setV] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address1: user?.billing?.address1 ?? '',
    city: user?.billing?.city ?? '',
    postcode: user?.billing?.postcode ?? '',
    state: user?.billing?.state ?? '',
    country: user?.billing?.country ?? '',
  });
  const set = (k: keyof typeof v) => (x: string) => setV({ ...v, [k]: x });
  if (!user)
    return (
      <Screen title="Edit Profile">
        <Text>Please log in first.</Text>
      </Screen>
    );
  return (
    <Screen title="Edit Profile">
      <View style={{ gap: spacing.md }}>
        <View style={s.avatarSection}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, s.avatarFallback]}>
              <Text style={s.avatarInitials}>
                {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() ||
                  user.displayName.slice(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={s.avatarAction}>
            <Text style={s.avatarTitle}>Profile photo</Text>
            <Text style={s.avatarHelp}>JPEG, PNG or WebP, up to 5 MB.</Text>
            <Button
              label={uploadingAvatar ? 'Uploading…' : 'Choose Photo'}
              variant="outline"
              disabled={uploadingAvatar}
              onPress={async () => {
                const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permission.granted) {
                  Alert.alert(
                    'Photo access required',
                    'Allow photo access in your phone settings to choose a profile photo.',
                  );
                  return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ['images'],
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                });
                const asset = result.assets?.[0];
                if (result.canceled || !asset || !token) return;
                setUploadingAvatar(true);
                try {
                  await uploadAvatar(token, {
                    uri: asset.uri,
                    name: asset.fileName ?? `taai-profile-${user.id}.jpg`,
                    type: asset.mimeType ?? 'image/jpeg',
                  });
                  await refresh();
                } catch (error) {
                  Alert.alert(
                    'Upload failed',
                    error instanceof Error ? error.message : 'Please try another photo.',
                  );
                } finally {
                  setUploadingAvatar(false);
                }
              }}
            />
          </View>
        </View>
        {Object.entries(v).map(([k, value]) => (
          <FormField
            key={k}
            label={k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
            value={value}
            onChangeText={set(k as keyof typeof v)}
          />
        ))}
        {v.email.trim().toLowerCase() !== user.email.trim().toLowerCase() ? (
          <FormField
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            textContentType="password"
            autoCapitalize="none"
            helperText="Required to securely change your account email."
          />
        ) : null}
        <Button
          label="Save Changes"
          onPress={async () => {
            const emailChanged = v.email.trim().toLowerCase() !== user.email.trim().toLowerCase();
            await requestJson(`${urls.mobile}/profile`, {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${token}` },
              body: JSON.stringify({ ...v, currentPassword }),
            });
            if (emailChanged) {
              await logout();
              router.replace('/auth/login');
              return;
            }
            await refresh();
          }}
        />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: { width: 82, height: 82, borderRadius: 41 },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  avatarInitials: { color: colors.white, fontSize: 22, fontWeight: '800' },
  avatarAction: { flex: 1, gap: spacing.xs },
  avatarTitle: { color: colors.textPrimary, fontWeight: '800', fontSize: 16 },
  avatarHelp: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.xs },
});
