/**
 * Instagram-Beiträge für die Sektion «Unterwegs».
 *
 * Quelle: src/data/instagram.json und die Bilder in src/assets/instagram/. Beides schreibt nur das
 * Skript scripts/instagram-aktualisieren.mjs (npm run instagram, automatisch im Workflow
 * «Instagram aktualisieren»). Nie von Hand ändern.
 *
 * Der Build liest nur diese Dateien im Repository, nie das Netz.
 * Fehlt die Datei, ist sie leer oder enthält sie keine Beiträge: leere Liste (die Sektion zeigt die Platzhalter).
 * Stimmt der Inhalt nicht mit dem Schema überein oder fehlt ein Bild: Der Build bricht mit einer Meldung ab.
 */
import { existsSync, readFileSync } from 'node:fs';
import type { ImageMetadata } from 'astro';
import { z } from 'astro/zod';

const DATEI = './src/data/instagram.json';

const schema = z.object({
  aktualisiert: z.iso.datetime(),
  beitraege: z
    .array(
      z.object({
        id: z.string().regex(/^[A-Za-z0-9_-]+$/),
        permalink: z.url().regex(/^https:\/\/(www\.)?instagram\.com\//, 'Link muss auf instagram.com zeigen'),
        datum: z.iso.date(),
        typ: z.enum(['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM']),
        bild: z.string().regex(/^[A-Za-z0-9_-]+\.jpg$/),
        breite: z.number().int().positive(),
        hoehe: z.number().int().positive(),
      }),
    )
    .max(6),
});

export interface InstagramBeitrag extends Omit<z.infer<typeof schema>['beitraege'][number], 'datum'> {
  /** Datum des Beitrags (Mitternacht UTC, Anzeige mit format.datum) */
  datum: Date;
  /** Bild für astro:assets */
  bildDaten: ImageMetadata;
}

const bilder = import.meta.glob<ImageMetadata>('/src/assets/instagram/*.jpg', { eager: true, import: 'default' });

let cache: InstagramBeitrag[] | undefined;

export function getInstagramBeitraege(): InstagramBeitrag[] {
  if (cache) return cache;
  const text = existsSync(DATEI) ? readFileSync(DATEI, 'utf8').trim() : '';
  if (!text) return (cache = []);

  let roh: unknown;
  try {
    roh = JSON.parse(text);
  } catch {
    throw new Error(`${DATEI} ist kein gültiges JSON. Datei mit «npm run instagram» neu erzeugen.`);
  }
  // {} oder [] gelten als leer
  if (roh === null || (typeof roh === 'object' && Object.keys(roh).length === 0)) return (cache = []);

  const ergebnis = schema.safeParse(roh);
  if (!ergebnis.success) {
    throw new Error(`${DATEI} entspricht nicht dem Schema:\n${z.prettifyError(ergebnis.error)}`);
  }

  return (cache = ergebnis.data.beitraege.map((b) => {
    const bildDaten = bilder[`/src/assets/instagram/${b.bild}`];
    if (!bildDaten) throw new Error(`Bild src/assets/instagram/${b.bild} fehlt (Beitrag ${b.id}). Datei mit «npm run instagram» neu erzeugen.`);
    return { ...b, datum: new Date(`${b.datum}T00:00:00Z`), bildDaten };
  }));
}
