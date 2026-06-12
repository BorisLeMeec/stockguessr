/* ═══════════ STOCKGUESSR ═══════════ */
'use strict';

const TIMEFRAMES = ['1D', '3D', '1M', '3M', '1Y', '5Y', 'ALL'];

/* ─────────── i18n ───────────
   Transcreated, not translated — the humour is rewritten per language.
   Brand elements (STOCKGUESSR, timeframe pills, CAP) stay English. */
const STR = {
  en: {
    tagline: 'ten charts. <em>no names.</em> trust the line.',
    d_easy: 'Easy', d_easy_desc: 'Mega-caps, prices on the axis. Browse all timeframes freely.',
    d_medium: 'Medium',
    d_medium_desc: n => n > 50 ? 'Top 50, the axis goes dark. Timeframes still yours to browse.'
                              : `All ${n} tickers, the axis goes dark. Timeframes still yours to browse.`,
    d_hard: 'Hard',
    d_hard_desc: n => `All ${n} tickers, one frozen chart — and now you guess the timeframe too.`,
    d_veryhard: 'Very Hard', d_veryhard_desc: 'Pure chaos. Even the quants would sweat.',
    foot: 'real market data · no login · just vibes',
    daily_name: 'Daily Challenge', train_lbl: 'TRAIN',
    daily_desc: 'Five charts. Same for everyone. One attempt — bon chance.',
    daily_played: (s, m) => `PLAYED TODAY ✓ ${s}/${m} PTS — new charts at midnight.`,
    hints_lbl: '// HINTS',
    hint_names: { tf: 'TIMELINE', s: 'SECTOR', f: 'FOUNDED', c: 'CAP', a: 'PRICES', g: 'COUNTRY' },
    rounds_lbl: '// ROUNDS', market_lbl: '// MARKET', lang_lbl: '// LANG',
    company_lbl: '// COMPANY', lock: 'LOCK IN GUESS',
    clues: '// CLUES', since: 'SINCE',
    rs_company: 'COMPANY', rs_tf: 'TIMEFRAME', rs_pts: 'POINTS',
    session: 'SESSION CLOSED', share: 'SHARE ↗', copy_img: 'COPY IMAGE', post_x: 'POST ON 𝕏', again: 'RUN IT BACK',
    round_word: 'ROUND',
    levels: ['EASY', 'MEDIUM', 'HARD'],
    diffs: { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD', veryhard: 'VERY HARD' },
    tf_guess: '// TIMEFRAME — YOUR GUESS', tf_browse: '// TIMEFRAME — BROWSE FREELY',
    ph_top: n => `one of the top ${n}…`, ph_any: n => `any of the ${n}…`,
    v_good: ['Absolutely nailed it.', 'The tape never lies.', 'Inside information?'],
    v_mid: ['Half right. Half rekt.', 'Close, but the market is cruel.', 'Partial fill.'],
    v_bad: ['Liquidated.', 'The chart says no.', 'Margin call.'],
    next: 'NEXT CHART →', see_results: 'SEE RESULTS →',
    tfl: { '1D': '1 day', '3D': '3 days', '1M': '1 month', '3M': '3 months', '1Y': '1 year', '5Y': '5 years' },
    all_time: y => `All time (since ${y})`,
    grades: [[0.9, 'The Oracle of Omaha.'], [0.7, 'Wolf of Wall Street.'], [0.5, 'Portfolio manager.'], [0.3, 'Day trader energy.'], [0.12, 'Retail investor.'], [0, 'Index funds. Please.']],
    f_shared: 'SHARED ✓', f_shared_txt: 'SHARED ✓ (TEXT — LONG-PRESS THE IMAGE TO ADD IT)',
    f_fail: n => `SHARE FAILED (${n}) — LONG-PRESS THE IMAGE INSTEAD`,
    f_img: 'IMAGE IN CLIPBOARD — PASTE IT ANYWHERE ✓', f_longpress: 'LONG-PRESS THE IMAGE ABOVE TO SAVE OR SHARE IT',
    f_dl: 'CLIPBOARD BLOCKED — IMAGE DOWNLOADED ✓',
    sponsor: [
      [0.7, 'You clearly read charts better than most. Put it to work — commission-free.'],
      [0.4, 'Decent eye. Imagine if those had been real positions.'],
      [0.12, 'Reading charts is hard. Owning them is easier — commission-free.'],
      [0, 'Rough session. Good thing this was free — unlike real trading, which can also be free.'],
    ],
    sponsor_cta: 'TRY TRADE REPUBLIC →', sponsor_disc: 'Investing carries a risk of capital loss.',
  },
  fr: {
    tagline: 'dix graphiques. <em>aucun nom.</em> fais confiance à la courbe.',
    d_easy: 'Facile', d_easy_desc: 'Méga-caps, prix affichés. Explore toute la timeline librement.',
    d_medium: 'Moyen',
    d_medium_desc: n => n > 50 ? "Top 50, l'axe s'éteint. La timeline reste à toi."
                               : `Les ${n} valeurs, l'axe s'éteint. La timeline reste à toi.`,
    d_hard: 'Difficile',
    d_hard_desc: n => `Les ${n} valeurs, un graphique figé — et il faut aussi deviner la timeline.`,
    d_veryhard: 'Très Difficile', d_veryhard_desc: 'Le chaos pur. Même les quants transpireraient.',
    foot: 'vraies données de marché · sans compte · que des vibes',
    daily_name: 'Le Défi du Jour', train_lbl: 'ENTRAÎNEMENT',
    daily_desc: 'Cinq graphiques. Les mêmes pour tout le monde. Une seule tentative — bon chance.',
    daily_played: (s, m) => `DÉJÀ JOUÉ AUJOURD'HUI ✓ ${s}/${m} PTS — nouveaux graphiques à minuit.`,
    hints_lbl: '// INDICES',
    hint_names: { tf: 'TIMELINE', s: 'SECTEUR', f: 'CRÉATION', c: 'CAP', a: 'PRIX', g: 'PAYS' },
    rounds_lbl: '// MANCHES', market_lbl: '// MARCHÉ', lang_lbl: '// LANGUE',
    company_lbl: '// SOCIÉTÉ', lock: 'VALIDER',
    clues: '// INDICES', since: 'DEPUIS',
    rs_company: 'SOCIÉTÉ', rs_tf: 'TIMELINE', rs_pts: 'POINTS',
    session: 'SÉANCE TERMINÉE', share: 'PARTAGER ↗', copy_img: "COPIER L'IMAGE", post_x: 'POSTER SUR 𝕏', again: 'ON REMET ÇA',
    round_word: 'MANCHE',
    levels: ['FACILE', 'MOYEN', 'DIFFICILE'],
    diffs: { easy: 'FACILE', medium: 'MOYEN', hard: 'DIFFICILE', veryhard: 'TRÈS DIFFICILE' },
    tf_guess: '// TIMELINE — TON PARI', tf_browse: '// TIMELINE — EXPLORE LIBREMENT',
    ph_top: n => `une société du top ${n}…`, ph_any: n => `n'importe laquelle des ${n}…`,
    v_good: ['En plein dans le mille.', 'Le marché ne ment jamais.', "Délit d'initié ?"],
    v_mid: ['À moitié juste. À moitié ruiné.', 'Proche, mais le marché est cruel.', 'Exécution partielle.'],
    v_bad: ['Liquidé.', 'Le graphique dit non.', 'Appel de marge.'],
    next: 'GRAPHIQUE SUIVANT →', see_results: 'VOIR LES RÉSULTATS →',
    tfl: { '1D': '1 jour', '3D': '3 jours', '1M': '1 mois', '3M': '3 mois', '1Y': '1 an', '5Y': '5 ans' },
    all_time: y => `Depuis l'origine (${y})`,
    grades: [[0.9, "L'Oracle d'Omaha."], [0.7, 'Le Loup de Wall Street.'], [0.5, 'Gérant de portefeuille.'], [0.3, 'Âme de day trader.'], [0.12, 'Investisseur du dimanche.'], [0, 'Les ETF. S\'il te plaît.']],
    f_shared: 'PARTAGÉ ✓', f_shared_txt: "PARTAGÉ ✓ (TEXTE — APPUI LONG SUR L'IMAGE POUR L'AJOUTER)",
    f_fail: n => `ÉCHEC DU PARTAGE (${n}) — APPUI LONG SUR L'IMAGE`,
    f_img: 'IMAGE COPIÉE — COLLE-LA OÙ TU VEUX ✓', f_longpress: "APPUI LONG SUR L'IMAGE POUR L'ENREGISTRER OU LA PARTAGER",
    f_dl: 'PRESSE-PAPIERS BLOQUÉ — IMAGE TÉLÉCHARGÉE ✓',
    sponsor: [
      [0.7, 'Tu lis clairement mieux les graphiques que la moyenne. Mets ça à profit — sans commission.'],
      [0.4, "Joli coup d'œil. Imagine si c'étaient de vraies positions."],
      [0.12, "Lire les graphiques, c'est dur. Les détenir, c'est plus simple — sans commission."],
      [0, "Séance compliquée. Heureusement, c'était gratuit — comme le vrai trading, d'ailleurs."],
    ],
    sponsor_cta: 'ESSAYER TRADE REPUBLIC →', sponsor_disc: 'Investir comporte un risque de perte en capital.',
  },
};

// Sector names come from the data files in English; map them for French display.
const SECTOR_FR = {
  'Information Technology': 'Technologies', 'Health Care': 'Santé', 'Financials': 'Finance',
  'Consumer Discretionary': 'Consommation discrétionnaire', 'Communication Services': 'Communication',
  'Industrials': 'Industrie', 'Consumer Staples': 'Consommation de base', 'Energy': 'Énergie',
  'Utilities': 'Services publics', 'Real Estate': 'Immobilier', 'Materials': 'Matériaux',
  'Luxury': 'Luxe', 'Cosmetics': 'Cosmétiques', 'Aerospace': 'Aéronautique', 'Pharma': 'Pharma',
  'Eyewear': 'Optique', 'Industrial Gases': 'Gaz industriels', 'Banking': 'Banque',
  'Insurance': 'Assurance', 'Construction': 'BTP', 'Software': 'Logiciels',
  'Building Materials': 'Matériaux de construction', 'Automotive': 'Automobile',
  'Spirits': 'Spiritueux', 'Electrical Equipment': 'Équipement électrique', 'Defense': 'Défense',
  'Food': 'Agroalimentaire', 'Advertising': 'Publicité', 'Tires': 'Pneumatiques',
  'Telecom': 'Télécoms', 'IT Services': 'Services informatiques',
  'Testing & Certification': 'Certification', 'Semiconductors': 'Semi-conducteurs',
  'Hotels': 'Hôtellerie', 'Steel': 'Acier', 'Retail': 'Distribution',
  'Payment Services': 'Paiements', 'Payments': 'Paiements', 'Lab Services': 'Laboratoires',
  'Media': 'Médias', 'Financial Exchanges': 'Bourses', 'Logistics': 'Logistique',
  'Sportswear': 'Équipement sportif', 'Chemicals': 'Chimie', 'Pharma & Chemicals': 'Pharma & chimie',
  'Energy Technology': 'Technologies énergétiques', 'Cables & Grids': 'Câbles & réseaux',
  'Information Services': "Services d'information", 'Beverages': 'Boissons',
};

let lang = localStorage.getItem('sg_lang') || (navigator.language?.startsWith('fr') ? 'fr' : 'en');
const t = key => STR[lang][key];
const sectorName = s => (lang === 'fr' ? SECTOR_FR[s] ?? s : s);

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t(el.dataset.i18n);
    if (v != null) el.innerHTML = typeof v === 'function' ? v(COMPANIES.length) : v;
  });
  document.querySelectorAll('#lang-pills .tf-pill')
    .forEach(x => x.classList.toggle('sel', x.dataset.l === lang));
  renderDailyCard(); // its copy is language- and market-dependent
}

// Per-game mix of question levels [easy, medium, hard].
// Question level: easy = top 20 + visible price axis, medium = top 50, hard = everything.
// guessTf: hard modes hide the timeframe and make you guess it;
// friendly modes let you browse timeframes freely and only guess the company.
const DIFFICULTY = {
  easy:     { key: 'easy',     mix: [7, 3, 0], guessTf: false },
  medium:   { key: 'medium',   mix: [2, 6, 2], guessTf: false },
  hard:     { key: 'hard',     mix: [1, 4, 5], guessTf: true },
  veryhard: { key: 'veryhard', mix: [0, 2, 8], guessTf: true },
};
const diffLabel = () => game.dailyNum ? `DAILY #${game.dailyNum}` : t('diffs')[game.diff.key];
const LEVEL = [
  { name: 'EASY',   pool: 20,       axis: true,  pts: 100 },
  { name: 'MEDIUM', pool: 50,       axis: false, pts: 150 },
  { name: 'HARD',   pool: Infinity, axis: false, pts: 200 },
];
const TF_PTS = 50;
let roundCount = 10; // menu setting: 1 / 5 / 10 / 20

/* ─────────── daily challenge ───────────
   Same five charts for everyone on a given day+market, one attempt per day.
   Companies are picked by hashing date|market|round|ticker and keeping the max,
   so the pick is independent of list order (caps re-sort daily at 06:00 UTC). */
const DAILY_LEVELS = [0, 1, 1, 2, 2]; // fixed ramp, easy → hard
const DAILY_EPOCH = Date.UTC(2026, 5, 11); // day before #1 (2026-06-12)

function hash32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// local date: the daily flips at the player's midnight
const todayStr = () => dateStr(new Date());
function dailyNumber() {
  const d = new Date();
  return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - DAILY_EPOCH) / 864e5);
}
function dateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
// streak: consecutive days with at least one daily completed (any market)
function readStreak() {
  try { return JSON.parse(localStorage.getItem('sg_streak')); } catch { return null; }
}
function bumpStreak() {
  const s = readStreak(), today = todayStr();
  if (s?.date === today) return; // another market's daily already counted today
  const y = new Date(); y.setDate(y.getDate() - 1);
  const count = s?.date === dateStr(y) ? s.count + 1 : 1;
  localStorage.setItem('sg_streak', JSON.stringify({ date: today, count }));
}
function currentStreak() {
  const s = readStreak();
  if (!s) return 0;
  const y = new Date(); y.setDate(y.getDate() - 1);
  return s.date === todayStr() || s.date === dateStr(y) ? s.count : 0; // dead streaks show nothing
}

function dailyRecord() {
  try {
    const r = JSON.parse(localStorage.getItem(`sg_daily_${market}`));
    return r && r.date === todayStr() ? r : null;
  } catch { return null; }
}
function dailyRounds() {
  const date = todayStr();
  const used = new Set();
  return DAILY_LEVELS.map((lvl, i) => {
    const pool = COMPANIES
      .slice(0, Math.min(LEVEL[lvl].pool, COMPANIES.length))
      .filter(c => AVAILABLE.has(c.t) && !used.has(c.t));
    const list = pool.length ? pool : COMPANIES.filter(c => AVAILABLE.has(c.t) && !used.has(c.t));
    let company = list[0], best = -1;
    for (const c of list) {
      const h = hash32(`${date}|${market}|${i}|${c.t}`);
      if (h > best) { best = h; company = c; }
    }
    used.add(company.t);
    const tf = TIMEFRAMES[hash32(`${date}|${market}|tf|${company.t}`) % TIMEFRAMES.length];
    return { lvl, company, tf };
  });
}
function renderDailyCard() {
  const rec = dailyRecord();
  const st = currentStreak();
  $('daily-streak').hidden = !st;
  $('daily-streak').textContent = `🔥 ${st}`;
  $('daily-num').textContent = `#${dailyNumber()} · ${MARKETS[market].label}`;
  $('daily-card').classList.toggle('played', !!rec);
  $('daily-desc').textContent = rec ? t('daily_played')(rec.score, rec.max) : t('daily_desc');
}

const MARKETS = {
  sp500: { dir: 'data/sp500', cur: '$', label: 'S&P 500' },
  cac40: { dir: 'data/cac40', cur: '€', label: 'CAC 40' },
  eurostoxx50: { dir: 'data/eurostoxx50', cur: '€', label: 'EURO STOXX 50' },
};
let market = 'sp500';         // menu setting
const marketCache = {};       // lazy-loaded {companies, available} per market

let COMPANIES = [];           // [{t, n, s, f, c}] ranked by market cap
let AVAILABLE = new Set();    // tickers with price data

async function loadMarket(m) {
  if (!marketCache[m]) {
    const [companies, available] = await Promise.all([
      fetch(`${MARKETS[m].dir}/companies.json`).then(r => r.json()),
      fetch(`${MARKETS[m].dir}/available.json`).then(r => r.json()),
    ]);
    marketCache[m] = { companies, available: new Set(available) };
  }
  COMPANIES = marketCache[m].companies;
  AVAILABLE = marketCache[m].available;
}

const $ = id => document.getElementById(id);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];

/* ─────────── boot ─────────── */
async function boot() {
  await loadMarket(market);
  applyLang();
  const langPills = document.querySelectorAll('#lang-pills .tf-pill');
  langPills.forEach(pill =>
    pill.addEventListener('click', () => {
      lang = pill.dataset.l;
      localStorage.setItem('sg_lang', lang);
      applyLang();
    }));
  buildTickerTape();
  document.querySelectorAll('.diff-card').forEach(card =>
    card.addEventListener('click', () => startGame(card.dataset.diff)));
  const roundPills = document.querySelectorAll('#rounds-pills .tf-pill');
  roundPills.forEach(pill =>
    pill.addEventListener('click', () => {
      roundCount = +pill.dataset.n;
      roundPills.forEach(x => x.classList.toggle('sel', +x.dataset.n === roundCount));
    }));
  const marketPills = document.querySelectorAll('#market-pills .tf-pill');
  marketPills.forEach(pill =>
    pill.addEventListener('click', () => {
      market = pill.dataset.m;
      marketPills.forEach(x => x.classList.toggle('sel', x.dataset.m === market));
      loadMarket(market).then(() => { buildTickerTape(); applyLang(); }); // tape + pool sizes follow the market
    }));
}

function buildTickerTape() {
  const names = shuffle(COMPANIES.slice(0, 60).map(c => c.t)).slice(0, 24);
  const text = names.map(t => {
    const up = Math.random() > 0.45;
    const pct = (Math.random() * 4 + 0.1).toFixed(2);
    return `<i class="${up ? 'tape-up' : 'tape-down'}">${t} ${up ? '▲' : '▼'}${pct}%</i>`;
  }).join(' · ');
  $('ticker-tape').innerHTML = `<span>${text} · ${text}</span>`;
}

/* ─────────── game state ─────────── */
const game = { rounds: [], idx: 0, score: 0, max: 0, results: [], diff: null };
let guess = { company: null, tf: null };
let currentData = null;

/* ─────────── hints (daily only) ───────────
   The daily is one shared puzzle, so instead of a difficulty pick each hint
   walks the round down toward easy mode. Strongest-first: unlocking free
   timeframe browsing forfeits the timeframe's +50 (that IS the price), then
   the hidden clue rows (sector → founded → cap) and finally the price axis
   cost HINT_COST each, deducted from what the round earns, floored at 0. */
const HINT_COST = 25;

// listing country from the Yahoo ticker suffix — only meaningful for
// multi-country markets (STOXX 50); CAC 40 is all-French, S&P has no suffix
const TICKER_COUNTRY = {
  PA: ['🇫🇷', 'FRA'], DE: ['🇩🇪', 'DEU'], AS: ['🇳🇱', 'NLD'], MI: ['🇮🇹', 'ITA'],
  MC: ['🇪🇸', 'ESP'], BR: ['🇧🇪', 'BEL'], HE: ['🇫🇮', 'FIN'], LS: ['🇵🇹', 'PRT'],
  IR: ['🇮🇪', 'IRL'], VI: ['🇦🇹', 'AUT'],
};
function countryOf(company) {
  const e = TICKER_COUNTRY[company.t.split('.')[1]];
  return e ? `${e[0]} (${e[1]})` : null;
}
let hints = { left: [], spent: 0, rows: null, tfUnlocked: false, axisShown: false };
const tfIsGuess = () => game.diff.guessTf && !hints.tfUnlocked;
const chartAxis = round => LEVEL[round.lvl].axis || hints.axisShown;

function renderHintBtns() {
  $('hint-row').hidden = !hints.left.length;
  $('hints-label').textContent = t('hints_lbl');
  const box = $('hint-pills');
  box.innerHTML = '';
  hints.left.forEach(k => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn-hint';
    b.textContent = `+ ${t('hint_names')[k]} (−${k === 'tf' ? TF_PTS : HINT_COST} PTS)`;
    b.addEventListener('click', () => buyHint(k));
    box.appendChild(b);
  });
}

function buyHint(k) {
  hints.left = hints.left.filter(x => x !== k);
  if (k === 'tf') {
    hints.tfUnlocked = true; // forfeits the +50, pills now just browse
    guess.tf = null;
    buildTfPills();
    updateSubmit();
  } else if (k === 'a') {
    hints.spent += HINT_COST;
    hints.axisShown = true;
    if (currentData) drawChart(currentData.series[viewTf], true);
  } else {
    hints.spent += HINT_COST;
    hints.rows[k].el.style.display = '';
    $('intel-card').hidden = false;
  }
  renderHintBtns();
}

// the clue card overlays the chart — fade it on hover (desktop) / tap (mobile)
$('intel-card').addEventListener('click', () => $('intel-card').classList.toggle('peek'));

// Scale a 10-question mix to n questions (largest-remainder rounding),
// so e.g. [2,6,2] at n=5 → [1,3,1] and the proportions hold.
function levelsFor(mix, n) {
  const exact = mix.map(m => (m * n) / 10);
  const counts = exact.map(Math.floor);
  let left = n - counts.reduce((a, b) => a + b, 0);
  exact.map((e, i) => [e - counts[i], i])
    .sort((a, b) => b[0] - a[0])
    .slice(0, left)
    .forEach(([, i]) => counts[i]++);
  const levels = [];
  counts.forEach((c, lvl) => { for (let i = 0; i < c; i++) levels.push(lvl); });
  return shuffle(levels);
}

async function startGame(diff) {
  await loadMarket(market); // apply the menu's market choice
  let cfg;
  if (diff === 'daily') {
    if (dailyRecord()) return; // one attempt a day
    cfg = { key: 'daily', guessTf: true };
    game.rounds = dailyRounds();
    game.dailyNum = dailyNumber();
  } else {
    cfg = DIFFICULTY[diff];
    game.dailyNum = null;
    const levels = levelsFor(cfg.mix, roundCount);

    // pick a distinct company per round from each question's level pool
    const used = new Set();
    game.rounds = levels.map(lvl => {
      const pool = COMPANIES
        .slice(0, Math.min(LEVEL[lvl].pool, COMPANIES.length))
        .filter(c => AVAILABLE.has(c.t) && !used.has(c.t));
      const company = pick(pool.length ? pool : COMPANIES.filter(c => AVAILABLE.has(c.t)));
      used.add(company.t);
      return { lvl, company, tf: pick(TIMEFRAMES) };
    });
  }

  game.idx = 0; game.score = 0; game.results = []; game.diff = cfg; game.market = market;
  game.max = game.rounds.reduce((s, r) => s + LEVEL[r.lvl].pts + (cfg.guessTf ? TF_PTS : 0), 0);
  show('screen-game');
  loadRound();
}

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
}

let viewTf = null; // timeframe currently displayed on the chart

// 2540000000000 → "$2.5T", 354000000000 → "€354B"
function fmtCap(c, cur) {
  if (!c) return null;
  return c >= 1e12 ? `${cur}${(c / 1e12).toFixed(1)}T` : `${cur}${Math.round(c / 1e9)}B`;
}

async function loadRound() {
  const round = game.rounds[game.idx];
  guess = { company: null, tf: null };
  hints = { left: [], spent: 0, rows: null, tfUnlocked: false, axisShown: false }; // before buildTfPills — tfIsGuess reads it
  viewTf = round.tf;

  $('hud-round').textContent = `${t('round_word')} ${String(game.idx + 1).padStart(2, '0')}/${game.rounds.length}`;
  $('hud-score').textContent = `${game.score} PTS`;
  $('hud-market').textContent = MARKETS[game.market].label;
  $('hud-level').textContent = t('levels')[round.lvl];
  $('hud-level').style.color = ['var(--green)', 'var(--amber)', 'var(--red)'][round.lvl];

  $('guess-panel').style.display = '';
  $('reveal-panel').hidden = true;
  const input = $('guess-input');
  input.value = ''; input.classList.remove('locked'); input.disabled = false;
  const poolSize = Math.min(LEVEL[round.lvl].pool, COMPANIES.length);
  input.placeholder = poolSize === COMPANIES.length ? t('ph_any')(poolSize) : t('ph_top')(poolSize);
  $('ac-list').hidden = true;
  buildTfPills();
  updateSubmit();

  // clue card: founded+sector for easy contexts, market cap up to medium contexts
  const showId = game.diff === DIFFICULTY.easy || round.lvl === 0;
  const showCap = game.diff === DIFFICULTY.easy || game.diff === DIFFICULTY.medium || round.lvl <= 1;
  const cap = fmtCap(round.company.c, MARKETS[game.market].cur);
  const rows = {
    s: { el: $('intel-sector'), val: round.company.s, shown: showId },
    g: { el: $('intel-country'), val: game.market === 'eurostoxx50' ? countryOf(round.company) : null, shown: showCap }, // like cap: up to medium contexts
    f: { el: $('intel-founded').parentElement, val: round.company.f, shown: showId },
    c: { el: $('intel-cap').parentElement, val: cap, shown: showCap },
  };
  for (const r of Object.values(rows)) r.el.style.display = r.shown && r.val ? '' : 'none';
  $('intel-card').hidden = !Object.values(rows).some(r => r.shown && r.val);
  $('intel-card').classList.remove('peek');
  $('intel-founded').textContent = round.company.f ?? '';
  $('intel-sector').textContent = sectorName(round.company.s) ?? '';
  $('intel-country').textContent = rows.g.val ?? '';
  $('intel-cap').textContent = cap ?? '';
  // buyable helps — daily only; each one walks the round toward easy mode
  hints.left = game.dailyNum ? [
    ...(game.diff.guessTf ? ['tf'] : []),
    ...['s', 'g', 'f', 'c'].filter(k => !rows[k].shown && rows[k].val),
    ...(LEVEL[round.lvl].axis ? [] : ['a']),
  ] : [];
  hints.rows = rows;
  renderHintBtns();

  currentData = await fetch(`${MARKETS[game.market].dir}/stocks/${round.company.t}.json`).then(r => r.json());
  drawChart(currentData.series[viewTf], chartAxis(round));
}

/* ─────────── chart ─────────── */
function drawChart(series, showAxis) {
  const canvas = $('chart');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const padL = showAxis ? 64 : 10, padR = 10, padT = 16, padB = 14;
  const min = Math.min(...series), max = Math.max(...series);
  const span = (max - min) || 1;
  const x = i => padL + (i / (series.length - 1)) * (w - padL - padR);
  const y = v => padT + (1 - (v - min) / span) * (h - padT - padB);

  // grid + axis
  ctx.font = '11px IBM Plex Mono';
  for (let g = 0; g <= 4; g++) {
    const v = min + (span * g) / 4, gy = y(v);
    ctx.strokeStyle = 'rgba(255,255,255,.05)';
    ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(w - padR, gy); ctx.stroke();
    if (showAxis) {
      ctx.fillStyle = '#5a675a';
      ctx.textBaseline = 'middle';
      ctx.fillText(`$${v >= 100 ? v.toFixed(0) : v.toFixed(2)}`, 6, gy);
    }
  }

  // line, colored per segment, with glow — animated sweep
  const start = performance.now(), DUR = 700;
  function frame(now) {
    const t = Math.min(1, (now - start) / DUR);
    const eased = 1 - Math.pow(1 - t, 3);
    const upto = Math.max(2, Math.floor(eased * series.length));
    ctx.clearRect(padL - 4, 0, w - padL + 4, h);
    // redraw gridlines inside plot
    for (let g = 0; g <= 4; g++) {
      const gy = y(min + (span * g) / 4);
      ctx.strokeStyle = 'rgba(255,255,255,.05)';
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(w - padR, gy); ctx.stroke();
    }
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.shadowBlur = 10;
    for (let i = 1; i < upto; i++) {
      const up = series[i] >= series[i - 1];
      ctx.strokeStyle = up ? '#2dff8a' : '#ff3b4f';
      ctx.shadowColor = up ? 'rgba(45,255,138,.6)' : 'rgba(255,59,79,.6)';
      ctx.beginPath();
      ctx.moveTo(x(i - 1), y(series[i - 1]));
      ctx.lineTo(x(i), y(series[i]));
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ─────────── autocomplete ─────────── */
let acItems = [], acSel = -1;
const input = document.getElementById('guess-input');
const acList = document.getElementById('ac-list');

input.addEventListener('input', () => {
  guess.company = null;
  input.classList.remove('locked');
  const q = input.value.trim().toLowerCase();
  if (q.length < 1) { acList.hidden = true; updateSubmit(); return; }
  // only companies in this question's pool are valid answers
  const pool = COMPANIES.slice(0, Math.min(LEVEL[game.rounds[game.idx].lvl].pool, COMPANIES.length));
  const starts = [], contains = [];
  for (const c of pool) {
    const n = c.n.toLowerCase(), t = c.t.toLowerCase();
    if (n.startsWith(q) || t.startsWith(q)) starts.push(c);
    else if (n.includes(q)) contains.push(c);
    if (starts.length >= 8) break;
  }
  acItems = starts.concat(contains).slice(0, 8);
  acSel = -1;
  acList.innerHTML = acItems.map(c =>
    `<li><span>${c.n}</span><span class="ac-ticker">${c.t}</span></li>`).join('');
  acList.hidden = acItems.length === 0;
  [...acList.children].forEach((li, i) => li.addEventListener('mousedown', e => { e.preventDefault(); choose(i); }));
  updateSubmit();
});

input.addEventListener('keydown', e => {
  if (acList.hidden) {
    if (e.key === 'Enter' && !$('btn-submit').disabled) submitGuess();
    return;
  }
  if (e.key === 'ArrowDown') { e.preventDefault(); acSel = Math.min(acSel + 1, acItems.length - 1); paintSel(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); acSel = Math.max(acSel - 1, 0); paintSel(); }
  else if (e.key === 'Enter') { e.preventDefault(); choose(acSel >= 0 ? acSel : 0); }
  else if (e.key === 'Escape') acList.hidden = true;
});
input.addEventListener('blur', () => setTimeout(() => { acList.hidden = true; undockInput(); }, 120));
// on-screen keyboards cover the bottom half: instead of scrolling the page,
// lift the field out of the flow and pin it over the top of the screen so
// input + suggestions always sit in the visible strip above the keyboard
const companyField = input.closest('.field-company');
function placeDock() {
  if (!companyField.classList.contains('docked')) return;
  // iOS anchors fixed elements to the layout viewport; follow the visual one
  companyField.style.top = (window.visualViewport?.offsetTop ?? 0) + 'px';
}
window.visualViewport?.addEventListener('resize', placeDock);
window.visualViewport?.addEventListener('scroll', placeDock);
function undockInput() {
  companyField.classList.remove('docked');
  companyField.style.top = '';
  companyField.parentElement.style.minHeight = '';
}
input.addEventListener('focus', () => {
  if (!matchMedia('(pointer: coarse)').matches) return;
  companyField.parentElement.style.minHeight = companyField.offsetHeight + 'px';
  companyField.classList.add('docked');
  placeDock();
});

function paintSel() {
  [...acList.children].forEach((li, i) => li.classList.toggle('sel', i === acSel));
  acList.children[acSel]?.scrollIntoView({ block: 'nearest' });
}
function choose(i) {
  const c = acItems[i];
  if (!c) return;
  guess.company = c;
  input.value = c.n;
  input.classList.add('locked');
  acList.hidden = true;
  updateSubmit();
}

/* ─────────── timeframe pills ─────────── */
function buildTfPills() {
  const round = game.rounds[game.idx];
  const box = $('tf-pills');
  box.innerHTML = '';
  $('tf-label').textContent = tfIsGuess() ? t('tf_guess') : t('tf_browse');
  TIMEFRAMES.forEach(tf => {
    const b = document.createElement('button');
    b.className = 'tf-pill'; b.textContent = tf;
    if (!tfIsGuess() && tf === viewTf) b.classList.add('sel');
    b.addEventListener('click', () => {
      [...box.children].forEach(x => x.classList.toggle('sel', x === b));
      if (tfIsGuess()) {
        guess.tf = tf;
        updateSubmit();
      } else {
        // friendly mode: pills just change the chart view
        viewTf = tf;
        if (currentData) drawChart(currentData.series[viewTf], chartAxis(round));
      }
    });
    box.appendChild(b);
  });
}

function updateSubmit() {
  $('btn-submit').disabled = !(guess.company && (guess.tf || !tfIsGuess()));
}

/* ─────────── submit / reveal ─────────── */
$('btn-submit').addEventListener('click', submitGuess);

function submitGuess() {
  const round = game.rounds[game.idx];
  const okCompany = guess.company.t === round.company.t;
  const okTf = tfIsGuess() ? guess.tf === round.tf : null; // null = not part of the puzzle (browse mode or unlocked)
  const base = (okCompany ? LEVEL[round.lvl].pts : 0) + (okTf ? TF_PTS : 0);
  const pts = Math.max(0, base - hints.spent);
  game.score += pts;
  game.results.push({ round, okCompany, okTf, pts });

  $('hud-score').textContent = `${game.score} PTS`;
  $('guess-panel').style.display = 'none';

  const verdict = $('reveal-verdict');
  if (okCompany && okTf !== false) { verdict.textContent = pick(t('v_good')); verdict.className = 'reveal-verdict good'; }
  else if (okCompany || okTf) { verdict.textContent = pick(t('v_mid')); verdict.className = 'reveal-verdict mid'; }
  else { verdict.textContent = pick(t('v_bad')); verdict.className = 'reveal-verdict bad'; }

  $('reveal-company').textContent = `${round.company.n} (${round.company.t})`;
  $('reveal-company-mark').textContent = okCompany ? '✓' : `✗ ${guess.company.t}`;
  $('reveal-company-mark').className = `rs-mark ${okCompany ? 'ok' : 'ko'}`;
  const tfBlock = $('reveal-tf').closest('.rs-block');
  tfBlock.style.display = okTf === null ? 'none' : '';
  if (okTf !== null) {
    $('reveal-tf').textContent = tfLabel(round.tf, round.company);
    $('reveal-tf-mark').textContent = okTf ? '✓' : `✗ ${guess.tf}`;
    $('reveal-tf-mark').className = `rs-mark ${okTf ? 'ok' : 'ko'}`;
  }
  $('reveal-points').textContent = `+${pts}` + (hints.spent && base ? ` (−${hints.spent})` : '');
  $('reveal-panel').hidden = false;
  $('btn-next').textContent = game.idx === game.rounds.length - 1 ? t('see_results') : t('next');
  $('btn-next').focus();
}

function tfLabel(tf, company) {
  return tf === 'ALL' ? t('all_time')(currentData?.since ?? '—') : t('tfl')[tf];
}

$('btn-next').addEventListener('click', () => {
  game.idx++;
  if (game.idx >= game.rounds.length) showResults();
  else loadRound();
});

/* ─────────── sponsor slot ───────────
   One native ad on the results screen. Swap campaigns by editing this object;
   set enabled: false to run clean. url should carry your affiliate tag. */
// Copy lives in STR[lang].sponsor (score-tiered), sponsor_cta, sponsor_disc.
const SPONSOR = {
  enabled: true,
  url: 'https://refnocode.trade.re/ffxf9qx5',
};

function renderSponsor() {
  const card = $('sponsor-card');
  card.hidden = !SPONSOR.enabled;
  if (!SPONSOR.enabled) return;
  const ratio = game.score / game.max;
  $('sponsor-text').textContent = t('sponsor').find(([min]) => ratio >= min)[1];
  $('sponsor-cta').textContent = t('sponsor_cta');
  $('sponsor-disclaimer').textContent = t('sponsor_disc');
  card.href = SPONSOR.url;
}

/* ─────────── results ─────────── */
function showResults() {
  show('screen-results');
  if (game.dailyNum) {
    localStorage.setItem(`sg_daily_${game.market}`,
      JSON.stringify({ date: todayStr(), num: game.dailyNum, score: game.score, max: game.max }));
    bumpStreak();
    renderDailyCard();
  }
  const ratio = game.score / game.max;
  $('results-grade').textContent = t('grades').find(([min]) => ratio >= min)[1];
  $('results-score').textContent = game.score;
  $('results-max').textContent = ` / ${game.max}`;
  $('results-list').innerHTML = game.results.map((r, i) => `
    <li style="animation-delay:${i * 60}ms">
      <span class="rl-num">${String(i + 1).padStart(2, '0')}</span>
      <span class="rl-name">${r.round.company.n}</span>
      <span class="rl-tf">${r.okTf === null ? '—' : r.round.tf}</span>
      <span class="rl-marks"><span class="${r.okCompany ? 'ok' : 'ko'}">${r.okCompany ? '✓' : '✗'}</span>${r.okTf === null ? '' : ` <span class="${r.okTf ? 'ok' : 'ko'}">${r.okTf ? '✓' : '✗'}</span>`}</span>
      <span class="rl-pts ${r.pts ? '' : 'zero'}">+${r.pts}</span>
    </li>`).join('');
  $('share-feedback').innerHTML = '&nbsp;';
  renderSponsor();
  prepareShare();
}

$('btn-again').addEventListener('click', () => show('screen-menu'));

/* ─────────── share ─────────── */
const SITE = 'stockguessr.fr';
let shareBlob = null;

function roundEmoji(r) {
  if (r.okTf === null) return r.okCompany ? '🟩' : '🟥'; // company-only rounds
  return r.okCompany && r.okTf ? '🟩' : (r.okCompany || r.okTf) ? '🟨' : '🟥';
}

function shareText() {
  const rows = [];
  for (let i = 0; i < game.results.length; i += 5)
    rows.push(game.results.slice(i, i + 5).map(roundEmoji).join(''));
  const grid = rows.join('\n');
  const st = game.dailyNum ? currentStreak() : 0;
  return `STOCKGUESSR · ${diffLabel()} · ${MARKETS[game.market].label}${st > 1 ? ` · 🔥${st}` : ''}\n${grid}\n${game.score}/${game.max} PTS — ${$('results-grade').textContent}\nhttps://${SITE}`;
}

async function buildShareImage() {
  await document.fonts.ready;
  const S = 1080;
  const c = document.createElement('canvas');
  c.width = S; c.height = S;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#050605';
  ctx.fillRect(0, 0, S, S);
  const vg = ctx.createRadialGradient(S / 2, S * .42, S * .2, S / 2, S * .42, S * .75);
  vg.addColorStop(0, 'rgba(45,255,138,.06)');
  vg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, S, S);

  // decorative chart line from the last round played
  const series = currentData?.series[game.rounds[game.rounds.length - 1].tf];
  if (series) {
    const min = Math.min(...series), max = Math.max(...series), span = (max - min) || 1;
    ctx.lineWidth = 3; ctx.globalAlpha = .28; ctx.shadowBlur = 12;
    const px = i => 80 + (i / (series.length - 1)) * (S - 160);
    const py = v => S * .58 - ((v - min) / span) * S * .30;
    for (let i = 1; i < series.length; i++) {
      const up = series[i] >= series[i - 1];
      ctx.strokeStyle = up ? '#2dff8a' : '#ff3b4f';
      ctx.shadowColor = ctx.strokeStyle;
      ctx.beginPath();
      ctx.moveTo(px(i - 1), py(series[i - 1]));
      ctx.lineTo(px(i), py(series[i]));
      ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }

  ctx.font = '600 64px "IBM Plex Mono"';
  const w1 = ctx.measureText('STOCK').width;
  const w2 = ctx.measureText('GUESSR').width;
  const x0 = (S - w1 - w2) / 2;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#d8e0d8';
  ctx.fillText('STOCK', x0, 150);
  ctx.fillStyle = '#2dff8a';
  ctx.shadowColor = 'rgba(45,255,138,.6)'; ctx.shadowBlur = 24;
  ctx.fillText('GUESSR', x0 + w1, 150);
  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';

  ctx.font = '500 30px "IBM Plex Mono"';
  ctx.fillStyle = '#ffc24b';
  const st = game.dailyNum ? currentStreak() : 0;
  ctx.fillText(`— ${diffLabel()} · ${MARKETS[game.market].label}${st > 1 ? ` · 🔥${st}` : ''} —`, S / 2, 215);

  ctx.font = '600 190px "IBM Plex Mono"';
  ctx.fillStyle = '#2dff8a';
  ctx.shadowColor = 'rgba(45,255,138,.55)'; ctx.shadowBlur = 40;
  ctx.fillText(String(game.score), S / 2, 470);
  ctx.shadowBlur = 0;
  ctx.font = '400 40px "IBM Plex Mono"';
  ctx.fillStyle = '#5a675a';
  ctx.fillText(`/ ${game.max} PTS`, S / 2, 535);

  ctx.font = 'italic 64px "Instrument Serif"';
  ctx.fillStyle = '#d8e0d8';
  ctx.fillText($('results-grade').textContent, S / 2, 650);

  // round squares, rows of 5 — smaller cells when more than 10 rounds
  const n = game.results.length;
  const cell = n > 10 ? 46 : 64, gap = n > 10 ? 12 : 18;
  const perRow = Math.min(5, n);
  const rowW = perRow * cell + (perRow - 1) * gap;
  game.results.forEach((r, i) => {
    const gx = S / 2 - rowW / 2 + (i % 5) * (cell + gap);
    const gy = 730 + Math.floor(i / 5) * (cell + gap);
    const emoji = roundEmoji(r);
    ctx.fillStyle = emoji === '🟩' ? '#2dff8a' : emoji === '🟨' ? '#ffc24b' : '#ff3b4f';
    ctx.globalAlpha = .9;
    ctx.beginPath();
    ctx.roundRect(gx, gy, cell, cell, 8);
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  ctx.font = '500 34px "IBM Plex Mono"';
  ctx.fillStyle = '#5a675a';
  ctx.fillText(SITE, S / 2, 990);

  return new Promise(res => c.toBlob(b => res(b), 'image/png'));
}

async function prepareShare() {
  shareBlob = await buildShareImage();
  $('share-img').src = URL.createObjectURL(shareBlob);
  const file = new File([shareBlob], 'stockguessr-score.png', { type: 'image/png' });
  const canShareFiles = !!navigator.canShare?.({ files: [file] });
  // show native share if files work, or on touch devices with any share support
  // (the click handler falls back to text-only sharing)
  $('btn-share').hidden = !(canShareFiles || (navigator.share && matchMedia('(pointer: coarse)').matches));
  $('btn-x').href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText());
}

function flash(msg) {
  const feedback = $('share-feedback');
  feedback.textContent = msg;
  clearTimeout(flash.t);
  flash.t = setTimeout(() => { feedback.innerHTML = '&nbsp;'; }, 2500);
}

// native share sheet — mobile / supporting browsers only
$('btn-share').addEventListener('click', async () => {
  const file = new File([shareBlob], 'stockguessr-score.png', { type: 'image/png' });
  try {
    await navigator.share({ files: [file], title: 'STOCKGUESSR', text: shareText() });
    flash(t('f_shared'));
    return;
  } catch (e) {
    if (e.name === 'AbortError') return;
  }
  // some Android browsers/webviews choke on files+text — retry with text only
  try {
    await navigator.share({ title: 'STOCKGUESSR', text: shareText() });
    flash(t('f_shared_txt'));
  } catch (e) {
    if (e.name !== 'AbortError') flash(t('f_fail')(e.name));
  }
});

const isTouch = matchMedia('(pointer: coarse)').matches;

$('btn-copy-img').addEventListener('click', async () => {
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': shareBlob })]);
    flash(t('f_img'));
  } catch {
    if (isTouch) {
      // blob downloads are unreliable on mobile; the native gesture works better
      flash(t('f_longpress'));
    } else {
      // browser without image clipboard (e.g. Firefox): download instead
      const a = document.createElement('a');
      a.href = $('share-img').src;
      a.download = 'stockguessr-score.png';
      a.click();
      flash(t('f_dl'));
    }
  }
});

window.addEventListener('resize', () => {
  if ($('screen-game').classList.contains('active') && currentData) {
    const round = game.rounds[game.idx];
    drawChart(currentData.series[viewTf], chartAxis(round));
  }
});

boot();
