import { Project } from "../types/project";
import { DEFAULT_PROJECTS } from "../data/defaultProjects";

const COOKIE_CACHE_KEY = "prohor_projects_cookie_cache";
let inMemoryProjectsCache: Project[] | null = null;

// Cleanup old bulky localStorage cache keys if present to prevent browser quota errors
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("prohor_projects_cache_v1");
    localStorage.removeItem("prohor_projects_cache_v2");
  } catch {
    // Ignore if localStorage is restricted
  }
}

/**
 * Cookie Helper: Set a cookie with path and expiration
 */
export const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === "undefined") return;
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    console.warn("Cookie set error:", e);
  }
};

/**
 * Cookie Helper: Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[2]) : null;
  } catch {
    return null;
  }
};

/**
 * Cookie Helper: Delete a cookie
 */
export const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=-99999999; path=/;`;
};

/**
 * Save projects list to in-memory cache and browser cookies (lightweight metadata index)
 * Never uses localStorage or Firebase Storage to prevent quota exceeded errors.
 */
export const saveProjectsToCache = (projects: Project[]) => {
  try {
    if (!Array.isArray(projects) || projects.length === 0) return;
    
    // 1. In-memory fast cache (full objects)
    inMemoryProjectsCache = sortProjectsZA(projects);

    // 2. Browser Cookie Lightweight Cache (IDs, Titles, Categories, Dates, URLs)
    // Keep cookie payload minimal (< 3KB) without heavy base64 data
    const lightweightIndex = projects.slice(0, 10).map((p) => ({
      id: p.id,
      numericId: p.numericId,
      title: p.title,
      category: p.category || "Full Stack",
      status: p.status || "Live",
      description: p.description ? p.description.slice(0, 160) : "",
      thumbnail: p.thumbnail && p.thumbnail.startsWith("http") ? p.thumbnail : "",
      coreServices: (p.coreServices || []).slice(0, 5),
      deployUrl: p.deployUrl || "",
      githubUrl: p.githubUrl || "",
      createdAt: p.createdAt || Date.now(),
    }));

    const jsonStr = JSON.stringify(lightweightIndex);
    setCookie(COOKIE_CACHE_KEY, jsonStr, 7);
    setCookie("prohor_proj_count", String(projects.length), 7);
  } catch (e) {
    console.warn("Unable to save projects to cookie cache", e);
  }
};

/**
 * Retrieve cached projects instantly from memory or cookies (falls back to DEFAULT_PROJECTS)
 */
export const getCachedProjects = (): Project[] => {
  try {
    // 1. Check in-memory cache first
    if (inMemoryProjectsCache && inMemoryProjectsCache.length > 0) {
      return inMemoryProjectsCache;
    }

    // 2. Check Browser Cookie Cache
    const cookieData = getCookie(COOKIE_CACHE_KEY);
    if (cookieData) {
      const parsed = JSON.parse(cookieData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with DEFAULT_PROJECTS details if available
        const enriched: Project[] = parsed.map((item) => {
          const defaultMatch = DEFAULT_PROJECTS.find(
            (dp) => dp.id === item.id || (item.numericId && dp.numericId === item.numericId)
          );
          if (defaultMatch) {
            return { ...defaultMatch, ...item };
          }
          return item as Project;
        });

        inMemoryProjectsCache = sortProjectsZA(enriched);
        return inMemoryProjectsCache;
      }
    }

    // 3. Fallback to Default Projects
    return DEFAULT_PROJECTS;
  } catch {
    return DEFAULT_PROJECTS;
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
