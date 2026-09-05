export interface Project {
  id: string; // Database key or numeric ID as string
  numericId?: number; // e.g. 1, 2, 3...
  title: string;
  description: string;
  features: string[]; // List of key project features
  coreServices: string[]; // Core technologies/services (e.g. React, Tailwind, Firebase)
  thumbnail: string; // Base64 thumbnail or cover image URL
  images?: string[]; // Array of base64 screenshots/gallery images
  githubUrl?: string; // GitHub repository link
  deployUrl?: string; // Live project deploy / demo link
  category?: string; // e.g. Full Stack, Web App, Mobile, AI Tool
  status?: string; // e.g. Live, Completed, In Progress
  
  // Custom SEO & Search Engine Meta Information:
  metaTitle?: string; // Custom Meta Title for Search Engines & Social Cards
  metaDescription?: string; // Custom Meta Description for SERP & Open Graph
  metaKeywords?: string; // Comma-separated custom SEO keywords
  metaCanonicalUrl?: string; // Optional custom canonical override
  metaOgImage?: string; // Optional custom OpenGraph image URL
  metaCategory?: string; // Secondary SEO Category / Classification

  createdAt: number;
  updatedAt?: number;
}
