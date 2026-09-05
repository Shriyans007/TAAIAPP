export interface TAAIEvent {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  image?: string;
  thumbnail?: string;
  ticketUrl: string;
  isInStock: boolean;
  memberTypes: string[];
  date?: string;
  time?: string;
  venue?: string;
}
export interface StoreProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  permalink: string;
  is_in_stock: boolean;
  images?: Array<{ src: string; thumbnail?: string }>;
  attributes?: Array<{ name: string; terms: Array<{ name: string }> }>;
  extensions?: Record<string, unknown>;
}
