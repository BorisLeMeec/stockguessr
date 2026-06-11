/* ═══════════ STOCKGUESSR ═══════════ */
'use strict';

const TIMEFRAMES = ['1D', '3D', '1M', '3M', '1Y', '5Y', 'ALL'];

// Per-game mix of question levels [easy, medium, hard].
// Question level: easy = top 20 + visible price axis, medium = top 50, hard = everything.
const DIFFICULTY = {
  easy:     { label: 'EASY',      mix: [7, 3, 0] },
  medium:   { label: 'MEDIUM',    mix: [2, 6, 2] },
  hard:     { label: 'HARD',      mix: [1, 4, 5] },
  veryhard: { label: 'VERY HARD', mix: [0, 2, 8] },
};
const LEVEL = [
  { name: 'EASY',   pool: 20,       axis: true,  pts: 100 },
  { name: 'MEDIUM', pool: 50,       axis: false, pts: 150 },
  { name: 'HARD',   pool: Infinity, axis: false, pts: 200 },
];
const TF_PTS = 50;
let roundCount = 10; // menu setting: 1 / 5 / 10 / 20

let COMPANIES = [];           // [{t, n}] ranked
let AVAILABLE = new Set();    // tickers with price data

const $ = id => document.getElementById(id);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];

/* ─────────── boot ─────────── */
async function boot() {
  const [companies, available] = await Promise.all([
    fetch('data/companies.json').then(r => r.json()),
    fetch('data/available.json').then(r => r.json()),
  ]);
  COMPANIES = companies;
  AVAILABLE = new Set(available);
  buildTickerTape();
  document.querySelectorAll('.diff-card').forEach(card =>
    card.addEventListener('click', () => startGame(card.dataset.diff)));
  document.querySelectorAll('#rounds-pills .tf-pill').forEach(pill =>
    pill.addEventListener('click', () => {
      roundCount = +pill.dataset.n;
      document.querySelectorAll('#rounds-pills .tf-pill').forEach(x => x.classList.toggle('sel', x === pill));
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

function startGame(diff) {
  const cfg = DIFFICULTY[diff];
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

  game.idx = 0; game.score = 0; game.results = []; game.diff = cfg;
  game.max = game.rounds.reduce((s, r) => s + LEVEL[r.lvl].pts + TF_PTS, 0);
  show('screen-game');
  loadRound();
}

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
}

async function loadRound() {
  const round = game.rounds[game.idx];
  guess = { company: null, tf: null };

  $('hud-round').textContent = `ROUND ${String(game.idx + 1).padStart(2, '0')}/${game.rounds.length}`;
  $('hud-score').textContent = `${game.score} PTS`;
  $('hud-level').textContent = LEVEL[round.lvl].name;
  $('hud-level').style.color = ['var(--green)', 'var(--amber)', 'var(--red)'][round.lvl];

  $('guess-panel').style.display = '';
  $('reveal-panel').hidden = true;
  const input = $('company-input');
  input.value = ''; input.classList.remove('locked'); input.disabled = false;
  $('ac-list').hidden = true;
  buildTfPills();
  updateSubmit();

  // easy questions get an intel card: founded year + sector
  const easy = round.lvl === 0;
  $('intel-card').hidden = !(easy && (round.company.f || round.company.s));
  if (easy) {
    $('intel-founded').textContent = round.company.f ?? '????';
    $('intel-sector').textContent = round.company.s ?? '';
  }

  currentData = await fetch(`data/stocks/${round.company.t}.json`).then(r => r.json());
  drawChart(currentData.series[round.tf], LEVEL[round.lvl].axis);
  input.focus();
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
const input = document.getElementById('company-input');
const acList = document.getElementById('ac-list');

input.addEventListener('input', () => {
  guess.company = null;
  input.classList.remove('locked');
  const q = input.value.trim().toLowerCase();
  if (q.length < 1) { acList.hidden = true; updateSubmit(); return; }
  const starts = [], contains = [];
  for (const c of COMPANIES) {
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
input.addEventListener('blur', () => setTimeout(() => { acList.hidden = true; }, 120));

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
  const box = $('tf-pills');
  box.innerHTML = '';
  TIMEFRAMES.forEach(tf => {
    const b = document.createElement('button');
    b.className = 'tf-pill'; b.textContent = tf;
    b.addEventListener('click', () => {
      guess.tf = tf;
      [...box.children].forEach(x => x.classList.toggle('sel', x === b));
      updateSubmit();
    });
    box.appendChild(b);
  });
}

function updateSubmit() {
  $('btn-submit').disabled = !(guess.company && guess.tf);
}

/* ─────────── submit / reveal ─────────── */
$('btn-submit').addEventListener('click', submitGuess);

function submitGuess() {
  const round = game.rounds[game.idx];
  const okCompany = guess.company.t === round.company.t;
  const okTf = guess.tf === round.tf;
  const pts = (okCompany ? LEVEL[round.lvl].pts : 0) + (okTf ? TF_PTS : 0);
  game.score += pts;
  game.results.push({ round, okCompany, okTf, pts });

  $('hud-score').textContent = `${game.score} PTS`;
  $('guess-panel').style.display = 'none';

  const verdict = $('reveal-verdict');
  if (okCompany && okTf) { verdict.textContent = pick(['Absolutely nailed it.', 'The tape never lies.', 'Inside information?']); verdict.className = 'reveal-verdict good'; }
  else if (okCompany || okTf) { verdict.textContent = pick(['Half right. Half rekt.', 'Close, but the market is cruel.', 'Partial fill.']); verdict.className = 'reveal-verdict mid'; }
  else { verdict.textContent = pick(['Liquidated.', 'The chart says no.', 'Margin call.']); verdict.className = 'reveal-verdict bad'; }

  $('reveal-company').textContent = `${round.company.n} (${round.company.t})`;
  $('reveal-company-mark').textContent = okCompany ? '✓' : `✗ ${guess.company.t}`;
  $('reveal-company-mark').className = `rs-mark ${okCompany ? 'ok' : 'ko'}`;
  $('reveal-tf').textContent = tfLabel(round.tf, round.company);
  $('reveal-tf-mark').textContent = okTf ? '✓' : `✗ ${guess.tf}`;
  $('reveal-tf-mark').className = `rs-mark ${okTf ? 'ok' : 'ko'}`;
  $('reveal-points').textContent = `+${pts}`;
  $('reveal-panel').hidden = false;
  $('btn-next').textContent = game.idx === game.rounds.length - 1 ? 'SEE RESULTS →' : 'NEXT CHART →';
  $('btn-next').focus();
}

function tfLabel(tf, company) {
  const labels = { '1D': '1 day', '3D': '3 days', '1M': '1 month', '3M': '3 months', '1Y': '1 year', '5Y': '5 years' };
  return tf === 'ALL' ? `All time (since ${currentData?.since ?? '—'})` : labels[tf];
}

$('btn-next').addEventListener('click', () => {
  game.idx++;
  if (game.idx >= game.rounds.length) showResults();
  else loadRound();
});

/* ─────────── results ─────────── */
function showResults() {
  show('screen-results');
  const ratio = game.score / game.max;
  const grade =
    ratio >= 0.9 ? 'The Oracle of Omaha.' :
    ratio >= 0.7 ? 'Wolf of Wall Street.' :
    ratio >= 0.5 ? 'Portfolio manager.' :
    ratio >= 0.3 ? 'Day trader energy.' :
    ratio >= 0.12 ? 'Retail investor.' : 'Index funds. Please.';
  $('results-grade').textContent = grade;
  $('results-score').textContent = game.score;
  $('results-max').textContent = ` / ${game.max}`;
  $('results-list').innerHTML = game.results.map((r, i) => `
    <li style="animation-delay:${i * 60}ms">
      <span class="rl-num">${String(i + 1).padStart(2, '0')}</span>
      <span class="rl-name">${r.round.company.n}</span>
      <span class="rl-tf">${r.round.tf}</span>
      <span class="rl-marks"><span class="${r.okCompany ? 'ok' : 'ko'}">${r.okCompany ? '✓' : '✗'}</span> <span class="${r.okTf ? 'ok' : 'ko'}">${r.okTf ? '✓' : '✗'}</span></span>
      <span class="rl-pts ${r.pts ? '' : 'zero'}">+${r.pts}</span>
    </li>`).join('');
  $('share-feedback').innerHTML = '&nbsp;';
  prepareShare();
}

$('btn-again').addEventListener('click', () => show('screen-menu'));

/* ─────────── share ─────────── */
const SITE = 'stockguessr.fr';
let shareBlob = null;

function roundEmoji(r) {
  return r.okCompany && r.okTf ? '🟩' : (r.okCompany || r.okTf) ? '🟨' : '🟥';
}

function shareText() {
  const rows = [];
  for (let i = 0; i < game.results.length; i += 5)
    rows.push(game.results.slice(i, i + 5).map(roundEmoji).join(''));
  const grid = rows.join('\n');
  return `STOCKGUESSR · ${game.diff.label}\n${grid}\n${game.score}/${game.max} PTS — ${$('results-grade').textContent}\nhttps://${SITE}`;
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
  ctx.fillText(`— ${game.diff.label} —`, S / 2, 215);

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
    ctx.fillStyle = r.okCompany && r.okTf ? '#2dff8a' : (r.okCompany || r.okTf) ? '#ffc24b' : '#ff3b4f';
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
}

$('btn-share').addEventListener('click', async () => {
  const feedback = $('share-feedback');
  const text = shareText();
  const file = shareBlob && new File([shareBlob], 'stockguessr-score.png', { type: 'image/png' });
  try {
    if (file && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text });
      feedback.textContent = 'SHARED ✓';
      return;
    }
  } catch (e) {
    if (e.name === 'AbortError') return; // user closed the share sheet
  }
  // desktop fallback: text+link to clipboard, image as download
  try { await navigator.clipboard.writeText(text); } catch { /* clipboard blocked */ }
  if (shareBlob) {
    const a = document.createElement('a');
    a.href = $('share-img').src;
    a.download = 'stockguessr-score.png';
    a.click();
  }
  feedback.textContent = 'SCORE COPIED · IMAGE DOWNLOADED ✓';
});

window.addEventListener('resize', () => {
  if ($('screen-game').classList.contains('active') && currentData) {
    const round = game.rounds[game.idx];
    drawChart(currentData.series[round.tf], LEVEL[round.lvl].axis);
  }
});

boot();
