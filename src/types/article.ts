export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  image: string; // base64
  date: string;
  readingTime: string;
  author: string;
  slug: string;
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  createdAt: number;
}
