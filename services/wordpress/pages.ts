import { urls } from '@/services/config';
import { requestJson } from '@/services/http';
import type { WordPressPage } from '@/types/page';
import { contentBlocks, decodeHtml } from '@/utils/html';

type PageResponse = {
  id: number;
  slug: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  jetpack_featured_media_url?: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url?: string;
      media_details?: { sizes?: Record<string, { source_url: string }> };
    }>;
  };
};

export async function getPageBySlug(slug: string, signal?: AbortSignal): Promise<WordPressPage> {
  const rows = await requestJson<PageResponse[]>(
    `${urls.api}/wp/v2/pages?slug=${encodeURIComponent(slug)}&_embed=1`,
    {},
    signal,
  );
  const page = rows[0];
  if (!page) throw new Error('This initiative page is unavailable.');
  const media = page._embedded?.['wp:featuredmedia']?.[0];
  const firstContentImage = page.content.rendered.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
  return {
    id: page.id,
    slug: page.slug,
    title: decodeHtml(page.title.rendered.replace(/<[^>]+>/g, '')),
    url: page.link,
    image:
      media?.media_details?.sizes?.large?.source_url ??
      media?.source_url ??
      page.jetpack_featured_media_url ??
      firstContentImage,
    blocks: contentBlocks(page.content.rendered),
  };
}
