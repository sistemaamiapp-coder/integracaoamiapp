// API do app AMI Integração: login próprio, membros e contas compartilhados.
// A identidade vem SEMPRE da sessão do banco; nada de e-mail/unidade enviados pelo cliente.
import { AppError, applicationPath, errorJson, json, readJson, requireSameOrigin, rows } from './http.mjs';
import { hashPass, makeSalt, safeEqual } from './crypto.mjs';
import {
  SESSION_TTL_MS, clearSessionCookie, createSession, revokeSession, revokeUserSessions,
  sessionCookie, validateSession, consumeLoginAttempt,
} from './auth.mjs';

const GENERAL_EMAIL = 'werleyvenceslau17@gmail.com';
const GENERAL_NAME = 'Werley Venceslau';
const UNITS = ['pacheco', 'amendoeira'];
const STATUSES = ['ativo', 'integracao', 'visitante'];
const MINISTRIES = ['louvor', 'midia', 'recepcao', 'infantil', 'intercessao', 'diaconia', 'jovens', 'nenhum'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const SESSION_TTL_SECONDS = Math.floor(SESSION_TTL_MS / 1000);
const USER_COLUMNS = 'id,email,name,role,units,salt,pass_hash,added_at,added_by,deleted_at';
const MEMBER_COLUMNS = 'id,name,unit,status,ministry,birth,phone,email,baptized,peniel,wants_work,joined,address,notes,created_at,updated_at';

const normEmail = (v) => String(v || '').trim().toLowerCase();
const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const nowIso = () => new Date().toISOString();
const roleOf = (row) => (row.email === GENERAL_EMAIL ? 'geral' : row.role === 'admin' ? 'admin' : 'user');
const canManage = (row) => ['geral', 'admin'].includes(roleOf(row));

function unitsOfRow(row) {
  if (roleOf(row) === 'geral') return [...UNITS];
  let value = row.units;
  if (typeof value === 'string') {
    try { value = JSON.parse(value); } catch { value = []; }
  }
  return Array.isArray(value) ? value.filter((u) => UNITS.includes(u)) : [];
}

function canEditUser(actor, target) {
  const actorRole = roleOf(actor);
  if (actorRole === 'geral') return true;
  if (actorRole !== 'admin') return actor.id === target.id;
  return roleOf(target) === 'user' || target.id === actor.id;
}

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: roleOf(row),
    units: unitsOfRow(row),
    addedAt: row.added_at,
    addedBy: row.added_by || '',
    hasPass: !!row.pass_hash,
  };
}

function isoOrEmpty(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : '';
}

function publicMember(row) {
  return {
    id: row.id,
    name: row.name,
    unit: row.unit,
    status: row.status,
    ministry: row.ministry,
    birth: row.birth || '',
    phone: row.phone || '',
    email: row.email || '',
    baptized: !!row.baptized,
    peniel: !!row.peniel,
    wantsWork: !!row.wants_work,
    joined: row.joined || '',
    address: row.address || '',
    notes: row.notes || '',
    createdAt: isoOrEmpty(row.created_at),
  };
}

function validPassword(raw) {
  if (typeof raw !== 'string' || raw.length < 6 || raw.length > 128) throw new AppError('weak_password', 400);
  return raw;
}

function readUnits(input, actor) {
  const allowed = unitsOfRow(actor);
  const picked = Array.isArray(input) ? input.filter((u) => allowed.includes(u)) : [];
  return [...new Set(picked)];
}

function readMember(body, actor) {
  const source = body?.member;
  if (!source || typeof source !== 'object') throw new AppError('invalid_input', 400);
  const id = text(source.id, 64);
  if (!ID_RE.test(id)) throw new AppError('invalid_input', 400);
  const name = text(source.name, 80);
  if (!name) throw new AppError('invalid_input', 400);
  const unit = text(source.unit, 20);
  if (!unitsOfRow(actor).includes(unit)) throw new AppError('unit_forbidden', 403);
  const status = STATUSES.includes(source.status) ? source.status : 'ativo';
  const ministry = MINISTRIES.includes(source.ministry) ? source.ministry : 'nenhum';
  const birth = DATE_RE.test(source.birth || '') ? source.birth : '';
  const joined = DATE_RE.test(source.joined || '') ? source.joined : '';
  const email = text(source.email, 120);
  if (email && !EMAIL_RE.test(email)) throw new AppError('invalid_input', 400);
  return {
    id,
    name,
    unit,
    status,
    ministry,
    birth,
    phone: text(source.phone, 20),
    email,
    baptized: source.baptized === true,
    peniel: source.peniel === true,
    wants_work: source.wantsWork === true,
    joined,
    address: text(source.address, 120),
    notes: text(source.notes, 500),
  };
}

async function userBySession(db, request) {
  const session = await validateSession(db, request);
  if (!session) return null;
  const found = rows(await db.from('ami_users').select(USER_COLUMNS).eq('id', session.userId).limit(1));
  if (!found.length || found[0].deleted_at) return null;
  return { row: found[0], session };
}

async function setupRequired(db) {
  const found = rows(await db.from('ami_users').select('pass_hash').eq('email', GENERAL_EMAIL).limit(1));
  return !found.length || !found[0].pass_hash;
}

async function stateFor(db, actor) {
  const visibleUnits = unitsOfRow(actor);
  const manage = canManage(actor);

  let users = [];
  if (manage) {
    const all = rows(await db.from('ami_users').select(USER_COLUMNS));
    users = all
      .filter((row) => !row.deleted_at && row.email !== GENERAL_EMAIL)
      .map(publicUser);
  }

  const allMembers = rows(await db.from('ami_members').select(MEMBER_COLUMNS));
  const members = allMembers
    .filter((row) => visibleUnits.includes(row.unit))
    .map(publicMember)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return { user: publicUser(actor), users, members };
}

async function issueSession(db, row) {
  const token = await createSession(db, row.id);
  return json(await stateFor(db, row), 200, { 'set-cookie': sessionCookie(token, SESSION_TTL_SECONDS) });
}

async function login(db, request) {
  const body = await readJson(request);
  const email = normEmail(body?.email);
  if (!EMAIL_RE.test(email)) throw new AppError('invalid_input', 400);
  const password = typeof body?.password === 'string' ? body.password.slice(0, 128) : '';
  if (!password) throw new AppError('invalid_input', 400);

  const limit = await consumeLoginAttempt(db, email);
  if (!limit.allowed) {
    return errorJson('rate_limited', 429, { 'retry-after': String(Math.max(1, Math.ceil(limit.retryAfterMs / 1000))) });
  }

  const found = rows(await db.from('ami_users').select(USER_COLUMNS).eq('email', email).limit(1));
  const row = found.find((u) => !u.deleted_at);
  if (!row) {
    await hashPass('0000000000000000', password);
    return errorJson('invalid_credentials', 401);
  }
  if (!row.pass_hash) {
    return errorJson(row.email === GENERAL_EMAIL ? 'setup_required' : 'password_required', 401);
  }
  if (!safeEqual(await hashPass(row.salt, password), row.pass_hash)) {
    return errorJson('invalid_credentials', 401);
  }
  if (!unitsOfRow(row).length) return errorJson('no_units', 403);
  return issueSession(db, row);
}

async function setup(db, request) {
  const body = await readJson(request);
  const password = validPassword(body?.password);
  const found = rows(await db.from('ami_users').select('id,pass_hash').eq('email', GENERAL_EMAIL).limit(1));
  if (found.length && found[0].pass_hash) return errorJson('already_initialized', 409);

  const salt = makeSalt();
  const passHash = await hashPass(salt, password);
  let id;
  if (found.length) {
    id = found[0].id;
    const updated = rows(await db.from('ami_users')
      .update({ salt, pass_hash: passHash }).eq('id', id).select('id'));
    if (!updated.length) throw new AppError('write_conflict', 409);
  } else {
    id = crypto.randomUUID();
    const created = rows(await db.from('ami_users').insert({
      id,
      email: GENERAL_EMAIL,
      name: GENERAL_NAME,
      role: 'geral',
      units: UNITS,
      salt,
      pass_hash: passHash,
      added_at: nowIso(),
      added_by: 'primeiro acesso',
    }).select('id'));
    if (!created.length) return errorJson('already_initialized', 409);
  }
  const row = rows(await db.from('ami_users').select(USER_COLUMNS).eq('id', id).limit(1))[0];
  return issueSession(db, row);
}

async function logout(db, request) {
  const session = await validateSession(db, request);
  if (session) await revokeSession(db, session.digest);
  return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() });
}

async function createUser(db, actor, request) {
  const body = await readJson(request);
  const name = text(body?.name, 80);
  const email = normEmail(body?.email);
  if (!name) return errorJson('invalid_name', 400);
  if (!EMAIL_RE.test(email) || email === GENERAL_EMAIL) return errorJson('invalid_email', 400);
  const role = roleOf(actor) === 'geral' && body?.role === 'admin' ? 'admin' : 'user';
  const units = readUnits(body?.units, actor);
  if (!units.length) return errorJson('units_required', 400);
  const password = validPassword(body?.password);

  const existing = rows(await db.from('ami_users').select('id,deleted_at').eq('email', email).limit(1));
  if (existing.length) return errorJson('email_taken', 409);

  const salt = makeSalt();
  const created = rows(await db.from('ami_users').insert({
    id: crypto.randomUUID(),
    email,
    name,
    role,
    units,
    salt,
    pass_hash: await hashPass(salt, password),
    added_at: nowIso(),
    added_by: actor.name,
  }).select(USER_COLUMNS));
  if (!created.length) return errorJson('user_unconfirmed', 503);
  return json({ user: publicUser(created[0]) }, 201);
}

async function updateUser(db, actor, request) {
  const body = await readJson(request);
  const id = text(body?.id, 64);
  const found = rows(await db.from('ami_users').select(USER_COLUMNS).eq('id', id).limit(1));
  const target = found[0];
  if (!target || target.deleted_at) return errorJson('not_found', 404);
  if (!canEditUser(actor, target)) return errorJson('forbidden', 403);
  if (roleOf(target) === 'geral' && target.id !== actor.id) return errorJson('general_protected', 403);

  const isGeneralSelf = roleOf(target) === 'geral';
  const patch = {};
  if (!isGeneralSelf) {
    const name = text(body?.name, 80);
    if (!name) return errorJson('invalid_name', 400);
    patch.name = name;
    if (roleOf(actor) === 'geral') {
      const email = normEmail(body?.email);
      if (!EMAIL_RE.test(email) || email === GENERAL_EMAIL) return errorJson('invalid_email', 400);
      if (email !== target.email) {
        const clash = rows(await db.from('ami_users').select('id').eq('email', email).limit(1));
        if (clash.length) return errorJson('email_taken', 409);
        patch.email = email;
      }
      if (text(body?.role, 20) !== roleOf(target)) patch.role = body.role === 'admin' ? 'admin' : 'user';
    }
    const grantable = unitsOfRow(actor);
    const kept = unitsOfRow(target).filter((u) => !grantable.includes(u));
    const units = [...new Set([...kept, ...readUnits(body?.units, actor)])];
    if (!units.length) return errorJson('units_required', 400);
    patch.units = units;
  }
  if (typeof body?.password === 'string' && body.password.length) {
    const password = validPassword(body.password);
    patch.salt = makeSalt();
    patch.pass_hash = await hashPass(patch.salt, password);
  }
  if (!Object.keys(patch).length) throw new AppError('invalid_input', 400);

  const updated = rows(await db.from('ami_users').update(patch).eq('id', target.id).select(USER_COLUMNS));
  if (!updated.length) throw new AppError('write_conflict', 409);
  if (patch.pass_hash) await revokeUserSessions(db, target.id).catch(() => {});
  return json({ user: publicUser(updated[0]) });
}

async function deleteUser(db, actor, request) {
  const body = await readJson(request);
  const id = text(body?.id, 64);
  const found = rows(await db.from('ami_users').select(USER_COLUMNS).eq('id', id).limit(1));
  const target = found[0];
  if (!target || target.deleted_at) return errorJson('not_found', 404);
  if (target.id === actor.id) return errorJson('cannot_remove_self', 400);
  if (roleOf(target) === 'geral') return errorJson('general_protected', 403);
  if (!canEditUser(actor, target)) return errorJson('forbidden', 403);

  const updated = rows(await db.from('ami_users')
    .update({ deleted_at: nowIso() }).eq('id', target.id).select('id'));
  if (!updated.length) throw new AppError('write_conflict', 409);
  await revokeUserSessions(db, target.id).catch(() => {});
  return json({ ok: true });
}

async function restoreUser(db, actor, request) {
  const body = await readJson(request);
  const id = text(body?.id, 64);
  const found = rows(await db.from('ami_users').select(USER_COLUMNS).eq('id', id).limit(1));
  const target = found[0];
  if (!target) return errorJson('not_found', 404);
  if (!canEditUser(actor, target)) return errorJson('forbidden', 403);
  const updated = rows(await db.from('ami_users')
    .update({ deleted_at: null }).eq('id', target.id).select(USER_COLUMNS));
  if (!updated.length) throw new AppError('write_conflict', 409);
  return json({ user: publicUser(updated[0]) });
}

async function changeOwnPassword(db, actor, request) {
  const body = await readJson(request);
  const password = validPassword(body?.password);
  const salt = makeSalt();
  const updated = rows(await db.from('ami_users')
    .update({ salt, pass_hash: await hashPass(salt, password) }).eq('id', actor.id).select('id'));
  if (!updated.length) throw new AppError('write_conflict', 409);
  return json({ ok: true });
}

async function upsertMember(db, actor, request) {
  const body = await readJson(request);
  const member = readMember(body, actor);
  const existing = rows(await db.from('ami_members').select('id,unit').eq('id', member.id).limit(1));

  if (existing.length) {
    if (!unitsOfRow(actor).includes(existing[0].unit)) return errorJson('unit_forbidden', 403);
    const updated = rows(await db.from('ami_members')
      .update({ ...member, updated_at: nowIso() }).eq('id', member.id).select(MEMBER_COLUMNS));
    if (!updated.length) throw new AppError('write_conflict', 409);
    return json({ member: publicMember(updated[0]) });
  }

  const created = rows(await db.from('ami_members').insert({
    ...member,
    created_at: nowIso(),
    updated_at: nowIso(),
  }).select(MEMBER_COLUMNS));
  if (!created.length) return errorJson('member_unconfirmed', 503);
  return json({ member: publicMember(created[0]) }, 201);
}

async function deleteMembers(db, actor, request) {
  const body = await readJson(request);
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id) => ID_RE.test(String(id))).slice(0, 200) : [];
  if (!ids.length) throw new AppError('invalid_input', 400);
  let deleted = 0;
  for (const id of ids) {
    const found = rows(await db.from('ami_members').select('id,unit').eq('id', id).limit(1));
    if (!found.length) continue;
    if (!unitsOfRow(actor).includes(found[0].unit)) continue;
    const result = rows(await db.from('ami_members').delete().eq('id', id).select('id'));
    if (result.length) deleted += 1;
  }
  return json({ deleted });
}

// Migração única dos dados que já existiam no navegador (somente administrador geral e banco vazio).
async function importLegacy(db, actor, request) {
  if (roleOf(actor) !== 'geral') return errorJson('forbidden', 403);
  const existing = rows(await db.from('ami_members').select('id').limit(1));
  if (existing.length) return json({ members: 0, users: 0, alreadyInitialized: true });

  const body = await readJson(request);
  const legacyMembers = Array.isArray(body?.members) ? body.members.slice(0, 500) : [];
  const legacyUsers = Array.isArray(body?.users) ? body.users.slice(0, 100) : [];
  const generalCred = body?.geral && typeof body.geral === 'object' ? body.geral : null;

  let members = 0;
  if (legacyMembers.length) {
    const payload = [];
    for (const item of legacyMembers) {
      try { payload.push(readMember({ member: item }, actor)); } catch { /* linha inválida é ignorada */ }
    }
    if (payload.length) {
      const created = rows(await db.from('ami_members').insert(payload.map((m) => ({
        ...m, created_at: nowIso(), updated_at: nowIso(),
      }))).select('id'));
      members = created.length;
    }
  }

  let users = 0;
  for (const item of legacyUsers) {
    const email = normEmail(item?.email);
    const salt = String(item?.salt || '');
    const hash = String(item?.hash || '');
    if (!EMAIL_RE.test(email) || email === GENERAL_EMAIL) continue;
    if (!/^[0-9a-f]{16}$/.test(salt) || !/^[0-9a-f]{64}$/.test(hash)) continue;
    const found = rows(await db.from('ami_users').select('id').eq('email', email).limit(1));
    if (found.length) continue;
    const units = (Array.isArray(item.units) ? item.units : UNITS).filter((u) => UNITS.includes(u));
    if (!units.length) continue;
    const created = rows(await db.from('ami_users').insert({
      id: typeof item.id === 'string' && ID_RE.test(item.id) ? item.id : crypto.randomUUID(),
      email,
      name: text(item.name, 80) || email,
      role: item.role === 'admin' ? 'admin' : 'user',
      units,
      salt,
      pass_hash: hash,
      added_at: item.addedAt && Number.isFinite(Date.parse(item.addedAt)) ? new Date(item.addedAt).toISOString() : nowIso(),
      added_by: text(item.addedBy, 80) || 'migração',
    }).select('id'));
    if (created.length) users += 1;
  }

  if (generalCred && !actor.pass_hash) {
    const salt = String(generalCred.salt || '');
    const hash = String(generalCred.hash || '');
    if (/^[0-9a-f]{16}$/.test(salt) && /^[0-9a-f]{64}$/.test(hash)) {
      rows(await db.from('ami_users').update({ salt, pass_hash: hash }).eq('id', actor.id).select('id'));
    }
  }
  return json({ members, users });
}

export function createApplication({ db }) {
  return async function handle(ctx) {
    const request = ctx.request;
    try {
      requireSameOrigin(request);
      const path = applicationPath(request);

      if (path === '/api/health' && request.method === 'GET') return json({ ok: true });
      if (path === '/api/login' && request.method === 'POST') return await login(db, request);
      if (path === '/api/setup' && request.method === 'POST') return await setup(db, request);
      if (path === '/api/logout' && request.method === 'POST') return await logout(db, request);

      if (path === '/api/state' && request.method === 'GET') {
        const actor = await userBySession(db, request);
        if (!actor) return errorJson((await setupRequired(db)) ? 'setup_required' : 'login_required', 401);
        return json(await stateFor(db, actor.row));
      }

      const actor = await userBySession(db, request);
      if (!actor) return errorJson('login_required', 401);
      const me = actor.row;

      if (path === '/api/me/password' && request.method === 'POST') return await changeOwnPassword(db, me, request);
      if (path === '/api/members' && request.method === 'POST') return await upsertMember(db, me, request);
      if (path === '/api/members/delete' && request.method === 'POST') return await deleteMembers(db, me, request);
      if (path === '/api/import' && request.method === 'POST') return await importLegacy(db, me, request);

      if (path === '/api/users' && request.method === 'POST') {
        if (!canManage(me)) return errorJson('forbidden', 403);
        return await createUser(db, me, request);
      }
      if (path === '/api/users/update' && request.method === 'POST') {
        if (!canManage(me)) return errorJson('forbidden', 403);
        return await updateUser(db, me, request);
      }
      if (path === '/api/users/delete' && request.method === 'POST') {
        if (!canManage(me)) return errorJson('forbidden', 403);
        return await deleteUser(db, me, request);
      }
      if (path === '/api/users/restore' && request.method === 'POST') {
        if (!canManage(me)) return errorJson('forbidden', 403);
        return await restoreUser(db, me, request);
      }

      throw new AppError('not_found', 404);
    } catch (error) {
      if (error instanceof AppError) return errorJson(error.code, error.status);
      return errorJson('service_unavailable', 503);
    }
  };
}
