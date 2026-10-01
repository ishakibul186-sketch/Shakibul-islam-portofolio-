import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const distIndexPath = path.join(rootDir, "dist", "index.html");
const apiDir = path.join(rootDir, "api");
const templateJsonPath = path.join(apiDir, "template.json");

try {
  if (fs.existsSync(distIndexPath)) {
    const distHtml = fs.readFileSync(distIndexPath, "utf-8");

    // Extract compiled script and CSS links
    const scriptMatch = distHtml.match(/<script\s+type=["']module["']\s+crossorigin\s+src=["']([^"']+)["']><\/script>/i)
      || distHtml.match(/<script\s+type=["']module["']\s+src=["']([^"']+)["']><\/script>/i);
    const cssMatch = distHtml.match(/<link\s+rel=["']stylesheet["']\s+crossorigin\s+href=["']([^"']+)["']\/?>/i)
      || distHtml.match(/<link\s+rel=["']stylesheet["']\s+href=["']([^"']+)["']\/?>/i);

    const mainJs = scriptMatch ? scriptMatch[1] : "";
    const mainCss = cssMatch ? cssMatch[1] : "";

    const payload = {
      mainJs,
      mainCss,
      html: distHtml,
      updatedAt: new Date().toISOString()
    };

    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }

    fs.writeFileSync(templateJsonPath, JSON.stringify(payload, null, 2), "utf-8");
    console.log(`[sync-template] Successfully synced dist/index.html to api/template.json (mainJs: ${mainJs}, mainCss: ${mainCss})`);
  } else {
    console.warn(`[sync-template] Warning: dist/index.html not found at ${distIndexPath}`);
  }
} catch (err) {
  console.error("[sync-template] Error syncing template:", err);
}
