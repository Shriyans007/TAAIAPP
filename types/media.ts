export interface GalleryItem {
  id: number;
  title: string;
  caption: string;
  thumbnail: string;
  full: string;
  mediaType: 'image' | 'video';
}

export interface GalleryAlbum {
  id: number;
  name: string;
  slug: string;
  cover?: string | null;
  photoCount: number;
  photos: GalleryItem[];
}
