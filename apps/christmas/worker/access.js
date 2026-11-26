// Server-side verification protects family photos, voice recordings, and wish lists.
// Never trust Cloudflare Access identity headers without checking the JWT signature.
const certCache = new Map();
const MAX_TOKEN_LENGTH = 16000;
const MAX_CERT_AGE_MS = 5 * 60 * 1000;

function bytesFromBase64Url(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid token encoding');
  const raw = atob(value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '='));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}
function readJsonPart(encoded) {
  return JSON.parse(new TextDecoder().decode(bytesFromBase64Url(encoded)));
}
function accessToken(request) {
  const assertion = request.headers.get('Cf-Access-Jwt-Assertion');
  if (assertion) return assertion;
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)CF_Authorization=([^;]+)/);
  return match ? match[1] : null;
}
async function signingKeys(teamDomain, refresh = false) {
  const existing = certCache.get(teamDomain);
  if (!refresh && existing && existing.until > Date.now()) return existing.keys;
  const res = await fetch('https://' + teamDomain + '/cdn-cgi/access/certs', { redirect: 'error' });
  if (!res.ok) throw new Error('Unable to fetch Cloudflare Access signing certificates');
  const body = await res.json();
  if (!Array.isArray(body.keys)) throw new Error('Invalid Cloudflare Access certificates');
  const keys = body.keys.filter(k => k.kty === 'RSA' && k.kid && k.n && k.e);
  certCache.set(teamDomain, { keys, until: Date.now() + MAX_CERT_AGE_MS });
  return keys;
}
export async function accessAuthorized(request, env) {
  const domain = typeof env.CHRISTMAS_ACCESS_TEAM_DOMAIN === 'string'
    ? env.CHRISTMAS_ACCESS_TEAM_DOMAIN.trim().replace(/^https:\/\//, '').replace(/\/$/, '') : '';
  const audience = env.CHRISTMAS_ACCESS_AUD;
  // Only permit Cloudflare's Access issuer to provide signing keys.
  if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(domain) ||
    typeof audience !== 'string' || !/^[A-Za-z0-9_-]{10,128}$/.test(audience)) return false;

  const token = accessToken(request);
  if (!token || token.length > MAX_TOKEN_LENGTH) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [first, second, signature] = parts;
    const header = readJsonPart(first);
    const payload = readJsonPart(second);
    const now = Math.floor(Date.now() / 1000);
    if (header.alg !== 'RS256' || typeof header.kid !== 'string' ||
      payload.iss !== 'https://' + domain || !Array.isArray(payload.aud) ||
      !payload.aud.includes(audience) || !Number.isFinite(payload.exp) ||
      payload.exp <= now || payload.nbf && payload.nbf > now ||
      payload.iat && payload.iat > now + 60) return false;
    let keys = await signingKeys(domain);
    let jwk = keys.find(key => key.kid === header.kid);
    if (!jwk) {
      keys = await signingKeys(domain, true); // Cloudflare may have rotated the signing key.
      jwk = keys.find(key => key.kid === header.kid);
    }
    if (!jwk) return false;
    const publicKey = await crypto.subtle.importKey('jwk', jwk, {
      name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256',
    }, false, ['verify']);
    return await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5', publicKey, bytesFromBase64Url(signature),
      new TextEncoder().encode(first + '.' + second)
    );
  } catch {
    return false;
  }
}
