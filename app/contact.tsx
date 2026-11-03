import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, FormField, Screen } from '@/components';
import { useAuth } from '@/services/auth/AuthProvider';
import { urls } from '@/services/config';
import { requestJson } from '@/services/http';
import { colors, spacing } from '@/theme';

export default function Contact() {
  const { user } = useAuth();
  const [name, setName] = useState(
    [user?.firstName?.trim(), user?.lastName?.trim()].filter(Boolean).join(' ') ||
      user?.displayName ||
      '',
  );
  const [email, setEmail] = useState(user?.email ?? '');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    if (sending) return;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || !trimmedMessage) {
      setError('Enter your name, a valid email address and a message.');
      return;
    }
    setError('');
    setSending(true);
    try {
      await requestJson(`${urls.mobile}/contact`, {
        method: 'POST',
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, message: trimmedMessage }),
      });
      setMessage('');
      Alert.alert('Message sent', 'TAAI has received your message.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Message could not be sent. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen title="Contact Us">
      <View style={s.fields}>
        <Text style={s.intro}>Send a message to the TAAI team. We will reply to your email.</Text>
        <FormField label="Name" value={name} onChangeText={setName} autoComplete="name" />
        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <FormField
          label="Message"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={6}
          style={s.message}
        />
        {error ? (
          <Text accessibilityRole="alert" style={s.error}>
            {error}
          </Text>
        ) : null}
        <Button label={sending ? 'Sending…' : 'Send Message'} disabled={sending} onPress={send} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  fields: { gap: spacing.md },
  intro: { color: colors.textSecondary, lineHeight: 22 },
  message: { minHeight: 140, paddingVertical: spacing.md, textAlignVertical: 'top' },
  error: { color: colors.error },
});
