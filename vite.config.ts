import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';

function syncHtmlTemplatePlugin() {
  return {
    name: 'sync-html-template',
    closeBundle() {
      try {
        const distIndexPath = path.resolve(__dirname, 'dist', 'index.html');
        if (fs.existsSync(distIndexPath)) {
          const distHtml = fs.readFileSync(distIndexPath, 'utf-8');
          const scriptMatch = distHtml.match(/<script\s+type=["']module["']\s+crossorigin\s+src=["']([^"']+)["']><\/script>/i)
            || distHtml.match(/<script\s+type=["']module["']\s+src=["']([^"']+)["']><\/script>/i);
          const cssMatch = distHtml.match(/<link\s+rel=["']stylesheet["']\s+crossorigin\s+href=["']([^"']+)["']\/?>/i)
            || distHtml.match(/<link\s+rel=["']stylesheet["']\s+href=["']([^"']+)["']\/?>/i);
          const payload = {
            mainJs: scriptMatch ? scriptMatch[1] : "",
            mainCss: cssMatch ? cssMatch[1] : "",
            html: distHtml,
            updatedAt: new Date().toISOString()
          };
          const apiDir = path.resolve(__dirname, 'api');
          if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });
          fs.writeFileSync(path.resolve(apiDir, 'template.json'), JSON.stringify(payload, null, 2), 'utf-8');
        }
      } catch (err) {
        console.warn('[syncHtmlTemplatePlugin] Warning syncing template:', err);
      }
    }
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), syncHtmlTemplatePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          about: path.resolve(__dirname, 'about.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
