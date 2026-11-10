/**
 * Zugriff auf die Inhaltsdateien mit Freigabe-Mechanismus und Sprach-Fallback.
 *
 * Freigabe:
 * - freigabe: true  -> immer sichtbar.
 * - freigabe: false -> nur sichtbar, wenn beim Build PUBLIC_SHOW_ENTWUERFE=true gesetzt ist
 *   (dann mit dem Label «Entwurf – nicht freigegeben»). Sonst wird der Inhalt gar nicht gebaut.
 *
 * Französisch:
 * - Zu jeder Datei unter de/ gibt es eine gleichnamige Datei unter fr/.
 * - Solange dort uebersetzt: false steht, zeigt die französische Seite den deutschen Text.
 * - Auf der französischen Seite ist ein Inhalt nur freigegeben, wenn die fr-Datei freigegeben ist
 *   und (falls noch nicht übersetzt) auch die de-Datei.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { SHOW_ENTWUERFE } from '../config';
import type { Locale } from '../i18n';

type TexteEintrag = CollectionEntry<'texte'>;
type TexteDaten = TexteEintrag['data'];
export type Sektion = TexteDaten['sektion'];
export type TexteVon<S extends Sektion> = Extract<TexteDaten, { sektion: S }>;
type BlogEintrag = CollectionEntry<'blog'>;

export interface Aufgeloest<E, D> {
  /** Der Eintrag, dessen Text angezeigt wird (für render()) */
  eintrag: E;
  data: D;
  /** Sprache des angezeigten Texts (kann auf der FR-Seite «de» sein) */
  lang: Locale;
  /** true = nicht freigegeben, nur in der Vorschau mit Entwürfen sichtbar */
  entwurf: boolean;
  /** Pfad ohne Sprachordner, z. B. «weg/station-01-zermatt» */
  pfad: string;
}

const sprachordner = /^(de|fr)\//;
const pfadOhneSprache = (id: string) => id.replace(sprachordner, '');

interface MitFreigabe {
  id: string;
  data: { freigabe: boolean; uebersetzt?: boolean; beispiel: boolean };
}

/** Wählt für eine Sprache den anzuzeigenden Eintrag und berechnet die Freigabe. */
function aufloesen<E extends MitFreigabe>(alle: E[], locale: Locale): Aufgeloest<E, E['data']>[] {
  const nachId = new Map(alle.map((e) => [e.id, e]));
  return alle
    .filter((e) => e.id.startsWith('de/') && !e.data.beispiel)
    .map((de) => {
      const pfad = pfadOhneSprache(de.id);
      const fr = locale === 'fr' ? nachId.get(`fr/${pfad}`) : undefined;
      let eintrag = de;
      let lang: Locale = 'de';
      let freigabe = de.data.freigabe;
      if (fr) {
        if (fr.data.uebersetzt === true) {
          eintrag = fr;
          lang = 'fr';
          freigabe = fr.data.freigabe;
        } else {
          freigabe = de.data.freigabe && fr.data.freigabe;
        }
      }
      return { eintrag, data: eintrag.data, lang, entwurf: !freigabe, pfad };
    })
    .filter((a) => !a.entwurf || SHOW_ENTWUERFE);
}

let texteCache: Promise<TexteEintrag[]> | undefined;
const alleTexte = () => (texteCache ??= getCollection('texte'));

/** Alle sichtbaren Texte einer Sektion (z. B. alle Stationen von «Mein Weg») */
async function texteDerSektion<S extends Sektion>(locale: Locale, sektion: S) {
  const alle = await alleTexte();
  return aufloesen(alle, locale).filter((a) => a.data.sektion === sektion) as unknown as Aufgeloest<
    TexteEintrag,
    TexteVon<S>
  >[];
}

/** Text einer Sektion, die es nur einmal gibt (z. B. «hero»). undefined = nicht freigegeben/nicht vorhanden. */
export async function getText<S extends Sektion>(locale: Locale, sektion: S) {
  const [erster] = await texteDerSektion(locale, sektion);
  return erster;
}

/**
 * Texte einer Sektion mit mehreren Dateien, sortiert nach position.
 * Gibt es mehrere Dateien mit derselben position (Entwurf und freigegebene Fassung),
 * wird in der Vorschau mit Entwürfen der Entwurf gezeigt, sonst die freigegebene Fassung.
 */
export async function getTexteListe<S extends Extract<Sektion, 'weg-station' | 'weg-geschichte'>>(
  locale: Locale,
  sektion: S,
) {
  const liste = await texteDerSektion(locale, sektion);
  const nachPosition = new Map<number, (typeof liste)[number]>();
  for (const eintrag of liste) {
    const position = (eintrag.data as { position: number }).position;
    const bisher = nachPosition.get(position);
    if (!bisher || (eintrag.entwurf && !bisher.entwurf)) nachPosition.set(position, eintrag);
  }
  return [...nachPosition.entries()].sort(([a], [b]) => a - b).map(([, eintrag]) => eintrag);
}

let blogCache: Promise<BlogEintrag[]> | undefined;
const alleBlog = () => (blogCache ??= getCollection('blog'));

export type BlogAufgeloest = Aufgeloest<BlogEintrag, BlogEintrag['data']> & { slug: string };

/** Alle sichtbaren Blogbeiträge einer Sprache, in der Reihenfolge der Startseite */
export async function getBlog(locale: Locale): Promise<BlogAufgeloest[]> {
  const alle = await alleBlog();
  return aufloesen(alle, locale)
    .map((a) => ({ ...a, slug: a.pfad }))
    .sort((a, b) => a.data.reihenfolge - b.data.reihenfolge);
}

/** Blogbeiträge mit eigener Seite (Status «veroeffentlicht») */
export async function getBlogSeiten(locale: Locale) {
  return (await getBlog(locale)).filter((b) => b.data.status === 'veroeffentlicht');
}

/** Platzhalter wie [DATUM] erkennen (werden auf der Website nicht angezeigt) */
export const istPlatzhalter = (wert: unknown): wert is string => typeof wert === 'string' && /^\[.*\]$/.test(wert);
