/**
 * Zugriff auf die Bilder aus src/content/bilder, mit demselben Mechanismus wie bei den Texten:
 * - lizenz_geklaert: true  -> Bild erscheint.
 * - lizenz_geklaert: false -> Bild erscheint nur, wenn beim Build PUBLIC_SHOW_ENTWUERFE=true gesetzt ist
 *   (dann mit dem Label «Entwurf – nicht freigegeben»). Sonst undefined: Die Seite zeigt den Platzhalter.
 */
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { SHOW_ENTWUERFE } from '../config';
import { tf, type Locale } from '../i18n';
import { getBlog } from './inhalte';

/** Einträge in src/content/bilder für die festen Bildstellen der Website */
export const BILD_HERO = 'hero-soelden-2026';
export const BILD_PORTRAIT = 'portrait-charlotte-lingg';
export const BILD_TEILEN = 'og-charlotte-lingg';

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

/**
 * Bildnachweise für das Impressum: alle Fotos, die auf der Website sichtbar im Einsatz sind
 * (Hero, Portrait, Blogbeiträge mit Foto), nach demselben Mechanismus wie auf den Seiten selbst.
 * Kommt ein neues Foto dazu oder ersetzt eines ein anderes, stimmt die Liste automatisch.
 * Das Vorschaubild beim Teilen (BILD_TEILEN) erscheint auf der Website nicht und fehlt deshalb hier.
 * Format: «Foto <Verwendung>: <Fotograf>» (Texte in src/i18n, bildnachweis.*).
 */
export async function getBildnachweise(locale: Locale): Promise<string[]> {
  const zeilen: string[] = [];
  const hero = await getBild(BILD_HERO, locale);
  if (hero) zeilen.push(tf(locale, 'bildnachweis.hero', { name: hero.fotograf }));
  const portrait = await getBild(BILD_PORTRAIT, locale);
  if (portrait) zeilen.push(tf(locale, 'bildnachweis.portrait', { name: portrait.fotograf }));
  for (const beitrag of await getBlog(locale)) {
    if (!beitrag.data.bild) continue;
    const foto = await getBlogBild(beitrag.slug, locale);
    if (foto) zeilen.push(tf(locale, 'bildnachweis.blog', { titel: beitrag.data.titel, name: foto.fotograf }));
  }
  return zeilen;
}
