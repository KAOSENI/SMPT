// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://kaoseni.github.io',
  base: '/SMPT',
  outDir: './dist',
  vite: {
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
