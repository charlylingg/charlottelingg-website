/**
 * Content Collections: Inhalte getrennt vom Layout.
 * Jede Datei unter src/content/<collection>/ wird beim Build gegen dieses Schema geprüft.
 * Fehlt ein Pflichtfeld oder stimmt ein Wert nicht, bricht der Build mit einer Meldung ab.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const stufe = z.enum(['Weltcup', 'Europacup', 'WM', 'FIS', 'Landesmeisterschaft']);
const disziplin = z.enum(['Slalom', 'Riesenslalom', 'Super-G', 'Abfahrt', 'Kombination', 'Parallel', 'Teambewerb']);
/** ISO-3166-1 Alpha-3 wie bei der FIS (LIE, SUI, AUT …). Platzhalter in eckigen Klammern sind erlaubt. */
const land = z.string().regex(/^([A-Z]{3}|\[[A-Z_]+\])$/, 'Ländercode als ISO-Alpha-3 in Grossbuchstaben, z. B. LIE');
/** Saison im Format 2026/27 */
const saison = z.string().regex(/^\d{4}\/\d{2}$/, 'Saison im Format 2026/27');

/** Markiert Beispiel-Einträge. Sie werden auf der Website nie angezeigt. */
const beispiel = z.boolean().default(false);

const resultate = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml,json}', base: './src/content/resultate' }),
  schema: z.object({
    beispiel,
    datum: z.coerce.date(),
    saison,
    stufe,
    disziplin,
    ort: z.string().min(1),
    land,
    /** Rang als Zahl; DNF, DNS, DSQ für nicht klassiert */
    rang: z.union([z.number().int().positive(), z.enum(['DNF', 'DNS', 'DSQ', 'DNQ'])]),
    /** Quelle bei der FIS – Pflichtfeld */
    fis_link: z.url(),
  }),
});

const rennen = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml,json}', base: './src/content/rennen' }),
  schema: z.object({
    beispiel,
    datum: z.coerce.date(),
    stufe,
    disziplin,
    ort: z.string().min(1),
    land,
    status: z.enum(['geplant', 'abgesagt', 'gefahren']),
  }),
});

const partner = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml,json}', base: './src/content/partner' }),
  schema: z.object({
    beispiel,
    name: z.string().min(1),
    kategorie: z.string().min(1),
    /** Pfad unterhalb von public/, z. B. /partner/name.svg */
    logo: z.string().startsWith('/'),
    url: z.url(),
    /** Vertraglich vorgeschrieben: Logo muss gezeigt werden */
    pflicht_logo: z.boolean(),
    /** Vertraglich vorgeschrieben: Logo muss verlinkt sein */
    pflicht_link: z.boolean(),
    reihenfolge: z.number().int(),
  }),
});

/** Texte pro Sektion und Sprache: src/content/texte/de/<sektion>.md und src/content/texte/fr/<sektion>.md */
const texte = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/texte' }),
  schema: z.object({
    beispiel,
    sektion: z.string().min(1),
    titel: z.string().optional(),
  }),
});

export const collections = { resultate, rennen, partner, texte };
