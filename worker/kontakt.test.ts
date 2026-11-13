/**
 * Tests für das Kontaktformular (npm test). Laufen ohne Netz: Resend wird durch einen Stub ersetzt.
 */
import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.ts';
import { EMPFAENGER_KONTAKT, EMPFAENGER_SPONSORING, RESEND_URL, type RateLimit } from './kontakt.ts';

const JETZT = Date.now();

interface Aufruf {
  url: string;
  init: RequestInit;
}
let aufrufe: Aufruf[] = [];
let resendStatus = 200;
const echtesFetch = globalThis.fetch;
const echtesError = console.error;
let logs: string[] = [];

beforeEach(() => {
  aufrufe = [];
  logs = [];
  resendStatus = 200;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    aufrufe.push({ url: String(url), init: init ?? {} });
    return new Response('{}', { status: resendStatus });
  }) as typeof fetch;
  console.error = (...args: unknown[]) => {
    logs.push(args.join(' '));
  };
});

afterEach(() => {
  globalThis.fetch = echtesFetch;
  console.error = echtesError;
});

function limit(max = 3): RateLimit {
  const zaehler = new Map<string, number>();
  return {
    async limit({ key }) {
      const n = (zaehler.get(key) ?? 0) + 1;
      zaehler.set(key, n);
      return { success: n <= max };
    },
  };
}

const assets = { fetch: async () => new Response('statisch') };

function env(extra: Record<string, unknown> = {}) {
  return { RESEND_API_KEY: 're_test', KONTAKT_LIMIT: limit(), ASSETS: assets, ...extra };
}

const gueltig = {
  name: 'Anna Muster',
  email: 'anna@beispiel.ch',
  anliegen: 'medien',
  nachricht: 'Guten Tag, ich hätte eine Anfrage für ein Interview.',
  sprache: 'de',
  website: '',
  zeit: String(JETZT - 20_000),
};

function anfrage(
  felder: Record<string, string> = gueltig,
  optionen: { methode?: string; origin?: string | null; json?: boolean; multipart?: boolean; ip?: string } = {},
) {
  const { methode = 'POST', origin = 'https://charlottelingg.com', json = true, multipart = false, ip = '203.0.113.1' } =
    optionen;
  const headers = new Headers({ 'CF-Connecting-IP': ip });
  if (origin) headers.set('Origin', origin);
  if (json) headers.set('Accept', 'application/json');
  let body: BodyInit | undefined;
  if (methode === 'POST') {
    if (multipart) {
      const fd = new FormData();
      for (const [k, v] of Object.entries(felder)) fd.set(k, v);
      body = fd;
    } else {
      body = new URLSearchParams(felder);
    }
  }
  return new Request('https://charlottelingg.com/api/kontakt', { method: methode, headers, body });
}

async function json(res: Response) {
  return (await res.json()) as { ok: boolean; fehler?: string };
}

describe('POST /api/kontakt', () => {
  it('gültige Nachricht wird über Resend gesendet', async () => {
    const res = await worker.fetch(anfrage(), env());
    assert.equal(res.status, 200);
    assert.deepEqual(await json(res), { ok: true });
    assert.equal(aufrufe.length, 1);
    assert.equal(aufrufe[0].url, RESEND_URL);
    const headers = new Headers(aufrufe[0].init.headers);
    assert.equal(headers.get('Authorization'), 'Bearer re_test');
    const mail = JSON.parse(String(aufrufe[0].init.body));
    assert.equal(mail.from, 'Website Charlotte Lingg <website@charlottelingg.com>');
    assert.deepEqual(mail.to, [EMPFAENGER_KONTAKT]);
    assert.equal(mail.reply_to, 'anna@beispiel.ch');
    assert.equal(mail.subject, '[Website] Medienanfrage – Anna Muster');
    assert.match(mail.text, /Name: Anna Muster/);
    assert.match(mail.text, /E-Mail: anna@beispiel\.ch/);
    assert.match(mail.text, /Anliegen: Medienanfrage/);
    assert.match(mail.text, /Sprache: Deutsch/);
    assert.match(mail.text, /Datum: \d\d\.\d\d\.\d{4}, \d\d:\d\d \(Europe\/Zurich\)/);
    assert.match(mail.text, /Interview/);
    assert.equal(mail.html, undefined);
  });

  it('multipart/form-data wird ebenfalls angenommen', async () => {
    const res = await worker.fetch(anfrage(gueltig, { multipart: true }), env());
    assert.equal(res.status, 200);
    assert.equal(aufrufe.length, 1);
  });

  it('Anliegen Sponsoring geht an sponsoring@, übrige an contact@', async () => {
    for (const anliegen of ['sponsoring', 'medien', 'anlass', 'allgemein']) {
      aufrufe = [];
      const res = await worker.fetch(anfrage({ ...gueltig, anliegen }), env());
      assert.equal(res.status, 200);
      const mail = JSON.parse(String(aufrufe[0].init.body));
      assert.deepEqual(mail.to, [anliegen === 'sponsoring' ? EMPFAENGER_SPONSORING : EMPFAENGER_KONTAKT]);
    }
  });

  it('Französisch: Sprache im Text, Weiterleitung auf /fr/', async () => {
    const res = await worker.fetch(anfrage({ ...gueltig, sprache: 'fr' }, { json: false }), env());
    assert.equal(res.status, 303);
    assert.equal(res.headers.get('Location'), '/fr/?gesendet=1#kontakt-gesendet');
    assert.match(JSON.parse(String(aufrufe[0].init.body)).text, /Sprache: Französisch/);
  });

  it('ohne JavaScript: Weiterleitung 303 mit gesendet=1 bzw. fehler=1', async () => {
    const ok = await worker.fetch(anfrage(gueltig, { json: false }), env());
    assert.equal(ok.status, 303);
    assert.equal(ok.headers.get('Location'), '/?gesendet=1#kontakt-gesendet');
    const fehler = await worker.fetch(anfrage({ ...gueltig, email: 'kaputt' }, { json: false }), env());
    assert.equal(fehler.status, 303);
    assert.equal(fehler.headers.get('Location'), '/?fehler=1#kontakt-fehler');
  });

  for (const feld of ['name', 'email', 'anliegen', 'nachricht', 'sprache']) {
    it(`fehlendes Feld ${feld}: 400`, async () => {
      const felder: Record<string, string> = { ...gueltig };
      delete felder[feld];
      const res = await worker.fetch(anfrage(felder), env());
      assert.equal(res.status, 400);
      assert.deepEqual(await json(res), { ok: false, fehler: 'ungueltig' });
      assert.equal(aufrufe.length, 0);
    });
  }

  for (const email of ['anna', 'anna@', 'anna@beispiel', 'an na@beispiel.ch', `${'a'.repeat(196)}@b.ch`]) {
    it(`ungültige E-Mail «${email.slice(0, 20)}»: 400`, async () => {
      const res = await worker.fetch(anfrage({ ...gueltig, email }), env());
      assert.equal(res.status, 400);
      assert.equal(aufrufe.length, 0);
    });
  }

  it('Längen und Werte werden geprüft', async () => {
    const faelle: Record<string, string>[] = [
      { name: 'x'.repeat(101) },
      { name: '   ' },
      { nachricht: 'zu kurz' },
      { nachricht: 'x'.repeat(5001) },
      { anliegen: 'Sponsoring und Partnerschaft' },
      { anliegen: 'toString' },
      { sprache: 'en' },
    ];
    for (const fall of faelle) {
      const res = await worker.fetch(anfrage({ ...gueltig, ...fall }), env());
      assert.equal(res.status, 400, JSON.stringify(fall).slice(0, 60));
    }
    assert.equal(aufrufe.length, 0);
  });

  it('Zeilenumbrüche und Steuerzeichen in Name und E-Mail werden entfernt', async () => {
    const res = await worker.fetch(
      anfrage({ ...gueltig, name: 'Anna\r\nBcc: boese@x.ch', email: 'anna@beispiel.ch\r\n' }),
      env(),
    );
    assert.equal(res.status, 200);
    const mail = JSON.parse(String(aufrufe[0].init.body));
    assert.equal(mail.subject, '[Website] Medienanfrage – Anna Bcc: boese@x.ch');
    assert.equal(mail.reply_to, 'anna@beispiel.ch');
    assert.doesNotMatch(mail.subject, /[\r\n]/);
  });

  it('Honeypot ausgefüllt: 200, aber nichts gesendet', async () => {
    const res = await worker.fetch(anfrage({ ...gueltig, website: 'http://spam.example' }), env());
    assert.equal(res.status, 200);
    assert.deepEqual(await json(res), { ok: true });
    assert.equal(aufrufe.length, 0);
  });

  it('zu schnell (unter 3 Sekunden): 200, aber nichts gesendet', async () => {
    const res = await worker.fetch(anfrage({ ...gueltig, zeit: String(Date.now() - 1000) }), env());
    assert.equal(res.status, 200);
    assert.equal(aufrufe.length, 0);
  });

  it('ohne Zeitstempel (kein JavaScript): wird gesendet', async () => {
    const felder: Record<string, string> = { ...gueltig };
    delete felder.zeit;
    const res = await worker.fetch(anfrage(felder, { json: false }), env());
    assert.equal(res.status, 303);
    assert.equal(aufrufe.length, 1);
  });

  it('falsche oder fehlende Herkunft: 403', async () => {
    for (const origin of ['https://boese.example', 'https://charlottelingg.com.boese.example', 'null', null]) {
      const res = await worker.fetch(anfrage(gueltig, { origin }), env());
      assert.equal(res.status, 403, String(origin));
    }
    assert.equal(aufrufe.length, 0);
  });

  it('erlaubte Herkunft: www, Vorschau-Adressen, localhost', async () => {
    for (const origin of [
      'https://www.charlottelingg.com',
      'https://charlottelingg.lingg-charlotte.workers.dev',
      'https://abc123-charlottelingg.lingg-charlotte.workers.dev',
      'http://localhost:8787',
      'http://127.0.0.1:4321',
    ]) {
      const res = await worker.fetch(anfrage(gueltig, { origin, ip: origin }), env());
      assert.equal(res.status, 200, origin);
    }
  });

  it('falsche Methode: 405', async () => {
    for (const methode of ['GET', 'PUT', 'DELETE']) {
      const res = await worker.fetch(anfrage(gueltig, { methode }), env());
      assert.equal(res.status, 405, methode);
      assert.equal(res.headers.get('Allow'), 'POST');
    }
  });

  it('falsches Format (JSON): 415', async () => {
    const req = new Request('https://charlottelingg.com/api/kontakt', {
      method: 'POST',
      headers: { Origin: 'https://charlottelingg.com', 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(gueltig),
    });
    const res = await worker.fetch(req, env());
    assert.equal(res.status, 415);
  });

  it('Rate-Limit: die vierte Anfrage innert 60 Sekunden ergibt 429', async () => {
    const e = env();
    for (let i = 0; i < 3; i++) assert.equal((await worker.fetch(anfrage(), e)).status, 200);
    const res = await worker.fetch(anfrage(), e);
    assert.equal(res.status, 429);
    assert.deepEqual(await json(res), { ok: false, fehler: 'zu_viele' });
    // andere IP ist nicht betroffen
    assert.equal((await worker.fetch(anfrage(gueltig, { ip: '203.0.113.2' }), e)).status, 200);
  });

  it('fehlender API-Schlüssel: Fehlermeldung, nichts gesendet, Log ohne Personendaten', async () => {
    const res = await worker.fetch(anfrage(), env({ RESEND_API_KEY: undefined }));
    assert.equal(res.status, 503);
    assert.deepEqual(await json(res), { ok: false, fehler: 'konfiguration' });
    assert.equal(aufrufe.length, 0);
    assert.equal(logs.length, 1);
    assert.doesNotMatch(logs.join(), /Anna|anna@/);
  });

  it('Resend antwortet mit Fehler: Fehlermeldung, Log ohne Personendaten', async () => {
    resendStatus = 422;
    const res = await worker.fetch(anfrage(), env());
    assert.equal(res.status, 502);
    assert.deepEqual(await json(res), { ok: false, fehler: 'versand' });
    assert.match(logs.join(), /422/);
    assert.doesNotMatch(logs.join(), /Anna|anna@/);
  });
});

describe('übrige Adressen', () => {
  it('unbekannte /api/-Adresse: 404', async () => {
    const res = await worker.fetch(new Request('https://charlottelingg.com/api/sonstwas'), env());
    assert.equal(res.status, 404);
  });

  it('alles andere geht an die statischen Dateien', async () => {
    const res = await worker.fetch(new Request('https://charlottelingg.com/'), env());
    assert.equal(await res.text(), 'statisch');
  });
});
