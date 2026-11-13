/**
 * Worker-Einstieg. Bedient nur /api/* (siehe run_worker_first in wrangler.jsonc).
 * Alle anderen Adressen liefert Cloudflare direkt als statische Dateien aus dem Ordner dist aus.
 */
import { kontakt, type KontaktEnv } from './kontakt.ts';

interface Env extends KontaktEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/kontakt' || pathname === '/api/kontakt/') return kontakt(request, env);
    if (pathname.startsWith('/api/')) {
      return Response.json({ ok: false, fehler: 'nicht_gefunden' }, { status: 404 });
    }
    return env.ASSETS.fetch(request);
  },
};
