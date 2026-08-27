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
  createdAt: number;
  updatedAt?: number;
}
