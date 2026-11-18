'use strict';

/* ═════════ Helpers ═════════ */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2));
const store = {
  get(k, f) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const AGENTES_URL = 'https://sistemaamiapp-coder.github.io/agentesamiapp/';
const WA_TEMPLATES = [
  { label: 'Saudação', text: 'A paz do Senhor, {nome}! Aqui é da AMI. Estamos passando para saber como você está. Conte com a gente!' },
  { label: 'Aniversário', text: 'Feliz aniversário, {nome}! A família AMI celebra junto com você. Que Deus te abençoe muito!' },
  { label: 'Visita', text: 'A paz, {nome}! Foi uma alegria receber você na AMI. Que tal um café no próximo culto?' },
  { label: 'Quer servir', text: 'A paz, {nome}! Vimos seu interesse em servir na igreja. Acesse o app Agentes do Amor AMI e escolha onde você quer servir: ' + AGENTES_URL }
];
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const VERSES = [
  { t: 'Assim também nós, embora sejamos muitos, formamos um só corpo em Cristo, e cada um de nós está ligado a todos os outros.', r: 'Romanos 12:5' },
  { t: 'Porque onde estiverem dois ou três reunidos em meu nome, ali estou eu no meio deles.', r: 'Mateus 18:20' },
  { t: 'E tudo o que fizerem, façam de todo o coração, como para o Senhor, e não para os homens.', r: 'Colossenses 3:23' },
  { t: 'O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.', r: '1 Coríntios 13:4' },
  { t: 'Entrega o teu caminho ao Senhor; confia nele, e ele o fará.', r: 'Salmos 37:5' },
  { t: 'Posso tudo naquele que me fortalece.', r: 'Filipenses 4:13' },
  { t: 'Seja forte e corajoso! Não se apavore nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar.', r: 'Josué 1:9' },
  { t: 'Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês.', r: '1 Pedro 5:7' },
  { t: 'O Senhor é o meu pastor; nada me faltará.', r: 'Salmos 23:1' },
  { t: 'Busquem, pois, em primeiro lugar o Reino de Deus e a sua justiça, e todas essas coisas lhes serão acrescentadas.', r: 'Mateus 6:33' },
  { t: 'Deem graças em todas as circunstâncias, pois esta é a vontade de Deus para vocês em Cristo Jesus.', r: '1 Tessalonicenses 5:18' },
  { t: 'Porque eu bem sei os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.', r: 'Jeremias 29:11' },
  { t: 'Venham a mim, todos os que estão cansados e sobrecarregados, e eu lhes darei descanso.', r: 'Mateus 11:28' },
  { t: 'O Senhor mesmo irá adiante de vocês e estará com vocês; não os deixará nem os abandonará. Não tenham medo nem desanimem.', r: 'Deuteronômio 31:8' },
  { t: 'Alegrem-se sempre no Senhor. Novamente direi: alegrem-se!', r: 'Filipenses 4:4' },
  { t: 'Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus.', r: 'Filipenses 4:6' },
  { t: 'Ensina-nos a contar os nossos dias, para que o nosso coração seja sábio.', r: 'Salmos 90:12' },
  { t: 'Lâmpada para os meus pés é a tua palavra e luz para o meu caminho.', r: 'Salmos 119:105' },
  { t: 'Portanto, vão e façam discípulos de todas as nações, batizando-os em nome do Pai e do Filho e do Espírito Santo.', r: 'Mateus 28:19' },
  { t: 'Sirvam uns aos outros com amor, cada um utilizando o dom que recebeu para administrar a graça de Deus em suas múltiplas formas.', r: '1 Pedro 4:10' },
  { t: 'E não nos cansemos de fazer o bem, pois no tempo próprio colheremos, se não desanimarmos.', r: 'Gálatas 6:9' },
  { t: 'O meu mandamento é este: amem-se uns aos outros como eu os amei.', r: 'João 15:12' },
  { t: 'Ninguém tem maior amor do que este: de dar alguém a sua vida pelos seus amigos.', r: 'João 15:13' },
  { t: 'Dele, por ele e para ele são todas as coisas. A ele seja a glória para sempre! Amém.', r: 'Romanos 11:36' },
  { t: 'Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.', r: 'João 3:16' },
  { t: 'Mas os que esperam no Senhor renovarão as suas forças. Subirão com asas como águias; correrão e não se cansarão; caminharão e não se fatigarão.', r: 'Isaías 40:31' },
  { t: 'Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento.', r: 'Provérbios 3:5' },
  { t: 'Portanto, se alguém está em Cristo, é nova criação. As coisas antigas já passaram; eis que surgiram coisas novas!', r: '2 Coríntios 5:17' },
  { t: 'Aquietai-vos e sabei que eu sou Deus.', r: 'Salmos 46:10' },
  { t: 'Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai, a não ser por mim.', r: 'João 14:6' },
  { t: 'Portanto, agora já não há condenação para os que estão em Cristo Jesus.', r: 'Romanos 8:1' }
];
function verseOfDay() {
  const day = Math.floor(today().getTime() / 86400000);
  return VERSES[((day % VERSES.length) + VERSES.length) % VERSES.length];
}
let verseKey = null;
function renderVerse(force) {
  const key = today().toDateString();
  if (!force && key === verseKey) return;
  verseKey = key;
  const v = verseOfDay();
  const put = (sel, txt) => { const el = $(sel); if (el) el.textContent = txt; };
  put('#verse-text', `“${v.t}”`);
  put('#verse-ref', v.r);
  put('#verse-bar-text', v.t);
  put('#verse-bar-ref', v.r);
  const bar = $('#verse-bar');
  if (bar) { bar.classList.remove('verse-swap'); void bar.offsetWidth; bar.classList.add('verse-swap'); }
}

const UNITS = {
  pacheco:    { label: 'AMI Pacheco',    color: 'var(--pacheco)' },
  amendoeira: { label: 'AMI Amendoeira', color: 'var(--amendoeira)' }
};
const STATUS = {
  ativo:      { label: 'Ativo',          cls: 'badge-ativo' },
  integracao: { label: 'Em integração',  cls: 'badge-integracao' },
  visitante:  { label: 'Visitante',      cls: 'badge-visitante' }
};
const MINISTRIES = {
  louvor:      { label: 'Louvor',       color: '#FF3B52' },
  midia:       { label: 'Mídia',        color: '#3D8BFD' },
  recepcao:    { label: 'Recepção',     color: '#FFB020' },
  infantil:    { label: 'Infantil',     color: '#2ECC71' },
  intercessao: { label: 'Intercessão',  color: '#9B6BFF' },
  diaconia:    { label: 'Diaconia',     color: '#2BD9E8' },
  jovens:      { label: 'Jovens',       color: '#F04BD8' },
  nenhum:      { label: 'Sem ministério', color: '#B79A9A' }
};
const AV_COLORS = [
  ['#E8112D','#7A0918'], ['#FF7A1A','#8F3A00'], ['#3D8BFD','#123C8F'],
  ['#2ECC71','#0E6B3A'], ['#9B6BFF','#4A2396'], ['#F04BD8','#7C1170'],
  ['#2BD9E8','#0A6B78'], ['#FFB020','#8F5C00']
];

function parseDate(s) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function fmtDate(s) {
  const d = parseDate(s);
  return d ? `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}` : '—';
}
function today() { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); }
function nextBirthdayDays(birth) {
  const b = parseDate(birth);
  if (!b) return Infinity;
  const t = today();
  let next = new Date(t.getFullYear(), b.getMonth(), b.getDate());
  if (next < t) next = new Date(t.getFullYear() + 1, b.getMonth(), b.getDate());
  return Math.round((next - t) / 86400000);
}
function turningAge(birth) {
  const b = parseDate(birth);
  if (!b) return null;
  const t = today();
  let age = t.getFullYear() - b.getFullYear();
  if (new Date(t.getFullYear(), b.getMonth(), b.getDate()) < t) age++;
  return age;
}
function currentAge(birth) {
  const b = parseDate(birth);
  if (!b) return null;
  const t = today();
  let age = t.getFullYear() - b.getFullYear();
  if (new Date(t.getFullYear(), b.getMonth(), b.getDate()) > t) age--;
  return age;
}
function initials(name) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || '') + (p.length > 1 ? p[p.length-1][0] : '')).toUpperCase();
}
function avStyle(name) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const [a, b] = AV_COLORS[h % AV_COLORS.length];
  return `--av-a:${a};--av-b:${b}`;
}
function avatarHTML(name, cls = '') {
  return `<div class="avatar ${cls}" style="${avStyle(name)}">${esc(initials(name))}</div>`;
}
function unitLabel(u) { return u === 'all' ? 'Todas as unidades' : UNITS[u].label; }
function unitBadge(u) { return `<span class="badge-unit badge-${u}"><i class="dot dot-${u}"></i>${UNITS[u].label}</span>`; }
function statusBadge(s) { return `<span class="badge ${STATUS[s].cls}">${STATUS[s].label}</span>`; }
function minChip(m) { const mi = MINISTRIES[m] || MINISTRIES.nenhum; return `<span class="chip-min" style="--mc:${mi.color}">${mi.label}</span>`; }
function memberFlags(m, cls = '') {
  const out = [];
  if (m.peniel) out.push(`<span class="flag-chip peniel">${SVG_PENIEL} Peniel</span>`);
  if (m.wantsWork) out.push(`<span class="flag-chip servir">${SVG_HEART} Quer servir</span>`);
  return out.length ? `<span class="mini-flags ${cls}">${out.join('')}</span>` : '';
}

/* ═════════ Dados compartilhados (banco na nuvem) ═════════
   Login e cadastros ficam no servidor, então funcionam em qualquer aparelho
   e navegador. O navegador guarda apenas o cookie de sessão e preferências. */
function legacySnapshot(key) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
const LEGACY_MEMBERS = (() => { const v = legacySnapshot('ami.members'); return Array.isArray(v) && v.length ? v : null; })();
const LEGACY_USERS = (() => { const v = legacySnapshot('ami.users'); return Array.isArray(v) && v.length ? v : null; })();
const LEGACY_GERAL = (() => { const v = legacySnapshot('ami.geral'); return v && v.salt && v.hash ? v : null; })();

const API = {
  async call(path, body) {
    const res = await fetch('/functions/v1/app' + path, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: body === undefined ? { accept: 'application/json' } : { accept: 'application/json', 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    let data = null;
    try { data = await res.json(); } catch {}
    if (!res.ok) {
      const err = new Error((data && data.error) || 'request_failed');
      err.code = (data && data.error) || 'request_failed';
      err.status = res.status;
      throw err;
    }
    return data;
  }
};

let members = [];
const replaceMembers = list => { members = (Array.isArray(list) ? list : []).map(m => ({ ...m })); };

function saveFailed(err) {
  console.warn(err);
  toast('Não foi possível salvar na nuvem. Verifique a conexão e tente novamente.', { type: 'danger' });
}

async function syncMember(m) {
  try {
    await API.call('/api/members', { member: m });
    return true;
  } catch (err) { saveFailed(err); return false; }
}

async function refreshState(silent = false) {
  try {
    const data = await API.call('/api/state');
    applyState(data);
    renderAll();
    return true;
  } catch (err) {
    if (!silent) saveFailed(err);
    return false;
  }
}

/* ═════════ Criptografia local (SHA-256 puro, sem dependências) ═════════ */
function sha256Hex(input) {
  const rr = (v, a) => (v >>> a) | (v << (32 - a));
  const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const utf8 = new TextEncoder().encode(input);
  const bitLen = utf8.length * 8;
  const total = ((utf8.length + 1 + 8 + 63) >> 6) << 6;
  const bytes = new Uint8Array(total);
  bytes.set(utf8);
  bytes[utf8.length] = 0x80;
  const dv = new DataView(bytes.buffer);
  dv.setUint32(total - 8, Math.floor(bitLen / 0x100000000));
  dv.setUint32(total - 4, bitLen >>> 0);
  const w = new Uint32Array(64);
  for (let b = 0; b < total; b += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(b + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rr(w[i-15],7) ^ rr(w[i-15],18) ^ (w[i-15] >>> 3);
      const s1 = rr(w[i-2],17) ^ rr(w[i-2],19) ^ (w[i-2] >>> 10);
      w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0;
    }
    let a = H[0], b2 = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (let i = 0; i < 64; i++) {
      const S1 = rr(e,6) ^ rr(e,11) ^ rr(e,25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = rr(a,2) ^ rr(a,13) ^ rr(a,22);
      const maj = (a & b2) ^ (a & c) ^ (b2 & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b2; b2 = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b2) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
}
const hashPass = (salt, pass) => sha256Hex(`${salt}:${pass}`);

/* ═════════ Contas de acesso (compartilhadas na nuvem) ═════════ */
const GENERAL_ADMIN = { name: 'Werley Venceslau', email: 'werleyvenceslau17@gmail.com' };
const normEmail = e => String(e || '').trim().toLowerCase();
let users = [];
let geralCred = LEGACY_GERAL; // credencial antiga deste navegador, usada uma única vez na migração
function roleOf(email) {
  const e = normEmail(email);
  if (e === GENERAL_ADMIN.email) return 'geral';
  if (state.user && e === normEmail(state.user.email) && state.user.role) return state.user.role;
  const u = users.find(a => a.email === e);
  return u ? u.role : null;
}
const isGeneral = () => !!state.user && roleOf(state.user.email) === 'geral';
const canManageUsers = () => !!state.user && (isGeneral() || roleOf(state.user.email) === 'admin');
const ALL_UNITS = Object.keys(UNITS);

function userUnits(email) {
  const e = normEmail(email);
  if (!e) return [];
  if (e === GENERAL_ADMIN.email) return [...ALL_UNITS];
  if (state.user && e === normEmail(state.user.email) && Array.isArray(state.user.units)) {
    return state.user.units.filter(x => ALL_UNITS.includes(x));
  }
  const u = users.find(a => a.email === e);
  if (!u) return [];
  if (u.role === 'geral') return [...ALL_UNITS];
  return Array.isArray(u.units) ? u.units.filter(x => ALL_UNITS.includes(x)) : [...ALL_UNITS];
}
function myUnits() { return state.user ? userUnits(state.user.email) : [...ALL_UNITS]; }
function clampUnit() {
  const allowed = myUnits();
  if (!allowed.length) return;
  if (state.unit === 'all' && allowed.length === 1) state.unit = allowed[0];
  else if (state.unit !== 'all' && !allowed.includes(state.unit)) state.unit = allowed.length === 1 ? allowed[0] : 'all';
}

const state = {
  user: null,
  unit: 'all',
  view: 'dashboard',
  search: '', status: 'todos', ministry: 'todos', sort: 'name',
  bmonth: new Date().getMonth(),
  waSearch: '', waMsg: '',
  selected: new Set(),
  savedViews: store.get('ami.savedViews', [])
};

function unitMembers() {
  const allowed = myUnits();
  const base = members.filter(m => allowed.includes(m.unit));
  return state.unit === 'all' ? base : base.filter(m => m.unit === state.unit);
}
function allowedMembers() { const allowed = myUnits(); return members.filter(m => allowed.includes(m.unit)); }
function waNumber(phone) {
  let d = String(phone || '').replace(/\D/g, '').replace(/^0+/, '');
  if (!d) return '';
  if (d.length === 10 || d.length === 11) return '55' + d;
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) return d;
  if (d.length >= 12 && d.length <= 15) return d;
  return '';
}

function birthdayEntries() {
  return unitMembers()
    .filter(m => m.birth)
    .map(m => ({ m, name: m.name, birth: m.birth }));
}

function filteredMembers() {
  let list = unitMembers();
  const q = state.search.trim().toLowerCase();
  if (q) list = list.filter(m =>
    m.name.toLowerCase().includes(q) ||
    (m.email || '').toLowerCase().includes(q) ||
    (m.phone || '').toLowerCase().includes(q) ||
    (m.address || '').toLowerCase().includes(q)
  );
  if (state.status !== 'todos') list = list.filter(m => m.status === state.status);
  if (state.ministry !== 'todos') list = list.filter(m => m.ministry === state.ministry);
  const sorters = {
    name: (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
    recent: (a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''),
    joined: (a, b) => (b.joined || '').localeCompare(a.joined || ''),
    birthday: (a, b) => nextBirthdayDays(a.birth) - nextBirthdayDays(b.birth)
  };
  return [...list].sort(sorters[state.sort] || sorters.name);
}

/* ═════════ Toasts ═════════ */
const ICONS = {
  success: '<svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>',
  danger: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
  info: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
};
function toast(msg, { type = 'success', undo = null } = {}) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.style.setProperty('--tc', type === 'danger' ? 'var(--danger)' : type === 'info' ? 'var(--info)' : 'var(--success)');
  el.innerHTML = `${ICONS[type] || ICONS.success}<span>${esc(msg)}</span>${undo ? '<button class="toast-undo" type="button">Desfazer</button>' : ''}<button class="toast-x" type="button" aria-label="Fechar">✕</button>`;
  $('#toasts').appendChild(el);
  let done = false;
  const dismiss = () => { if (done) return; done = true; el.classList.add('out'); setTimeout(() => el.remove(), 260); };
  const timer = setTimeout(dismiss, undo ? 7000 : 4200);
  el.querySelector('.toast-x').addEventListener('click', () => { clearTimeout(timer); dismiss(); });
  if (undo) el.querySelector('.toast-undo').addEventListener('click', () => { clearTimeout(timer); dismiss(); undo(); });
}

/* ═════════ Autenticação (e-mail e senha próprios) ═════════ */
function spawnEmbers() {
  const zone = $('.login-embers');
  for (let i = 0; i < 18; i++) {
    const e = document.createElement('span');
    e.className = 'ember';
    const size = 3 + Math.random() * 6;
    e.style.cssText = `left:${Math.random()*100}%;width:${size}px;height:${size}px;--sway:${(Math.random()*120-60).toFixed(0)}px;animation-duration:${(7+Math.random()*9).toFixed(1)}s;animation-delay:${(Math.random()*10).toFixed(1)}s`;
    zone.appendChild(e);
  }
}

function showLoginError(msg) {
  const el = $('#login-error');
  el.textContent = msg;
  el.hidden = false;
}

let loginSetup = false;
function setLoginSetup(on) {
  loginSetup = on;
  $('#login-pass2-row').hidden = !on;
  $('#btn-login').querySelector('span').textContent = on ? 'Criar senha e entrar' : 'Entrar';
  $('#login-note').textContent = on
    ? 'Primeiro acesso: crie a senha do administrador geral. Guarde-a com cuidado.'
    : 'Acesso restrito. Sua conta funciona em qualquer aparelho: entre com o seu e-mail e a sua senha.';
}

function applyState(data) {
  state.user = {
    id: data.user.id,
    name: data.user.name,
    email: normEmail(data.user.email),
    role: data.user.role,
    units: Array.isArray(data.user.units) ? [...data.user.units] : []
  };
  users = (Array.isArray(data.users) ? data.users : []).map(u => ({ ...u }));
  replaceMembers(data.members);
  clampUnit();
}

async function afterLogin(data) {
  applyState(data);
  store.set('ami.lastEmail', state.user.email);
  await migrateLegacyData(data);
  showApp();
  toast(`A paz, ${state.user.name.split(' ')[0]}! Bem-vindo(a) ao AMI Integração.`);
}

// Envia uma única vez os cadastros que só existiam neste navegador.
async function migrateLegacyData(data) {
  if (localStorage.getItem('ami.migrated') === '1') return;
  if (state.user.role !== 'geral') return;
  if (!LEGACY_MEMBERS && !LEGACY_USERS && !LEGACY_GERAL) { localStorage.setItem('ami.migrated', '1'); return; }
  if (Array.isArray(data.members) && data.members.length) { localStorage.setItem('ami.migrated', '1'); return; }
  try {
    const result = await API.call('/api/import', {
      members: LEGACY_MEMBERS || [],
      users: LEGACY_USERS || [],
      geral: LEGACY_GERAL
    });
    localStorage.setItem('ami.migrated', '1');
    applyState(await API.call('/api/state'));
    if (result.members || result.users) {
      toast(`Dados deste aparelho enviados para a nuvem: ${result.members} membro(s) e ${result.users} acesso(s).`, { type: 'info' });
    }
  } catch (err) {
    console.warn(err);
    toast('Os cadastros deste aparelho ainda não foram enviados para a nuvem. Tentaremos de novo no próximo acesso.', { type: 'danger' });
  }
}

function showApp() {
  $('#login-screen').hidden = true;
  $('#app').hidden = false;
  $('#user-name').textContent = state.user.name;
  $('#user-email').textContent = state.user.email;
  const role = roleOf(state.user.email);
  const roleEl = $('#user-role');
  roleEl.textContent = role === 'geral' ? 'Administrador geral' : role === 'admin' ? 'Administrador' : 'Usuário';
  roleEl.className = 'role-tag ' + (role === 'geral' ? 'role-geral' : role === 'admin' ? 'role-admin' : 'role-user');
  const av = $('#user-avatar');
  av.textContent = initials(state.user.name);
  av.setAttribute('style', avStyle(state.user.name));
  renderAll();
}
async function signOut() {
  try { await API.call('/api/logout', {}); } catch (err) { console.warn(err); }
  state.user = null;
  users = [];
  replaceMembers([]);
  loginSetup = false;
  setLoginSetup(false);
  state.selected.clear();
  closeDrawer(); closeForm();
  $('#login-error').hidden = true;
  $('#login-pass').value = '';
  $('#login-pass2').value = '';
  $('#app').hidden = true;
  $('#login-screen').hidden = false;
  const last = store.get('ami.lastEmail', '');
  if (last) $('#login-email').value = last;
  setTimeout(() => $('#login-email').focus(), 60);
}

/* ═════════ Render: geral ═════════ */
function renderAll() {
  const manage = canManageUsers();
  clampUnit();
  const allowed = myUnits();
  $('#nav-admins').hidden = !manage;
  $('#nav-admin-count').textContent = users.length + 1;
  if (state.view === 'admins' && !manage) state.view = 'dashboard';
  $$('.side-link').forEach(b => b.classList.toggle('active', b.dataset.nav === state.view));
  $$('.unit-btn').forEach(b => {
    const key = b.dataset.unit;
    b.hidden = key === 'all' ? allowed.length < 2 : !allowed.includes(key);
    b.classList.toggle('active', key === state.unit);
  });
  $('#nav-count').textContent = unitMembers().length;
  $('#view-dashboard').hidden = state.view !== 'dashboard';
  $('#view-members').hidden = state.view !== 'members';
  $('#view-birthdays').hidden = state.view !== 'birthdays';
  $('#view-whatsapp').hidden = state.view !== 'whatsapp';
  $('#view-admins').hidden = state.view !== 'admins';
  if (state.view === 'dashboard') renderDashboard();
  else if (state.view === 'members') renderMembers();
  else if (state.view === 'birthdays') renderBirthdays();
  else if (state.view === 'whatsapp') renderWhatsapp();
  else renderUsers();
}

/* ═════════ Render: painel ═════════ */
function renderDashboard() {
  const list = unitMembers();
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const ativos = list.filter(m => m.status === 'ativo').length;
  const integracao = list.filter(m => m.status === 'integracao').length;
  const novos = list.filter(m => (m.joined || '').startsWith(ym)).length;
  const bdayMonth = birthdayEntries().filter(e => parseDate(e.birth).getMonth() === now.getMonth()).length;

  const minCounts = Object.keys(MINISTRIES)
    .map(k => ({ k, n: list.filter(m => m.ministry === k).length }))
    .filter(x => x.n > 0).sort((a, b) => b.n - a.n);
  const maxMin = Math.max(1, ...minCounts.map(x => x.n));

  const upcoming = birthdayEntries().sort((a, b) => nextBirthdayDays(a.birth) - nextBirthdayDays(b.birth)).slice(0, 5);
  const recent = [...list].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5);
  const ativosList = list.filter(m => m.status === 'ativo');
  const penielCount = ativosList.filter(m => m.peniel).length;
  const servirList = ativosList.filter(m => m.wantsWork);

  const statCard = (label, value, color, icon, foot) => `
    <div class="stat" style="--sc:${color}">
      <div class="stat-label">${icon}${label}</div>
      <div class="stat-value" data-count="${value}">0</div>
      <div class="stat-foot">${foot}</div>
    </div>`;

  $('#view-dashboard').innerHTML = `
    <div class="hero">
      <div class="hero-inner">
        <div class="hero-hello">A paz, ${esc(state.user.name.split(' ')[0])}!</div>
        <div class="hero-title">JUNTOS POR UM SERVIR <span style="color:var(--red-hot)">AINDA MAIS FORTE</span></div>
        <div class="hero-sub">${esc(unitLabel(state.unit))} &nbsp•&nbsp; <b>${list.length}</b> membros cadastrados &nbsp•&nbsp; <b>${bdayMonth}</b> aniversariantes em ${MONTHS[now.getMonth()]}</div>
      </div>
    </div>
    <div class="stats">
      ${statCard('Total de membros', list.length, 'var(--red-hot)', '<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>', `em <b>${esc(unitLabel(state.unit).toLowerCase())}</b>`)}
      ${statCard('Membros ativos', ativos, 'var(--success)', '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>', 'servindo e congregando')}
      ${statCard('Em integração', integracao, 'var(--warning)', '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>', 'no curso de novos membros')}
      ${statCard('Novos em ' + MONTHS_SHORT[now.getMonth()], novos, 'var(--info)', '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>', 'chegaram este mês')}
    </div>
    <div class="dash-grid">
      <div class="panel">
        <div class="panel-title">
          <svg viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.3-6.2-4.5-6.2 4.5 2.4-7.3L2 9.4h7.6z"/></svg>
          Ministérios em movimento
        </div>
        ${minCounts.length ? minCounts.map(x => `
          <div class="min-bar-row">
            <span class="min-bar-label">${MINISTRIES[x.k].label}</span>
            <div class="min-bar-track"><div class="min-bar-fill" style="--mc:${MINISTRIES[x.k].color}" data-w="${(x.n / maxMin * 100).toFixed(1)}"></div></div>
            <span class="min-bar-num">${x.n}</span>
          </div>`).join('') : '<p class="empty-note">Nenhum membro nesta unidade ainda.</p>'}
        <div class="unit-split">
          ${myUnits().map(u => {
            const n = members.filter(m => m.unit === u).length;
            const a = members.filter(m => m.unit === u && m.status === 'ativo').length;
            return `<div class="unit-card" style="--uc:${UNITS[u].color}">
              <b><i class="dot dot-${u}"></i>${UNITS[u].label}</b>
              <div class="unit-num">${n}</div>
              <span>${a} ativos · ${n - a} em caminhada</span>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
        <div class="panel">
          <div class="panel-title">
            <svg viewBox="0 0 24 24"><path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm6 3h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v9h18v-9c0-1.66-1.34-3-3-3z"/></svg>
            Próximos aniversários
            <button class="panel-link" data-goto="birthdays" type="button">ver todos →</button>
          </div>
          <div class="mini-list">
            ${upcoming.length ? upcoming.map(e => {
              const d = nextBirthdayDays(e.birth);
              const b = parseDate(e.birth);
              return `<div class="mini-row" data-open="${e.m.id}">
                ${avatarHTML(e.name, 'avatar-sm')}
                <div class="mini-info"><b><span class="mi-name">${esc(e.name)}</span></b><span>${UNITS[e.m.unit].label} · ${b.getDate()} de ${MONTHS[b.getMonth()]}</span></div>
                <div class="mini-side">${d === 0 ? '<span class="bday-today">🎉 hoje!</span>' : d === 1 ? 'amanhã' : `em ${d} dias`}</div>
              </div>`;
            }).join('') : '<p class="empty-note">Cadastre datas de nascimento para acompanhar.</p>'}
          </div>
        </div>
        <div class="panel">
          <div class="panel-title">
            <svg viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
            Chegadas recentes
            <button class="panel-link" data-goto="members" type="button">ver membros →</button>
          </div>
          <div class="mini-list">
            ${recent.map(m => `<div class="mini-row" data-open="${m.id}">
              ${avatarHTML(m.name, 'avatar-sm')}
              <div class="mini-info"><b>${esc(m.name)}</b><span>${UNITS[m.unit].label} · entrou em ${fmtDate(m.joined)}</span></div>
              <div class="mini-side">${statusBadge(m.status)}</div>
            </div>`).join('')}
          </div>
        </div>
        <div class="panel peniel-panel">
          <div class="panel-title">
            <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            Peniel &amp; servir
            <button class="panel-link" data-goto="members" type="button">ver membros →</button>
          </div>
          <div class="stat-mini">
            <div class="peniel-num"><b>${penielCount}</b><span>ativos fizeram o Peniel</span></div>
            <div class="peniel-num"><b>${servirList.length}</b><span>ativos querem servir</span></div>
          </div>
          <div class="peniel-list">
            ${servirList.slice(0, 4).map(m => `<div class="peniel-row" data-open="${m.id}">
              ${avatarHTML(m.name, 'avatar-sm')}
              <div class="mini-info"><b>${esc(m.name)}</b><span>${UNITS[m.unit].label}</span></div>
              <span class="flag-chip servir">${SVG_HEART} Quer servir</span>
            </div>`).join('') || '<p class="empty-note">Marque no membro “Quer trabalhar na igreja” para acompanhar aqui.</p>'}
          </div>
          <a class="btn btn-primary peniel-cta" href="${AGENTES_URL}" target="_blank" rel="noopener">Abrir Agentes do Amor AMI</a>
        </div>
      </div>
    </div>`;

  $$('#view-dashboard .min-bar-fill').forEach(el => {
    const apply = () => { el.style.width = el.dataset.w + '%'; };
    requestAnimationFrame(apply);
    setTimeout(apply, 150);
  });
  $$('#view-dashboard .stat-value').forEach(el => {
    const target = +el.dataset.count;
    const t0 = performance.now();
    const tick = t => {
      const p = Math.min(1, (t - t0) / 650);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    setTimeout(() => { el.textContent = target; }, 800);
  });
}

/* ═════════ Render: membros ═════════ */
function renderMembers() {
  const minOptions = Object.entries(MINISTRIES).map(([k, v]) => `<option value="${k}" ${state.ministry === k ? 'selected' : ''}>${v.label}</option>`).join('');
  $('#view-members').innerHTML = `
    <div class="view-head">
      <h1 class="view-title">MEMBROS <span class="hl">· ${esc(unitLabel(state.unit).toUpperCase())}</span>
        <small>Cadastre, acompanhe e cuide de cada pessoa que Deus trouxe.</small>
      </h1>
      <button class="btn btn-ghost" data-action="export" type="button" title="Baixar planilha Excel formatada (.xlsx)">
        <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
        Exportar Excel
      </button>
    </div>
    <div class="toolbar">
      <div class="search-box ${state.search ? 'has-value' : ''}">
        <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input id="member-search" type="search" placeholder="Buscar nome, telefone, e-mail ou endereço…" value="${esc(state.search)}" autocomplete="off">
        <button class="search-clear" data-action="clear-search" type="button" aria-label="Limpar busca">✕</button>
      </div>
      <div class="select-wrap">
        <select id="filter-status" aria-label="Filtrar por status">
          <option value="todos" ${state.status === 'todos' ? 'selected' : ''}>Todos os status</option>
          ${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${state.status === k ? 'selected' : ''}>${v.label}</option>`).join('')}
        </select>
      </div>
      <div class="select-wrap">
        <select id="filter-ministry" aria-label="Filtrar por ministério">
          <option value="todos" ${state.ministry === 'todos' ? 'selected' : ''}>Todos os ministérios</option>
          ${minOptions}
        </select>
      </div>
      <div class="select-wrap">
        <select id="sort-by" aria-label="Ordenar">
          <option value="name" ${state.sort === 'name' ? 'selected' : ''}>Nome (A–Z)</option>
          <option value="recent" ${state.sort === 'recent' ? 'selected' : ''}>Cadastro recente</option>
          <option value="joined" ${state.sort === 'joined' ? 'selected' : ''}>Entrada recente</option>
          <option value="birthday" ${state.sort === 'birthday' ? 'selected' : ''}>Próximo aniversário</option>
        </select>
      </div>
      <div class="toolbar-spacer"></div>
      <div class="savedviews-wrap">
        <button id="btn-savedviews" class="btn btn-ghost" type="button">
          <svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
          Visões salvas${state.savedViews.length ? ` (${state.savedViews.length})` : ''}
        </button>
        <div id="savedviews-menu" class="savedviews-menu" hidden></div>
      </div>
      <button class="btn btn-primary" data-action="new-member" type="button">
        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        Novo membro
      </button>
    </div>
    <div id="bulkbar-zone"></div>
    <div id="result-meta" class="result-meta"></div>
    <div id="member-list-wrap"></div>`;
  updateMemberList();
}

function updateMemberList() {
  const list = filteredMembers();
  const total = unitMembers().length;
  const visibleIds = new Set(list.map(m => m.id));
  state.selected = new Set([...state.selected].filter(id => visibleIds.has(id)));

  $('#result-meta').innerHTML = `Exibindo <b>${list.length}</b> de <b>${total}</b> membros${state.search || state.status !== 'todos' || state.ministry !== 'todos' ? ' · filtros ativos' : ''}`;

  const sel = state.selected;
  $('#bulkbar-zone').innerHTML = sel.size ? `
    <div class="bulkbar">
      <b>${sel.size} selecionado${sel.size > 1 ? 's' : ''}</b>
      <div class="select-wrap">
        <select id="bulk-unit" aria-label="Mover para unidade">
          <option value="">Mover para…</option>
          ${myUnits().map(u => `<option value="${u}">${UNITS[u].label}</option>`).join('')}
        </select>
      </div>
      <div class="select-wrap">
        <select id="bulk-status" aria-label="Alterar status">
          <option value="">Status…</option>
          ${Object.entries(STATUS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-danger btn-sm" data-action="bulk-delete" type="button">
        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        Excluir
      </button>
      <button class="bulk-clear" data-action="bulk-clear" type="button">Limpar seleção</button>
    </div>` : '';

  if (!list.length) {
    $('#member-list-wrap').innerHTML = `
      <div class="empty-state">
        <div class="empty-heart"><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>
        <h3>${total ? 'Nenhum membro encontrado' : 'Nenhum membro nesta unidade ainda'}</h3>
        <p>${total ? 'Ajuste a busca ou os filtros para encontrar quem você procura.' : 'Que alegria começar! Cadastre o primeiro membro desta unidade.'}</p>
        ${total ? '<button class="btn btn-ghost" data-action="reset-filters" type="button">Limpar filtros</button>' : '<button class="btn btn-primary" data-action="new-member" type="button">Cadastrar primeiro membro</button>'}
      </div>`;
    return;
  }

  const allChecked = list.every(m => sel.has(m.id));
  $('#member-list-wrap').innerHTML = `
    <div class="table-scroll">
      <table class="member-table">
        <thead><tr>
          <th style="width:38px"><input type="checkbox" class="rowcheck" id="check-all" ${allChecked ? 'checked' : ''} aria-label="Selecionar todos"></th>
          <th>Membro</th><th>Unidade</th><th>Telefone</th><th>Ministério</th><th>Status</th><th style="text-align:right">Ações</th>
        </tr></thead>
        <tbody>
          ${list.map(m => `
            <tr data-open="${m.id}" class="${sel.has(m.id) ? 'selected' : ''}">
              <td><input type="checkbox" class="rowcheck" data-check="${m.id}" ${sel.has(m.id) ? 'checked' : ''} aria-label="Selecionar ${esc(m.name)}"></td>
              <td><div class="cell-name">${avatarHTML(m.name, 'avatar-sm')}<div><b>${esc(m.name)}</b><span>${esc(m.email || (m.birth ? 'Nasc. ' + fmtDate(m.birth) : 'Sem e-mail'))}</span>${memberFlags(m, 'mini')}</div></div></td>
              <td>${unitBadge(m.unit)}</td>
              <td class="cell-phone">${esc(m.phone || '—')}</td>
              <td>${minChip(m.ministry)}</td>
              <td>${statusBadge(m.status)}</td>
              <td><div class="row-actions">
                <button class="icon-btn" data-edit="${m.id}" type="button" title="Editar" aria-label="Editar ${esc(m.name)}"><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button>
                <button class="icon-btn del" data-del="${m.id}" type="button" title="Excluir" aria-label="Excluir ${esc(m.name)}"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>
              </div></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  const ca = $('#check-all');
  if (ca && !allChecked && sel.size) ca.indeterminate = true;
}

/* ═════════ Render: aniversariantes ═════════ */
function renderBirthdays() {
  const entries = birthdayEntries();
  const t = today();
  const monthList = entries
    .filter(e => parseDate(e.birth).getMonth() === state.bmonth)
    .sort((a, b) => parseDate(a.birth).getDate() - parseDate(b.birth).getDate());

  $('#view-birthdays').innerHTML = `
    <div class="view-head">
      <h1 class="view-title">ANIVERSARIANTES <span class="hl">· ${MONTHS[state.bmonth].toUpperCase()}</span>
        <small>Membros — ${esc(unitLabel(state.unit))}.</small>
      </h1>
    </div>
    <div class="month-strip">
      ${MONTHS.map((mn, i) => {
        const n = entries.filter(e => parseDate(e.birth).getMonth() === i).length;
        return `<button class="month-btn ${i === state.bmonth ? 'active' : ''}" data-month="${i}" type="button">${MONTHS_SHORT[i]}<span class="mb-count">${n}</span></button>`;
      }).join('')}
    </div>
    ${monthList.length ? `<div class="bday-grid">
      ${monthList.map(e => {
        const b = parseDate(e.birth);
        const isToday = state.bmonth === t.getMonth() && b.getDate() === t.getDate();
        const age = turningAge(e.birth);
        return `<div class="bday-card ${isToday ? 'today' : ''}" data-open="${e.m.id}">
          <div class="bday-day"><b>${String(b.getDate()).padStart(2,'0')}</b><span>${MONTHS_SHORT[b.getMonth()]}</span></div>
          ${avatarHTML(e.name)}
          <div class="bday-info"><b><span class="mi-name">${esc(e.name)}</span></b><span>${UNITS[e.m.unit].label}</span><span>${esc(e.m.phone || '')}</span></div>
          ${age !== null ? `<span class="bday-age">${age} anos</span>` : ''}
        </div>`;
      }).join('')}
    </div>` : `
    <div class="empty-state">
      <div class="empty-heart"><svg viewBox="0 0 24 24"><path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm6 3h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v9h18v-9c0-1.66-1.34-3-3-3z"/></svg></div>
      <h3>Nenhum aniversariante em ${MONTHS[state.bmonth]}</h3>
      <p>Cadastre as datas de nascimento dos membros para celebrar junto com eles.</p>
      <button class="btn btn-primary" data-goto="members" type="button">Ir para membros</button>
    </div>`}`;
}

/* ═════════ Render: contato WhatsApp ═════════ */
function waContacts() {
  const q = state.waSearch.trim().toLowerCase();
  return allowedMembers()
    .filter(m => state.unit === 'all' || m.unit === state.unit)
    .filter(m => !q || m.name.toLowerCase().includes(q) || String(m.phone || '').toLowerCase().includes(q) || String(m.email || '').toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}
function waHref(m) {
  const num = waNumber(m.phone);
  if (!num) return '';
  const text = state.waMsg.trim().replace(/\{nome\}/gi, m.name.split(' ')[0]);
  return `https://api.whatsapp.com/send?phone=${num}${text ? '&text=' + encodeURIComponent(text) : ''}`;
}
function renderWhatsapp() {
  $('#view-whatsapp').innerHTML = `
    <div class="view-head">
      <h1 class="view-title">CONTATO <span class="hl">· WHATSAPP</span>
        <small>Fale direto com cada membro — ${esc(unitLabel(state.unit).toLowerCase())}.</small>
      </h1>
    </div>
    <div class="wa-tools">
      <div class="search-box ${state.waSearch ? 'has-value' : ''}">
        <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input id="wa-search" type="search" placeholder="Buscar por nome, telefone ou e-mail…" value="${esc(state.waSearch)}" autocomplete="off">
      </div>
      <label class="wa-msg"><span>Mensagem (opcional)</span>
        <input id="wa-msg" type="text" maxlength="200" placeholder="A mensagem acompanha o link do WhatsApp" value="${esc(state.waMsg)}">
      </label>
      <div class="wa-templates">
        ${WA_TEMPLATES.map((t, i) => `<button class="wa-tpl" data-tpl="${i}" type="button">${t.label}</button>`).join('')}
        <button class="wa-tpl" data-tpl="clear" type="button">Limpar mensagem</button>
      </div>
    </div>
    <p class="wa-summary" id="wa-summary"></p>
    <div id="wa-grid" class="wa-grid"></div>`;
  renderWaGrid();
}
function renderWaGrid() {
  const list = waContacts();
  const total = allowedMembers().filter(m => state.unit === 'all' || m.unit === state.unit).length;
  const summary = $('#wa-summary');
  if (summary) summary.innerHTML = `Mostrando <b>${list.length}</b> de <b>${total}</b> membros${state.unit === 'all' ? ' das suas unidades' : ''}. Toque em “WhatsApp” para abrir a conversa.`;
  const grid = $('#wa-grid');
  if (!grid) return;
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state wa-empty">
      <div class="empty-heart"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></div>
      <h3>Nenhum membro encontrado</h3>
      <p>Ajuste a busca ou cadastre um telefone para iniciar uma conversa.</p>
    </div>`;
    return;
  }
  grid.innerHTML = list.map(m => {
    const href = waHref(m);
    return `<div class="wa-card">
      ${avatarHTML(m.name)}
      <div class="wa-info">
        <b>${esc(m.name)}</b>
        <span><i class="dot dot-${m.unit}"></i> ${esc(m.phone || 'Sem telefone cadastrado')} · ${UNITS[m.unit].label}</span>
        ${memberFlags(m)}
      </div>
      ${href
        ? `<a class="wa-btn" href="${esc(href)}" target="_blank" rel="noopener" aria-label="Conversar com ${esc(m.name)} no WhatsApp"><svg viewBox="0 0 24 24"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zM12.04 20.15c-1.52 0-3.01-.41-4.3-1.18l-.31-.18-3.12.82.83-3.04-.2-.32a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.25-8.11 8.25z"/></svg>WhatsApp</a>`
        : `<span class="wa-btn no-number" title="Cadastre o telefone com DDD para abrir a conversa">${m.phone ? 'Número incompleto' : 'Sem número'}</span>`}
    </div>`;
  }).join('');
}

/* ═════════ Drawer de detalhes ═════════ */
let drawerId = null;
function openDrawer(id) {
  const m = members.find(x => x.id === id);
  if (!m) return;
  drawerId = id;
  const wa = waNumber(m.phone);
  const flags = [];
  if (m.peniel) flags.push(`<span class="flag-chip peniel">${SVG_PENIEL} Fez o Peniel</span>`);
  if (m.wantsWork) flags.push(`<span class="flag-chip servir">${SVG_HEART} Quer trabalhar na igreja</span>`);
  $('#drawer').innerHTML = `
    <div class="drawer-hero">
      <button class="icon-btn drawer-close" data-action="close-drawer" type="button" aria-label="Fechar detalhes">✕</button>
      ${avatarHTML(m.name, 'avatar-lg')}
      <div class="drawer-name">${esc(m.name)}</div>
      <div class="drawer-badges">${unitBadge(m.unit)}${statusBadge(m.status)}${minChip(m.ministry)}</div>
    </div>
    <div class="drawer-body">
      ${flags.length ? `<div class="drawer-flags">${flags.join('')}</div>` : ''}
      <dl class="detail-grid">
        <div class="detail-item"><dt>Telefone / WhatsApp</dt><dd>${m.phone ? (wa ? `<a href="https://api.whatsapp.com/send?phone=${wa}" target="_blank" rel="noopener">${esc(m.phone)}</a>` : esc(m.phone)) : '—'}</dd></div>
        <div class="detail-item"><dt>E-mail</dt><dd>${m.email ? `<a href="mailto:${esc(m.email)}">${esc(m.email)}</a>` : '—'}</dd></div>
        <div class="detail-item"><dt>Nascimento</dt><dd>${fmtDate(m.birth)}${m.birth && currentAge(m.birth) !== null ? ` · ${currentAge(m.birth)} anos` : ''}</dd></div>
        <div class="detail-item"><dt>Entrada na igreja</dt><dd>${fmtDate(m.joined)}</dd></div>
        <div class="detail-item"><dt>Batismo nas águas</dt><dd>${m.baptized ? '<span class="baptized-tag">✓ Batizado(a)</span>' : 'Ainda não'}</dd></div>
        <div class="detail-item"><dt>Próximo aniversário</dt><dd>${m.birth ? (nextBirthdayDays(m.birth) === 0 ? '🎉 Hoje!' : `em ${nextBirthdayDays(m.birth)} dias`) : '—'}</dd></div>
        <div class="detail-item full"><dt>Endereço / Bairro</dt><dd>${esc(m.address || '—')}</dd></div>
      </dl>
      ${flags.length ? `<div class="agentes-cta">
        <b>${m.wantsWork ? 'Pronto(a) para servir' : 'Peniel concluído'}</b>
        <p>${m.wantsWork ? 'Este membro quer trabalhar na igreja. Abra o app Agentes do Amor AMI para acompanhar o voluntariado.' : 'Este membro fez o Peniel. Use o app Agentes do Amor AMI para acompanhar a caminhada de servir.'}</p>
        <a class="btn btn-primary" href="${AGENTES_URL}" target="_blank" rel="noopener">Abrir Agentes do Amor AMI</a>
      </div>` : ''}
      ${m.notes ? `<dt style="font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-bottom:6px">Observações</dt><div class="detail-notes">${esc(m.notes)}</div>` : ''}
      <div class="drawer-actions">
        ${wa ? `<a class="btn btn-ghost" href="https://api.whatsapp.com/send?phone=${wa}" target="_blank" rel="noopener">${SVG_CHAT} WhatsApp</a>` : ''}
        <button class="btn btn-primary" data-edit="${m.id}" type="button">
          <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          Editar
        </button>
        <button class="btn btn-danger" data-del="${m.id}" type="button">
          <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          Excluir
        </button>
      </div>
    </div>`;
  $('#drawer').hidden = false;
  $('#drawer-overlay').hidden = false;
  syncBodyLock();
}
function closeDrawer() { drawerId = null; $('#drawer').hidden = true; $('#drawer-overlay').hidden = true; syncBodyLock(); }
function syncBodyLock() {
  document.body.classList.toggle('modal-open', !$('#form-overlay').hidden || !$('#drawer').hidden);
}

/* ═════════ Formulário ═════════ */
let editingId = null;

function openForm(id = null) {
  editingId = id;
  const form = $('#member-form');
  form.reset();
  $$('#member-form .field-err').forEach(e => e.classList.remove('show'));
  $$('#member-form input').forEach(i => i.classList.remove('invalid'));
  $('#form-ministry').innerHTML = Object.entries(MINISTRIES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');
  form.elements.unit.innerHTML = myUnits().map(u => `<option value="${u}">${UNITS[u].label}</option>`).join('');
  const m = id ? members.find(x => x.id === id) : null;
  $('#form-title').textContent = m ? 'Editar membro' : 'Novo membro';
  $('#form-submit').textContent = m ? 'Salvar alterações' : 'Cadastrar membro';
  if (m) {
    for (const k of ['name','unit','status','ministry','birth','phone','email','joined','address','notes']) form.elements[k].value = m[k] || '';
    form.elements.baptized.checked = !!m.baptized;
    form.elements.peniel.checked = !!m.peniel;
    form.elements.wantsWork.checked = !!m.wantsWork;
  } else {
    form.elements.unit.value = state.unit !== 'all' ? state.unit : myUnits()[0];
    form.elements.ministry.value = 'nenhum';
    form.elements.joined.value = new Date().toISOString().slice(0, 10);
  }
  $('#form-overlay').hidden = false;
  syncBodyLock();
  setTimeout(() => form.elements.name.focus(), 60);
}
function closeForm() { $('#form-overlay').hidden = true; editingId = null; syncBodyLock(); }

function submitForm(e) {
  e.preventDefault();
  const form = $('#member-form');
  const val = k => form.elements[k].value.trim();
  let ok = true;
  const nameErr = $('[data-err="name"]'), emailErr = $('[data-err="email"]');
  nameErr.classList.remove('show'); emailErr.classList.remove('show');
  form.elements.name.classList.remove('invalid'); form.elements.email.classList.remove('invalid');
  if (!val('name')) {
    nameErr.textContent = 'Informe o nome do membro.'; nameErr.classList.add('show');
    form.elements.name.classList.add('invalid'); ok = false;
  }
  if (val('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('email'))) {
    emailErr.textContent = 'E-mail inválido.'; emailErr.classList.add('show');
    form.elements.email.classList.add('invalid'); ok = false;
  }
  if (!ok) return;
  if (!myUnits().includes(form.elements.unit.value)) {
    toast('Você só pode cadastrar membros nas unidades liberadas para o seu acesso.', { type: 'danger' });
    return;
  }

  const data = {
    name: val('name'), unit: form.elements.unit.value, status: form.elements.status.value,
    ministry: form.elements.ministry.value, birth: form.elements.birth.value,
    phone: val('phone'), email: val('email'), joined: form.elements.joined.value,
    baptized: form.elements.baptized.checked, peniel: form.elements.peniel.checked,
    wantsWork: form.elements.wantsWork.checked, address: val('address'), notes: val('notes')
  };
  let saved, prev = null;
  const wasEditing = !!editingId;
  if (wasEditing) {
    const m = members.find(x => x.id === editingId);
    prev = { ...m };
    Object.assign(m, data);
    delete m.children; delete m.hasChildren;
    saved = m;
  } else {
    saved = { id: uid(), ...data, createdAt: new Date().toISOString() };
    members.push(saved);
  }
  const keepDrawer = drawerId;
  closeForm();
  renderAll();
  if (keepDrawer) openDrawer(keepDrawer);
  syncMember(saved).then(ok => {
    if (ok) {
      toast(wasEditing
        ? `Dados de ${data.name.split(' ')[0]} atualizados.`
        : `${data.name.split(' ')[0]} cadastrado(a) em ${UNITS[data.unit].label}!`);
      return;
    }
    const idx = members.findIndex(x => x.id === saved.id);
    if (prev && idx >= 0) Object.assign(members[idx], prev);
    if (!prev && idx >= 0) members.splice(idx, 1);
    renderAll();
    if (keepDrawer) openDrawer(keepDrawer);
  });
}

/* ═════════ Exclusão + desfazer ═════════ */
function deleteMembers(ids) {
  const removed = members.filter(m => ids.includes(m.id));
  if (!removed.length) return;
  members = members.filter(m => !ids.includes(m.id));
  API.call('/api/members/delete', { ids })
    .then(res => { if (res.deleted !== removed.length) refreshState(true); })
    .catch(err => { saveFailed(err); refreshState(true); });
  state.selected.clear();
  if (drawerId && ids.includes(drawerId)) closeDrawer();
  renderAll();
  const msg = removed.length === 1 ? `${removed[0].name} foi excluído(a).` : `${removed.length} membros excluídos.`;
  toast(msg, {
    type: 'danger',
    undo: () => {
      members = members.concat(removed);
      removed.forEach(m => syncMember(m));
      renderAll();
      toast(removed.length === 1 ? `${removed[0].name.split(' ')[0]} restaurado(a).` : `${removed.length} membros restaurados.`);
    }
  });
}

/* ═════════ Exportação Excel (.xlsx) — formatada, com linhas separando ═════════ */
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const XLSX_CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; }
  return t;
})();
function xlsxCrc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = XLSX_CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function xlsxCol(n) { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
function xlsxCell(ref, s, v) {
  return `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${esc(v ?? '')}</t></is></c>`;
}
/* ZIP writer (método STORE, sem dependências) */
function xlsxZip(files) {
  const enc = new TextEncoder();
  const d = new Date();
  const dosTime = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const dosDate = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  const locals = [], centrals = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name), data = f.data, crc = xlsxCrc32(data);
    const lh = new Uint8Array(30 + name.length), lv = new DataView(lh.buffer);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true);
    lv.setUint16(8, 0, true); lv.setUint16(10, dosTime, true); lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true); lv.setUint32(18, data.length, true); lv.setUint32(22, data.length, true);
    lv.setUint16(26, name.length, true); lv.setUint16(28, 0, true); lh.set(name, 30);
    locals.push(lh, data);
    const ch = new Uint8Array(46 + name.length), cv = new DataView(ch.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true); cv.setUint16(10, 0, true); cv.setUint16(12, dosTime, true); cv.setUint16(14, dosDate, true);
    cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true); cv.setUint16(30, 0, true); cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true); cv.setUint16(36, 0, true); cv.setUint32(38, 0, true); cv.setUint32(42, offset, true);
    ch.set(name, 46); centrals.push(ch);
    offset += lh.length + data.length;
  }
  const cdSize = centrals.reduce((s, c) => s + c.length, 0);
  const end = new Uint8Array(22), ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
  ev.setUint32(12, cdSize, true); ev.setUint32(16, offset, true);
  const out = new Uint8Array(offset + cdSize + 22);
  let pos = 0;
  for (const c of locals) { out.set(c, pos); pos += c.length; }
  for (const c of centrals) { out.set(c, pos); pos += c.length; }
  out.set(end, pos);
  return out;
}
function xlsxStyles() {
  const font = (b, sz, color, i) => `<font>${i ? '<i/>' : ''}${b ? '<b/>' : ''}<sz val="${sz}"/><color rgb="${color}"/><name val="Calibri"/><family val="2"/></font>`;
  const fill = rgb => `<fill><patternFill patternType="solid"><fgColor rgb="${rgb}"/><bgColor indexed="64"/></patternFill></fill>`;
  const bord = '<border><left style="thin"><color rgb="FFD9A7AC"/></left><right style="thin"><color rgb="FFD9A7AC"/></right><top style="thin"><color rgb="FFD9A7AC"/></top><bottom style="thin"><color rgb="FFD9A7AC"/></bottom><diagonal/></border>';
  const xf = (f, fl, b, align) => `<xf numFmtId="0" fontId="${f}" fillId="${fl}" borderId="${b}" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment ${align}/></xf>`;
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    `<fonts count="6">${font(0,11,'FF1A1A1A')}${font(1,16,'FFFFFFFF')}${font(1,11,'FFFFFFFF')}${font(0,11,'FF262626')}${font(1,11,'FF9E0B1E')}${font(0,10,'FF8A5A5E',1)}</fonts>` +
    `<fills count="7"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>${fill('FFE8112D')}${fill('FF9E0B1E')}${fill('FFFBE9EB')}${fill('FFFFFFFF')}${fill('FFFDECEE')}</fills>` +
    `<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>${bord}</borders>` +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellStyleXfs>' +
    '<cellXfs count="9">' +
    xf(0,0,0,'vertical="center"') +
    xf(1,3,0,'horizontal="left" vertical="center" indent="1"') +
    xf(5,0,0,'horizontal="left" vertical="center" indent="1"') +
    xf(2,2,1,'horizontal="center" vertical="center" wrapText="1"') +
    xf(3,5,1,'horizontal="left" vertical="center" wrapText="1" indent="1"') +
    xf(3,4,1,'horizontal="left" vertical="center" wrapText="1" indent="1"') +
    xf(3,5,1,'horizontal="center" vertical="center" wrapText="1"') +
    xf(3,4,1,'horizontal="center" vertical="center" wrapText="1"') +
    xf(4,6,1,'horizontal="left" vertical="center" wrapText="1" indent="1"') +
    '</cellXfs>' +
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
    '<dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>' +
    '</styleSheet>';
}
function xlsxSheet({ title, subtitle, cols, rows, centerCols = [], emptyNote = '' }) {
  const n = cols.length, last = xlsxCol(n);
  const totalRows = 3 + Math.max(rows.length, emptyNote ? 1 : 0);
  let x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>' +
    `<dimension ref="A1:${last}${totalRows}"/>` +
    '<sheetViews><sheetView workbookViewId="0" showGridLines="0"><pane ySplit="3" topLeftCell="A4" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A4" sqref="A4"/></sheetView></sheetViews>' +
    '<sheetFormatPr defaultRowHeight="18"/>' +
    '<cols>' + cols.map((c, i) => `<col min="${i+1}" max="${i+1}" width="${c.width}" customWidth="1"/>`).join('') + '</cols>' +
    '<sheetData>';
  x += '<row r="1" ht="32" customHeight="1">' + cols.map((c, i) => xlsxCell(xlsxCol(i+1)+'1', 1, i === 0 ? title : '')).join('') + '</row>';
  x += '<row r="2" ht="20" customHeight="1">' + cols.map((c, i) => xlsxCell(xlsxCol(i+1)+'2', 2, i === 0 ? subtitle : '')).join('') + '</row>';
  x += '<row r="3" ht="28" customHeight="1">' + cols.map((c, i) => xlsxCell(xlsxCol(i+1)+'3', 3, c.label)).join('') + '</row>';
  if (rows.length) {
    rows.forEach((r, ri) => {
      const rn = 4 + ri, zebra = ri % 2 === 1;
      x += `<row r="${rn}">` + r.map((val, ci) => {
        const center = centerCols.includes(ci);
        return xlsxCell(xlsxCol(ci+1)+rn, center ? (zebra ? 7 : 6) : (zebra ? 5 : 4), val);
      }).join('') + '</row>';
    });
  } else if (emptyNote) {
    x += '<row r="4" ht="24" customHeight="1">' + cols.map((c, i) => xlsxCell(xlsxCol(i+1)+'4', 4, i === 0 ? emptyNote : '')).join('') + '</row>';
  }
  x += '</sheetData>';
  if (rows.length) x += `<autoFilter ref="A3:${last}${3 + rows.length}"/>`;
  x += `<mergeCells count="2"><mergeCell ref="A1:${last}1"/><mergeCell ref="A2:${last}2"/></mergeCells>`;
  x += '<pageMargins left="0.3" right="0.3" top="0.4" bottom="0.4" header="0.2" footer="0.2"/>';
  x += '<pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/>';
  x += '</worksheet>';
  return x;
}
function xlsxBuild(sheets) {
  const enc = new TextEncoder(), files = [], n = sheets.length;
  let ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>';
  for (let i = 1; i <= n; i++) ct += `<Override PartName="/xl/worksheets/sheet${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`;
  ct += '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>';
  files.push({ name: '[Content_Types].xml', data: enc.encode(ct) });
  files.push({ name: '_rels/.rels', data: enc.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>') });
  let wb = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>';
  sheets.forEach((s, i) => wb += `<sheet name="${esc(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`);
  wb += '</sheets></workbook>';
  files.push({ name: 'xl/workbook.xml', data: enc.encode(wb) });
  let wr = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
  for (let i = 1; i <= n; i++) wr += `<Relationship Id="rId${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i}.xml"/>`;
  wr += `<Relationship Id="rId${n+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
  files.push({ name: 'xl/_rels/workbook.xml.rels', data: enc.encode(wr) });
  files.push({ name: 'xl/styles.xml', data: enc.encode(xlsxStyles()) });
  sheets.forEach((s, i) => files.push({ name: `xl/worksheets/sheet${i+1}.xml`, data: enc.encode(xlsxSheet(s)) }));
  return xlsxZip(files);
}
function exportExcel() {
  const list = filteredMembers();
  if (!list.length) { toast('Nada para exportar com os filtros atuais.', { type: 'info' }); return; }
  const stamp = new Date().toISOString().slice(0, 10);
  const fparts = [];
  if (state.status !== 'todos') fparts.push('Status: ' + STATUS[state.status].label);
  if (state.ministry !== 'todos') fparts.push('Ministério: ' + (MINISTRIES[state.ministry] || MINISTRIES.nenhum).label);
  if (state.search.trim()) fparts.push('Busca: “' + state.search.trim() + '”');
  const ftxt = fparts.length ? ' · Filtros: ' + fparts.join(' | ') : '';
  const mCols = [
    { label: 'Nome', width: 34 }, { label: 'Unidade', width: 18 }, { label: 'Status', width: 16 },
    { label: 'Ministério', width: 18 }, { label: 'Nascimento', width: 14 }, { label: 'Telefone', width: 18 },
    { label: 'E-mail', width: 30 }, { label: 'Batizado', width: 12 }, { label: 'Entrada', width: 14 },
    { label: 'Peniel', width: 10 }, { label: 'Quer servir', width: 12 },
    { label: 'Endereço', width: 34 }, { label: 'Observações', width: 40 }
  ];
  const mRows = list.map(m => [
    m.name, UNITS[m.unit].label, STATUS[m.status].label, (MINISTRIES[m.ministry] || MINISTRIES.nenhum).label,
    fmtDate(m.birth) === '—' ? '' : fmtDate(m.birth), m.phone || '', m.email || '', m.baptized ? 'Sim' : 'Não',
    fmtDate(m.joined) === '—' ? '' : fmtDate(m.joined), m.peniel ? 'Sim' : 'Não', m.wantsWork ? 'Sim' : 'Não',
    m.address || '', m.notes || ''
  ]);
  const sheets = [
    { name: 'Membros', title: `AMI INTEGRAÇÃO · ${unitLabel(state.unit).toUpperCase()}`, subtitle: `Cadastro de membros · Exportado em ${fmtDate(stamp)} · ${list.length} registro(s)${ftxt}`, cols: mCols, rows: mRows, centerCols: [1, 2, 4, 5, 7, 8, 9, 10] }
  ];
  const blob = new Blob([xlsxBuild(sheets)], { type: XLSX_MIME });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `ami-membros-${state.unit}-${stamp}.xlsx`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast(`${list.length} membros exportados em Excel (.xlsx).`);
}

/* ═════════ Visões salvas ═════════ */
function renderSavedViewsMenu() {
  const menu = $('#savedviews-menu');
  if (!menu) return;
  menu.innerHTML = `
    ${state.savedViews.length ? state.savedViews.map(v => `
      <div class="sv-item">
        <button class="sv-apply" data-sv-apply="${v.id}" type="button">${esc(v.name)}
          <span class="sv-meta">${esc(unitLabel(v.unit))}${v.status !== 'todos' ? ' · ' + STATUS[v.status].label : ''}${v.ministry !== 'todos' ? ' · ' + MINISTRIES[v.ministry].label : ''}${v.search ? ` · “${esc(v.search)}”` : ''}</span>
        </button>
        <button class="sv-del" data-sv-del="${v.id}" type="button" aria-label="Excluir visão">✕</button>
      </div>`).join('') : '<div class="sv-empty">Nenhuma visão salva ainda.<br>Salve a combinação atual de filtros.</div>'}
    <button class="sv-save-current" data-action="open-saveview" type="button">＋ Salvar filtros atuais como visão</button>`;
}
function openSaveViewPop() {
  const btn = $('#btn-savedviews');
  const r = btn.getBoundingClientRect();
  const pop = $('#saveview-pop');
  pop.hidden = false;
  const w = 270;
  pop.style.left = Math.max(10, Math.min(window.innerWidth - w - 10, r.right - w)) + 'px';
  pop.style.top = Math.min(window.innerHeight - 160, r.bottom + 8) + 'px';
  $('#saveview-name').value = '';
  setTimeout(() => $('#saveview-name').focus(), 50);
}
function confirmSaveView() {
  const name = $('#saveview-name').value.trim();
  if (!name) { $('#saveview-name').focus(); return; }
  state.savedViews.push({ id: uid(), name, unit: state.unit, search: state.search, status: state.status, ministry: state.ministry, sort: state.sort });
  store.set('ami.savedViews', state.savedViews);
  $('#saveview-pop').hidden = true;
  toast(`Visão “${name}” salva.`);
  renderMembers();
}

/* ═════════ Usuários ═════════ */
const SVG_CROWN = '<svg viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>';
const SVG_SHIELD = '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>';
const SVG_LOCK = '<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>';
const SVG_TRASH = '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
const SVG_PLUS = '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
const SVG_KEY = '<svg viewBox="0 0 24 24"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>';
const SVG_PENCIL = '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
const SVG_PERSON = '<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
const SVG_HEART = '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
const SVG_PENIEL = '<svg viewBox="0 0 24 24"><path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>';
const SVG_CHAT = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>';

const ROLE_LABEL = { geral: 'Administrador geral', admin: 'Administrador', user: 'Usuário' };
let editingUserId = null;
let editingGeral = false;

function canEditUser(u) {
  if (isGeneral()) return true;
  const myRole = roleOf(state.user.email);
  if (myRole !== 'admin') return false;
  return u.role === 'user' || u.email === normEmail(state.user.email);
}

function renderUsers() {
  const gaName = normEmail(state.user.email) === GENERAL_ADMIN.email ? state.user.name : GENERAL_ADMIN.name;
  if (!isGeneral()) editingGeral = false;
  const geralMode = editingGeral;
  const editing = !geralMode && editingUserId ? users.find(u => u.id === editingUserId) : null;
  editingUserId = editing ? editing.id : null;
  $('#view-admins').innerHTML = `
    <div class="view-head">
      <h1 class="view-title">USUÁRIOS <span class="hl">· ACESSO AO APP</span>
        <small>Cada pessoa entra com o próprio e-mail e senha cadastrados aqui.</small>
      </h1>
    </div>
    <div class="admin-grid">
      <div class="panel">
        <div class="panel-title">${SVG_SHIELD} Contas com acesso
          <span class="panel-link" style="cursor:default">${users.length + 1} conta${users.length ? 's' : ''}</span>
        </div>
        <div class="admin-list">
          <div class="admin-card geral">
            ${avatarHTML(gaName)}
            <div class="admin-info">
              <b>${esc(gaName)} ${normEmail(state.user.email) === GENERAL_ADMIN.email ? '<em class="you-tag">você</em>' : ''}</b>
              <span>${GENERAL_ADMIN.email}</span>
              <em class="admin-meta">Conta principal · acesso total · não removível</em>
            </div>
            <span class="badge-role role-geral">${SVG_CROWN}Administrador geral</span>
            ${normEmail(state.user.email) === GENERAL_ADMIN.email ? `<button class="icon-btn" data-geral-pass type="button" title="Alterar minha senha" aria-label="Alterar minha senha">${SVG_KEY}</button>` : ''}
          </div>
          ${users.map(u => `
            <div class="admin-card">
              ${avatarHTML(u.name)}
              <div class="admin-info">
                <b>${esc(u.name)} ${normEmail(state.user.email) === u.email ? '<em class="you-tag">você</em>' : ''}</b>
                <span>${esc(u.email)}</span>
                <em class="admin-meta">Desde ${fmtDate((u.addedAt || '').slice(0, 10))}${u.hasPass ? '' : ' · aguardando primeira senha'}</em>
                <em class="admin-units">${u.role === 'geral'
                  ? `<span class="flag-chip">${SVG_CROWN} Todas as unidades</span>`
                  : (u.units || ALL_UNITS).map(x => `<span class="flag-chip"><i class="dot dot-${x}"></i>${UNITS[x].label}</span>`).join('') || '<span class="flag-chip">Sem unidade liberada</span>'}</em>
              </div>
              <span class="badge-role role-${u.role}">${u.role === 'geral' ? SVG_CROWN : u.role === 'admin' ? SVG_SHIELD : ''}${ROLE_LABEL[u.role] || 'Usuário'}</span>
              ${canEditUser(u) ? `
                <button class="icon-btn" data-user-pass="${u.id}" type="button" title="Definir nova senha" aria-label="Definir nova senha de ${esc(u.name)}">${SVG_KEY}</button>
                <button class="icon-btn" data-user-edit="${u.id}" type="button" title="Editar usuário" aria-label="Editar ${esc(u.name)}">${SVG_PENCIL}</button>` : ''}
              ${canEditUser(u) && u.email !== normEmail(state.user.email) ? `<button class="icon-btn del" data-user-del="${u.id}" type="button" title="Remover acesso" aria-label="Remover acesso de ${esc(u.name)}">${SVG_TRASH}</button>` : ''}
            </div>`).join('')}
          ${!users.length ? '<p class="empty-note">Nenhum outro usuário cadastrado.<br>Use o formulário ao lado para criar o acesso de um irmão(ã) da equipe.</p>' : ''}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
        <div class="panel">
          <div class="panel-title">${geralMode ? SVG_KEY + ' Alterar senha do administrador geral' : editing ? SVG_PENCIL + ' Editar usuário' : SVG_PLUS + ' Cadastrar usuário'}</div>
          <form id="acc-form" novalidate>
            <div class="form-grid admin-form-grid">
              <label class="span-2" ${geralMode ? 'hidden' : ''}>Nome completo *
                <input id="acc-name" type="text" maxlength="80" placeholder="Ex.: Ana Beatriz Lima" autocomplete="off">
                <em class="field-err" data-uerr="name"></em>
              </label>
              <label class="span-2" ${geralMode ? 'hidden' : ''}>E-mail de acesso *
                <input id="acc-email" type="email" placeholder="pessoa@email.com" autocomplete="off">
                <em class="field-err" data-uerr="email"></em>
              </label>
              <label class="span-2" ${geralMode ? 'hidden' : ''}>Nível de acesso
                <select id="acc-role" ${isGeneral() ? '' : 'disabled'}>
                  <option value="user">Usuário — cadastra e edita membros</option>
                  <option value="admin">Administrador — também gerencia usuários</option>
                  ${isGeneral() ? '<option value="geral">Administrador geral — acesso total ao sistema</option>' : ''}
                </select>
              </label>
              <div class="span-2" id="acc-units-wrap" ${geralMode ? 'hidden' : ''}>
                <span class="acc-units-label">Unidades liberadas *</span>
                <div class="unit-access" id="acc-units">
                  ${ALL_UNITS.map(u => {
                    const mine = myUnits().includes(u);
                    return `<label class="check-label" ${mine ? '' : 'title="Somente o administrador geral pode liberar esta unidade"' }><input type="checkbox" value="${u}" ${mine ? '' : 'disabled'}><span class="check-box" aria-hidden="true"></span><i class="dot dot-${u}"></i>${UNITS[u].label}</label>`;
                  }).join('')}
                </div>
                <em class="unit-hint">${isGeneral() ? 'Marque as unidades que este acesso poderá visualizar e editar.' : 'Você libera as unidades que você mesmo acessa. O administrador geral pode liberar as duas.'}</em>
                <em class="field-err" data-uerr="units"></em>
              </div>
              <label class="span-2">${geralMode ? 'Nova senha do administrador geral *' : editing ? 'Nova senha (deixe em branco para manter a atual)' : 'Senha de acesso *'}
                <input id="acc-pass" type="password" autocomplete="new-password" placeholder="Mínimo de 6 caracteres">
                <em class="field-err" data-uerr="pass"></em>
              </label>
            </div>
            <button class="btn btn-primary admin-submit" type="submit">${geralMode ? 'Salvar nova senha' : editing ? 'Salvar alterações' : SVG_PLUS + ' Cadastrar usuário'}</button>
            ${geralMode || editing ? '<button class="btn btn-ghost admin-cancel" id="acc-cancel" type="button">Cancelar</button>' : ''}
          </form>
          <p class="admin-hint">${geralMode
            ? 'Você está logado como administrador geral. A nova senha passa a valer no próximo acesso.'
            : isGeneral()
              ? 'Cada pessoa recebe o próprio e-mail e senha — nunca compartilhe a sua conta. Administradores comuns só cadastram usuários; administradores gerais criam administradores e outros gerais.'
              : 'Você pode cadastrar usuários comuns e redefinir a senha deles. Contas de administrador são gerenciadas pelo administrador geral.'}</p>
        </div>
        <div class="panel">
          <div class="panel-title">${SVG_LOCK} Níveis de acesso</div>
          <div class="perm-row"><span class="perm-ico role-geral">${SVG_CROWN}</span><div><b>Administrador geral</b><span>Acesso total: membros, exportações, todas as unidades e gestão de todos os usuários. Somente um administrador geral cria outros administradores gerais.</span></div></div>
          <div class="perm-row"><span class="perm-ico role-admin">${SVG_SHIELD}</span><div><b>Administrador</b><span>Gerencia membros, exportações e usuários comuns nas unidades liberadas para ele. Pode ter acesso às duas unidades.</span></div></div>
          <div class="perm-row"><span class="perm-ico role-user">${SVG_PERSON}</span><div><b>Usuário</b><span>Vê e cadastra membros apenas nas unidades liberadas pelo administrador. Não gerencia contas de acesso.</span></div></div>
        </div>
      </div>
    </div>`;
  $('#acc-name').value = geralMode ? GENERAL_ADMIN.name : editing ? editing.name : '';
  $('#acc-email').value = geralMode ? GENERAL_ADMIN.email : editing ? editing.email : '';
  $('#acc-role').value = editing ? editing.role : 'user';
  $('#acc-pass').value = '';
  const presetUnits = geralMode ? [] : editing
    ? (editing.role === 'geral' ? ALL_UNITS : (editing.units || ALL_UNITS))
    : (state.unit !== 'all' ? [state.unit] : myUnits());
  $$('#acc-units input').forEach(b => { b.checked = presetUnits.includes(b.value); });
  const roleSel = $('#acc-role');
  const syncUnits = () => { const w = $('#acc-units-wrap'); if (w) w.hidden = roleSel.value === 'geral'; };
  roleSel.addEventListener('change', syncUnits);
  syncUnits();
  $('#acc-form').addEventListener('submit', submitUser);
  const cancel = $('#acc-cancel');
  if (cancel) cancel.addEventListener('click', () => { editingUserId = null; editingGeral = false; renderUsers(); });
}

function userFieldError(err) {
  switch (err.code) {
    case 'email_taken': return ['email', 'Este e-mail já tem acesso cadastrado.'];
    case 'invalid_email': return ['email', 'E-mail inválido.'];
    case 'invalid_name': return ['name', 'Informe o nome do usuário.'];
    case 'weak_password': return ['pass', 'A senha precisa ter pelo menos 6 caracteres.'];
    case 'units_required': return ['units', 'Libere pelo menos uma unidade para este acesso.'];
    case 'general_protected': return [null, 'A conta do administrador geral não pode ser alterada por aqui.'];
    case 'forbidden': return [null, 'Seu acesso não permite esta alteração.'];
    case 'cannot_remove_self': return [null, 'Você não pode remover o próprio acesso.'];
    case 'rate_limited': return [null, 'Muitas tentativas. Aguarde alguns minutos e tente de novo.'];
    default: return [null, 'Não foi possível salvar agora. Verifique a conexão e tente novamente.'];
  }
}

async function submitUser(e) {
  e.preventDefault();
  const passI = $('#acc-pass');
  if (editingGeral && isGeneral()) {
    const errP = $('[data-uerr="pass"]');
    errP.classList.remove('show'); passI.classList.remove('invalid');
    if (passI.value.length < 6) {
      errP.textContent = 'A senha precisa ter pelo menos 6 caracteres.'; errP.classList.add('show');
      passI.classList.add('invalid'); return;
    }
    try {
      await API.call('/api/me/password', { password: passI.value });
      editingGeral = false;
      renderUsers();
      toast('Senha do administrador geral atualizada.');
    } catch (err) {
      const [, msg] = userFieldError(err);
      errP.textContent = msg; errP.classList.add('show');
    }
    return;
  }
  const nameI = $('#acc-name'), emailI = $('#acc-email'), roleI = $('#acc-role');
  const name = nameI.value.trim();
  const email = normEmail(emailI.value);
  const pass = passI.value;
  const editing = editingUserId ? users.find(u => u.id === editingUserId) : null;
  const role = isGeneral() ? roleI.value : (editing ? editing.role : 'user');
  const errN = $('[data-uerr="name"]'), errE = $('[data-uerr="email"]'), errP = $('[data-uerr="pass"]'), errU = $('[data-uerr="units"]');
  [errN, errE, errP, errU].forEach(el => el.classList.remove('show'));
  [nameI, emailI, passI].forEach(el => el.classList.remove('invalid'));
  const grantable = myUnits();
  const picked = $$('#acc-units input:checked').filter(b => !b.disabled).map(b => b.value);
  const kept = editing && editing.role !== 'geral'
    ? (editing.units || ALL_UNITS).filter(x => !grantable.includes(x))
    : [];
  const units = role === 'geral' ? [...ALL_UNITS] : [...new Set([...kept, ...picked])];
  let ok = true;
  if (!name) {
    errN.textContent = 'Informe o nome do usuário.'; errN.classList.add('show');
    nameI.classList.add('invalid'); ok = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errE.textContent = 'E-mail inválido.'; errE.classList.add('show');
    emailI.classList.add('invalid'); ok = false;
  } else if (email === GENERAL_ADMIN.email) {
    errE.textContent = 'Este e-mail é a conta do administrador geral.'; errE.classList.add('show');
    emailI.classList.add('invalid'); ok = false;
  } else if (users.some(u => u.email === email && u.id !== editingUserId)) {
    errE.textContent = 'Este e-mail já tem acesso cadastrado.'; errE.classList.add('show');
    emailI.classList.add('invalid'); ok = false;
  }
  const needsPass = !editing || !editing.hasPass;
  if (needsPass && !pass) {
    errP.textContent = 'Defina uma senha de acesso.'; errP.classList.add('show');
    passI.classList.add('invalid'); ok = false;
  } else if (pass && pass.length < 6) {
    errP.textContent = 'A senha precisa ter pelo menos 6 caracteres.'; errP.classList.add('show');
    passI.classList.add('invalid'); ok = false;
  }
  if (role !== 'geral' && !units.length) {
    errU.textContent = 'Libere pelo menos uma unidade para este acesso.'; errU.classList.add('show'); ok = false;
  }
  if (!ok) return;

  const btn = $('#acc-form button[type="submit"]');
  if (btn) btn.disabled = true;
  try {
    if (editing) {
      const res = await API.call('/api/users/update', {
        id: editing.id, name, email, role, units, password: pass || undefined
      });
      const index = users.findIndex(x => x.id === editing.id);
      if (index >= 0) users[index] = res.user;
      editingUserId = null;
      renderAll();
      toast(`Dados de ${name.split(' ')[0]} atualizados${pass ? ' e nova senha definida' : ''}.`);
    } else {
      const res = await API.call('/api/users', { name, email, role, units, password: pass });
      users.push(res.user);
      users.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      renderAll();
      toast(`${name.split(' ')[0]} cadastrado(a) como ${ROLE_LABEL[res.user.role]} com acesso próprio.`);
    }
  } catch (err) {
    const [field, msg] = userFieldError(err);
    if (field === 'name') { errN.textContent = msg; errN.classList.add('show'); nameI.classList.add('invalid'); }
    else if (field === 'email') { errE.textContent = msg; errE.classList.add('show'); emailI.classList.add('invalid'); }
    else if (field === 'pass') { errP.textContent = msg; errP.classList.add('show'); passI.classList.add('invalid'); }
    else if (field === 'units') { errU.textContent = msg; errU.classList.add('show'); }
    else toast(msg, { type: 'danger' });
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function removeUser(id) {
  const u = users.find(x => x.id === id);
  if (!u || !canManageUsers()) return;
  if (u.email === normEmail(state.user.email)) { toast('Você não pode remover o próprio acesso.', { type: 'danger' }); return; }
  if (!canEditUser(u)) { toast('Somente o administrador geral remove administradores.', { type: 'danger' }); return; }
  try {
    await API.call('/api/users/delete', { id });
  } catch (err) {
    const [, msg] = userFieldError(err);
    toast(msg, { type: 'danger' });
    return;
  }
  users = users.filter(x => x.id !== id);
  if (editingUserId === id) editingUserId = null;
  renderAll();
  toast(`Acesso de ${u.name.split(' ')[0]} removido.`, {
    type: 'danger',
    undo: () => {
      API.call('/api/users/restore', { id })
        .then(res => {
          users.push(res.user);
          users.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
          renderAll();
          toast(`Acesso de ${u.name.split(' ')[0]} restaurado.`);
        })
        .catch(saveFailed);
    }
  });
}

/* ═════════ Eventos ═════════ */
document.addEventListener('click', e => {
  const t = e.target;

  const nav = t.closest('[data-nav]');
  if (nav) { state.view = nav.dataset.nav; state.selected.clear(); renderAll(); return; }

  const goto = t.closest('[data-goto]');
  if (goto) { state.view = goto.dataset.goto; state.selected.clear(); renderAll(); return; }

  const unitBtn = t.closest('.unit-btn');
  if (unitBtn) { state.unit = unitBtn.dataset.unit; state.selected.clear(); renderAll(); return; }

  const monthBtn = t.closest('[data-month]');
  if (monthBtn) { state.bmonth = +monthBtn.dataset.month; renderBirthdays(); return; }

  const editBtn = t.closest('[data-edit]');
  if (editBtn) { e.stopPropagation(); openForm(editBtn.dataset.edit); return; }

  const delBtn = t.closest('[data-del]');
  if (delBtn) { e.stopPropagation(); deleteMembers([delBtn.dataset.del]); return; }

  const userDel = t.closest('[data-user-del]');
  if (userDel) { removeUser(userDel.dataset.userDel); return; }

  if (t.closest('[data-geral-pass]')) {
    editingGeral = true; editingUserId = null;
    renderUsers();
    setTimeout(() => { const el = $('#acc-pass'); if (el) el.focus(); }, 40);
    return;
  }

  const userEdit = t.closest('[data-user-edit]');
  if (userEdit) {
    editingGeral = false;
    editingUserId = userEdit.dataset.userEdit;
    renderUsers();
    setTimeout(() => { const el = $('#acc-name'); if (el) el.focus(); }, 40);
    return;
  }

  const userPass = t.closest('[data-user-pass]');
  if (userPass) {
    editingGeral = false;
    editingUserId = userPass.dataset.userPass;
    renderUsers();
    setTimeout(() => { const el = $('#acc-pass'); if (el) el.focus(); }, 40);
    return;
  }

  if (t.closest('[data-check]') || t.closest('#check-all')) return; // tratado no change

  const openRow = t.closest('[data-open]');
  if (openRow) { openDrawer(openRow.dataset.open); return; }

  const svApply = t.closest('[data-sv-apply]');
  if (svApply) {
    const v = state.savedViews.find(x => x.id === svApply.dataset.svApply);
    if (v) {
      Object.assign(state, { unit: v.unit, search: v.search, status: v.status, ministry: v.ministry, sort: v.sort });
      state.selected.clear();
      renderAll();
      toast(`Visão “${v.name}” aplicada.`, { type: 'info' });
    }
    return;
  }
  const svDel = t.closest('[data-sv-del]');
  if (svDel) {
    state.savedViews = state.savedViews.filter(x => x.id !== svDel.dataset.svDel);
    store.set('ami.savedViews', state.savedViews);
    renderSavedViewsMenu();
    return;
  }

  const action = t.closest('[data-action]')?.dataset.action;
  if (action === 'new-member') { openForm(); return; }
  const tplBtn = t.closest('[data-tpl]');
  if (tplBtn) {
    const input = $('#wa-msg');
    if (!input) return;
    const key = tplBtn.dataset.tpl;
    if (key === 'clear') { state.waMsg = ''; input.value = ''; }
    else {
      const tpl = WA_TEMPLATES[+key];
      if (tpl) { state.waMsg = tpl.text; input.value = tpl.text; }
    }
    renderWaGrid();
    input.focus();
    return;
  }
  if (action === 'export') { exportExcel(); return; }
  if (action === 'close-drawer') { closeDrawer(); return; }
  if (action === 'bulk-delete') { deleteMembers([...state.selected]); return; }
  if (action === 'bulk-clear') { state.selected.clear(); updateMemberList(); return; }
  if (action === 'clear-search') {
    state.search = ''; $('#member-search').value = '';
    $('.search-box').classList.remove('has-value'); updateMemberList(); return;
  }
  if (action === 'reset-filters') {
    Object.assign(state, { search: '', status: 'todos', ministry: 'todos' });
    renderMembers(); return;
  }
  if (action === 'open-saveview') { $('#savedviews-menu').hidden = true; openSaveViewPop(); return; }

  if (t.closest('#btn-savedviews')) {
    const menu = $('#savedviews-menu');
    menu.hidden = !menu.hidden;
    if (!menu.hidden) renderSavedViewsMenu();
    return;
  }
  if (!t.closest('.savedviews-wrap') && $('#savedviews-menu')) $('#savedviews-menu').hidden = true;
  if (!t.closest('#saveview-pop') && !t.closest('[data-action="open-saveview"]')) $('#saveview-pop').hidden = true;
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'filter-status') { state.status = t.value; state.selected.clear(); updateMemberList(); }
  else if (t.id === 'filter-ministry') { state.ministry = t.value; state.selected.clear(); updateMemberList(); }
  else if (t.id === 'sort-by') { state.sort = t.value; updateMemberList(); }
  else if (t.id === 'check-all') {
    const list = filteredMembers();
    if (t.checked) list.forEach(m => state.selected.add(m.id));
    else state.selected.clear();
    updateMemberList();
  }
  else if (t.dataset.check) {
    if (t.checked) state.selected.add(t.dataset.check);
    else state.selected.delete(t.dataset.check);
    updateMemberList();
  }
  else if (t.id === 'bulk-unit' && t.value) {
    const ids = [...state.selected];
    const dest = t.value;
    if (!myUnits().includes(dest)) { toast('Você não tem acesso a essa unidade.', { type: 'danger' }); return; }
    members.forEach(m => { if (ids.includes(m.id)) m.unit = dest; });
    const moved = members.filter(m => ids.includes(m.id));
    state.selected.clear(); renderAll();
    Promise.all(moved.map(syncMember)).then(results => {
      if (results.every(Boolean)) toast(`${ids.length} membro${ids.length > 1 ? 's' : ''} movido${ids.length > 1 ? 's' : ''} para ${UNITS[dest].label}.`);
      else refreshState(true);
    });
  }
  else if (t.id === 'bulk-status' && t.value) {
    const ids = [...state.selected];
    const st = t.value;
    members.forEach(m => { if (ids.includes(m.id)) m.status = st; });
    const changed = members.filter(m => ids.includes(m.id));
    state.selected.clear(); renderAll();
    Promise.all(changed.map(syncMember)).then(results => {
      if (results.every(Boolean)) toast(`Status de ${ids.length} membro${ids.length > 1 ? 's' : ''} alterado para “${STATUS[st].label}”.`);
      else refreshState(true);
    });
  }
});

document.addEventListener('input', e => {
  if (e.target.id === 'member-search') {
    state.search = e.target.value;
    $('.search-box').classList.toggle('has-value', !!state.search);
    updateMemberList();
    return;
  }
  if (e.target.id === 'wa-search') {
    state.waSearch = e.target.value;
    const box = $('#view-whatsapp .search-box');
    if (box) box.classList.toggle('has-value', !!state.waSearch);
    renderWaGrid();
    return;
  }
  if (e.target.id === 'wa-msg') {
    state.waMsg = e.target.value;
    renderWaGrid();
  }
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('#saveview-pop').hidden) { $('#saveview-pop').hidden = true; return; }
  if ($('#savedviews-menu') && !$('#savedviews-menu').hidden) { $('#savedviews-menu').hidden = true; return; }
  if (!$('#form-overlay').hidden) { closeForm(); return; }
  if (!$('#drawer').hidden) { closeDrawer(); return; }
});

/* ═════════ Login com e-mail e senha (validado no servidor) ═════════ */
function loginMessage(err) {
  switch (err.code) {
    case 'invalid_credentials': return 'E-mail ou senha incorretos.';
    case 'password_required': return 'Esta conta ainda não tem senha definida. Peça ao administrador para definir sua senha.';
    case 'no_units': return 'Seu acesso ainda não tem unidade liberada. Peça ao administrador para liberar AMI Pacheco e/ou AMI Amendoeira.';
    case 'rate_limited': return 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.';
    case 'already_initialized': return 'O primeiro acesso já foi configurado. Entre com o e-mail e a senha.';
    default: return 'Não foi possível entrar agora. Verifique a internet e tente novamente.';
  }
}

async function loginSubmit(e) {
  e.preventDefault();
  const email = normEmail($('#login-email').value);
  const pass = $('#login-pass').value;
  $('#login-error').hidden = true;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showLoginError('Informe um e-mail válido.'); return; }
  if (!pass) { showLoginError('Informe sua senha.'); return; }

  const btn = $('#btn-login');
  if (btn) btn.disabled = true;
  try {
    if (loginSetup && email === GENERAL_ADMIN.email) {
      if (pass.length < 6) { showLoginError('A senha precisa ter pelo menos 6 caracteres.'); return; }
      if (pass !== $('#login-pass2').value) { showLoginError('As senhas não conferem.'); return; }
      const data = await API.call('/api/setup', { password: pass });
      await afterLogin(data);
      setLoginSetup(false);
      $('#login-pass').value = ''; $('#login-pass2').value = '';
      return;
    }

    try {
      const data = await API.call('/api/login', { email, password: pass });
      await afterLogin(data);
      $('#login-pass').value = '';
    } catch (err) {
      if (err.code !== 'setup_required') throw err;
      if (email !== GENERAL_ADMIN.email) {
        showLoginError('Esta conta ainda não foi criada na nuvem. Peça ao administrador para cadastrá-la na tela Usuários.');
        return;
      }
      // Senha já usada neste navegador: cria a conta principal com a mesma senha.
      if (geralCred && hashPass(geralCred.salt, pass) === geralCred.hash) {
        const data = await API.call('/api/setup', { password: pass });
        await afterLogin(data);
        $('#login-pass').value = '';
        return;
      }
      setLoginSetup(true);
      showLoginError('Primeiro acesso: confirme a senha abaixo para criá-la.');
      $('#login-pass2').focus();
    }
  } catch (err) {
    showLoginError(loginMessage(err));
  } finally {
    if (btn) btn.disabled = false;
  }
}

/* ligações fixas */
$('#login-form').addEventListener('submit', loginSubmit);
$('#login-email').addEventListener('input', () => {
  if (loginSetup && normEmail($('#login-email').value) !== GENERAL_ADMIN.email) setLoginSetup(false);
});
$('#btn-new-top').addEventListener('click', () => openForm());
$('#btn-logout').addEventListener('click', signOut);
$('#form-close').addEventListener('click', closeForm);
$('#form-cancel').addEventListener('click', closeForm);
$('#member-form').addEventListener('submit', submitForm);
$('#form-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeForm(); });
$('#drawer-overlay').addEventListener('click', closeDrawer);
$('#saveview-cancel').addEventListener('click', () => { $('#saveview-pop').hidden = true; });
$('#saveview-confirm').addEventListener('click', confirmSaveView);
$('#saveview-name').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); confirmSaveView(); } });

/* ═════════ Início ═════════ */
async function boot() {
  spawnEmbers();
  renderVerse(true);
  setInterval(() => renderVerse(false), 60000);
  window.addEventListener('focus', () => renderVerse(false));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) renderVerse(false); });

  try {
    const data = await API.call('/api/state');
    applyState(data);
    showApp();
  } catch (err) {
    if (err.code === 'setup_required') {
      loginSetup = true;
      setLoginSetup(true);
      $('#login-email').value = GENERAL_ADMIN.email;
    } else if (err.code !== 'login_required') {
      showLoginError('Não foi possível falar com o servidor do app. Verifique a internet e recarregue a página.');
    }
    const last = store.get('ami.lastEmail', '');
    if (last && !$('#login-email').value) $('#login-email').value = last;
  }
}

boot();