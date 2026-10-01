// api/index.ts
import path from "path";
import fs from "fs";

// api/seoInjector.ts
var CACHE_TTL_MS = 60 * 1e3;
var projectCache = /* @__PURE__ */ new Map();
var articleCache = /* @__PURE__ */ new Map();
var RTDB_BASE = "https://shakibul-islam-ltd-server-default-rtdb.firebaseio.com";
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function resolveOgImage(ogImage, thumbnail) {
  if (ogImage && typeof ogImage === "string" && ogImage.trim().startsWith("http")) {
    return ogImage.trim();
  }
  if (thumbnail && typeof thumbnail === "string" && thumbnail.trim().startsWith("http")) {
    return thumbnail.trim();
  }
  return "https://shakibul-islam-portofolio.vercel.app/my-projects-banner.png";
}
function resolveCanonicalUrl(pathUrl, explicitCanonical) {
  if (explicitCanonical && typeof explicitCanonical === "string" && explicitCanonical.trim().startsWith("http")) {
    return explicitCanonical.trim();
  }
  const cleanPath = pathUrl.startsWith("/") ? pathUrl : `/${pathUrl}`;
  return `https://shakibul-islam-portofolio.vercel.app${cleanPath}`;
}
async function fetchProjectById(id) {
  const cleanId = id.trim();
  const cached = projectCache.get(cleanId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
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
  try {
    const allRes = await fetch(`${RTDB_BASE}/projects.json`);
    if (allRes.ok) {
      const allData = await allRes.json();
      if (allData && typeof allData === "object") {
        for (const [key, val] of Object.entries(allData)) {
          if (!val || typeof val !== "object" || key === "totalstring") continue;
          const p = val;
          if (key === cleanId || p.id === cleanId || String(p.numericId) === cleanId || p.slug === cleanId) {
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
async function fetchArticleById(id) {
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
          const a = val;
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
function replaceOrInsertMeta(html, regex, replacement, fallbackInsertBefore = "</head>") {
  if (regex.test(html)) {
    return html.replace(regex, replacement);
  }
  return html.replace(fallbackInsertBefore, `    ${replacement}
  ${fallbackInsertBefore}`);
}
async function injectDynamicSeo(html, requestPath, params) {
  if (!html) return "<!doctype html><html><body>Error loading page</body></html>";
  const cleanPath = requestPath.split("?")[0].replace(/\/+$/, "");
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
      let projectKeywords = [];
      if (typeof project.metaKeywords === "string" && project.metaKeywords.trim()) {
        projectKeywords = project.metaKeywords.split(",").map((k) => k.trim()).filter(Boolean);
      } else if (Array.isArray(project.keywords) && project.keywords.length > 0) {
        projectKeywords = project.keywords.map((k) => String(k).trim()).filter(Boolean);
      } else if (Array.isArray(project.metaKeywords) && project.metaKeywords.length > 0) {
        projectKeywords = project.metaKeywords.map((k) => String(k).trim()).filter(Boolean);
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
      const techList = Array.isArray(project.coreServices) ? project.coreServices.map((s) => `<li style="display:inline-block;margin:4px 8px;padding:4px 12px;background:#1e1b4b;border:1px solid #4338ca;border-radius:9999px;font-size:0.875rem;">${escapeHtml(s)}</li>`).join("") : "";
      const featureList = Array.isArray(project.features) ? project.features.map((f) => `<li style="margin:8px 0;">${escapeHtml(f)}</li>`).join("") : "";
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
    const schemaTag = `<script type="application/ld+json">
${JSON.stringify(softwareSchema, null, 2)}
    </script>`;
    result = result.replace(/<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/i, schemaTag);
    if (rootHtml) {
      result = result.replace(/<div\s+id=["']root["']>\s*<\/div>/i, `<div id="root">${rootHtml}</div>`);
    }
    return result;
  }
  const articleMatch = cleanPath.match(/^\/articles\/([^\/]+)$/);
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
    const schemaTag = `<script type="application/ld+json">
${JSON.stringify(articleSchema, null, 2)}
    </script>`;
    result = result.replace(/<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/i, schemaTag);
    if (rootHtml) {
      result = result.replace(/<div\s+id=["']root["']>\s*<\/div>/i, `<div id="root">${rootHtml}</div>`);
    }
    return result;
  }
  if (cleanPath === "/my-projects" || cleanPath === "/projects") {
    let result = html;
    const title = "My Projects & Software Portfolio | Shakibul Islam Prohor";
    const description = "Explore full stack web applications, POS software, AI systems, and production software engineered by Shakibul Islam Prohor.";
    const keywords = "Shakibul Islam Prohor Projects, Full Stack Projects, Web Applications, Software Portfolio, React Apps, Node.js Projects";
    const canonical = "https://shakibul-islam-portofolio.vercel.app/my-projects";
    const image = "https://shakibul-islam-portofolio.vercel.app/my-projects-banner.png";
    result = result.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
    result = replaceOrInsertMeta(result, /<meta\s+[^>]*?name=["']title["'][^>]*?\/?>/i, `<meta name="title" content="${title}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+[^>]*?name=["']description["'][^>]*?\/?>/i, `<meta name="description" content="${description}" />`);
    const keywordsRegex = /<meta\s+[^>]*?name=["']keywords["'][^>]*?\/?>/i;
    const keywordsRegexAlt = /<meta\s+[^>]*?content=["'][^"']*?["'][^>]*?name=["']keywords["'][^>]*?\/?>/i;
    if (keywordsRegex.test(result)) {
      result = result.replace(keywordsRegex, `<meta name="keywords" content="${escapeHtml(keywords)}" />`);
    } else if (keywordsRegexAlt.test(result)) {
      result = result.replace(keywordsRegexAlt, `<meta name="keywords" content="${escapeHtml(keywords)}" />`);
    } else {
      result = replaceOrInsertMeta(result, keywordsRegex, `<meta name="keywords" content="${escapeHtml(keywords)}" />`);
    }
    result = replaceOrInsertMeta(result, /<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:url["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:image" content="${image}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+name=["']twitter:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+name=["']twitter:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+name=["']twitter:image["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="twitter:image" content="${image}" />`);
    return result;
  }
  if (cleanPath === "/skills") {
    let result = html;
    const title = "Technical Skills & Tech Stack | Shakibul Islam Prohor";
    const description = "Explore the technical capabilities, programming languages, libraries, and frameworks utilized by Shakibul Islam Prohor.";
    const canonical = "https://shakibul-islam-portofolio.vercel.app/skills";
    result = result.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
    result = replaceOrInsertMeta(result, /<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="description" content="${description}" />`);
    result = replaceOrInsertMeta(result, /<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:url["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
    return result;
  }
  if (cleanPath === "/blog") {
    let result = html;
    const title = "Technical Blog & Articles | Shakibul Islam Prohor";
    const description = "Read insightful web development tutorials, React best practices, full stack architecture guides, and tech articles by Shakibul Islam Prohor.";
    const canonical = "https://shakibul-islam-portofolio.vercel.app/blog";
    result = result.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
    result = replaceOrInsertMeta(result, /<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="description" content="${description}" />`);
    result = replaceOrInsertMeta(result, /<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:url["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
    return result;
  }
  if (cleanPath === "/contact") {
    let result = html;
    const title = "Contact & Hire Shakibul Islam Prohor | Full Stack Developer";
    const description = "Get in touch with Shakibul Islam Prohor for web development projects, software engineering consultations, freelance inquiries, and collaborations.";
    const canonical = "https://shakibul-islam-portofolio.vercel.app/contact";
    result = result.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
    result = replaceOrInsertMeta(result, /<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="description" content="${description}" />`);
    result = replaceOrInsertMeta(result, /<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+property=["']og:url["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
    return result;
  }
  if (cleanPath === "/404") {
    let result = html;
    const title = "404: Page Not Found | Shakibul Islam Prohor";
    const description = "The page you requested does not exist or has been moved.";
    result = result.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
    result = replaceOrInsertMeta(result, /<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="description" content="${description}" />`);
    result = replaceOrInsertMeta(result, /<meta\s+name=["']robots["']\s+content=["'][\s\S]*?["']\s*\/?>/i, `<meta name="robots" content="noindex, follow" />`);
    return result;
  }
  return html;
}

// api/embeddedTemplate.ts
var EMBEDDED_INDEX_HTML = '<!doctype html>\n<html lang="en" dir="ltr" prefix="og: https://ogp.me/ns# profile: https://ogp.me/ns/profile#">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />\n    <meta http-equiv="X-UA-Compatible" content="IE=edge" />\n    \n    <!-- Primary SEO Meta Tags -->\n    <title>Shakibul Islam Prohor | Full Stack Developer & Software Engineer</title>\n    <meta name="title" content="Shakibul Islam Prohor | Full Stack Developer & Software Engineer" />\n    <meta name="description" content="Official portfolio of Shakibul Islam Prohor \u2013 Full Stack Developer & Software Engineer specializing in modern React, TypeScript, Node.js, Firebase, cloud architecture, and high-performance web applications. Explore featured projects, tech articles, and custom development services." />\n    <meta name="keywords" content="Shakibul Islam Prohor, Prohor, Shakibul Prohor, Full Stack Developer, Full Stack Developer Bangladesh, Software Engineer Bangladesh, React Developer, Node.js Developer, TypeScript Specialist, Web Application Developer, Frontend Developer, Backend Developer, Firebase Developer, Next.js Developer, Web Designer, JavaScript Developer, UI UX Developer, API Developer, Portfolio Website, Bangladeshi Programmer, Best Web Developer Bangladesh, Shakibul Islam Portfolio, Hire Full Stack Developer, Freelance Web Developer" />\n    <meta name="author" content="Shakibul Islam Prohor" />\n    <meta name="creator" content="Shakibul Islam Prohor" />\n    <meta name="publisher" content="Shakibul Islam Prohor" />\n    <meta name="application-name" content="Shakibul Islam Prohor Portfolio" />\n    <meta name="category" content="Portfolio / Web Development / Technology" />\n    <meta name="classification" content="Software Engineering & Web Development" />\n    <meta name="rating" content="General" />\n    <meta name="distribution" content="Global" />\n    <meta name="coverage" content="Worldwide" />\n    <meta name="revisit-after" content="7 days" />\n\n    <!-- Crawling & Indexing Directives -->\n    <meta name="google-site-verification" content="googlead42dd66f9e0cb82" />\n    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />\n    <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />\n    <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />\n\n    <!-- Canonical URL -->\n    <link rel="canonical" href="https://shakibul-islam-portofolio.vercel.app/" />\n\n    <!-- Favicon & Touch Icons (Site Logo / Avatar) -->\n    <link rel="icon" type="image/png" href="/prohor-v2.png" sizes="any" />\n    <link rel="apple-touch-icon" href="/prohor-v2.png" />\n    <link rel="shortcut icon" href="/prohor-v2.png" type="image/png" />\n\n    <!-- Theme & Color Scheme -->\n    <meta name="theme-color" content="#030014" />\n    <meta name="msapplication-TileColor" content="#030014" />\n    <meta name="msapplication-navbutton-color" content="#030014" />\n    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />\n    <meta name="color-scheme" content="dark" />\n\n    <!-- Geographic & Localization Metadata -->\n    <meta name="geo.region" content="BD-13" />\n    <meta name="geo.placename" content="Dhaka, Bangladesh" />\n    <meta name="geo.position" content="23.8103;90.4125" />\n    <meta name="ICBM" content="23.8103, 90.4125" />\n\n    <!-- Open Graph / Facebook / LinkedIn / WhatsApp -->\n    <meta property="og:type" content="profile" />\n    <meta property="og:site_name" content="Shakibul Islam Prohor Portfolio" />\n    <meta property="og:locale" content="en_US" />\n    <meta property="og:url" content="https://shakibul-islam-portofolio.vercel.app/" />\n    <meta property="og:title" content="Shakibul Islam Prohor | Full Stack Developer & Software Engineer" />\n    <meta property="og:description" content="Official portfolio of Shakibul Islam Prohor \u2013 Full Stack Developer specializing in React, TypeScript, Node.js, and cloud architecture. Explore projects, articles, and developer insights." />\n    <meta property="og:image" content="https://shakibul-islam-portofolio.vercel.app/prohor-v2.png" />\n    <meta property="og:image:secure_url" content="https://shakibul-islam-portofolio.vercel.app/prohor-v2.png" />\n    <meta property="og:image:type" content="image/png" />\n    <meta property="og:image:width" content="800" />\n    <meta property="og:image:height" content="800" />\n    <meta property="og:image:alt" content="Shakibul Islam Prohor - Full Stack Developer Logo & Profile" />\n    <meta property="profile:first_name" content="Shakibul Islam" />\n    <meta property="profile:last_name" content="Prohor" />\n    <meta property="profile:username" content="prohor" />\n    <meta property="profile:gender" content="male" />\n\n    <!-- Twitter / X Card -->\n    <meta name="twitter:card" content="summary_large_image" />\n    <meta name="twitter:site" content="@prohor" />\n    <meta name="twitter:creator" content="@prohor" />\n    <meta name="twitter:url" content="https://shakibul-islam-portofolio.vercel.app/" />\n    <meta name="twitter:title" content="Shakibul Islam Prohor | Full Stack Developer & Software Engineer" />\n    <meta name="twitter:description" content="Official portfolio of Shakibul Islam Prohor \u2013 Full Stack Developer specializing in React, TypeScript, Node.js, and cloud architecture." />\n    <meta name="twitter:image" content="https://shakibul-islam-portofolio.vercel.app/prohor-v2.png" />\n    <meta name="twitter:image:alt" content="Shakibul Islam Prohor - Full Stack Developer Profile Photo" />\n\n    <!-- Performance & Preconnect Optimization -->\n    <link rel="preconnect" href="https://fonts.googleapis.com" />\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n    <link rel="dns-prefetch" href="https://fonts.googleapis.com" />\n    <link rel="dns-prefetch" href="https://fonts.gstatic.com" />\n\n    <!-- Schema.org Multi-Entity Structured Data (JSON-LD) -->\n    <script type="application/ld+json">\n    {\n      "@context": "https://schema.org",\n      "@graph": [\n        {\n          "@type": "Person",\n          "@id": "https://shakibul-islam-portofolio.vercel.app/#person",\n          "name": "Shakibul Islam Prohor",\n          "alternateName": ["Prohor", "Shakibul Prohor", "Shakibul Islam"],\n          "givenName": "Shakibul Islam",\n          "familyName": "Prohor",\n          "gender": "https://schema.org/Male",\n          "nationality": "Bangladeshi",\n          "jobTitle": "Full Stack Developer & Software Engineer",\n          "url": "https://shakibul-islam-portofolio.vercel.app/",\n          "image": "https://shakibul-islam-portofolio.vercel.app/prohor-v2.png",\n          "description": "Full Stack Developer and Software Engineer specializing in React, TypeScript, Node.js, Firebase, modern cloud systems, and scalable web solutions.",\n          "email": "mailto:ishakibul186@gmail.com",\n          "address": {\n            "@type": "PostalAddress",\n            "addressLocality": "Dhaka",\n            "addressCountry": "Bangladesh"\n          },\n          "knowsAbout": [\n            "Full Stack Web Development",\n            "React.js",\n            "Next.js",\n            "TypeScript",\n            "JavaScript",\n            "Node.js",\n            "Express.js",\n            "Tailwind CSS",\n            "Firebase & Cloud Databases",\n            "RESTful APIs & GraphQL",\n            "Git & GitHub Version Control",\n            "Software Architecture & Optimization"\n          ],\n          "sameAs": [\n            "https://github.com/ishakibul186-sketch",\n            "https://www.instagram.com/about_prohor/",\n            "https://www.facebook.com/prohor245",\n            "https://build-by-prohor.vercel.app"\n          ]\n        },\n        {\n          "@type": "WebSite",\n          "@id": "https://shakibul-islam-portofolio.vercel.app/#website",\n          "url": "https://shakibul-islam-portofolio.vercel.app/",\n          "name": "Shakibul Islam Prohor Portfolio",\n          "description": "Portfolio of Shakibul Islam Prohor featuring modern web applications, software engineering projects, technical articles, and professional services.",\n          "publisher": {\n            "@id": "https://shakibul-islam-portofolio.vercel.app/#person"\n          },\n          "inLanguage": "en-US"\n        },\n        {\n          "@type": "ProfilePage",\n          "@id": "https://shakibul-islam-portofolio.vercel.app/#profilepage",\n          "url": "https://shakibul-islam-portofolio.vercel.app/",\n          "name": "Shakibul Islam Prohor | Full Stack Developer Profile",\n          "isPartOf": {\n            "@id": "https://shakibul-islam-portofolio.vercel.app/#website"\n          },\n          "mainEntity": {\n            "@id": "https://shakibul-islam-portofolio.vercel.app/#person"\n          },\n          "breadcrumb": {\n            "@type": "BreadcrumbList",\n            "itemListElement": [\n              {\n                "@type": "ListItem",\n                "position": 1,\n                "name": "Home",\n                "item": "https://shakibul-islam-portofolio.vercel.app/"\n              },\n              {\n                "@type": "ListItem",\n                "position": 2,\n                "name": "Projects",\n                "item": "https://shakibul-islam-portofolio.vercel.app/my-projects"\n              }\n            ]\n          }\n        },\n        {\n          "@type": "ProfessionalService",\n          "@id": "https://shakibul-islam-portofolio.vercel.app/#service",\n          "name": "Shakibul Islam Prohor Web Development Services",\n          "image": "https://shakibul-islam-portofolio.vercel.app/prohor-v2.png",\n          "url": "https://shakibul-islam-portofolio.vercel.app/",\n          "provider": {\n            "@id": "https://shakibul-islam-portofolio.vercel.app/#person"\n          },\n          "areaServed": "Worldwide",\n          "serviceType": [\n            "Full Stack Web Development",\n            "Frontend React/Next.js Engineering",\n            "Backend API & Database Development",\n            "Custom Web Application Development",\n            "UI/UX Design Implementation"\n          ]\n        }\n      ]\n    }\n    </script>\n    <script type="module" crossorigin src="/assets/main-Blcsmcmx.js"></script>\n    <link rel="stylesheet" crossorigin href="/assets/main-CqkyRn-6.css">\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>\n\n';

// api/index.ts
function getTemplateHtml() {
  const candidates = [];
  try {
    candidates.push(path.join(process.cwd(), "dist", "index.html"));
    candidates.push(path.join(process.cwd(), "index.html"));
  } catch {
  }
  try {
    if (typeof __dirname !== "undefined") {
      candidates.push(path.resolve(__dirname, "../dist/index.html"));
      candidates.push(path.resolve(__dirname, "../../dist/index.html"));
      candidates.push(path.resolve(__dirname, "dist/index.html"));
      candidates.push(path.resolve(__dirname, "index.html"));
      candidates.push(path.resolve(__dirname, "../index.html"));
    }
  } catch {
  }
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf-8");
        if (content && content.length > 100) {
          return content;
        }
      }
    } catch {
    }
  }
  return EMBEDDED_INDEX_HTML;
}
async function handler(req, res) {
  try {
    const url = req.url || "";
    const method = req.method || "GET";
    const targetApiPath = req.headers?.["x-forwarded-uri"] || req.headers?.["x-matched-path"] || url;
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
          error: "Server email configuration is missing."
        });
      }
      try {
        const nodemailerModule = await import("nodemailer");
        const nodemailer = nodemailerModule.default || nodemailerModule;
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: gmailUser, pass: gmailPass }
        });
        await transporter.sendMail({
          from: `"${name}" <${gmailUser}>`,
          to: gmailUser,
          replyTo: email,
          subject: `[Portfolio Contact] ${subject}`,
          text: `From: ${name} (${email})
Subject: ${subject}

${message}`,
          html: `<div><h2>New Portfolio Message</h2><p><strong>From:</strong> ${name} (${email})</p><p><strong>Subject:</strong> ${subject}</p><p>${message}</p></div>`
        });
        return res.status(200).json({ success: true, message: "Email sent successfully!" });
      } catch (err) {
        return res.status(500).json({ error: "Failed to send email", details: err.message });
      }
    }
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
          auth: { user: gmailUser, pass: gmailPass }
        });
        await transporter.sendMail({
          from: `"Shakibul Islam Prohor" <${gmailUser}>`,
          to,
          subject,
          text: text || "View in HTML client",
          html
        });
        return res.status(200).json({ success: true, message: `Email reply sent to ${to}` });
      } catch (err) {
        return res.status(500).json({ error: "Failed to send email", details: err.message });
      }
    }
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
          auth: { user: gmailUser, pass: gmailPass }
        });
        await transporter.sendMail({
          from: `"Shakibul Islam Prohor" <${gmailUser}>`,
          to: gmailUser,
          bcc: recipients,
          subject,
          text: text || "View in HTML client",
          html
        });
        return res.status(200).json({ success: true, count: recipients.length });
      } catch (err) {
        return res.status(500).json({ error: "Failed to dispatch broadcast", details: err.message });
      }
    }
    if (method === "GET" || method === "HEAD") {
      const queryRoute = req.query?.route;
      const forwardedUri = req.headers?.["x-forwarded-uri"];
      const matchedPath = req.headers?.["x-matched-path"];
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
      if (requestedPath === "/about" || requestedPath === "/about/") {
        const aboutPaths = [
          path.join(process.cwd(), "about.html"),
          path.join(process.cwd(), "dist", "about.html")
        ];
        try {
          if (typeof __dirname !== "undefined") {
            aboutPaths.push(path.resolve(__dirname, "../about.html"));
            aboutPaths.push(path.resolve(__dirname, "../../about.html"));
          }
        } catch {
        }
        for (const ap of aboutPaths) {
          try {
            if (fs.existsSync(ap)) {
              const content = fs.readFileSync(ap, "utf-8");
              res.setHeader("Content-Type", "text/html; charset=utf-8");
              return res.status(200).send(content);
            }
          } catch {
          }
        }
      }
      try {
        const template = getTemplateHtml();
        const html = await injectDynamicSeo(template, requestedPath);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.status(200).send(html);
      } catch (err) {
        console.error("[Vercel SSR] Error injecting dynamic SEO:", err);
        const fallback = getTemplateHtml();
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.status(200).send(fallback);
      }
    }
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (globalErr) {
    console.error("[Vercel Handler] Global catch triggered:", globalErr);
    try {
      const fallback = getTemplateHtml();
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(fallback);
    } catch {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(EMBEDDED_INDEX_HTML);
    }
  }
}
export {
  handler as default
};
