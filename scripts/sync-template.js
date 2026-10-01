import fs from "fs";
import path from "path";

try {
  const distIndex = path.join(process.cwd(), "dist", "index.html");
  const fallbackIndex = path.join(process.cwd(), "index.html");
  let html = "";
  if (fs.existsSync(distIndex)) {
    html = fs.readFileSync(distIndex, "utf-8");
  } else if (fs.existsSync(fallbackIndex)) {
    html = fs.readFileSync(fallbackIndex, "utf-8");
  }

  const outDir = path.join(process.cwd(), "api", "_lib");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.join(outDir, "embeddedTemplate.ts");
  const code = `// Auto-generated embedded fallback HTML template for Vercel
export const EMBEDDED_INDEX_HTML = ${JSON.stringify(html)};
`;

  fs.writeFileSync(outPath, code, "utf-8");
  console.log(`[sync-template] Successfully synced ${outPath} (${html.length} bytes)`);
} catch (err) {
  console.warn("[sync-template] Warning: Failed to sync embedded template:", err);
}
