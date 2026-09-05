import { Article } from "../types/article";
import { DEFAULT_ARTICLES } from "../data/defaultArticles";
import { getCookie, setCookie } from "./projectUtils";

const ARTICLE_COOKIE_CACHE_KEY = "prohor_articles_cookie_cache";
let inMemoryArticlesCache: Article[] | null = null;

// Cleanup old bulky localStorage cache keys if present to prevent browser quota errors
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("prohor_articles_cache_v1");
    localStorage.removeItem("prohor_articles_cache_v2");
  } catch {
    // Ignore if localStorage is restricted
  }
}

/**
 * Save articles list to in-memory cache and browser cookies (lightweight metadata index)
 * Never uses localStorage or Firebase Storage to prevent quota exceeded errors.
 */
export const saveArticlesToCache = (articles: Article[]) => {
  try {
    if (!Array.isArray(articles) || articles.length === 0) return;

    // 1. In-memory fast cache (full objects with complete markdown content)
    inMemoryArticlesCache = articles;

    // 2. Browser Cookie Lightweight Cache (IDs, Titles, Excerpts, Categories, Dates, Images)
    // Keep cookie payload minimal (< 3KB) without heavy base64 data or full markdown
    const lightweightIndex = articles.slice(0, 8).map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug || a.id,
      category: a.category || "General",
      excerpt: a.excerpt ? a.excerpt.slice(0, 140) : "",
      image: a.image && a.image.startsWith("http") ? a.image : "",
      date: a.date || new Date().toISOString().split("T")[0],
      readingTime: a.readingTime || "5 min read",
      author: a.author || "Shakibul Islam Prohor",
      tags: (a.tags || []).slice(0, 3),
    }));

    const jsonStr = JSON.stringify(lightweightIndex);
    setCookie(ARTICLE_COOKIE_CACHE_KEY, jsonStr, 7);
    setCookie("prohor_articles_count", String(articles.length), 7);
  } catch (e) {
    console.warn("Unable to save articles to cookie cache", e);
  }
};

/**
 * Retrieve cached articles instantly from memory or cookies (falls back to DEFAULT_ARTICLES)
 * Ensures instant 0ms first render without waiting for remote network calls.
 */
export const getCachedArticles = (): Article[] => {
  try {
    // 1. Check in-memory cache first
    if (inMemoryArticlesCache && inMemoryArticlesCache.length > 0) {
      return inMemoryArticlesCache;
    }

    // 2. Check Browser Cookie Cache
    const cookieData = getCookie(ARTICLE_COOKIE_CACHE_KEY);
    if (cookieData) {
      const parsed = JSON.parse(cookieData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with DEFAULT_ARTICLES details if matching
        const enriched: Article[] = parsed.map((item) => {
          const defaultMatch = DEFAULT_ARTICLES.find(
            (da) => da.id === item.id || (item.slug && da.slug === item.slug)
          );
          if (defaultMatch) {
            return { ...defaultMatch, ...item };
          }
          return item as Article;
        });

        inMemoryArticlesCache = enriched;
        return inMemoryArticlesCache;
      }
    }

    // 3. Fallback to Default Articles
    return DEFAULT_ARTICLES;
  } catch {
    return DEFAULT_ARTICLES;
  }
};
