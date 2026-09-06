import { urls } from '@/services/config';
import { requestJson } from '@/services/http';
import type { StoreProduct, TAAIEvent } from '@/types/event';
import { stripHtml } from '@/utils/html';
export function mapEvent(p: StoreProduct): TAAIEvent {
  const ext = (p.extensions?.taai_event ?? {}) as Partial<
    Pick<TAAIEvent, 'date' | 'time' | 'venue' | 'organiser' | 'organiserEmail'>
  >;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: stripHtml(p.description),
    shortDescription: stripHtml(p.short_description),
    image: p.images?.[0]?.src,
    thumbnail: p.images?.[0]?.thumbnail ?? p.images?.[0]?.src,
    ticketUrl: p.permalink,
    isInStock: p.is_in_stock,
    memberTypes:
      p.attributes?.flatMap((a) =>
        a.name.toLowerCase().includes('member') ? a.terms.map((t) => t.name) : [],
      ) ?? [],
    ...ext,
  };
}
export async function getEvents(signal?: AbortSignal) {
  const products = await requestJson<StoreProduct[]>(
    `${urls.store}/products?category=112&per_page=20`,
    {},
    signal,
  );
  return products.map(mapEvent);
}
export async function getEvent(id: string, signal?: AbortSignal) {
  return mapEvent(
    await requestJson<StoreProduct>(`${urls.store}/products/${encodeURIComponent(id)}`, {}, signal),
  );
}
