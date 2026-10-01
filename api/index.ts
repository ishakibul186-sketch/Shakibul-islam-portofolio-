import path from "path";
import fs from "fs";

export interface ProjectSeoData {
  id: string;
  title?: string;
  metaTitle?: string;
  description?: string;
  metaDescription?: string;
  keywords?: string[];
  metaKeywords?: string;
  metaCanonicalUrl?: string;
  metaOgImage?: string;
  metaCategory?: string;
  category?: string;
  thumbnail?: string;
  coreServices?: string[];
  features?: string[];
}

// In-memory cache with 60-second TTL
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 60 * 1000;
const projectCache = new Map<string, CacheItem<any>>();
const articleCache = new Map<string, CacheItem<any>>();

const RTDB_BASE = "https://shakibul-islam-ltd-server-default-rtdb.firebaseio.com";

function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function resolveOgImage(ogImage?: string, thumbnail?: string): string {
  if (ogImage && typeof ogImage === "string" && ogImage.trim().startsWith("http")) {
    return ogImage.trim();
  }
  if (thumbnail && typeof thumbnail === "string" && thumbnail.trim().startsWith("http")) {
    return thumbnail.trim();
  }
  return "https://shakibul-islam-portofolio.vercel.app/my-projects-banner.png";
}

function resolveCanonicalUrl(pathUrl: string, explicitCanonical?: string): string {
  if (explicitCanonical && typeof explicitCanonical === "string" && explicitCanonical.trim().startsWith("http")) {
    return explicitCanonical.trim();
  }
  const cleanPath = pathUrl.startsWith("/") ? pathUrl : `/${pathUrl}`;
  return `https://shakibul-islam-portofolio.vercel.app${cleanPath}`;
}

async function fetchProjectById(id: string): Promise<any | null> {
  const cleanId = id.trim();
  const cached = projectCache.get(cleanId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 1. Direct path lookup: /projects/{id}.json
  try {
    const res = await fetch(`${RTDB_BASE}/projects/${encodeURIComponent(cleanId)}.json`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === "object" && (data.title || data.metaTitle)) {
        const result = { id: cleanId, ...data };
        projectCache.set(cleanId, { data: result, timestamp: Date.now() });
        return result;
      }
    }
  } catch (err) {
    console.warn(`[SEO] Direct RTDB fetch error for project ${cleanId}:`, err);
  }

  // 2. Fallback full scan of /projects.json (match by key, id, numericId, or slug)
  try {
    const allRes = await fetch(`${RTDB_BASE}/projects.json`);
    if (allRes.ok) {
      const allData = await allRes.json();
      if (allData && typeof allData === "object") {
        for (const [key, val] of Object.entries(allData)) {
          if (!val || typeof val !== "object" || key === "totalstring") continue;
          const p = val as any;
          if (
            key === cleanId ||
            p.id === cleanId ||
            String(p.numericId) === cleanId ||
            p.slug === cleanId
          ) {
            const result = { id: key, ...p };
            projectCache.set(cleanId, { data: result, timestamp: Date.now() });
            return result;
          }
        }
      }
    }
  } catch (err) {
    console.warn(`[SEO] Full RTDB fetch error for projects:`, err);
  }

  return null;
}

async function fetchArticleById(id: string): Promise<any | null> {
  const cleanId = id.trim();
  const cached = articleCache.get(cleanId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const res = await fetch(`${RTDB_BASE}/articles/${encodeURIComponent(cleanId)}.json`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === "object" && (data.title || data.seo?.title)) {
        const result = { id: cleanId, ...data };
        articleCache.set(cleanId, { data: result, timestamp: Date.now() });
        return result;
      }
    }
  } catch (err) {
    console.warn(`[SEO] Direct RTDB fetch error for article ${cleanId}:`, err);
  }

  try {
    const allRes = await fetch(`${RTDB_BASE}/articles.json`);
    if (allRes.ok) {
      const allData = await allRes.json();
      if (allData && typeof allData === "object") {
        for (const [key, val] of Object.entries(allData)) {
          if (!val || typeof val !== "object") continue;
          const a = val as any;
          if (key === cleanId || a.id === cleanId || a.slug === cleanId) {
            const result = { id: key, ...a };
            articleCache.set(cleanId, { data: result, timestamp: Date.now() });
            return result;
          }
        }
      }
    }
  } catch (err) {
    console.warn(`[SEO] Full RTDB fetch error for articles:`, err);
  }

  return null;
}

function replaceOrInsertMeta(
  html: string,
  regex: RegExp,
  replacement: string,
  fallbackInsertBefore: string = "</head>"
): string {
  if (regex.test(html)) {
    return html.replace(regex, replacement);
  }
  return html.replace(fallbackInsertBefore, `    ${replacement}\n  ${fallbackInsertBefore}`);
}

async function injectDynamicSeo(
  html: string,
  requestPath: string,
  params?: Record<string, string>
): Promise<string> {
  if (!html) return "<!doctype html><html><body>Error loading page</body></html>";
  const cleanPath = requestPath.split("?")[0].replace(/\/+$/, "");

  // Match /my-projects/:id or /projects/:id
  const projectMatch = cleanPath.match(/^\/(?:my-projects|projects)\/([^\/]+)$/);
  if (projectMatch) {
    const projectId = params?.id || projectMatch[1];
    const project = await fetchProjectById(projectId);

    let title = `${projectId} | Shakibul Islam Prohor Projects`;
    let description = "Software engineering project details, architecture specification, and tech stack by Shakibul Islam Prohor.";
    let keywords = "Shakibul Islam Prohor, Full Stack Developer, Software Engineer, Portfolio, React, Node.js";
    let canonical = `https://shakibul-islam-portofolio.vercel.app/my-projects/${projectId}`;
    let image = "https://shakibul-islam-portofolio.vercel.app/my-projects-banner.png";
    let category = "Software Application";
    let rootHtml = "";

    if (project) {
      title = project.metaTitle || (project.title ? `${project.title} | Shakibul Islam Prohor` : title);
      description = project.metaDescription || project.description || description;

      let projectKeywords: string[] = [];
      if (typeof project.metaKeywords === "string" && project.metaKeywords.trim()) {
        projectKeywords = project.metaKeywords.split(",").map((k: string) => k.trim()).filter(Boolean);
      } else if (Array.isArray(project.keywords) && project.keywords.length > 0) {
        projectKeywords = project.keywords.map((k: any) => String(k).trim()).filter(Boolean);
      } else if (Array.isArray(project.metaKeywords) && project.metaKeywords.length > 0) {
        projectKeywords = (project.metaKeywords as any[]).map((k: any) => String(k).trim()).filter(Boolean);
      }

      if (projectKeywords.length === 0) {
        if (project.title) projectKeywords.push(project.title);
        if (project.category) projectKeywords.push(project.category);
        if (Array.isArray(project.coreServices)) {
          projectKeywords.push(...project.coreServices);
        }
        if (Array.isArray(project.features)) {
          projectKeywords.push(...project.features.slice(0, 3));
        }
      }

      const uniqueProjectKeywords = Array.from(new Set(projectKeywords));
      if (uniqueProjectKeywords.length > 0) {
        keywords = uniqueProjectKeywords.join(", ");
      } else {
        keywords = "Shakibul Islam Prohor, Full Stack Developer, Software Engineer, Portfolio, React, Node.js";
      }

      canonical = resolveCanonicalUrl(cleanPath, project.metaCanonicalUrl);
      image = resolveOgImage(project.metaOgImage, project.thumbnail);
      category = project.metaCategory || project.category || category;

      const techList = Array.isArray(project.coreServices)
        ? project.coreServices.map((s: string) => `<li style="display:inline-block;margin:4px 8px;padding:4px 12px;background:#1e1b4b;border:1px solid #4338ca;border-radius:9999px;font-size:0.875rem;">${escapeHtml(s)}</li>`).join("")
        : "";
      const featureList = Array.isArray(project.features)
        ? project.features.map((f: string) => `<li style="margin:8px 0;">${escapeHtml(f)}</li>`).join("")
        : "";

      rootHtml = `
      <div style="min-height:100vh;background-color:#030014;color:#f8fafc;font-family:sans-serif;padding:48px 24px;max-width:1000px;margin:0 auto;">
        <nav style="margin-bottom:24px;"><a href="/my-projects" style="color:#a855f7;text-decoration:none;">&larr; Back to All Projects</a></nav>
        <header style="margin-bottom:32px;">
          <span style="display:inline-block;padding:4px 12px;background:#3b0764;color:#d8b4fe;border-radius:9999px;font-size:0.875rem;font-weight:600;margin-bottom:12px;">${escapeHtml(category)}</span>
          <h1 style="font-size:2.25rem;font-weight:800;letter-spacing:-0.025em;margin:0 0 16px 0;line-height:1.2;">${escapeHtml(project.title || title)}</h1>
          <p style="font-size:1.125rem;line-height:1.75;color:#94a3b8;margin:0;">${escapeHtml(project.description || description)}</p>
        </header>
        ${image ? `<div style="margin-bottom:32px;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);"><img src="${escapeHtml(image)}" alt="${escapeHtml(project.title || title)}" style="width:100%;height:auto;display:block;max-height:550px;object-fit:cover;" /></div>` : ""}
        ${techList ? `<div style="margin-bottom:32px;"><h2 style="font-size:1.25rem;font-weight:700;color:#c084fc;margin-bottom:12px;">Core Technologies</h2><ul style="list-style:none;padding:0;margin:0;">${techList}</ul></div>` : ""}
        ${featureList ? `<div style="margin-bottom:32px;"><h2 style="font-size:1.25rem;font-weight:700;color:#c084fc;margin-bottom:12px;">Key Architectural Features</h2><ul style="padding-left:24px;line-height:1.7;color:#cbd5e1;">${featureList}</ul></div>` : ""}
      </div>
      `;
    }

    let result = html;
    result = result.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    result = replaceOrInsertMeta(result, /<meta\s+[^>]*?name=["']title["'][^>]*?\/?>/i, `<meta name="title" content="${escapeHtml(title)}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+[^>]*?name=["']description["'][^>]*?\/?>/i, `<meta name="description" content="${escapeHtml(description)}" />`);
    
    const keywordsRegex = /<meta\s+[^>]*?name=["']keywords["'][^>]*?\/?>/i;
    const keywordsRegexAlt = /<meta\s+[^>]*?content=["'][^"']*?["'][^>]*?name=["']keywords["'][^>]*?\/?>/i;
    if (keywordsRegex.test(result)) {
      result = result.replace(keywordsRegex, `<meta name="keywords" content="${escapeHtml(keywords)}" />`);
    } else if (keywordsRegexAlt.test(result)) {
      result = result.replace(keywordsRegexAlt, `<meta name="keywords" content="${escapeHtml(keywords)}" />`);
    } else {
      result = replaceOrInsertMeta(result, keywordsRegex, `<meta name="keywords" content="${escapeHtml(keywords)}" />`);
    }

    result = replaceOrInsertMeta(result, /<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i, `<link rel="canonical" href="${escapeHtml(canonical)}" />`);

    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:type["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:type" content="article" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:url["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:url" content="${escapeHtml(canonical)}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:image" content="${escapeHtml(image)}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:image:secure_url["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:image:secure_url" content="${escapeHtml(image)}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:image:alt["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:image:alt" content="${escapeHtml(title)}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:image:width["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:image:width" content="1200" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:image:height["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:image:height" content="630" />`);

    result = replaceOrInsertMeta(result, /<meta\s+name=["']twitter:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+name=["']twitter:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+name=["']twitter:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:image" content="${escapeHtml(image)}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+name=["']twitter:image:alt["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:image:alt" content="${escapeHtml(title)}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+name=["']twitter:url["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:url" content="${escapeHtml(canonical)}" />`);

    const softwareSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": project?.title || title,
      "headline": title,
      "description": description,
      "url": canonical,
      "image": image,
      "applicationCategory": category,
      "operatingSystem": "Web, Cloud, Cross-Platform",
      "author": {
        "@type": "Person",
        "name": "Shakibul Islam Prohor",
        "url": "https://shakibul-islam-portofolio.vercel.app/"
      }
    };
    const schemaTag = `<script type="application/ld+json">\n${JSON.stringify(softwareSchema, null, 2)}\n    </script>`;
    result = result.replace(/<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/i, schemaTag);

    if (rootHtml) {
      result = result.replace(/<div\s+id=["']root["']>\s*<\/div>/i, `<div id="root">${rootHtml}</div>`);
    }

    return result;
  }

  // Match /articles/:id or /blog/:id
  const articleMatch = cleanPath.match(/^\/(?:articles|blog)\/([^\/]+)$/);
  if (articleMatch) {
    const articleId = params?.id || articleMatch[1];
    const article = await fetchArticleById(articleId);

    let title = `${articleId} | Shakibul Islam Prohor Blog`;
    let description = "Technical article, architecture analysis, and software development guide by Shakibul Islam Prohor.";
    let keywords = "Software Engineering, Web Development, Tutorials, TypeScript, React, Node.js";
    let canonical = `https://shakibul-islam-portofolio.vercel.app/articles/${articleId}`;
    let image = "https://shakibul-islam-portofolio.vercel.app/prohor-v2.png";
    let rootHtml = "";

    if (article) {
      title = article.seo?.title || (article.title ? `${article.title} | Shakibul Islam Prohor` : title);
      description = article.seo?.description || article.excerpt || description;
      if (article.seo?.keywords) {
        keywords = article.seo?.keywords;
      } else if (Array.isArray(article.tags)) {
        keywords = article.tags.join(", ");
      }
      canonical = `https://shakibul-islam-portofolio.vercel.app/articles/${article.id || articleId}`;
      if (article.image && article.image.startsWith("http")) {
        image = article.image;
      }

      rootHtml = `
      <article style="min-height:100vh;background-color:#030014;color:#f8fafc;font-family:sans-serif;padding:48px 24px;max-width:850px;margin:0 auto;">
        <nav style="margin-bottom:24px;"><a href="/blog" style="color:#a855f7;text-decoration:none;">&larr; Back to Articles</a></nav>
        <header style="margin-bottom:32px;">
          <h1 style="font-size:2.25rem;font-weight:800;letter-spacing:-0.025em;margin:0 0 16px 0;line-height:1.25;">${escapeHtml(article.title || title)}</h1>
          <p style="color:#94a3b8;font-size:1rem;margin:0 0 12px 0;">By ${escapeHtml(article.author || "Shakibul Islam Prohor")} &bull; ${escapeHtml(article.date || "")}</p>
          <p style="font-size:1.125rem;line-height:1.7;color:#cbd5e1;">${escapeHtml(article.excerpt || description)}</p>
        </header>
        ${image ? `<div style="margin-bottom:32px;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);"><img src="${escapeHtml(image)}" alt="${escapeHtml(article.title || title)}" style="width:100%;height:auto;max-height:480px;object-fit:cover;" /></div>` : ""}
      </article>
      `;
    }

    let result = html;
    result = result.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    result = replaceOrInsertMeta(result, /<meta\s+[^>]*?name=["']title["'][^>]*?\/?>/i, `<meta name="title" content="${escapeHtml(title)}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+[^>]*?name=["']description["'][^>]*?\/?>/i, `<meta name="description" content="${escapeHtml(description)}" />`);
    
    const keywordsRegex = /<meta\s+[^>]*?name=["']keywords["'][^>]*?\/?>/i;
    const keywordsRegexAlt = /<meta\s+[^>]*?content=["'][^"']*?["'][^>]*?name=["']keywords["'][^>]*?\/?>/i;
    if (keywordsRegex.test(result)) {
      result = result.replace(keywordsRegex, `<meta name="keywords" content="${escapeHtml(keywords)}" />`);
    } else if (keywordsRegexAlt.test(result)) {
      result = result.replace(keywordsRegexAlt, `<meta name="keywords" content="${escapeHtml(keywords)}" />`);
    } else {
      result = replaceOrInsertMeta(result, keywordsRegex, `<meta name="keywords" content="${escapeHtml(keywords)}" />`);
    }

    result = replaceOrInsertMeta(result, /<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i, `<link rel="canonical" href="${escapeHtml(canonical)}" />`);

    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:type["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:type" content="article" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:url["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:url" content="${escapeHtml(canonical)}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:image" content="${escapeHtml(image)}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:image:secure_url["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:image:secure_url" content="${escapeHtml(image)}" />`);

    result = replaceOrInsertMeta(result, /<meta\s+name=["']twitter:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+name=["']twitter:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+name=["']twitter:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:image" content="${escapeHtml(image)}" />`);

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": article?.title || title,
      "description": description,
      "image": image,
      "url": canonical,
      "author": {
        "@type": "Person",
        "name": article?.author || "Shakibul Islam Prohor",
        "url": "https://shakibul-islam-portofolio.vercel.app/"
      }
    };
    const schemaTag = `<script type="application/ld+json">\n${JSON.stringify(articleSchema, null, 2)}\n    </script>`;
    result = result.replace(/<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/i, schemaTag);

    if (rootHtml) {
      result = result.replace(/<div\s+id=["']root["']>\s*<\/div>/i, `<div id="root">${rootHtml}</div>`);
    }

    return result;
  }

  return html;
}

function getProductionAssets(): { js: string; css: string } {
  // 1. Try reading api/template.json (generated by scripts/sync-template.js)
  try {
    const jsonPaths = [
      path.join(process.cwd(), "api", "template.json"),
      path.join(process.cwd(), "template.json"),
    ];
    for (const jp of jsonPaths) {
      if (fs.existsSync(jp)) {
        const raw = fs.readFileSync(jp, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.mainJs) {
          return { js: parsed.mainJs, css: parsed.mainCss || "" };
        }
      }
    }
  } catch {}

  // 2. Try scanning dist/assets directory
  try {
    const assetsDirs = [
      path.join(process.cwd(), "dist", "assets"),
      path.join(process.cwd(), "assets"),
    ];
    for (const ad of assetsDirs) {
      if (fs.existsSync(ad)) {
        const files = fs.readdirSync(ad);
        const js = files.find(f => f.startsWith("main-") && f.endsWith(".js")) || files.find(f => f.endsWith(".js"));
        const css = files.find(f => f.startsWith("main-") && f.endsWith(".css")) || files.find(f => f.endsWith(".css"));
        if (js) {
          return { js: `/assets/${js}`, css: css ? `/assets/${css}` : "" };
        }
      }
    }
  } catch {}

  // 3. Fallback to latest known built assets
  return {
    js: "/assets/main-Blcsmcmx.js",
    css: "/assets/main-CqkyRn-6.css",
  };
}

function sanitizeHtmlForProduction(html: string): string {
  if (!html) return html;

  // Crucial: Replace raw Vite dev script "/src/main.tsx" with compiled production bundle
  if (html.includes("/src/main.tsx")) {
    const assets = getProductionAssets();
    html = html.replace(
      /<script\s+type=["']module["']\s+src=["']\/src\/main\.tsx["']><\/script>/gi,
      `<script type="module" crossorigin src="${assets.js}"></script>`
    );

    // If production stylesheet is not linked, inject it before </head>
    if (assets.css && !html.includes(assets.css)) {
      html = html.replace(
        /<\/head>/i,
        `    <link rel="stylesheet" crossorigin href="${assets.css}">\n  </head>`
      );
    }
  }

  return html;
}

// Built-in baseline HTML template that never fails and links directly to production bundles
const BASELINE_HTML = `<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
    <title>Shakibul Islam Prohor | Full Stack Developer &amp; Software Engineer</title>
    <meta name="title" content="Shakibul Islam Prohor | Full Stack Developer &amp; Software Engineer" />
    <meta name="description" content="Official portfolio of Shakibul Islam Prohor – Full Stack Developer &amp; Software Engineer specializing in modern React, TypeScript, Node.js, Firebase, cloud architecture, and high-performance web applications." />
    <meta name="keywords" content="Shakibul Islam Prohor, Full Stack Developer, Software Engineer, React Developer, Node.js Developer, Portfolio" />
    <link rel="canonical" href="https://shakibul-islam-portofolio.vercel.app/" />
    <link rel="icon" type="image/png" href="/prohor-v2.png" sizes="any" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Shakibul Islam Prohor Portfolio" />
    <meta property="og:url" content="https://shakibul-islam-portofolio.vercel.app/" />
    <meta property="og:title" content="Shakibul Islam Prohor | Full Stack Developer &amp; Software Engineer" />
    <meta property="og:description" content="Official portfolio of Shakibul Islam Prohor – Full Stack Developer specializing in React, TypeScript, Node.js, and cloud architecture." />
    <meta property="og:image" content="https://shakibul-islam-portofolio.vercel.app/prohor-v2.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Shakibul Islam Prohor | Full Stack Developer &amp; Software Engineer" />
    <meta name="twitter:description" content="Official portfolio of Shakibul Islam Prohor – Full Stack Developer specializing in React, TypeScript, Node.js, and cloud architecture." />
    <meta name="twitter:image" content="https://shakibul-islam-portofolio.vercel.app/prohor-v2.png" />
    <script type="module" crossorigin src="/assets/main-Blcsmcmx.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/main-CqkyRn-6.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

function getTemplateHtml(): string {
  // 1. Try dist/index.html first (contains compiled assets)
  const distCandidates = [
    path.join(process.cwd(), "dist", "index.html"),
    path.join(process.cwd(), "..", "dist", "index.html"),
  ];

  for (const p of distCandidates) {
    try {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf-8");
        if (content && content.length > 100) {
          return sanitizeHtmlForProduction(content);
        }
      }
    } catch {}
  }

  // 2. Try api/template.json (generated during build)
  try {
    const jsonCandidates = [
      path.join(process.cwd(), "api", "template.json"),
      path.join(process.cwd(), "template.json"),
    ];
    for (const jp of jsonCandidates) {
      if (fs.existsSync(jp)) {
        const raw = fs.readFileSync(jp, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.html && parsed.html.length > 100) {
          return sanitizeHtmlForProduction(parsed.html);
        }
      }
    }
  } catch {}

  // 3. Fallback to reading root index.html, but sanitize raw /src/main.tsx with production bundles
  try {
    const rootIndex = path.join(process.cwd(), "index.html");
    if (fs.existsSync(rootIndex)) {
      const content = fs.readFileSync(rootIndex, "utf-8");
      if (content && content.length > 100) {
        return sanitizeHtmlForProduction(content);
      }
    }
  } catch {}

  return sanitizeHtmlForProduction(BASELINE_HTML);
}

/**
 * Vercel Serverless Function Handler
 * Completely self-contained with ZERO external relative imports to avoid ESM ERR_MODULE_NOT_FOUND
 */
export default async function handler(req: any, res: any) {
  try {
    const url = req.url || "";
    const method = req.method || "GET";

    const targetApiPath = 
      (req.headers?.["x-forwarded-uri"] as string) || 
      (req.headers?.["x-matched-path"] as string) || 
      url;

    // 1. API: Contact Form Submission
    if (method === "POST" && (targetApiPath.includes("/api/contact") || targetApiPath === "/contact")) {
      const { name, email, subject, message } = req.body || {};
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email address format" });
      }

      const gmailUser = process.env.GMAIL_USER;
      const gmailPass = process.env.GMAIL_APP_PASSWORD;

      if (!gmailUser || !gmailPass) {
        return res.status(500).json({
          error: "Server email configuration is missing.",
        });
      }

      try {
        const nodemailerModule = await import("nodemailer");
        const nodemailer = nodemailerModule.default || nodemailerModule;
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: gmailUser, pass: gmailPass },
        });

        await transporter.sendMail({
          from: `"${name}" <${gmailUser}>`,
          to: gmailUser,
          replyTo: email,
          subject: `[Portfolio Contact] ${subject}`,
          text: `From: ${name} (${email})\nSubject: ${subject}\n\n${message}`,
          html: `<div><h2>New Portfolio Message</h2><p><strong>From:</strong> ${name} (${email})</p><p><strong>Subject:</strong> ${subject}</p><p>${message}</p></div>`,
        });

        return res.status(200).json({ success: true, message: "Email sent successfully!" });
      } catch (err: any) {
        return res.status(500).json({ error: "Failed to send email", details: err.message });
      }
    }

    // 2. API: Reply to Message
    if (method === "POST" && targetApiPath.includes("/api/reply-message")) {
      const { to, subject, html, text } = req.body || {};
      if (!to || !subject || !html) {
        return res.status(400).json({ error: "Recipient email, subject, and HTML are required" });
      }

      const gmailUser = process.env.GMAIL_USER;
      const gmailPass = process.env.GMAIL_APP_PASSWORD;

      if (!gmailUser || !gmailPass) {
        return res.status(200).json({ success: true, simulated: true, message: "Email queued." });
      }

      try {
        const nodemailerModule = await import("nodemailer");
        const nodemailer = nodemailerModule.default || nodemailerModule;
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: gmailUser, pass: gmailPass },
        });

        await transporter.sendMail({
          from: `"Shakibul Islam Prohor" <${gmailUser}>`,
          to,
          subject,
          text: text || "View in HTML client",
          html,
        });

        return res.status(200).json({ success: true, message: `Email reply sent to ${to}` });
      } catch (err: any) {
        return res.status(500).json({ error: "Failed to send email", details: err.message });
      }
    }

    // 3. API: Send Broadcast
    if (method === "POST" && targetApiPath.includes("/api/send-broadcast")) {
      const { recipients, subject, html, text } = req.body || {};
      if (!Array.isArray(recipients) || recipients.length === 0 || !subject || !html) {
        return res.status(400).json({ error: "Recipients, subject, and HTML are required" });
      }

      const gmailUser = process.env.GMAIL_USER;
      const gmailPass = process.env.GMAIL_APP_PASSWORD;

      if (!gmailUser || !gmailPass) {
        return res.status(200).json({ success: true, simulated: true, count: recipients.length });
      }

      try {
        const nodemailerModule = await import("nodemailer");
        const nodemailer = nodemailerModule.default || nodemailerModule;
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: gmailUser, pass: gmailPass },
        });

        await transporter.sendMail({
          from: `"Shakibul Islam Prohor" <${gmailUser}>`,
          to: gmailUser,
          bcc: recipients,
          subject,
          text: text || "View in HTML client",
          html,
        });

        return res.status(200).json({ success: true, count: recipients.length });
      } catch (err: any) {
        return res.status(500).json({ error: "Failed to dispatch broadcast", details: err.message });
      }
    }

    // 4. Handle GET / HEAD Requests for Web Pages
    if (method === "GET" || method === "HEAD") {
      const queryRoute = (req.query?.route as string);
      const forwardedUri = (req.headers?.["x-forwarded-uri"] as string);
      const matchedPath = (req.headers?.["x-matched-path"] as string);
      const rawUrl = url ? url.split("?")[0] : "/";

      let requestedPath = "/";
      if (queryRoute && queryRoute !== "/api" && queryRoute !== "/api/index") {
        requestedPath = queryRoute;
      } else if (forwardedUri && !forwardedUri.startsWith("/api")) {
        requestedPath = forwardedUri.split("?")[0];
      } else if (matchedPath && !matchedPath.startsWith("/api")) {
        requestedPath = matchedPath.split("?")[0];
      } else if (rawUrl && !rawUrl.startsWith("/api")) {
        requestedPath = rawUrl;
      }

      // Serve static about.html if requested
      if (requestedPath === "/about" || requestedPath === "/about/") {
        const aboutPaths = [
          path.join(process.cwd(), "about.html"),
          path.join(process.cwd(), "dist", "about.html"),
        ];
        for (const ap of aboutPaths) {
          try {
            if (fs.existsSync(ap)) {
              const content = fs.readFileSync(ap, "utf-8");
              res.setHeader("Content-Type", "text/html; charset=utf-8");
              return res.status(200).send(content);
            }
          } catch {}
        }
      }

      // ONLY specific project details and specific article/blog details are server-side rendered with dynamic data
      const cleanCheckPath = requestedPath.split("?")[0].replace(/\/+$/, "");
      const isSpecificProject = /^\/(?:my-projects|projects)\/([^\/]+)$/i.test(cleanCheckPath);
      const isSpecificArticle = /^\/(?:articles|blog)\/([^\/]+)$/i.test(cleanCheckPath);

      if (isSpecificProject || isSpecificArticle) {
        try {
          const template = getTemplateHtml();
          const html = await injectDynamicSeo(template, requestedPath);
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          return res.status(200).send(html);
        } catch (err: any) {
          console.error("[Vercel SSR] Error injecting dynamic SEO:", err);
          const fallback = getTemplateHtml();
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          return res.status(200).send(fallback);
        }
      }

      // All other pages (Home /, /contact, /skills, /my-projects list, /blog list, etc.)
      // are served with normal standard index.html for pure Client-Side Routing (CSR)
      const template = getTemplateHtml();
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(template);
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (globalErr: any) {
    console.error("[Vercel Handler] Global catch triggered:", globalErr);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(BASELINE_HTML);
  }
}
