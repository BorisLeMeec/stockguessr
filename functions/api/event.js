// POST /api/event — records one UI event (currently share-button clicks) for aggregate metrics.
// Best-effort: any bad input or DB hiccup returns 204 so the client never sees an error.
// Deliberately stores no IP / no identifier — just the event context.

const str = v => (typeof v === 'string' && v.length <= 20 ? v : null);

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  let b;
  try { b = await request.json(); } catch { return new Response(null, { status: 204 }); }
  if (!b || typeof b !== 'object') return new Response(null, { status: 204 });

  const name   = str(b.name);
  const detail = str(b.detail);
  const market = str(b.market);
  const mode   = str(b.mode);
  const lang   = b.lang === 'fr' ? 'fr' : b.lang === 'en' ? 'en' : null;

  if (!name) return new Response(null, { status: 204 });

  try {
    await env.DB.prepare(
      `INSERT INTO events (name, detail, market, mode, lang)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(name, detail, market, mode, lang).run();
  } catch { /* metrics must never break the client */ }

  return new Response(null, { status: 204 });
}
