import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { urls } from '@/services/config';
import { requestJson } from '@/services/http';
export type NotificationPreferences = { events: boolean; community: boolean; membership: boolean };
export async function registerNotifications(token: string, preferences: NotificationPreferences) {
  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status === 'undetermined') status = (await Notifications.requestPermissionsAsync()).status;
  if (status !== 'granted') return { granted: false };
  if (Platform.OS === 'android')
    await Notifications.setNotificationChannelAsync('default', {
      name: 'TAAI updates',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) throw new Error('EAS project ID is not configured.');
  const push = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await requestJson(`${urls.mobile}/push-token`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ token: push, preferences }),
  });
  return { granted: true };
}
