import { Project } from "../types/project";

const CACHE_KEY = "prohor_projects_cache_v1";

/**
 * Save projects list to browser storage and cookie for instant re-opening
 */
export const saveProjectsToCache = (projects: Project[]) => {
  try {
    const serialized = JSON.stringify(projects);
    localStorage.setItem(CACHE_KEY, serialized);
    // Also save simple metadata in cookie (short expire)
    document.cookie = `prohor_proj_count=${projects.length}; path=/; max-age=604800; SameSite=Lax`;
  } catch (e) {
    console.warn("Unable to save projects to cache", e);
  }
};

/**
 * Retrieve cached projects instantly
 */
export const getCachedProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sortProjectsZA(parsed) : [];
  } catch {
    return [];
  }
};

/**
 * Sort projects Z-A: Highest numeric ID first, then latest createdAt, or Title reverse alphabetical
 */
export const sortProjectsZA = (projects: Project[]): Project[] => {
  return [...projects].sort((a, b) => {
    // If numericId exists, use it descending (e.g. 10 -> 9 -> 8)
    if (a.numericId !== undefined && b.numericId !== undefined) {
      return b.numericId - a.numericId;
    }
    // Fall back to createdAt descending
    const timeA = a.createdAt || 0;
    const timeB = b.createdAt || 0;
    if (timeB !== timeA) return timeB - timeA;
    // Finally fall back to title Z-A
    return (b.title || "").localeCompare(a.title || "");
  });
};

/**
 * Compress an image file to a lightweight base64 string
 */
export const compressImageFile = (
  file: File,
  maxWidth = 1280,
  maxHeight = 720,
  quality = 0.75
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
