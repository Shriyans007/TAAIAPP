import { useEffect, useRef, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { googleClientIds } from '@/services/config';
import { colors, radius, spacing } from '@/theme';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  label: string;
  onIdToken(idToken: string): Promise<void>;
  onError?(message: string): void;
};

function configuredClientId() {
  if (Platform.OS === 'ios') return googleClientIds.ios;
  if (Platform.OS === 'android') return googleClientIds.android;
  return googleClientIds.web;
}

function ConfiguredGoogleAuthButton({ label, onIdToken, onError }: Props) {
  const [loading, setLoading] = useState(false);
  const handledToken = useRef<string | null>(null);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: googleClientIds.ios,
    androidClientId: googleClientIds.android,
    webClientId: googleClientIds.web,
    selectAccount: true,
  });

  useEffect(() => {
    if (response?.type === 'error') {
      setLoading(false);
      onError?.(response.error?.description ?? 'Google sign-in could not be completed.');
      return;
    }
    if (response?.type === 'dismiss' || response?.type === 'cancel') {
      setLoading(false);
      return;
    }
    const idToken = response?.type === 'success' ? response.params.id_token : undefined;
    if (!idToken || handledToken.current === idToken) return;
    handledToken.current = idToken;
    setLoading(true);
    onIdToken(idToken)
      .catch((error) => {
        handledToken.current = null;
        onError?.(error instanceof Error ? error.message : 'Google sign-in failed.');
      })
      .finally(() => setLoading(false));
  }, [onError, onIdToken, response]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={!request || loading}
      onPress={() => {
        setLoading(true);
        promptAsync().catch(() => {
          setLoading(false);
          onError?.('Google sign-in could not be opened.');
        });
      }}
      style={({ pressed }) => [s.button, (pressed || loading) && s.pressed]}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <>
          <Text style={s.googleMark}>G</Text>
          <Text style={s.label}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function GoogleAuthButton(props: Props) {
  if (!configuredClientId()) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={props.label}
        onPress={() =>
          Alert.alert(
            'Google sign-in needs setup',
            'Add the Google OAuth client ID for this platform to the app environment, then rebuild the app.',
          )
        }
        style={s.button}
      >
        <Text style={s.googleMark}>G</Text>
        <Text style={s.label}>{props.label}</Text>
      </Pressable>
    );
  }
  return <ConfiguredGoogleAuthButton {...props} />;
}

const s = StyleSheet.create({
  button: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#BEB7BA',
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  pressed: { opacity: 0.72 },
  googleMark: { color: '#4285F4', fontSize: 22, fontWeight: '900' },
  label: { color: colors.primaryDark, fontSize: 15, fontWeight: '700' },
});
