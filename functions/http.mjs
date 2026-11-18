// Utilitários HTTP da função: erros estáveis, JSON limitado e checagem de origem.
export const BODY_LIMIT_BYTES = 1_000_000;

export class AppError extends Error {
  constructor(code, status) {
    super(code);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
  }
}

const NO_STORE = { 'cache-control': 'private, no-store', 'referrer-policy': 'no-referrer' };

export function json(value, status = 200, extra = {}) {
  return Response.json(value, { status, headers: { ...NO_STORE, ...extra } });
}

export function errorJson(code, status, extra = {}) {
  return json({ error: code }, status, extra);
}

// O gateway troca o segmento app pelo nome físico; o provedor pode remover /functions/v1.
export function applicationPath(request) {
  const match = new URL(request.url).pathname.match(/^\/(?:functions\/v1\/)?(?:app|app-d[0-9a-f]{32})(\/.*)?$/);
  if (!match) throw new AppError('not_found', 404);
  return match[1] || '/';
}

// Mesma origem obrigatória para métodos que alteram dados (somado ao cookie SameSite=Lax).
// Na hospedagem, request.url é a URL interna do gateway; por isso a origem pública
// do site precisa estar na lista (o navegador envia sempre o endereço público).
const ALLOWED_ORIGINS = new Set([
  'https://ami-integracao-f04w9wpuzyz.qoder.website',
  'http://localhost:8124',
  'http://127.0.0.1:8124',
]);

export function requireSameOrigin(request) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return;
  const origin = request.headers.get('origin');
  if (!origin) return;
  let expected;
  try { expected = new URL(request.url).origin; } catch { throw new AppError('invalid_origin', 403); }
  if (origin !== expected && !ALLOWED_ORIGINS.has(origin)) throw new AppError('origin_forbidden', 403);
}

export async function readJson(request, maxBytes = BODY_LIMIT_BYTES) {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
    throw new AppError('invalid_input', 400);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new AppError('invalid_input', 400);
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maxBytes) {
        await reader.cancel();
        throw new AppError('payload_too_large', 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw new AppError('invalid_input', 400);
  }
}

// Erros do banco viram um código estável; detalhes do provedor nunca saem da função.
export function rows(result) {
  if (result?.error || !Array.isArray(result?.data)) throw new AppError('database_unavailable', 503);
  return result.data;
}
