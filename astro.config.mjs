// @ts-check
import { readdirSync, readFileSync, rmdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
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

export default defineConfig({
  site: 'https://charlottelingg.com',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [bilderOhneLizenzEntfernen()],
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'fr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
