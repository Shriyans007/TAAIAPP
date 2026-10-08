import { File } from 'expo-file-system';
import { urls } from '@/services/config';
import { ApiError } from '@/services/http';
import type { UserProfile } from '@/types/user';

type AvatarFile = {
  uri: string;
  name: string;
  type: string;
};

export async function uploadAvatar(token: string, file: AvatarFile): Promise<UserProfile> {
  const body = new FormData();
  const uploadFile = new File(file.uri);
  body.append('avatar', uploadFile, file.name);

  const response = await fetch(`${urls.mobile}/profile/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  let data: UserProfile | { message?: string; code?: string } | null = null;
  try {
    data = await response.json();
  } catch {}

  if (!response.ok) {
    const error = data as { message?: string; code?: string } | null;
    throw new ApiError(
      error?.message ?? 'The profile photo could not be uploaded. Please try again.',
      response.status,
      error?.code,
    );
  }

  return data as UserProfile;
}
