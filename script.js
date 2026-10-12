const ADSENSE_CLIENT = 'ca-pub-7174503033473057';
const GA_ID = 'G-YDGB4Z1HWK';
const SITE_URL = 'https://ethnicity-calculator.dankoresoft.com';
const STORAGE_KEY = 'ethnicity-calculator:v2';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const interactionCallbacks = [];

/* ---------- Shared helpers ---------- */

function onFirstInteraction(fn) {
  const events = ['scroll', 'pointerdown', 'pointermove', 'keydown', 'touchstart'];
  const run = () => {
    events.forEach(name => window.removeEventListener(name, run));
    fn();
  };
  events.forEach(name => window.addEventListener(name, run, { passive: true }));
}

// Ads, analytics, and decorative motion wait for the first interaction so they never delay the first paint.
function whenInteracted(fn) {
  interactionCallbacks.push(fn);
}

function loadScript(src, attrs = {}) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    Object.entries(attrs).forEach(([key, value]) => script.setAttribute(key, value));
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadAds() {
  window.adsbygoogle = window.adsbygoogle || [];
  loadScript(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`, {
    crossorigin: 'anonymous',
  }).catch(() => {});
  document.querySelectorAll('ins.adsbygoogle').forEach(() => window.adsbygoogle.push({}));
}

function loadAnalytics() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`).catch(() => {});
  loadScript('https://unpkg.com/web-vitals@4/dist/web-vitals.iife.js')
    .then(() => {
      const send = ({ name, delta, id }) =>
        window.gtag('event', name, {
          event_category: 'Web Vitals',
          event_label: id,
          value: Math.round(name === 'CLS' ? delta * 1000 : delta),
          non_interaction: true,
        });
      window.webVitals.onCLS(send);
      window.webVitals.onINP(send);
      window.webVitals.onLCP(send);
    })
    .catch(() => {});
}

function track(event, params) {
  if (typeof window.gtag === 'function') window.gtag('event', event, params);
}

/* ---------- Header, footer, reveal ---------- */

function setupTheme() {
  const buttons = document.querySelectorAll('.theme-switch button');
  const sync = () => {
    const current = document.documentElement.dataset.theme;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.theme === current)));
  };
  buttons.forEach(button =>
    button.addEventListener('click', () => {
      document.documentElement.dataset.theme = button.dataset.theme;
      localStorage.setItem('theme', button.dataset.theme);
      sync();
    }),
  );
  sync();
}

function setupMenu() {
  const header = document.getElementById('site-header');
  const button = document.getElementById('menu-btn');
  if (!header || !button) return;
  const setOpen = open => {
    header.classList.toggle('menu-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    button.querySelector('use')?.setAttribute('href', open ? '#i-x' : '#i-menu');
  };
  button.addEventListener('click', () => setOpen(!header.classList.contains('menu-open')));
  header.querySelectorAll('.site-nav a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setOpen(false);
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setOpen(false);
  });
  if (location.pathname.startsWith('/services')) {
    header.querySelector('[data-nav="services"]')?.setAttribute('aria-current', 'page');
  }
}

function setupFooterYear() {
  document.querySelectorAll('[data-year]').forEach(el => (el.textContent = String(new Date().getFullYear())));
}

function setupReveal() {
  if (reducedMotion || !('IntersectionObserver' in window)) return;
  const pending = [...document.querySelectorAll('.reveal')].filter(
    el => el.getBoundingClientRect().top > window.innerHeight,
  );
  if (!pending.length) return;
  const observer = new IntersectionObserver(
    entries =>
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('reveal-hidden');
        observer.unobserve(entry.target);
      }),
    { rootMargin: '0px 0px -8% 0px' },
  );
  pending.forEach(el => {
    el.classList.add('reveal-hidden');
    observer.observe(el);
  });
}

/* ---------- Heritage threads: mother and father strands woven into one ---------- */

const MOTHER = [242, 135, 107];
const FATHER = [41, 182, 246];
const MINT = [159, 240, 210];
const GOLD = [247, 201, 72];
const STILL_MS = 2600;

function rgba([r, g, b], a = 1) {
  return `rgba(${r},${g},${b},${a})`;
}

function mixRgb(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

function smoothstep(edge0, edge1, value) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function hash01(n) {
  let x = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

function setupThreads() {
  const canvases = document.querySelectorAll('canvas[data-threads]');
  if (!canvases.length) return;
  const loops = [...canvases].map(canvas => runCanvas(canvas, createThreadScene(canvas)));
  if (reducedMotion) return;
  whenInteracted(() => {
    document.querySelector('.knot')?.classList.add('is-live');
    loops.forEach(loop => loop && loop.enable());
  });
}

function runCanvas(canvas, scene) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  let width = 0;
  let height = 0;
  let frame = 0;
  let running = false;
  let enabled = false;
  let onScreen = false;

  const measure = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scene.measure(rect);
  };
  const tick = ms => {
    scene.draw(ctx, width, height, ms);
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    const go = enabled && onScreen && !document.hidden;
    if (go && !running) {
      running = true;
      frame = requestAnimationFrame(tick);
    } else if (!go && running) {
      running = false;
      cancelAnimationFrame(frame);
    }
  };

  measure();
  scene.draw(ctx, width, height, STILL_MS);
  new ResizeObserver(() => {
    measure();
    if (!running) scene.draw(ctx, width, height, STILL_MS);
  }).observe(canvas);
  new IntersectionObserver(
    entries => {
      onScreen = entries.some(entry => entry.isIntersecting);
      sync();
    },
    { rootMargin: '200px' },
  ).observe(canvas);
  document.addEventListener('visibilitychange', sync);

  return {
    enable() {
      enabled = true;
      sync();
    },
  };
}

function createThreadScene(canvas) {
  const kind = canvas.dataset.threads;
  if (kind === 'weave') return weaveScene(canvas);
  return braidScene(kind === 'braid-soft');
}

function weaveScene(canvas) {
  const PER_GROUP = 12;
  const COMETS = 7;
  const knot = canvas.parentElement.querySelector('.knot') || canvas.closest('.hero')?.querySelector('.knot');
  const frame = { w: 0, h: 0, gx: 0, gy: 0, t: 0 };

  const point = (g, i, u) => {
    const k = i / (PER_GROUP - 1);
    const out = (2 * i + g) / (2 * PER_GROUP - 1);
    const x = u * frame.w;
    const aperture = frame.h * 0.07;
    if (x <= frame.gx) {
      const pinch = smoothstep(0.02, 1, x / Math.max(1, frame.gx));
      const entry = g === 0 ? frame.h * (0.02 + 0.38 * k) : frame.h * (0.6 + 0.38 * k);
      const hk = hash01(g * 97 + i + 1);
      const jitter =
        frame.h * 0.035 * (1 - pinch) * Math.sin(u * Math.PI * (2 + 3 * hk) + frame.t * (0.6 + hk) + hk * 6.28);
      const target = frame.gy + (out - 0.5) * aperture;
      return { x, y: entry + (target - entry) * pinch + jitter };
    }
    const q = (x - frame.gx) / Math.max(1, frame.w - frame.gx);
    const open = smoothstep(0, 0.8, q);
    const spread = aperture + (frame.h * 0.24 - aperture) * open;
    const centre = frame.gy + frame.h * 0.05 * open * Math.sin(q * Math.PI * 2.2 - frame.t * 1.4);
    const braid = (g ? -1 : 1) * frame.h * 0.03 * open * Math.sin(q * Math.PI * 5 - frame.t * 2 + i * 0.35);
    return { x, y: centre + (out - 0.5) * spread + braid };
  };

  return {
    measure(rect) {
      frame.w = rect.width;
      frame.h = rect.height;
      if (knot) {
        const k = knot.getBoundingClientRect();
        frame.gx = k.left + k.width / 2 - rect.left;
        frame.gy = k.top + k.height / 2 - rect.top;
      } else {
        frame.gx = rect.width * 0.6;
        frame.gy = rect.height * 0.5;
      }
    },
    draw(ctx, w, h, ms) {
      ctx.clearRect(0, 0, w, h);
      if (w < 2 || h < 2) return;
      frame.t = ms / 1000;
      const gate = Math.min(0.95, Math.max(0.1, frame.gx / w));
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      [MOTHER, FATHER].forEach((color, g) => {
        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, rgba(color, 0.1));
        gradient.addColorStop(Math.max(0, gate - 0.25), rgba(color, 0.7));
        gradient.addColorStop(gate, rgba(mixRgb(color, MINT, 0.35), 0.95));
        gradient.addColorStop(1, rgba(mixRgb(color, MINT, 0.6), 0.35));
        ctx.strokeStyle = gradient;
        for (let i = 0; i < PER_GROUP; i++) {
          ctx.beginPath();
          for (let j = 0; j <= 64; j++) {
            const p = point(g, i, j / 64);
            if (j === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.globalAlpha = 0.45 + 0.4 * (0.5 + 0.5 * Math.cos((i / PER_GROUP) * Math.PI * 2 + frame.t * 2.2 + g));
          ctx.lineWidth = i % 4 === 0 ? 1.8 : 1.1;
          ctx.stroke();
        }
      });

      for (let c = 0; c < COMETS; c++) {
        const progress = ms * 0.6e-4 * (1 + (c % 3) * 0.35) + c * 0.37;
        const cycle = Math.floor(progress);
        const u = progress - cycle;
        const g = hash01(cycle * 17 + c * 5) < 0.5 ? 0 : 1;
        const lane = Math.floor(hash01(cycle * 131 + c * 977) * PER_GROUP);
        const parent = g ? FATHER : MOTHER;
        for (let s = 0; s < 14; s++) {
          const u0 = u - s * 0.012;
          const u1 = u - (s + 1) * 0.012;
          if (u1 < 0) break;
          const a = point(g, lane, u0);
          const b = point(g, lane, u1);
          const fall = 1 - s / 14;
          ctx.globalAlpha = fall * fall * 0.9;
          ctx.strokeStyle = rgba(a.x > frame.gx ? GOLD : mixRgb(parent, [255, 255, 255], 0.3));
          ctx.lineWidth = 0.6 + fall * 2.2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        const head = point(g, lane, u);
        const passed = head.x > frame.gx;
        const flare = passed ? Math.max(0, 1 - (head.x - frame.gx) / (w * 0.08)) : 0;
        ctx.globalAlpha = 1;
        ctx.fillStyle = rgba(passed ? mixRgb(GOLD, [255, 255, 255], 0.3) : mixRgb(parent, [255, 255, 255], 0.5));
        ctx.shadowColor = rgba(passed ? GOLD : parent, 0.9);
        ctx.shadowBlur = 8 + 14 * flare;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 1.8 + 2.4 * flare, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;
    },
  };
}

function braidScene(soft) {
  const groups = [MOTHER, FATHER, MINT];
  const STRANDS = soft ? 3 : 4;
  let cycles = 4;
  return {
    measure(rect) {
      cycles = Math.max(2, rect.width / (soft ? 380 : 240));
    },
    draw(ctx, w, h, ms) {
      ctx.clearRect(0, 0, w, h);
      if (w < 2 || h < 2) return;
      drawBraid(ctx, w, h, ms / 1000, { soft, groups, strands: STRANDS, cycles });
    },
  };
}

function drawBraid(ctx, w, h, t, { soft, groups, strands, cycles }) {
  const cy = soft ? h * 0.8 : h * 0.5;
  const amp = soft ? Math.min(h * 0.1, 46) : h * 0.26;
  const gap = soft ? 4 : 2.6;
  ctx.lineCap = 'round';
  groups.forEach((color, g) => {
    const phase = (g * Math.PI * 2) / groups.length;
    for (let s = 0; s < strands; s++) {
      ctx.beginPath();
      for (let j = 0; j <= 120; j++) {
        const u = j / 120;
        const y = cy + amp * Math.sin(u * Math.PI * 2 * cycles - t * 0.9 + phase) + (s - (strands - 1) / 2) * gap;
        if (j === 0) ctx.moveTo(u * w, y);
        else ctx.lineTo(u * w, y);
      }
      ctx.strokeStyle = rgba(color, soft ? 0.32 : 0.55);
      ctx.lineWidth = s === 0 ? 1.6 : 1;
      ctx.stroke();
    }
  });
  for (let c = 0; c < (soft ? 2 : 3); c++) {
    const u = (t * 0.045 + c / 3) % 1;
    const phase = (c * Math.PI * 2) / groups.length;
    const x = u * w;
    const y = cy + amp * Math.sin(u * Math.PI * 2 * cycles - t * 0.9 + phase);
    ctx.globalAlpha = 1;
    ctx.fillStyle = rgba(mixRgb(GOLD, [255, 255, 255], 0.3));
    ctx.shadowColor = rgba(GOLD, 0.9);
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(x, y, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;
}

/* ---------- Calculator ---------- */

const MODES = {
  parents: {
    weight: 0.5,
    people: [
      { id: 'mother', label: 'Mother', role: 'mother', avatar: '👩' },
      { id: 'father', label: 'Father', role: 'father', avatar: '👨' },
    ],
  },
  grandparents: {
    weight: 0.25,
    people: [
      { id: 'mm', label: "Mother's mother", role: 'mother', avatar: '👵' },
      { id: 'mf', label: "Mother's father", role: 'mother', avatar: '👴' },
      { id: 'fm', label: "Father's mother", role: 'father', avatar: '👵' },
      { id: 'ff', label: "Father's father", role: 'father', avatar: '👴' },
    ],
  },
};

const SAMPLES = {
  parents: [
    { label: 'Hausa & Fulani', data: { mother: [['Hausa', 50], ['Fulani', 50]], father: [['Fulani', 75], ['Kanuri', 25]] } },
    { label: 'Yoruba & Igbo', data: { mother: [['Yoruba', 100]], father: [['Igbo', 75], ['Ijaw', 25]] } },
    {
      label: 'Worked example',
      data: { mother: [['Hausa', 25], ['Igala', 25], ['Idoma', 50]], father: [['Fulani', 50], ['Hausa', 50]] },
    },
    { label: 'Irish & Italian', data: { mother: [['Irish', 50], ['German', 50]], father: [['Italian', 75], ['Irish', 25]] } },
  ],
  grandparents: [
    {
      label: 'Four tribes',
      data: { mm: [['Hausa', 100]], mf: [['Fulani', 100]], fm: [['Yoruba', 100]], ff: [['Igbo', 50], ['Edo', 50]] },
    },
    {
      label: 'Mixed American',
      data: {
        mm: [['Mexican', 100]],
        mf: [['Irish', 50], ['Scottish', 50]],
        fm: [['African American', 100]],
        ff: [['Jamaican', 75], ['Chinese', 25]],
      },
    },
  ],
};

const ETHNICITY_OPTIONS = [
  'Hausa', 'Fulani', 'Yoruba', 'Igbo', 'Ijaw', 'Kanuri', 'Tiv', 'Ibibio', 'Efik', 'Edo', 'Nupe', 'Igala', 'Idoma',
  'Urhobo', 'Itsekiri', 'Gwari', 'Jukun', 'Berom', 'Akan', 'Ashanti', 'Ewe', 'Ga', 'Wolof', 'Mandinka', 'Zulu',
  'Xhosa', 'Amhara', 'Oromo', 'Somali', 'Kikuyu', 'Luo', 'Arab', 'Berber', 'African American', 'Jamaican', 'Haitian',
  'English', 'Irish', 'Scottish', 'Welsh', 'German', 'French', 'Italian', 'Spanish', 'Portuguese', 'Polish', 'Dutch',
  'Greek', 'Ashkenazi Jewish', 'Turkish', 'Persian', 'Kurdish', 'Indian', 'Pakistani', 'Bengali', 'Punjabi', 'Chinese',
  'Japanese', 'Korean', 'Vietnamese', 'Filipino', 'Mexican', 'Puerto Rican', 'Cuban', 'Brazilian', 'Native American',
  'Cherokee', 'Navajo', 'Unknown',
];

const RESULT_COLORS = ['#00a37f', '#29b6f6', '#f2876b', '#f7c948', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b', '#84cc16'];
const DONUT_R = 80;
const DONUT_C = 2 * Math.PI * DONUT_R;

function setupCalculator() {
  const form = document.getElementById('calc-form');
  if (!form) return;

  const els = {
    form,
    people: document.getElementById('people'),
    template: document.getElementById('person-template'),
    samples: document.getElementById('samples'),
    modeButtons: document.querySelectorAll('[data-mode]'),
    badge: document.getElementById('result-badge'),
    donut: document.getElementById('donut'),
    donutValue: document.getElementById('donut-value'),
    donutLabel: document.getElementById('donut-label'),
    empty: document.getElementById('result-empty'),
    hint: document.getElementById('result-hint'),
    body: document.getElementById('result-body'),
    list: document.getElementById('result-list'),
    cardName: document.getElementById('card-name'),
    toast: document.getElementById('toast'),
    result: document.getElementById('result'),
  };

  const state = loadState();
  const requested = new URLSearchParams(location.search).get('mode');
  if (requested && MODES[requested]) state.mode = requested;
  let lastResultKey = '';
  let rowUid = 0;
  let saveTimer = 0;

  els.cardName.value = state.cardName || '';
  renderModeButtons();
  renderSamples();
  renderPeople();
  update(false);
  whenIdle(fillDatalist);

  els.modeButtons.forEach(button =>
    button.addEventListener('click', () => {
      if (state.mode === button.dataset.mode) return;
      state.mode = button.dataset.mode;
      const url = new URL(location.href);
      if (state.mode === 'parents') url.searchParams.delete('mode');
      else url.searchParams.set('mode', state.mode);
      history.replaceState(null, '', url);
      renderModeButtons();
      renderSamples();
      renderPeople();
      update(false);
      save();
    }),
  );

  els.samples.addEventListener('click', event => {
    const button = event.target.closest('button[data-sample]');
    if (!button) return;
    const sample = SAMPLES[state.mode][Number(button.dataset.sample)];
    state.data[state.mode] = Object.fromEntries(
      MODES[state.mode].people.map(p => [p.id, (sample.data[p.id] || []).map(([name, pct]) => ({ name, pct: String(pct) }))]),
    );
    renderPeople();
    update(true);
    save();
    track('sample_used', { sample: sample.label });
  });

  els.people.addEventListener('input', event => {
    const input = event.target.closest('[data-field]');
    if (!input) return;
    const { personId, index } = locate(input);
    personRows(personId)[index][input.dataset.field] = input.value;
    update(true);
    save();
  });

  els.people.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const card = button.closest('.person');
    const personId = card.dataset.person;
    const rows = personRows(personId);
    const action = button.dataset.action;
    let focusIndex = null;

    if (action === 'add') {
      rows.push({ name: '', pct: '' });
      focusIndex = rows.length - 1;
    } else if (action === 'remove') {
      const index = Number(button.closest('.row').dataset.index);
      if (rows.length > 1) rows.splice(index, 1);
      else rows[0] = { name: '', pct: '' };
      focusIndex = Math.min(index, rows.length - 1);
    } else if (action === 'unknown') {
      const remaining = round2(100 - totalOf(rows));
      if (remaining <= 0) return;
      const blank = rows.find(row => !row.name.trim() && !row.pct);
      if (blank) Object.assign(blank, { name: 'Unknown', pct: String(remaining) });
      else rows.push({ name: 'Unknown', pct: String(remaining) });
    }

    const person = MODES[state.mode].people.find(p => p.id === personId);
    const next = buildPerson(person);
    card.replaceWith(next);
    if (focusIndex !== null) next.querySelectorAll('.row')[focusIndex]?.querySelector('input')?.focus();
    update(true);
    save();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const status = update(true, true);
    if (status.valid) {
      if (window.innerWidth < 1024) els.result.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      launchConfetti();
      track('calculate', { mode: state.mode });
    } else {
      const firstBad = els.people.querySelector('[aria-invalid="true"]') || els.people.querySelector('.person.is-incomplete input');
      firstBad?.focus();
    }
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    state.data[state.mode] = emptyData(state.mode);
    renderPeople();
    update(false);
    save();
    els.people.querySelector('input')?.focus();
  });

  els.cardName.addEventListener('input', () => {
    state.cardName = els.cardName.value;
    save();
  });

  document.getElementById('share-btn').addEventListener('click', shareResult);
  document.getElementById('download-btn').addEventListener('click', downloadCard);

  function personRows(id) {
    const data = state.data[state.mode];
    if (!data[id] || !data[id].length) data[id] = [{ name: '', pct: '' }];
    return data[id];
  }

  function locate(input) {
    return {
      personId: input.closest('.person').dataset.person,
      index: Number(input.closest('.row').dataset.index),
    };
  }

  function renderModeButtons() {
    els.modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode)));
  }

  function renderSamples() {
    els.samples.replaceChildren(
      ...SAMPLES[state.mode].map((sample, i) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'chip';
        button.dataset.sample = String(i);
        button.textContent = sample.label;
        return button;
      }),
    );
  }

  function renderPeople() {
    els.people.replaceChildren(...MODES[state.mode].people.map(buildPerson));
  }

  function buildPerson(person) {
    const card = els.template.content.firstElementChild.cloneNode(true);
    card.dataset.role = person.role;
    card.dataset.person = person.id;
    card.querySelector('legend').textContent = person.label;
    card.querySelector('h3').textContent = person.label;
    card.querySelector('.person-avatar').textContent = person.avatar;
    const rowsEl = card.querySelector('.rows');
    personRows(person.id).forEach((row, index) => rowsEl.append(buildRow(person, row, index)));
    return card;
  }

  function buildRow(person, row, index) {
    const uid = ++rowUid;
    const el = document.createElement('div');
    el.className = 'row';
    el.dataset.index = String(index);

    const nameLabel = document.createElement('label');
    nameLabel.className = 'sr-only';
    nameLabel.htmlFor = `name-${uid}`;
    nameLabel.textContent = `${person.label}: ethnicity ${index + 1}`;
    const name = document.createElement('input');
    name.className = 'field';
    name.id = `name-${uid}`;
    name.type = 'text';
    name.autocomplete = 'off';
    name.placeholder = index === 0 ? 'e.g. Hausa' : 'Ethnicity';
    name.maxLength = 60;
    name.setAttribute('list', 'ethnicity-options');
    name.dataset.field = 'name';
    name.value = row.name;

    const pctWrap = document.createElement('div');
    pctWrap.className = 'pct-wrap';
    const pctLabel = document.createElement('label');
    pctLabel.className = 'sr-only';
    pctLabel.htmlFor = `pct-${uid}`;
    pctLabel.textContent = `${person.label}: percent for ethnicity ${index + 1}`;
    const pct = document.createElement('input');
    pct.className = 'field';
    pct.id = `pct-${uid}`;
    pct.type = 'number';
    pct.inputMode = 'decimal';
    pct.min = '0';
    pct.max = '100';
    pct.step = 'any';
    pct.placeholder = '0';
    pct.dataset.field = 'pct';
    pct.value = row.pct;
    pctWrap.append(pctLabel, pct);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'icon-btn';
    remove.dataset.action = 'remove';
    remove.setAttribute('aria-label', `Remove ethnicity ${index + 1} from ${person.label}`);
    remove.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-x"/></svg>';

    el.append(nameLabel, name, pctWrap, remove);
    return el;
  }

  function update(fromUser, showAllErrors = false) {
    let allValid = true;
    const needs = [];

    MODES[state.mode].people.forEach(person => {
      const card = els.people.querySelector(`[data-person="${person.id}"]`);
      const rows = personRows(person.id);
      const total = totalOf(rows);
      const full = Math.abs(total - 100) < 0.01;
      const over = total > 100.01;
      let error = '';

      card.querySelectorAll('.row').forEach(rowEl => {
        const row = rows[Number(rowEl.dataset.index)];
        const pct = parseFloat(row.pct);
        const nameInput = rowEl.querySelector('[data-field="name"]');
        const pctInput = rowEl.querySelector('[data-field="pct"]');
        const badPct = row.pct !== '' && (!Number.isFinite(pct) || pct <= 0 || pct > 100);
        const missingName = Number.isFinite(pct) && pct > 0 && !row.name.trim();
        pctInput.setAttribute('aria-invalid', String(badPct));
        nameInput.setAttribute('aria-invalid', String(missingName && (showAllErrors || row.pct.length > 0)));
        if (badPct) error = 'Percentages must be between 0 and 100.';
        else if (missingName) error = 'Add a name for each percentage.';
      });

      if (!error && over) error = `Over by ${fmt(total - 100)}%. Lower a percentage.`;
      if (!error && !full && showAllErrors) error = `Add ${fmt(100 - total)}% more to reach 100%.`;

      const pill = card.querySelector('.total-pill');
      pill.textContent = `${fmt(total)}%`;
      pill.classList.toggle('is-full', full && !error);
      pill.classList.toggle('is-over', over);
      card.querySelector('.meter').classList.toggle('is-over', over);
      card.querySelector('.meter span').style.width = `${Math.min(100, total)}%`;
      card.querySelector('[data-action="unknown"]').hidden = !(total > 0 && total < 100);
      card.querySelector('.person-error').textContent = error;
      const valid = full && !error;
      card.classList.toggle('is-incomplete', !valid);
      if (!valid) {
        allValid = false;
        needs.push(over ? `${person.label} is over 100%` : `${person.label} needs ${fmt(100 - total)}% more`);
      }
    });

    if (!allValid) {
      showEmpty(needs);
      lastResultKey = '';
      return { valid: false };
    }

    const entries = combine();
    const key = JSON.stringify(entries);
    if (key !== lastResultKey) {
      const firstTime = lastResultKey === '';
      lastResultKey = key;
      showResult(entries);
      if (fromUser && firstTime) launchConfetti();
    }
    return { valid: true, entries };
  }

  function combine() {
    const weight = MODES[state.mode].weight;
    const merged = new Map();
    MODES[state.mode].people.forEach(person => {
      personRows(person.id).forEach(row => {
        const pct = parseFloat(row.pct);
        const name = row.name.trim().replace(/\s+/g, ' ');
        if (!name || !Number.isFinite(pct) || pct <= 0) return;
        const key = name.toLowerCase();
        const current = merged.get(key) || { name, pct: 0 };
        current.pct += pct * weight;
        merged.set(key, current);
      });
    });
    return [...merged.values()].map(e => ({ name: e.name, pct: round2(e.pct) })).sort((a, b) => b.pct - a.pct);
  }

  function showEmpty(needs) {
    els.badge.textContent = 'Waiting';
    els.badge.classList.remove('is-ready');
    els.body.hidden = true;
    els.empty.hidden = false;
    els.hint.textContent = needs.length
      ? `${needs.join('. ')}.`
      : 'Fill in each person until they reach 100%, or try a sample above.';
    drawDonut([]);
    const ready = MODES[state.mode].people.length - needs.length;
    els.donutValue.textContent = `${ready}/${MODES[state.mode].people.length}`;
    els.donutLabel.textContent = 'people complete';
  }

  function showResult(entries) {
    els.badge.textContent = 'Ready';
    els.badge.classList.add('is-ready');
    els.empty.hidden = true;
    els.body.hidden = false;
    drawDonut(entries);
    els.donutValue.textContent = `${fmt(entries[0].pct)}%`;
    els.donutLabel.textContent = entries[0].name;
    els.list.replaceChildren(
      ...entries.map((entry, i) => {
        const li = document.createElement('li');
        li.className = 'result-item';
        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.style.background = colorAt(i);
        const name = document.createElement('span');
        name.className = 'name';
        name.textContent = entry.name;
        const pct = document.createElement('span');
        pct.className = 'pct';
        pct.textContent = `${fmt(entry.pct)}%`;
        const bar = document.createElement('span');
        bar.className = 'bar';
        const fill = document.createElement('span');
        fill.style.width = `${entry.pct}%`;
        fill.style.background = colorAt(i);
        bar.append(fill);
        li.append(dot, name, pct, bar);
        return li;
      }),
    );
  }

  function drawDonut(entries) {
    els.donut.querySelectorAll('.segment').forEach(el => el.remove());
    const gap = entries.length > 1 ? 2 : 0;
    let offset = 0;
    const segments = entries.map((entry, i) => {
      const length = (entry.pct / 100) * DONUT_C;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('class', 'segment');
      circle.setAttribute('cx', '100');
      circle.setAttribute('cy', '100');
      circle.setAttribute('r', String(DONUT_R));
      circle.style.stroke = colorAt(i);
      circle.style.strokeDasharray = `0 ${DONUT_C}`;
      circle.style.strokeDashoffset = String(-offset);
      circle.dataset.length = String(Math.max(0, length - gap));
      offset += length;
      els.donut.append(circle);
      return circle;
    });
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        segments.forEach(circle => (circle.style.strokeDasharray = `${circle.dataset.length} ${DONUT_C}`)),
      ),
    );
  }

  function resultText(entries) {
    const who = els.cardName.value.trim();
    const mix = entries.map(e => `${e.name} ${fmt(e.pct)}%`).join(', ');
    return `${who ? `${who}'s` : 'My'} ethnic mix: ${mix}. Calculate yours:`;
  }

  async function shareResult() {
    const status = update(false);
    if (!status.valid) return;
    const text = resultText(status.entries);
    try {
      if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ title: 'My ethnic mix', text, url: SITE_URL });
        track('share', { method: 'native' });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${SITE_URL}`);
      toast('Copied to your clipboard.');
      track('share', { method: 'clipboard' });
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      toast('Could not share. Try saving the image instead.');
    }
  }

  async function downloadCard() {
    const status = update(false);
    if (!status.valid) return;
    try {
      const name = els.cardName.value.trim();
      const blob = await renderCard(status.entries, name);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      link.href = url;
      link.download = `${slug || 'my'}-ethnic-mix.png`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast('Image saved.');
      track('download_card', { mode: state.mode });
    } catch {
      toast('Could not create the image. Please try again.');
    }
  }

  function toast(message) {
    els.toast.textContent = message;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => (els.toast.textContent = ''), 4000);
  }

  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Storage can be full or disabled; the calculator still works without it.
      }
    }, 250);
  }
}

function emptyData(mode) {
  return Object.fromEntries(
    MODES[mode].people.map(p => [p.id, [{ name: '', pct: '' }, { name: '', pct: '' }]]),
  );
}

function loadState() {
  const fresh = { mode: 'parents', cardName: '', data: { parents: emptyData('parents'), grandparents: emptyData('grandparents') } };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || !MODES[saved.mode] || typeof saved.data !== 'object') return fresh;
    Object.keys(MODES).forEach(mode => {
      MODES[mode].people.forEach(p => {
        const rows = saved.data?.[mode]?.[p.id];
        if (Array.isArray(rows) && rows.length) {
          fresh.data[mode][p.id] = rows.slice(0, 20).map(row => ({
            name: String(row?.name ?? '').slice(0, 60),
            pct: String(row?.pct ?? '').slice(0, 10),
          }));
        }
      });
    });
    fresh.mode = saved.mode;
    fresh.cardName = String(saved.cardName || '').slice(0, 40);
  } catch {
    // Ignore corrupt saved state and start fresh.
  }
  return fresh;
}

function totalOf(rows) {
  return round2(rows.reduce((sum, row) => {
    const pct = parseFloat(row.pct);
    return sum + (Number.isFinite(pct) && pct > 0 ? pct : 0);
  }, 0));
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function fmt(n) {
  return String(round2(n));
}

function colorAt(i) {
  return RESULT_COLORS[i % RESULT_COLORS.length];
}

function whenIdle(fn) {
  if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 3000 });
  else setTimeout(fn, 1200);
}

function fillDatalist() {
  const list = document.getElementById('ethnicity-options');
  if (!list) return;
  list.replaceChildren(
    ...ETHNICITY_OPTIONS.map(value => {
      const option = document.createElement('option');
      option.value = value;
      return option;
    }),
  );
}

let confettiReady;
function launchConfetti() {
  if (reducedMotion) return;
  confettiReady = confettiReady || loadScript('/vendor/confetti.min.js');
  confettiReady
    .then(() =>
      window.confetti({
        spread: 75,
        particleCount: 110,
        startVelocity: 32,
        origin: { y: 0.6 },
        colors: ['#00a37f', '#29b6f6', '#f2876b', '#f7c948', '#9ff0d2'],
      }),
    )
    .catch(() => {});
}

/* ---------- Shareable result card (1080x1350 PNG) ---------- */

async function renderCard(entries, name) {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const font = (weight, size) => `${weight} ${size}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#00574b');
  bg.addColorStop(0.6, '#003d34');
  bg.addColorStop(1, '#002a24');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  for (let x = 20; x < W; x += 30) for (let y = 20; y < H; y += 30) ctx.fillRect(x, y, 2, 2);

  ctx.save();
  ctx.translate(0, H - 210);
  drawBraid(ctx, W, 120, 3.2, { soft: false, groups: [MOTHER, FATHER, MINT], strands: 4, cycles: 3.5 });
  ctx.restore();

  const logo = await loadImage('/icons/android-icon-192x192.png').catch(() => null);
  roundRect(ctx, 72, 72, 104, 104, 28);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  if (logo) ctx.drawImage(logo, 84, 84, 80, 80);
  ctx.fillStyle = '#bfe9dc';
  ctx.font = font(800, 30);
  ctx.textBaseline = 'middle';
  ctx.fillText('ETHNICITY CALCULATOR', 204, 108);
  ctx.fillStyle = '#e3f4ee';
  ctx.font = font(500, 28);
  ctx.fillText('ethnicity-calculator.dankoresoft.com', 204, 146);

  const title = name ? `${name}'s ethnic mix` : 'My ethnic mix';
  let size = 76;
  ctx.font = font(850, size);
  while (ctx.measureText(title).width > W - 144 && size > 40) {
    size -= 4;
    ctx.font = font(850, size);
  }
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(title, 72, 290);

  const cx = 300;
  const cy = 590;
  const r = 170;
  ctx.lineWidth = 64;
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  let start = -Math.PI / 2;
  entries.forEach((entry, i) => {
    const sweep = (entry.pct / 100) * Math.PI * 2;
    ctx.strokeStyle = colorAt(i);
    ctx.beginPath();
    ctx.arc(cx, cy, r, start + (entries.length > 1 ? 0.012 : 0), start + sweep - (entries.length > 1 ? 0.012 : 0));
    ctx.stroke();
    start += sweep;
  });
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = font(850, 64);
  ctx.fillText(`${fmt(entries[0].pct)}%`, cx, cy + 8);
  ctx.fillStyle = '#d4ede5';
  ctx.font = font(700, 28);
  ctx.fillText(truncate(ctx, entries[0].name, 200), cx, cy + 52);
  ctx.textAlign = 'left';

  const listX = 540;
  const shown = entries.slice(0, 7);
  let y = 590 - (shown.length * 76) / 2 + 30;
  shown.forEach((entry, i) => {
    ctx.fillStyle = colorAt(i);
    roundRect(ctx, listX, y - 20, 20, 20, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = font(700, 32);
    ctx.fillText(truncate(ctx, entry.name, 300), listX + 36, y);
    ctx.font = font(850, 32);
    ctx.textAlign = 'right';
    ctx.fillText(`${fmt(entry.pct)}%`, W - 72, y);
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    roundRect(ctx, listX, y + 16, W - 72 - listX, 10, 5);
    ctx.fill();
    ctx.fillStyle = colorAt(i);
    roundRect(ctx, listX, y + 16, Math.max(10, ((W - 72 - listX) * entry.pct) / 100), 10, 5);
    ctx.fill();
    y += 76;
  });
  if (entries.length > shown.length) {
    ctx.fillStyle = '#d4ede5';
    ctx.font = font(600, 26);
    ctx.fillText(`+ ${entries.length - shown.length} more`, listX, y + 4);
  }

  ctx.fillStyle = '#e3f4ee';
  ctx.font = font(600, 30);
  ctx.fillText('Calculate yours free at ethnicity-calculator.dankoresoft.com', 72, H - 50);

  return new Promise((resolve, reject) => canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('empty'))), 'image/png'));
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function truncate(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && ctx.measureText(`${out}…`).width > maxWidth) out = out.slice(0, -1);
  return `${out}…`;
}

/* ---------- Start ---------- */

onFirstInteraction(() => interactionCallbacks.forEach(fn => fn()));
setupTheme();
setupMenu();
setupFooterYear();
setupReveal();
setupThreads();
setupCalculator();
whenInteracted(loadAds);
whenInteracted(loadAnalytics);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}
