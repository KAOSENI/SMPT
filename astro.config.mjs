// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'fs';

// Leer la versión desde package.json
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

// https://astro.build/config
export default defineConfig({
  site: 'https://kaoseni.github.io',
  base: '/SMPT',
  outDir: './dist',
  vite: {
    define: {
      // Inyecta la versión como variable de entorno disponible en el cliente
      'import.meta.env.APP_VERSION': JSON.stringify(pkg.version)
    },
    optimizeDeps: {
      force: true,
      include: [
        'echarts',
        '@lucide/astro'
      ]
    },
    server: {
      fs: {
        strict: false
      }
    }
  }
});