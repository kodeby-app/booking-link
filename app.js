// Booking Link: a booking page with no server. Your settings live in localStorage and in the link you share.

// ---------- helpers ----------

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function detectLang() {
  return (navigator.language || '').toLowerCase().match(/^(nb|nn|no)/) ? 'nb' : 'en';
}

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.textContent = msg;
  document.body.append(el);
  setTimeout(() => el.remove(), 2200);
}

async function copyText(text, okMsg, promptMsg) {
  try {
    await navigator.clipboard.writeText(text);
    toast(okMsg);
  } catch {
    prompt(promptMsg, text);
  }
}

function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

// Shared links carry their data in the #fragment, which browsers never send to a server.
function encodeHash(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeHash(str) {
  try {
    const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, ch => ch.charCodeAt(0))));
  } catch {
    return null;
  }
}

// ---------- texts ----------

const T = {
  en: {
    appName: 'Booking Link', tagline: 'Free. No sign-up. Nothing leaves your browser.',
    reset: 'Start over', open: 'Open booking page', copyLink: 'Copy booking link',
    aboutTitle: '1. About you', name: 'Your name', business: 'Business or title',
    email: 'Email that gets the requests', place: 'Where you meet', intro: 'A short welcome',
    typesTitle: '2. What people can book', typeName: 'Meeting type', minutes: 'Minutes', addType: '+ Add a meeting type',
    hoursTitle: '3. When you are available', tz: 'Your time zone', step: 'Start times every',
    notice: 'Earliest booking (hours ahead)', ahead: 'How far ahead (days)', to: 'to', closed: 'Closed',
    offTitle: '4. Days off', offHint: 'Holidays and days you are busy', addOff: 'Add day off', remove: 'Remove',
    how: 'Copy your booking link and put it on your website, in your email signature or on social media. Customers pick a time and send you the request by email. You confirm it yourself. Your settings are inside the link, so there is no account and no server.',
    previewLabel: 'Preview: this is what your customers see',
    privacy: 'Your settings stay in this browser and in the link you share. There is no server, no account and no tracking.',
    makeOwn: 'Make your own free booking page', madeBy: 'An example app by the Kodeby team.', source: 'Source code',
    copied: 'Booking link copied', copyPrompt: 'Copy your booking link:', copiedText: 'Copied',
    needEmail: 'Add the email that should get the requests first.',
    confirmReset: 'Start over with the example settings? Your current settings in this browser are replaced.',
    chooseType: 'What do you want to book?', chooseDay: 'Pick a day', chooseTime: 'Pick a time',
    noTimes: 'No free times in this period. Get in touch by email instead.',
    yourTz: 'Times are shown in your time zone ({tz}).',
    yourDetails: 'Your details', yourName: 'Your name', phone: 'Phone (optional)', message: 'Message (optional)',
    send: 'Send booking request', previewOnly: 'This is a preview. Customers send the request from your booking link.',
    sentTitle: 'Almost done', sentText: 'Your email app should now open with the request to {name}. Press send there to finish. {name} confirms the time by email.',
    noMailApp: 'Nothing opened? Copy the request and send it to {email}.', copyRequest: 'Copy request', addCal: 'Add to my calendar', back: 'Pick another time',
    reqSubject: 'Booking request: {type}, {when}',
    reqBody: 'Hi {owner},\n\nI would like to book {type} ({minutes} min).\n\nTime: {when} ({tz})\n{ownerWhen}\nName: {name}\nPhone: {phone}\n\n{message}\n\nSent from your booking page.',
    ownerWhen: 'Your time: {when} ({tz})\n', calTitle: '{type} with {owner} (requested)', minutesShort: '{n} min',
    needName: 'Please write your name.', badLink: 'This booking link is broken or incomplete. Ask the sender for a new one.',
    exName: 'Kari Nordmann', exBusiness: 'Freelance designer', exPlace: 'Video call, link sent by email',
    exIntro: 'Book a free intro call to talk about your project, or a full session when you are ready to start.',
    exType1: 'Free intro call', exType2: 'Design session',
  },
  nb: {
    appName: 'Bookinglenke', tagline: 'Gratis. Ingen konto. Ingenting forlater nettleseren.',
    reset: 'Start på nytt', open: 'Åpne bookingsiden', copyLink: 'Kopier bookinglenken',
    aboutTitle: '1. Om deg', name: 'Navnet ditt', business: 'Firma eller tittel',
    email: 'E-post som får forespørslene', place: 'Hvor dere møtes', intro: 'En kort velkomst',
    typesTitle: '2. Hva folk kan booke', typeName: 'Type møte', minutes: 'Minutter', addType: '+ Legg til en type møte',
    hoursTitle: '3. Når du er ledig', tz: 'Tidssonen din', step: 'Starttider hvert',
    notice: 'Tidligste booking (timer frem)', ahead: 'Hvor langt frem (dager)', to: 'til', closed: 'Stengt',
    offTitle: '4. Fridager', offHint: 'Ferie og dager du er opptatt', addOff: 'Legg til fridag', remove: 'Fjern',
    how: 'Kopier bookinglenken og legg den på nettsiden din, i e-postsignaturen eller i sosiale medier. Kundene velger en tid og sender deg forespørselen på e-post. Du bekrefter selv. Innstillingene ligger i lenken, så det er ingen konto og ingen server.',
    previewLabel: 'Forhåndsvisning: dette ser kundene dine',
    privacy: 'Innstillingene dine ligger i denne nettleseren og i lenken du deler. Det er ingen server, ingen konto og ingen sporing.',
    makeOwn: 'Lag din egen gratis bookingside', madeBy: 'En eksempelapp fra Kodeby-teamet.', source: 'Kildekode',
    copied: 'Bookinglenken er kopiert', copyPrompt: 'Kopier bookinglenken din:', copiedText: 'Kopiert',
    needEmail: 'Skriv inn e-posten som skal få forespørslene først.',
    confirmReset: 'Starte på nytt med eksempelinnstillingene? Innstillingene dine i denne nettleseren blir erstattet.',
    chooseType: 'Hva vil du booke?', chooseDay: 'Velg en dag', chooseTime: 'Velg et tidspunkt',
    noTimes: 'Ingen ledige tider i denne perioden. Ta kontakt på e-post i stedet.',
    yourTz: 'Tidene vises i din tidssone ({tz}).',
    yourDetails: 'Om deg', yourName: 'Navnet ditt', phone: 'Telefon (valgfritt)', message: 'Melding (valgfritt)',
    send: 'Send bookingforespørsel', previewOnly: 'Dette er en forhåndsvisning. Kundene sender forespørselen fra bookinglenken din.',
    sentTitle: 'Nesten ferdig', sentText: 'E-postappen din skal nå åpne seg med forespørselen til {name}. Trykk send der for å bli ferdig. {name} bekrefter tiden på e-post.',
    noMailApp: 'Åpnet ingenting seg? Kopier forespørselen og send den til {email}.', copyRequest: 'Kopier forespørselen', addCal: 'Legg i kalenderen min', back: 'Velg en annen tid',
    reqSubject: 'Bookingforespørsel: {type}, {when}',
    reqBody: 'Hei {owner},\n\nJeg vil gjerne booke {type} ({minutes} min).\n\nTid: {when} ({tz})\n{ownerWhen}\nNavn: {name}\nTelefon: {phone}\n\n{message}\n\nSendt fra bookingsiden din.',
    ownerWhen: 'Din tid: {when} ({tz})\n', calTitle: '{type} med {owner} (forespurt)', minutesShort: '{n} min',
    needName: 'Skriv navnet ditt.', badLink: 'Denne bookinglenken er ødelagt eller ufullstendig. Be avsenderen om en ny.',
    exName: 'Kari Nordmann', exBusiness: 'Frilans designer', exPlace: 'Videomøte, lenke sendes på e-post',
    exIntro: 'Book en gratis bli-kjent-samtale om prosjektet ditt, eller en hel økt når du er klar til å starte.',
    exType1: 'Gratis bli-kjent-samtale', exType2: 'Designøkt',
  },
};

const LOCALES = { en: 'en-GB', nb: 'nb-NO' };
const STORAGE_KEY = 'booking-link-v1';
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first

let lang = detectLang();

function t(key, vars) {
  let s = (T[lang] && T[lang][key]) ?? T.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}

// ---------- settings ----------

function localTz() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; }
}

function validTz(tz) {
  try { new Intl.DateTimeFormat('en', { timeZone: tz }); return true; } catch { return false; }
}

function freshConfig() {
  const days = {};
  for (let d = 0; d < 7; d++) days[d] = { on: d >= 1 && d <= 5, from: '09:00', to: '16:00' };
  return {
    v: 1,
    name: t('exName'), business: t('exBusiness'), email: '', place: t('exPlace'), intro: t('exIntro'),
    types: [{ id: uid(), name: t('exType1'), minutes: '20' }, { id: uid(), name: t('exType2'), minutes: '60' }],
    days, tz: localTz(), step: '30', notice: '24', ahead: '21', off: [],
  };
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function normalize(c) {
  if (!c || typeof c !== 'object' || c.v !== 1) return null;
  const out = freshConfig();
  for (const k of ['name', 'business', 'email', 'place', 'intro', 'step', 'notice', 'ahead']) {
    if (typeof c[k] === 'string') out[k] = c[k].slice(0, 400);
  }
  if (!['15', '30', '60'].includes(out.step)) out.step = '30';
  if (typeof c.tz === 'string' && validTz(c.tz)) out.tz = c.tz;
  if (Array.isArray(c.types)) {
    out.types = c.types.slice(0, 12).filter(x => x && typeof x === 'object').map(x => ({
      id: uid(), name: String(x.name ?? '').slice(0, 80), minutes: String(x.minutes ?? '').slice(0, 4),
    }));
  }
  if (c.days && typeof c.days === 'object') {
    for (let d = 0; d < 7; d++) {
      const x = c.days[d];
      if (!x) continue;
      out.days[d] = { on: !!x.on, from: TIME_RE.test(x.from) ? x.from : '09:00', to: TIME_RE.test(x.to) ? x.to : '16:00' };
    }
  }
  if (Array.isArray(c.off)) out.off = c.off.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x)).slice(0, 200).sort();
  return out;
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (raw && (raw.lang === 'en' || raw.lang === 'nb')) lang = raw.lang;
    return normalize(raw && raw.config);
  } catch {
    return null;
  }
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang, config: cfg })); } catch { /* storage blocked: still works for this visit */ }
}

function bookingLink() {
  const { types, ...rest } = cfg;
  return `${location.origin}${location.pathname}#b=${encodeHash({ ...rest, types: types.map(({ id, ...x }) => x) })}`;
}

// ---------- time zones ----------

const dtfCache = {};
function partsIn(ms, tz) {
  dtfCache[tz] ||= new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const g = {};
  for (const p of dtfCache[tz].formatToParts(new Date(ms))) g[p.type] = p.value;
  return { y: +g.year, m: +g.month - 1, d: +g.day, h: +g.hour % 24, mi: +g.minute, s: +g.second };
}

function offsetMs(ms, tz) {
  const p = partsIn(ms, tz);
  return Date.UTC(p.y, p.m, p.d, p.h, p.mi, p.s) - Math.floor(ms / 1000) * 1000;
}

// A wall-clock time in the owner's time zone, as a moment in time.
function zonedToMs(y, m, d, h, mi, tz) {
  const guess = Date.UTC(y, m, d, h, mi);
  const off = offsetMs(guess, tz);
  let ms = guess - off;
  const off2 = offsetMs(ms, tz);
  if (off2 !== off) ms = guess - off2;
  return ms;
}

function minutesOf(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function intIn(v, min, max, dflt) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : dflt;
}

function freeSlots(c, minutes) {
  const now = Date.now();
  const earliest = now + intIn(c.notice, 0, 2000, 24) * 3600e3;
  const ahead = intIn(c.ahead, 1, 180, 21);
  const step = intIn(c.step, 15, 60, 30);
  const today = partsIn(now, c.tz);
  const off = new Set(c.off);
  const slots = [];
  for (let i = 0; i <= ahead; i++) {
    const day = new Date(Date.UTC(today.y, today.m, today.d + i));
    const key = day.toISOString().slice(0, 10);
    const rule = c.days[day.getUTCDay()];
    if (!rule || !rule.on || off.has(key)) continue;
    const end = minutesOf(rule.to);
    for (let s = minutesOf(rule.from); s + minutes <= end; s += step) {
      const ms = zonedToMs(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), Math.floor(s / 60), s % 60, c.tz);
      if (ms >= earliest) slots.push(ms);
    }
  }
  return slots;
}

function localKey(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmt(ms, opts, tz) {
  return new Intl.DateTimeFormat(LOCALES[lang], { ...opts, ...(tz ? { timeZone: tz } : {}) }).format(new Date(ms));
}

function fmtWhen(ms, tz) {
  return fmt(ms, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }, tz);
}

// ---------- booking page (used for the preview and the public page) ----------

let cfg;
const pick = { type: '', day: '', slot: 0, done: false };

function typeMinutes(type) {
  return intIn(type.minutes, 5, 600, 30);
}

function renderBooking(root, c, preview) {
  const types = c.types.filter(x => x.name.trim());
  if (!types.find(x => x.id === pick.type)) { pick.type = types[0] ? types[0].id : ''; pick.day = ''; pick.slot = 0; }
  const type = types.find(x => x.id === pick.type);
  const slots = type ? freeSlots(c, typeMinutes(type)) : [];
  const byDay = new Map();
  for (const ms of slots) {
    const k = localKey(ms);
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k).push(ms);
  }
  if (!byDay.has(pick.day)) { pick.day = byDay.keys().next().value || ''; pick.slot = 0; }
  if (pick.slot && !slots.includes(pick.slot)) pick.slot = 0;
  const visitorTz = localTz();
  const initials = (c.name.trim() || '?').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

  let html = `
    <header class="bk-head">
      <div class="avatar" aria-hidden="true">${esc(initials)}</div>
      <div>
        <h1>${esc(c.name)}</h1>
        ${c.business ? `<p class="bk-business">${esc(c.business)}</p>` : ''}
      </div>
    </header>
    ${c.intro ? `<p class="bk-intro">${esc(c.intro)}</p>` : ''}
    ${c.place ? `<p class="bk-place"><span aria-hidden="true">📍</span> ${esc(c.place)}</p>` : ''}`;

  if (pick.done && pick.slot && type) {
    html += renderDone(c, type);
    root.innerHTML = html;
    return;
  }

  html += `<h2>${esc(t('chooseType'))}</h2><div class="types-pick">`;
  for (const x of types) {
    html += `<button type="button" class="type-btn ${x.id === pick.type ? 'on' : ''}" data-type="${x.id}">
      <strong>${esc(x.name)}</strong><span>${esc(t('minutesShort', { n: typeMinutes(x) }))}</span></button>`;
  }
  html += '</div>';

  if (!slots.length) {
    html += `<p class="empty">${esc(t('noTimes'))}</p>`;
    root.innerHTML = html;
    return;
  }

  html += `<div class="pick-grid"><div><h2>${esc(t('chooseDay'))}</h2>${renderMonth(byDay)}</div>`;
  html += `<div><h2>${esc(t('chooseTime'))}</h2>`;
  if (pick.day) {
    const [y, m, d] = pick.day.split('-').map(Number);
    html += `<p class="day-label">${esc(fmt(new Date(y, m - 1, d).getTime(), { weekday: 'long', day: 'numeric', month: 'long' }))}</p><div class="times">`;
    for (const ms of byDay.get(pick.day)) {
      html += `<button type="button" class="time-btn ${ms === pick.slot ? 'on' : ''}" data-slot="${ms}">${esc(fmt(ms, { hour: '2-digit', minute: '2-digit' }))}</button>`;
    }
    html += '</div>';
  }
  html += `<p class="tz-note">${esc(t('yourTz', { tz: visitorTz.replace(/_/g, ' ') }))}</p></div></div>`;

  if (pick.slot) {
    html += `
      <form class="details" data-details novalidate>
        <h2>${esc(t('yourDetails'))}</h2>
        <p class="chosen"><strong>${esc(type.name)}</strong> · ${esc(fmtWhen(pick.slot))}</p>
        <div class="grid">
          <label><span>${esc(t('yourName'))}</span><input name="vname" maxlength="80" autocomplete="name"></label>
          <label><span>${esc(t('phone'))}</span><input name="vphone" maxlength="40" autocomplete="tel" inputmode="tel"></label>
          <label class="wide"><span>${esc(t('message'))}</span><textarea name="vmsg" rows="2" maxlength="600"></textarea></label>
        </div>
        ${preview ? `<p class="hint">${esc(t('previewOnly'))}</p>` : ''}
        <button type="submit" class="primary send" ${preview ? 'disabled' : ''}>${esc(t('send'))}</button>
      </form>`;
  }
  const keep = root.querySelector('[data-details]');
  const values = keep ? Object.fromEntries(new FormData(keep)) : null;
  root.innerHTML = html;
  const form = root.querySelector('[data-details]');
  if (form && values) for (const [k, v] of Object.entries(values)) if (form.elements[k]) form.elements[k].value = v;
}

function renderMonth(byDay) {
  const keys = [...byDay.keys()];
  const first = new Date(keys[0] + 'T00:00');
  const last = new Date(keys[keys.length - 1] + 'T00:00');
  const start = new Date(first);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const todayKey = localKey(Date.now());
  let html = '<div class="month" role="grid">';
  for (let i = 0; i < 7; i++) {
    const d = new Date(2024, 0, 1 + i); // a Monday
    html += `<span class="dow">${esc(fmt(d.getTime(), { weekday: 'short' }))}</span>`;
  }
  for (const d = new Date(start); d <= last || d.getDay() !== 1; d.setDate(d.getDate() + 1)) {
    const k = localKey(d.getTime());
    const label = d.getDate() === 1 || k === localKey(start.getTime())
      ? `${d.getDate()}<small>${esc(fmt(d.getTime(), { month: 'short' }))}</small>` : `${d.getDate()}`;
    if (byDay.has(k)) {
      html += `<button type="button" class="day ${k === pick.day ? 'on' : ''}" data-day="${k}">${label}</button>`;
    } else {
      html += `<span class="day off ${k < todayKey ? 'past' : ''}">${label}</span>`;
    }
  }
  return html + '</div>';
}

function requestText(c, type, v) {
  const visitorTz = localTz();
  const when = fmtWhen(pick.slot);
  const ownerWhen = c.tz !== visitorTz ? t('ownerWhen', { when: fmtWhen(pick.slot, c.tz), tz: c.tz }) : '';
  return {
    subject: t('reqSubject', { type: type.name, when }),
    body: t('reqBody', {
      owner: c.name.split(' ')[0], type: type.name, minutes: typeMinutes(type), when, tz: visitorTz, ownerWhen,
      name: v.vname, phone: v.vphone || '–', message: v.vmsg || '',
    }).replace(/\n{3,}/g, '\n\n'),
  };
}

let lastRequest = null;

function renderDone(c, type) {
  return `
    <div class="done">
      <h2>${esc(t('sentTitle'))}</h2>
      <p class="chosen"><strong>${esc(type.name)}</strong> · ${esc(fmtWhen(pick.slot))}</p>
      <p>${esc(t('sentText', { name: c.name.split(' ')[0] }))}</p>
      <p class="hint">${esc(t('noMailApp', { email: c.email }))}</p>
      <div class="done-actions">
        <button type="button" data-act="copy-request">${esc(t('copyRequest'))}</button>
        <button type="button" data-act="ics">${esc(t('addCal'))}</button>
        <button type="button" class="ghost" data-act="back">${esc(t('back'))}</button>
      </div>
    </div>`;
}

function icsEscape(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
}

function icsDate(ms) {
  return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function icsFile(c, type) {
  const end = pick.slot + typeMinutes(type) * 60e3;
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Kodeby//Booking Link//EN', 'BEGIN:VEVENT',
    `UID:${uid()}${uid()}@book.kodeby.app`, `DTSTAMP:${icsDate(Date.now())}`,
    `DTSTART:${icsDate(pick.slot)}`, `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsEscape(t('calTitle', { type: type.name, owner: c.name }))}`,
    c.place ? `LOCATION:${icsEscape(c.place)}` : '', `DESCRIPTION:${icsEscape(c.email)}`,
    'STATUS:TENTATIVE', 'END:VEVENT', 'END:VCALENDAR', '',
  ].filter(x => x !== '').join('\r\n') + '\r\n';
}

function bindBooking(root, getCfg, preview) {
  root.addEventListener('click', e => {
    const c = getCfg();
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.type) { pick.type = b.dataset.type; pick.day = ''; pick.slot = 0; }
    else if (b.dataset.day) { pick.day = b.dataset.day; pick.slot = 0; }
    else if (b.dataset.slot) { pick.slot = Number(b.dataset.slot); }
    else if (b.dataset.act === 'back') { pick.done = false; pick.slot = 0; }
    else if (b.dataset.act === 'copy-request' && lastRequest) {
      copyText(`${c.email}\n${lastRequest.subject}\n\n${lastRequest.body}`, t('copiedText'), c.email);
      return;
    } else if (b.dataset.act === 'ics') {
      const type = c.types.find(x => x.id === pick.type);
      download('booking.ics', icsFile(c, type), 'text/calendar');
      return;
    } else return;
    renderBooking(root, c, preview);
    if (b.dataset.slot) root.querySelector('[data-details] input')?.focus();
  });
  root.addEventListener('submit', e => {
    e.preventDefault();
    if (preview) return;
    const c = getCfg();
    const v = Object.fromEntries(new FormData(e.target));
    if (!v.vname.trim()) { alert(t('needName')); e.target.elements.vname.focus(); return; }
    const type = c.types.find(x => x.id === pick.type);
    lastRequest = requestText(c, type, v);
    location.href = `mailto:${encodeURIComponent(c.email)}?subject=${encodeURIComponent(lastRequest.subject)}&body=${encodeURIComponent(lastRequest.body)}`;
    pick.done = true;
    renderBooking(root, c, preview);
  });
}

// ---------- editor ----------

function renderTypes() {
  $('#types').innerHTML = `<div class="type-row head" aria-hidden="true"><span>${esc(t('typeName'))}</span><span>${esc(t('minutes'))}</span><span></span></div>` +
    cfg.types.map(x => `
      <div class="type-row" data-id="${x.id}">
        <input data-field="name" value="${esc(x.name)}" maxlength="80" aria-label="${esc(t('typeName'))}">
        <input data-field="minutes" value="${esc(x.minutes)}" inputmode="numeric" maxlength="4" aria-label="${esc(t('minutes'))}">
        <button type="button" class="icon" data-remove title="${esc(t('remove'))}" aria-label="${esc(t('remove'))}">×</button>
      </div>`).join('');
}

function renderDays() {
  $('#days').innerHTML = DAY_ORDER.map(d => {
    const r = cfg.days[d];
    const name = fmt(new Date(2024, 0, d === 0 ? 7 : d).getTime(), { weekday: 'long' });
    return `
      <div class="day-row ${r.on ? '' : 'closed'}" data-day="${d}">
        <label class="inline"><input type="checkbox" data-field="on" ${r.on ? 'checked' : ''}> <span>${esc(name)}</span></label>
        <input type="time" data-field="from" value="${r.from}" step="900" aria-label="${esc(name)}" ${r.on ? '' : 'disabled'}>
        <span class="to">${esc(r.on ? t('to') : t('closed'))}</span>
        <input type="time" data-field="to" value="${r.to}" step="900" aria-label="${esc(name)}" ${r.on ? '' : 'disabled'}>
      </div>`;
  }).join('');
}

function renderOff() {
  $('#off').innerHTML = cfg.off.map(k => {
    const [y, m, d] = k.split('-').map(Number);
    return `<li>${esc(fmt(new Date(y, m - 1, d).getTime(), { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }))}
      <button type="button" class="icon" data-off="${k}" aria-label="${esc(t('remove'))}">×</button></li>`;
  }).join('');
}

function fillTz() {
  const sel = $('#tz');
  let zones = [];
  try { zones = Intl.supportedValuesOf('timeZone'); } catch { /* older browsers */ }
  if (!zones.includes(cfg.tz)) zones.unshift(cfg.tz);
  if (!zones.includes('UTC')) zones.push('UTC');
  sel.innerHTML = zones.map(z => `<option value="${esc(z)}">${esc(z.replace(/_/g, ' '))}</option>`).join('');
}

function fillForm() {
  $$('[data-bind]').forEach(el => { el.value = cfg[el.dataset.bind]; });
}

function applyLanguage() {
  document.documentElement.lang = lang;
  document.title = t('appName');
  $('#lang').value = lang;
  $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
}

function renderPreview() {
  renderBooking($('#preview'), cfg, true);
}

function renderOwner() {
  applyLanguage();
  fillForm();
  renderTypes();
  renderDays();
  renderOff();
  renderPreview();
}

function changed() {
  save();
  renderPreview();
}

function startOwner() {
  cfg = load() || freshConfig();
  fillTz();
  save();
  renderOwner();
  bindBooking($('#preview'), () => cfg, true);

  $('#editor').addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.bind) {
      cfg[el.dataset.bind] = el.value;
    } else if (el.closest('.type-row')) {
      const x = cfg.types.find(y => y.id === el.closest('.type-row').dataset.id);
      if (x) x[el.dataset.field] = el.value;
    } else if (el.closest('.day-row')) {
      const row = el.closest('.day-row');
      const r = cfg.days[row.dataset.day];
      if (el.dataset.field === 'on') { r.on = el.checked; renderDays(); }
      else if (TIME_RE.test(el.value)) r[el.dataset.field] = el.value;
    } else return;
    changed();
  });
  $('#editor').addEventListener('submit', e => e.preventDefault());
  $('#types').addEventListener('click', e => {
    const b = e.target.closest('[data-remove]');
    if (!b) return;
    cfg.types = cfg.types.filter(x => x.id !== b.closest('.type-row').dataset.id);
    renderTypes();
    changed();
  });
  $('#btn-add-type').addEventListener('click', () => {
    cfg.types.push({ id: uid(), name: '', minutes: '30' });
    renderTypes();
    changed();
    $$('#types .type-row input[data-field="name"]').pop().focus();
  });
  $('#btn-add-off').addEventListener('click', () => {
    const v = $('#off-date').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || cfg.off.includes(v)) return;
    cfg.off = [...cfg.off, v].sort();
    $('#off-date').value = '';
    renderOff();
    changed();
  });
  $('#off').addEventListener('click', e => {
    const b = e.target.closest('[data-off]');
    if (!b) return;
    cfg.off = cfg.off.filter(k => k !== b.dataset.off);
    renderOff();
    changed();
  });
  $('#btn-copy').addEventListener('click', () => {
    if (!cfg.email.includes('@')) { alert(t('needEmail')); $('[data-bind="email"]').focus(); return; }
    copyText(bookingLink(), t('copied'), t('copyPrompt'));
  });
  $('#btn-open').addEventListener('click', () => {
    if (!cfg.email.includes('@')) { alert(t('needEmail')); $('[data-bind="email"]').focus(); return; }
    window.open(bookingLink(), '_blank', 'noopener');
  });
  $('#btn-reset').addEventListener('click', () => {
    if (!confirm(t('confirmReset'))) return;
    cfg = freshConfig();
    save();
    renderOwner();
  });
  $('#lang').addEventListener('change', e => {
    lang = e.target.value === 'nb' ? 'nb' : 'en';
    save();
    renderOwner();
  });
}

// ---------- public booking page ----------

function startPublic(data) {
  document.body.classList.add('is-public');
  $('#setup').hidden = true;
  $('#public').hidden = false;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && (saved.lang === 'en' || saved.lang === 'nb')) lang = saved.lang;
  } catch { /* ignore */ }
  const c = normalize(data);
  const render = () => {
    applyLanguage();
    if (!c || !c.email.includes('@')) { $('#booking').innerHTML = `<p class="empty">${esc(t('badLink'))}</p>`; return; }
    document.title = `${c.name} · ${t('appName')}`;
    renderBooking($('#booking'), c, false);
  };
  render();
  if (c) bindBooking($('#booking'), () => c, false);
  $('#lang').addEventListener('change', e => {
    lang = e.target.value === 'nb' ? 'nb' : 'en';
    render();
  });
}

const m = location.hash.match(/^#b=([A-Za-z0-9_-]+)$/);
if (m) startPublic(decodeHash(m[1]));
else startOwner();
window.addEventListener('hashchange', () => location.reload());
