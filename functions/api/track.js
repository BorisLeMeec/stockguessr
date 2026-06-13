// POST /api/track — records one "validate" click for aggregate metrics.
// Best-effort: any bad input or DB hiccup returns 204 so the client never sees an error.
// Deliberately stores no IP / no identifier — just the guess context.

const str = v => (typeof v === 'string' && v.length <= 20 ? v : null);
const bool = v => (v === true ? 1 : v === false ? 0 : null);

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  let b;
  try { b = await request.json(); } catch { return new Response(null, { status: 204 }); }
  if (!b || typeof b !== 'object') return new Response(null, { status: 204 });

  const market    = str(b.market);
  const mode      = str(b.mode);
  const lang      = b.lang === 'fr' ? 'fr' : b.lang === 'en' ? 'en' : null;
  const dailyNum  = Number.isInteger(b.dailyNum) ? b.dailyNum : null;
  const level     = Number.isInteger(b.level) && b.level >= 0 && b.level <= 5 ? b.level : null;
  const okCompany = bool(b.okCompany);
  const okTf      = bool(b.okTf);

  try {
    await env.DB.prepare(
      `INSERT INTO guesses (market, mode, daily_num, level, ok_company, ok_tf, lang)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(market, mode, dailyNum, level, okCompany, okTf, lang).run();
  } catch { /* metrics must never break the client */ }

  return new Response(null, { status: 204 });
}
