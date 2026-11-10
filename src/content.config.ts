/**
 * Content Collections: Inhalte getrennt vom Layout.
 * Jede Datei unter src/content/<collection>/ wird beim Build gegen dieses Schema geprüft.
 * Fehlt ein Pflichtfeld oder stimmt ein Wert nicht, bricht der Build mit einer Meldung ab.
 */
import { existsSync } from 'node:fs';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const stufe = z.enum(['Weltcup', 'Europacup', 'WM', 'FIS', 'Landesmeisterschaft']);
const disziplin = z.enum(['Slalom', 'Riesenslalom', 'Super-G', 'Abfahrt', 'Kombination', 'Parallel', 'Teambewerb']);
/** ISO-3166-1 Alpha-3 wie bei der FIS (LIE, SUI, AUT …). Platzhalter in eckigen Klammern sind erlaubt. */
const land = z.string().regex(/^([A-Z]{3}|\[[A-Z_]+\])$/, 'Ländercode als ISO-Alpha-3 in Grossbuchstaben, z. B. LIE');
/** Saison im Format 2026/27 */
const saison = z.string().regex(/^\d{4}\/\d{2}$/, 'Saison im Format 2026/27');

/** Platzhalter für fehlende Angaben, z. B. [DATUM] oder [FIS-LINK] */
const platzhalter = z.string().regex(/^\[[A-ZÄÖÜ0-9_-]+\]$/, 'Platzhalter in eckigen Klammern, z. B. [DATUM]');
const istPlatzhalter = (wert: unknown) => typeof wert === 'string' && /^\[.*\]$/.test(wert);

/**
 * FIS-Link: echte Adresse oder, solange der Eintrag nicht gegen die FIS geprüft ist
 * (geprueft: false), der Platzhalter [FIS-LINK].
 */
const fisLink = z.union([z.literal('[FIS-LINK]'), z.url()]);

/** Markiert Beispiel-Einträge. Sie werden auf der Website nie angezeigt. */
const beispiel = z.boolean().default(false);

/**
 * Geprüfte Einträge (geprueft: true) dürfen keine Platzhalter mehr enthalten.
 * So kann ein Eintrag erst als geprüft gelten, wenn FIS-Link und alle Angaben vollständig sind.
 */
function ohnePlatzhalterWennGeprueft<T extends { geprueft: boolean }>(felder: (keyof T & string)[]) {
  return (daten: T, ctx: z.RefinementCtx) => {
    if (!daten.geprueft) return;
    for (const feld of felder) {
      if (istPlatzhalter(daten[feld])) {
        ctx.addIssue({
          code: 'custom',
          path: [feld],
          message: `Bei geprueft: true ist kein Platzhalter erlaubt. Bitte «${feld}» gemäss FIS-Resultatliste eintragen.`,
        });
      }
    }
  };
}

const resultate = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml,json}', base: './src/content/resultate' }),
  schema: z
    .object({
      beispiel,
      /** true erst, wenn der Eintrag mit der offiziellen FIS-Resultatliste verglichen ist */
      geprueft: z.boolean(),
      datum: z.union([platzhalter, z.coerce.date()]),
      saison: z.union([platzhalter, saison]),
      stufe,
      disziplin: z.union([platzhalter, disziplin]),
      ort: z.string().min(1),
      land,
      /** Rang als Zahl; DNF, DNS, DSQ für nicht klassiert */
      rang: z.union([z.number().int().positive(), z.enum(['DNF', 'DNS', 'DSQ', 'DNQ'])]),
      /** Quelle bei der FIS – Pflichtfeld. [FIS-LINK] nur solange geprueft: false */
      fis_link: fisLink,
    })
    .superRefine(ohnePlatzhalterWennGeprueft(['datum', 'saison', 'disziplin', 'land', 'fis_link'])),
});

const rennen = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml,json}', base: './src/content/rennen' }),
  schema: z
    .object({
      beispiel,
      /** true erst, wenn der Eintrag mit dem offiziellen FIS-Kalender verglichen ist */
      geprueft: z.boolean(),
      /** Erster Renntag */
      datum: z.coerce.date(),
      /** Letzter Renntag, nur bei mehrtägigen Rennen */
      datum_bis: z.coerce.date().optional(),
      stufe,
      /** Ein Eintrag pro Rennen, z. B. [Slalom, Slalom] = «2× SL» */
      disziplinen: z.array(disziplin).default([]),
      /** Saisonfinale: wird als «Finale» angezeigt */
      finale: z.boolean().default(false),
      ort: z.string().min(1),
      land,
      status: z.enum(['geplant', 'abgesagt', 'gefahren']),
      /** Kurzer Hinweis unter dem Ort. Texte stehen in src/i18n (rennen.hinweis.*) */
      hinweis: z.enum(['weltcuppunkte', 'sieg']).optional(),
      /** Quelle bei der FIS. [FIS-LINK] nur solange geprueft: false */
      fis_link: fisLink,
    })
    .superRefine(ohnePlatzhalterWennGeprueft(['land', 'fis_link'])),
});

/** Partner-Kategorien in der Reihenfolge der Website. Bezeichnungen in src/i18n (partner.kategorie.*) */
export const partnerKategorien = [
  'kopfsponsoren',
  'mobilitaetspartner',
  'trinkflaschenpartner',
  'anstellung',
  'ausruester',
  'unterstuetzer',
  'heimat',
] as const;

const partner = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml,json}', base: './src/content/partner' }),
  schema: z
    .object({
      beispiel,
      name: z.string().min(1),
      kategorie: z.enum(partnerKategorien),
      /** Pfad unterhalb von public/, z. B. /partner/name.svg. Fehlt das Logo, erscheint ein Platzhalter mit dem Namen. */
      logo: z.string().startsWith('/').optional(),
      url: z.url().optional(),
      /** logo = Logo bzw. Logo-Platzhalter, text = nur der Name in Schrift (wie im Design) */
      darstellung: z.enum(['logo', 'text']).default('logo'),
      /** Höhe des Logos in px (muss als Token existieren, z. B. 52, 80, 110) */
      logo_hoehe: z.number().int().positive().default(110),
      /** Grösste Anzeigebreite in px, z. B. Breite einer kleinen Bilddatei, damit sie nie hochskaliert wird (muss als Token --mass-… existieren) */
      logo_max_breite: z.number().int().positive().optional(),
      /** Vertraglich vorgeschrieben: Logo muss gezeigt werden */
      pflicht_logo: z.boolean(),
      /** Vertraglich vorgeschrieben: Logo muss verlinkt sein */
      pflicht_link: z.boolean(),
      reihenfolge: z.number().int(),
    })
    .superRefine((p, ctx) => {
      if (p.pflicht_link && !p.url) {
        ctx.addIssue({ code: 'custom', path: ['url'], message: 'pflicht_link: true verlangt eine url.' });
      }
      if (p.pflicht_logo && p.darstellung !== 'logo') {
        ctx.addIssue({ code: 'custom', path: ['darstellung'], message: 'pflicht_logo: true verlangt darstellung: logo.' });
      }
      if (p.logo && !existsSync(`./public${p.logo}`)) {
        ctx.addIssue({ code: 'custom', path: ['logo'], message: `Logodatei public${p.logo} fehlt.` });
      }
    }),
});

/* ------------------------------------------------------------------------------------------------
 * Bilder: src/content/bilder/<name>.yaml, ein Eintrag pro Bild. Die Dateien liegen in public/bilder/.
 *
 * lizenz_geklaert: true = Nutzungsrechte bestätigt (Eintrag in LIZENZEN.md), das Bild erscheint.
 *                  false = Bild erscheint nur, wenn beim Build PUBLIC_SHOW_ENTWUERFE=true gesetzt ist.
 *                  Sonst bleibt der Platzhalter, und die Datei wird nicht ausgeliefert (siehe astro.config.mjs).
 * ---------------------------------------------------------------------------------------------- */

const bildDatei = z.string().regex(/^\/bilder\/[a-z0-9-]+\.(webp|jpg|png)$/, 'Pfad wie /bilder/name.webp (Datei in public/bilder/)');

const bilder = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/bilder' }),
  schema: z
    .object({
      beispiel,
      /** Hauptdatei: WebP, z. B. /bilder/hero-soelden-2026.webp (Vorschaubild beim Teilen: JPG) */
      datei: bildDatei,
      /** Ersatzformat für alte Browser (JPG), optional */
      fallback: bildDatei.optional(),
      /** Grösse der Datei in px (längste Seite höchstens 1600) */
      breite: z.number().int().positive().max(1600),
      hoehe: z.number().int().positive().max(1600),
      alt_de: z.string().min(1),
      alt_fr: z.string().min(1),
      fotograf: z.string().min(1),
      /** true erst, wenn die Nutzungsrechte bestätigt und in LIZENZEN.md eingetragen sind */
      lizenz_geklaert: z.boolean(),
      /** Bildausschnitt (CSS object-position), z. B. «60% 45%» = Motiv bei 60 % Breite und 45 % Höhe */
      ausschnitt: z.string().regex(/^\d{1,3}% \d{1,3}%$/, 'Ausschnitt wie «60% 45%»').optional(),
      /** Bildausschnitt ab 1100 px Breite (Hero: Bild links, Textfeld rechts), z. B. «62% 45%». Fehlt er, gilt «ausschnitt». */
      ausschnitt_breit: z.string().regex(/^\d{1,3}% \d{1,3}%$/, 'Ausschnitt wie «62% 45%»').optional(),
    })
    .superRefine((b, ctx) => {
      for (const feld of ['datei', 'fallback'] as const) {
        const pfad = b[feld];
        if (pfad && !existsSync(`./public${pfad}`)) {
          ctx.addIssue({ code: 'custom', path: [feld], message: `Bilddatei public${pfad} fehlt.` });
        }
      }
    }),
});

/* ------------------------------------------------------------------------------------------------
 * Texte pro Sektion und Sprache: src/content/texte/de/<sektion>.md und src/content/texte/fr/<sektion>.md
 *
 * freigabe:   true = öffentlich. false = nur sichtbar, wenn beim Build PUBLIC_SHOW_ENTWUERFE=true gesetzt ist
 *             (dann mit dem Label «Entwurf – nicht freigegeben»).
 * uebersetzt: nur in fr-Dateien. Solange false, zeigt die französische Seite den deutschen Text.
 * ---------------------------------------------------------------------------------------------- */

const basis = {
  beispiel,
  freigabe: z.boolean(),
  uebersetzt: z.boolean().optional(),
};

const link = z.object({ text: z.string().min(1), ziel: z.string().min(1) });
const kachel = z.object({ kicker: z.string().min(1), titel: z.string().min(1), text: z.string().min(1) });

const texte = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/texte' }),
  schema: z.discriminatedUnion('sektion', [
    z.object({ ...basis, sektion: z.literal('beispiel'), titel: z.string().optional() }),
    z.object({
      ...basis,
      sektion: z.literal('startseite'),
      seo_titel: z.string().min(1),
      seo_beschreibung: z.string().min(1),
      /** Strukturierte Daten (JSON-LD, Typ Person) */
      person: z.object({
        name: z.string().min(1),
        sportart: z.string().min(1),
        team: z.string().min(1),
        verband: z.string().min(1),
        instagram: z.url(),
      }),
    }),
    z.object({
      ...basis,
      sektion: z.literal('hero'),
      kicker: z.string().min(1),
      /** Jede Zeile wird im Titel auf eine eigene Zeile gesetzt */
      titel_zeilen: z.array(z.string().min(1)).min(1),
      lead: z.string().min(1),
      bild_alt: z.string().min(1),
      buttons: z.array(link),
    }),
    z.object({
      ...basis,
      sektion: z.literal('portrait'),
      kicker: z.string().min(1),
      titel: z.string().min(1),
      lead: z.string().min(1),
      steckbrief: z.array(z.object({ label: z.string().min(1), wert: z.string().min(1) })),
      link,
      bild_alt: z.string().min(1),
    }),
    z.object({
      ...basis,
      sektion: z.literal('zitat'),
      zitat: z.string().min(1),
      autor: z.string().min(1),
    }),
    z.object({
      ...basis,
      sektion: z.literal('resultate'),
      kicker: z.string().min(1),
      titel: z.string().min(1),
      lead: z.string().min(1),
      fis_profil: z.object({ text: z.string().min(1), url: z.url() }),
      kalender: z.object({ label: z.string().min(1), text: z.string().min(1) }),
      podium_titel: z.string().min(1),
      fis_zusatz: z.object({ wert: z.string().min(1), zeilen: z.array(z.string().min(1)) }),
    }),
    z.object({
      ...basis,
      sektion: z.literal('rennkalender'),
      kicker: z.string().min(1),
      titel: z.string().min(1),
      lead: z.string().min(1),
      quelle: z.string().min(1),
    }),
    z.object({
      ...basis,
      sektion: z.literal('weg'),
      kicker: z.string().min(1),
      titel: z.string().min(1),
      geschichte_titel: z.string().min(1),
      geschichte_untertitel: z.string().min(1),
    }),
    z.object({
      ...basis,
      sektion: z.literal('weg-station'),
      /** Reihenfolge. Zwei Dateien mit gleicher Position = Entwurf und freigegebene Fassung derselben Station */
      position: z.number().int(),
      nummer: z.string().min(1),
      titel: z.string().min(1),
      text: z.string().min(1),
    }),
    z.object({
      ...basis,
      sektion: z.literal('weg-geschichte'),
      position: z.number().int(),
      titel: z.string().min(1),
      einleitung: z.string().optional(),
      liste: z.array(z.object({ marke: z.string().min(1), text: z.string().min(1) })).optional(),
      /** true = hier erscheint die Liste aus src/content/resultate */
      resultate_liste: z.boolean().default(false),
    }),
    z.object({
      ...basis,
      sektion: z.literal('unterwegs'),
      kicker: z.string().min(1),
      titel: z.string().min(1),
      text: z.string().min(1),
      instagram: z.object({ text: z.string().min(1), url: z.url() }),
    }),
    z.object({ ...basis, sektion: z.literal('blog'), titel: z.string().min(1) }),
    z.object({
      ...basis,
      sektion: z.literal('partner'),
      kicker: z.string().min(1),
      titel: z.string().min(1),
      lead: z.string().min(1),
    }),
    z.object({
      ...basis,
      sektion: z.literal('partner-werden'),
      kicker: z.string().min(1),
      titel: z.string().min(1),
      lead: z.string().min(1),
      hauptangebot: kachel.extend({
        zwischentitel: z.string().min(1),
        moeglichkeiten: z.array(z.string().min(1)),
        schluss: z.string().min(1),
      }),
      angebote: z.array(kachel),
      schluss: z.string().min(1),
      button: link,
    }),
    z.object({
      ...basis,
      sektion: z.literal('fanpost'),
      kicker: z.string().min(1),
      titel: z.string().min(1),
      text: z.string().min(1),
    }),
    z.object({
      ...basis,
      sektion: z.literal('fanpost-adresse'),
      name: z.string().min(1),
      zeilen: z.array(z.string().min(1)).min(1),
    }),
    z.object({
      ...basis,
      sektion: z.literal('kontakt'),
      titel: z.string().min(1),
      text: z.string().min(1),
    }),
    z.object({
      ...basis,
      sektion: z.literal('impressum'),
      titel: z.string().min(1),
      seo_beschreibung: z.string().optional(),
    }),
    z.object({
      ...basis,
      sektion: z.literal('datenschutz'),
      titel: z.string().min(1),
      seo_beschreibung: z.string().optional(),
    }),
  ]),
});

/**
 * Blog: src/content/blog/de/<slug>.md und src/content/blog/fr/<slug>.md.
 * Jeder veröffentlichte Beitrag erhält eine eigene Seite /blog/<slug> bzw. /fr/blog/<slug>.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    beispiel,
    titel: z.string().min(1),
    /** Monat ("2026-10"), genaues Datum (2026-10-24) oder Platzhalter [DATUM] */
    datum: z.union([platzhalter, z.string().regex(/^\d{4}-\d{2}$/, 'Monat im Format 2026-10'), z.coerce.date()]),
    kategorie: z.string().min(1),
    /** Ort, wird hinter der Kategorie angezeigt, z. B. «Saisonstart · Sölden, Oktober 2026» */
    ort: z.string().optional(),
    teaser: z.string().min(1),
    /** veroeffentlicht = mit eigener Seite; folgt = nur Vorschau mit «Beitrag folgt» */
    status: z.enum(['veroeffentlicht', 'folgt']),
    freigabe: z.boolean(),
    uebersetzt: z.boolean().optional(),
    /** Reihenfolge auf der Startseite (klein = zuerst) */
    reihenfolge: z.number().int(),
    /** true = Beitrag hat ein Foto (bis es da ist: Platzhalter, siehe BILDER.md) */
    bild: z.boolean().default(false),
    /** Alt-Text des Fotos; leer lassen, wenn das Foto rein schmückend ist */
    bild_alt: z.string().optional(),
  }),
});

export const collections = { resultate, rennen, partner, bilder, texte, blog };
