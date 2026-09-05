import { urls } from '@/services/config';
import { requestJson } from '@/services/http';
import type { GalleryItem } from '@/types/media';
import { stripHtml } from '@/utils/html';
type Media = {
  id: number;
  media_type: 'image' | 'file';
  mime_type: string;
  source_url: string;
  title: { rendered: string };
  caption: { rendered: string };
  media_details?: { sizes?: Record<string, { source_url: string }> };
};
export async function getGallery(page = 1, signal?: AbortSignal): Promise<GalleryItem[]> {
  const rows = await requestJson<Media[]>(
    `${urls.api}/wp/v2/media?media_type=image&per_page=30&page=${page}`,
    {},
    signal,
  );
  return rows
    .filter((x) => x.mime_type.startsWith('image/'))
    .map((x) => ({
      id: x.id,
      title: stripHtml(x.title.rendered),
      caption: stripHtml(x.caption.rendered),
      thumbnail: x.media_details?.sizes?.medium?.source_url ?? x.source_url,
      full: x.media_details?.sizes?.large?.source_url ?? x.source_url,
      mediaType: 'image',
    }));
}
