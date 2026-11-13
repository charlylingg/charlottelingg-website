/**
 * Zugriff auf die Bilder aus src/content/bilder, mit demselben Mechanismus wie bei den Texten:
 * - lizenz_geklaert: true  -> Bild erscheint.
 * - lizenz_geklaert: false -> Bild erscheint nur, wenn beim Build PUBLIC_SHOW_ENTWUERFE=true gesetzt ist
 *   (dann mit dem Label «Entwurf – nicht freigegeben»). Sonst undefined: Die Seite zeigt den Platzhalter.
 */
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { SHOW_ENTWUERFE } from '../config';
import type { Locale } from '../i18n';

type BildDaten = CollectionEntry<'bilder'>['data'];

export interface Bild extends BildDaten {
  /** Alt-Text in der Sprache der Seite */
  alt: string;
  /** true = Lizenz nicht geklärt, nur in der Vorschau mit Entwürfen sichtbar */
  entwurf: boolean;
}

/** Eintrag als Bild in der Sprache der Seite. undefined = Beispiel oder nicht freigegeben. */
function alsBild(eintrag: CollectionEntry<'bilder'> | undefined, locale: Locale): Bild | undefined {
  if (!eintrag || eintrag.data.beispiel) return undefined;
  const entwurf = !eintrag.data.lizenz_geklaert;
  if (entwurf && !SHOW_ENTWUERFE) return undefined;
  return { ...eintrag.data, alt: locale === 'fr' ? eintrag.data.alt_fr : eintrag.data.alt_de, entwurf };
}

/**
 * Bild nach Dateiname des Eintrags (z. B. «hero-soelden-2026»). undefined = nicht freigegeben oder nicht vorhanden.
 * Gibt es einen freigegebenen Eintrag mit «ersetzt: <id>», erscheint dieser an seiner Stelle.
 */
export async function getBild(id: string, locale: Locale): Promise<Bild | undefined> {
  const ersatz = (await getCollection('bilder', (e) => e.data.ersetzt === id))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((e) => alsBild(e, locale))
    .find(Boolean);
  return ersatz ?? alsBild(await getEntry('bilder', id), locale);
}

/**
 * Foto eines Blogbeitrags: Eintrag src/content/bilder/blog-<slug>.yaml,
 * z. B. blog-zurueck-im-weltcup für src/content/blog/de/zurueck-im-weltcup.md (gilt für DE und FR).
 */
export function getBlogBild(slug: string, locale: Locale): Promise<Bild | undefined> {
  return getBild(`blog-${slug}`, locale);
}
