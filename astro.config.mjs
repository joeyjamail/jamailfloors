// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://jamailfloors.com',
  trailingSlash: 'ignore',
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover'
  },
  build: {
    assets: '_astro',
    inlineStylesheets: 'auto'
  },
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) => !/\/(404|policy|privacy-policy|terms-and-conditions)\/?$/.test(page),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        if (item.url === 'https://jamailfloors.com/') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        } else if (item.url.includes('/products/') && item.url !== 'https://jamailfloors.com/products/') {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        }
        return item;
      }
    })
  ],
  vite: {
    css: {
      postcss: './postcss.config.cjs'
    },
    build: {
      cssMinify: 'lightningcss'
    }
  }
});
