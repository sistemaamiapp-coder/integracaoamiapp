// Sessões e limite de tentativas. O banco guarda só o resumo SHA-256 do token;
// o token em claro fica apenas no cookie HttpOnly do navegador.
import { AppError, rows } from './http.mjs';
import { newToken, sha256Hex } from './crypto.mjs';

export const SESSION_COOKIE = '__Host-ami_sess';
export const SESSION_TTL_MS = 400 * 24 * 60 * 60 * 1000;

export function sessionCookie(token, maxAgeSeconds) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function tokenFrom(request) {
  const header = request.headers.get('cookie') ?? '';
  if (!header || header.length > 8192) return null;
  const values = [];
  for (const part of header.split(';')) {
    const trimmed = part.trim();
    const at = trimmed.indexOf('=');
    if (at < 1) continue;
    if (trimmed.slice(0, at).trim() === SESSION_COOKIE) values.push(trimmed.slice(at + 1));
  }
  if (values.length !== 1) return null;
  return /^[A-Za-z0-9_-]{43}$/.test(values[0]) ? values[0] : null;
}

export async function createSession(db, userId, now = Date.now()) {
  const token = newToken();
  const digest = await sha256Hex(token);
  const created = rows(await db.from('ami_sessions').insertIfAbsent({
    token_digest: digest,
    user_id: userId,
    created_at: new Date(now).toISOString(),
    expires_at: new Date(now + SESSION_TTL_MS).toISOString(),
  }, { onConflict: 'token_digest' }).select('token_digest'));
  if (created.length !== 1) throw new AppError('session_unavailable', 503);
  return token;
}

export async function validateSession(db, request, now = Date.now()) {
  const token = tokenFrom(request);
  if (!token) return null;
  const digest = await sha256Hex(token);
  const found = rows(await db.from('ami_sessions')
    .select('token_digest,user_id,expires_at,revoked_at').eq('token_digest', digest).limit(1));
  if (found.length !== 1) return null;
  const row = found[0];
  if (row.revoked_at != null) return null;
  const expiresAt = Date.parse(row.expires_at);
  if (!Number.isFinite(expiresAt) || expiresAt <= now) return null;
  return { digest, userId: row.user_id };
}

export async function revokeSession(db, digest, now = Date.now()) {
  rows(await db.from('ami_sessions').update({ revoked_at: new Date(now).toISOString() })
    .eq('token_digest', digest).select('token_digest'));
}

export async function revokeUserSessions(db, userId, now = Date.now()) {
  rows(await db.from('ami_sessions').update({ revoked_at: new Date(now).toISOString() })
    .eq('user_id', userId).select('token_digest'));
}

const LIMIT = { maxAttempts: 10, windowMs: 15 * 60 * 1000 };
const ISO = (ms) => new Date(ms).toISOString();

// Janela fixa por conta, com atualização condicional para não perder contagem concorrente.
export async function consumeLoginAttempt(db, email, now = Date.now()) {
  const key = `login:${email}`;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const found = rows(await db.from('ami_login_limiter')
      .select('key,window_started_at,attempt_count').eq('key', key).limit(1));
    if (found.length === 0) {
      const inserted = rows(await db.from('ami_login_limiter').insertIfAbsent({
        key, window_started_at: ISO(now), attempt_count: 1,
      }, { onConflict: 'key' }).select('key'));
      if (inserted.length === 1) return { allowed: true };
      continue;
    }
    const row = found[0];
    const startedAt = Date.parse(row.window_started_at);
    const count = row.attempt_count;
    if (!Number.isFinite(startedAt) || !Number.isSafeInteger(count)) {
      throw new AppError('limiter_unavailable', 503);
    }
    if (now - startedAt >= LIMIT.windowMs) {
      const reset = rows(await db.from('ami_login_limiter')
        .update({ window_started_at: ISO(now), attempt_count: 1 })
        .eq('key', key).eq('window_started_at', row.window_started_at).select('key'));
      if (reset.length === 1) return { allowed: true };
      continue;
    }
    if (count >= LIMIT.maxAttempts) {
      return { allowed: false, retryAfterMs: Math.max(0, startedAt + LIMIT.windowMs - now) };
    }
    const incremented = rows(await db.from('ami_login_limiter')
      .update({ attempt_count: count + 1 })
      .eq('key', key).eq('window_started_at', row.window_started_at).eq('attempt_count', count)
      .select('key'));
    if (incremented.length === 1) return { allowed: true };
  }
  throw new AppError('limiter_busy', 503);
}
