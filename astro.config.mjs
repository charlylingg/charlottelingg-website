// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://charlottelingg.com',
  output: 'static',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'fr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
