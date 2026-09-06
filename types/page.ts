export type ContentBlock = {
  type: 'heading' | 'paragraph';
  text: string;
};

export interface WordPressPage {
  id: number;
  slug: string;
  title: string;
  url: string;
  image?: string;
  blocks: ContentBlock[];
}
