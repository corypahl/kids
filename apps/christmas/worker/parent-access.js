// Validate Cloudflare Access application assertions at the actual Christmas Worker.
// Access authentication on the public gateway does NOT propagate ctx.access through
// a Workers Service Binding. Never trust a raw email or a browser-supplied header.
const certCache = new Map();
const CERT_TTL_MS = 5 * 60 * 1000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function decodeBase64Url(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid encoding');
  const encoded = value.replaceAll('-', '+').replaceAll('_', '/');
  const raw = atob(encoded + '='.repeat((4 - encoded.length % 4) % 4));
  return Uint8Array.from(raw, character => character.charCodeAt(0));
}

function jsonPart(value) {
  return JSON.parse(decoder.decode(decodeBase64Url(value)));
}

function settings(env) {
  const domain = (env.CHRISTMAS_PARENT_ACCESS_TEAM_DOMAIN || '').trim().toLowerCase();
  const aud = (env.CHRISTMAS_PARENT_ACCESS_AUD || '').trim();
  const emails = (env.CHRISTMAS_PARENT_ALLOWED_EMAILS || '').split(',')
    .map(email => email.trim().toLowerCase()).filter(Boolean);
  // Only allow Cloudflare's trusted Access certificate hostname.
  if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(domain) || !aud || emails.length === 0) return null;
  return { domain, aud, emails };
}

async function certificates(domain, kid, fetcher) {
  const cached = certCache.get(domain);
  if (cached && cached.expires > Date.now() && cached.keys.some(key => key.kid === kid)) return cached.keys;
  const response = await fetcher('https://' + domain + '/cdn-cgi/access/certs', {
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return [];
  const document = await response.json();
  const keys = Array.isArray(document.keys) ? document.keys.filter(key => key.kty === 'RSA' && key.kid) : [];
  certCache.set(domain, { keys, expires: Date.now() + CERT_TTL_MS });
  return keys;
}

/**
 * Returns a verified email or null. Fail closed if configuration, signature,
 * issuer, audience, expiry, Access token type or exact email allowlist differs.
 *
 * fetcher is injectable solely to test verification against a generated keypair.
 */
export async function verifiedParentEmail(request, env, fetcher = fetch) {
  const config = settings(env);
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!config || !jwt || jwt.length > 12000) return null;
  const parts = jwt.split('.');
  if (parts.length !== 3) return null;
  try {
    const header = jsonPart(parts[0]);
    const payload = jsonPart(parts[1]);
    const now = Math.floor(Date.now() / 1000);
    if (header.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid
      || payload.iss !== 'https://' + config.domain
      || (payload.type !== 'app')
      || !Array.isArray(payload.aud) || !payload.aud.includes(config.aud)
      || !Number.isInteger(payload.exp) || payload.exp <= now
      || (payload.nbf !== undefined && (!Number.isInteger(payload.nbf) || payload.nbf > now))
      || (payload.iat !== undefined && (!Number.isInteger(payload.iat) || payload.iat > now + 60))
      || typeof payload.email !== 'string' || !config.emails.includes(payload.email.toLowerCase())) return null;
    const keys = await certificates(config.domain, header.kid, fetcher);
    const jwk = keys.find(key => key.kid === header.kid && key.kty === 'RSA' && (key.use === undefined || key.use === 'sig'));
    if (!jwk) return null;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decodeBase64Url(parts[2]), encoder.encode(parts[0] + '.' + parts[1]));
    return valid ? payload.email.toLowerCase() : null;
  } catch {
    return null;
  }
}

export function parentAccessConfigured(env) {
  return settings(env) !== null;
}
