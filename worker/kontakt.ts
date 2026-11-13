/**
 * Kontaktformular: POST /api/kontakt
 *
 * Prüft Herkunft, Rate-Limit, Spam-Schutz (Honeypot, Zeitprüfung) und die Felder
 * und schickt die Nachricht als reinen Text über Resend (EU) per E-Mail.
 * Es wird nichts gespeichert. Geloggt werden nur technische Fehler, nie Personendaten.
 */
import de from '../src/i18n/de.json' with { type: 'json' };

/** Empfänger und Absender: nur hier ändern (siehe README, «Empfänger ändern»). */
export const EMPFAENGER_KONTAKT = 'contact@charlottelingg.com';
export const EMPFAENGER_SPONSORING = 'sponsoring@charlottelingg.com';
export const ABSENDER = 'Website Charlotte Lingg <website@charlottelingg.com>';

export const RESEND_URL = 'https://api.resend.com/emails';

/** Mindestzeit zwischen dem Laden der Seite und dem Absenden (Spam-Schutz). */
export const MINDESTZEIT_MS = 3000;

/** Die vier Werte aus dem Formular (value der Optionen) mit der Bezeichnung für den Betreff. */
export const ANLIEGEN = {
  sponsoring: de['form.anliegen.sponsoring'],
  medien: de['form.anliegen.medien'],
  anlass: de['form.anliegen.anlass'],
  allgemein: de['form.anliegen.allgemein'],
} as const;
export type Anliegen = keyof typeof ANLIEGEN;

/** Erlaubte Herkunft (Origin-Header) */
const HERKUNFT = [
  /^https:\/\/(www\.)?charlottelingg\.com$/,
  /^https:\/\/([a-z0-9-]+\.)*lingg-charlotte\.workers\.dev$/,
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/,
];

/** Rate-Limit-Binding von Cloudflare (ratelimits in wrangler.jsonc) */
export interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface KontaktEnv {
  RESEND_API_KEY?: string;
  KONTAKT_LIMIT?: RateLimit;
}

export type Fehlercode =
  | 'methode'
  | 'format'
  | 'herkunft'
  | 'zu_viele'
  | 'ungueltig'
  | 'konfiguration'
  | 'versand';

const STATUS: Record<Fehlercode, number> = {
  methode: 405,
  format: 415,
  herkunft: 403,
  zu_viele: 429,
  ungueltig: 400,
  konfiguration: 503,
  versand: 502,
};

export interface Nachricht {
  name: string;
  email: string;
  anliegen: Anliegen;
  nachricht: string;
  sprache: 'de' | 'fr';
}

/** Steuerzeichen und Zeilenumbrüche entfernen (kein Header-Injection), Leerraum zusammenfassen. */
export function einzeilig(wert: string): string {
  return wert
    .replace(/[\u0000-\u001F\u007F-\u009F\u2028\u2029]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Mehrzeiliger Text: Zeilenumbrüche vereinheitlichen, übrige Steuerzeichen entfernen. */
export function mehrzeilig(wert: string): string {
  return wert
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, '')
    .trim();
}

const EMAIL_MUSTER = /^[^\s@<>()[\]",;:\\]+@[^\s@<>()[\]",;:\\]+\.[^\s@<>()[\]",;:\\]{2,}$/;

/** Felder prüfen. Gibt die bereinigte Nachricht zurück oder null, wenn etwas nicht stimmt. */
export function pruefen(daten: FormData): Nachricht | null {
  const feld = (name: string) => {
    const wert = daten.get(name);
    return typeof wert === 'string' ? wert : '';
  };

  const name = einzeilig(feld('name'));
  const email = einzeilig(feld('email'));
  const anliegen = feld('anliegen');
  const nachricht = mehrzeilig(feld('nachricht'));
  const sprache = feld('sprache');

  if (name.length < 1 || name.length > 100) return null;
  if (email.length > 200 || !EMAIL_MUSTER.test(email)) return null;
  if (!Object.hasOwn(ANLIEGEN, anliegen)) return null;
  if (nachricht.length < 10 || nachricht.length > 5000) return null;
  if (sprache !== 'de' && sprache !== 'fr') return null;

  return { name, email, anliegen: anliegen as Anliegen, nachricht, sprache };
}

/** Spam: Honeypot ausgefüllt oder schneller als MINDESTZEIT_MS abgeschickt. Fehlt der Zeitstempel, kein Spam. */
export function istSpam(daten: FormData, jetzt: number): boolean {
  const honeypot = daten.get('website');
  if (typeof honeypot === 'string' && honeypot.trim() !== '') return true;
  const zeit = Number(daten.get('zeit'));
  if (daten.get('zeit') === null || daten.get('zeit') === '' || !Number.isFinite(zeit)) return false;
  return jetzt - zeit < MINDESTZEIT_MS;
}

export function empfaenger(anliegen: Anliegen): string {
  return anliegen === 'sponsoring' ? EMPFAENGER_SPONSORING : EMPFAENGER_KONTAKT;
}

export function datumZuerich(jetzt: number): string {
  return new Intl.DateTimeFormat('de-CH', {
    timeZone: 'Europe/Zurich',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(jetzt));
}

/** Inhalt der E-Mail an Resend */
export function email(n: Nachricht, jetzt: number) {
  const anliegen = ANLIEGEN[n.anliegen];
  return {
    from: ABSENDER,
    to: [empfaenger(n.anliegen)],
    reply_to: n.email,
    subject: `[Website] ${anliegen} – ${n.name}`,
    text: [
      `Name: ${n.name}`,
      `E-Mail: ${n.email}`,
      `Anliegen: ${anliegen}`,
      `Sprache: ${n.sprache === 'de' ? 'Deutsch' : 'Französisch'}`,
      `Datum: ${datumZuerich(jetzt)} (Europe/Zurich)`,
      '',
      'Nachricht:',
      n.nachricht,
    ].join('\n'),
  };
}

/** Antwort: JSON für fetch, sonst Weiterleitung zurück zur Kontakt-Sektion. */
function antwort(request: Request, sprache: string | null, fehler: Fehlercode | null): Response {
  if ((request.headers.get('Accept') ?? '').includes('application/json')) {
    const body = fehler ? { ok: false, fehler } : { ok: true };
    return Response.json(body, {
      status: fehler ? STATUS[fehler] : 200,
      headers: {
        'Cache-Control': 'no-store',
        ...(fehler === 'methode' ? { Allow: 'POST' } : {}),
      },
    });
  }
  if (fehler === 'methode') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }
  // Die Meldung hat die id kontakt-gesendet bzw. kontakt-fehler und steht in der Kontakt-Sektion.
  // Über den Anker wird sie auch ohne JavaScript angezeigt (CSS :target).
  const pfad = sprache === 'fr' ? '/fr/' : '/';
  const ziel = fehler ? `${pfad}?fehler=1#kontakt-fehler` : `${pfad}?gesendet=1#kontakt-gesendet`;
  return new Response(null, { status: 303, headers: { Location: ziel, 'Cache-Control': 'no-store' } });
}

export async function kontakt(request: Request, env: KontaktEnv, jetzt = Date.now()): Promise<Response> {
  if (request.method !== 'POST') return antwort(request, null, 'methode');

  const typ = (request.headers.get('Content-Type') ?? '').toLowerCase();
  if (!typ.startsWith('application/x-www-form-urlencoded') && !typ.startsWith('multipart/form-data')) {
    return antwort(request, null, 'format');
  }

  const herkunft = request.headers.get('Origin') ?? '';
  if (!HERKUNFT.some((muster) => muster.test(herkunft))) return antwort(request, null, 'herkunft');

  let daten: FormData;
  try {
    daten = await request.formData();
  } catch {
    return antwort(request, null, 'format');
  }
  const sprache = daten.get('sprache');
  const spracheText = typeof sprache === 'string' ? sprache : null;

  if (env.KONTAKT_LIMIT) {
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unbekannt';
    const { success } = await env.KONTAKT_LIMIT.limit({ key: ip });
    if (!success) return antwort(request, spracheText, 'zu_viele');
  }

  // Spam: so tun, als wäre alles gut, aber nichts senden
  if (istSpam(daten, jetzt)) return antwort(request, spracheText, null);

  const nachricht = pruefen(daten);
  if (!nachricht) return antwort(request, spracheText, 'ungueltig');

  if (!env.RESEND_API_KEY) {
    console.error('kontakt: RESEND_API_KEY fehlt');
    return antwort(request, spracheText, 'konfiguration');
  }

  try {
    const resend = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(email(nachricht, jetzt)),
      signal: AbortSignal.timeout(10_000),
    });
    if (!resend.ok) {
      console.error(`kontakt: Resend antwortet mit Status ${resend.status}`);
      return antwort(request, spracheText, 'versand');
    }
  } catch (fehler) {
    console.error(`kontakt: Resend nicht erreichbar (${fehler instanceof Error ? fehler.name : 'unbekannt'})`);
    return antwort(request, spracheText, 'versand');
  }

  return antwort(request, spracheText, null);
}
