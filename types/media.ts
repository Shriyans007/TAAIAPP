export interface GalleryItem {
  id: number;
  title: string;
  caption: string;
  thumbnail: string;
  full: string;
  mediaType: 'image' | 'video';
}
