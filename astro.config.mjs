// @ts-check
import { readdirSync, readFileSync, rmdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

/**
 * Bilder ohne geklärte Lizenz nicht ausliefern.
 * Jede Datei, die in src/content/bilder bei einem Eintrag ohne «lizenz_geklaert: true» steht,
 * wird nach dem Build aus dist/ gelöscht, ausser PUBLIC_SHOW_ENTWUERFE=true ist gesetzt.
 * So ist ein Bild ohne bestätigte Nutzungsrechte nicht unter seiner Adresse abrufbar.
 */
function bilderOhneLizenzEntfernen() {
  return {
    name: 'bilder-ohne-lizenz-entfernen',
    hooks: {
      /** @param {{ dir: URL, logger: { info: (m: string) => void } }} optionen */
      'astro:build:done': ({ dir, logger }) => {
        const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), 'PUBLIC_');
        if (env.PUBLIC_SHOW_ENTWUERFE === 'true') return;
        const ordner = new URL('./src/content/bilder/', import.meta.url);
        for (const name of readdirSync(ordner).filter((n) => /\.ya?ml$/.test(n))) {
          const yaml = readFileSync(new URL(name, ordner), 'utf8');
          // Im Zweifel gilt die Lizenz als nicht geklärt.
          if (/^lizenz_geklaert:\s*true\s*(#.*)?$/m.test(yaml)) continue;
          for (const [, pfad] of yaml.matchAll(/^(?:datei|fallback):\s*["']?(\/bilder\/[^\s"'#]+)/gm)) {
            rmSync(fileURLToPath(new URL(`.${pfad}`, dir)), { force: true });
            logger.info(`${pfad} nicht ausgeliefert (lizenz_geklaert: false)`);
          }
        }
        // Leeren Ordner dist/bilder nicht ausliefern
        const bilderOrdner = fileURLToPath(new URL('./bilder/', dir));
        try {
          if (readdirSync(bilderOrdner).length === 0) rmdirSync(bilderOrdner);
        } catch {
          // Ordner gibt es nicht: nichts zu tun
        }
      },
    },
  };
}

/**
 * Pfade von Blogbeiträgen, die nicht in die Sitemap gehören:
 * freigabe: false (in DE oder FR). Solche Beiträge werden nur in Vorschauen mit Entwürfen gebaut.
 */
function gesperrteBlogPfade() {
  const pfade = new Set();
  const ordner = new URL('./src/content/blog/', import.meta.url);
  for (const sprache of ['de', 'fr']) {
    for (const name of readdirSync(new URL(`${sprache}/`, ordner)).filter((n) => n.endsWith('.md'))) {
      const md = readFileSync(new URL(`${sprache}/${name}`, ordner), 'utf8');
      // Im Zweifel gilt der Beitrag als gesperrt.
      if (/^freigabe:\s*true\s*(#.*)?$/m.test(md)) continue;
      const slug = name.replace(/\.md$/, '');
      pfade.add(`/blog/${slug}/`);
      pfade.add(`/fr/blog/${slug}/`);
    }
  }
  return pfade;
}

/** Sitemap: ohne 404-Seite und ohne gesperrte Blogbeiträge. */
function inSitemap(/** @type {string} */ seite) {
  const pfad = new URL(seite).pathname.replace(/\/?$/, '/');
  if (/^\/(fr\/)?404\/$/.test(pfad)) return false;
  return !gesperrteBlogPfade().has(pfad);
}

export default defineConfig({
  site: 'https://charlottelingg.com',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      filter: inSitemap,
      i18n: {
        defaultLocale: 'de',
        locales: { de: 'de', fr: 'fr' },
      },
    }),
    bilderOhneLizenzEntfernen(),
  ],
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'fr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
