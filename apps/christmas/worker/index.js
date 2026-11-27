const CHILDREN = new Set(['emma', 'sophie', 'adam']);
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic']);
const AUDIO_TYPES = new Set(['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg', 'audio/aac', 'audio/3gpp']);
const TZ = 'America/Detroit';

export function assetRequest(request) {
  const url = new URL(request.url);
  if (url.pathname === '/christmas/parent') {
    url.pathname = '/christmas/parent/';
    return { redirect: url.toString() };
  }
  if (url.pathname === '/christmas') {
    url.pathname = '/christmas/';
    return { redirect: url.toString() };
  }
  if (url.pathname.startsWith('/christmas/')) {
    url.pathname = url.pathname.slice('/christmas'.length) || '/';
  }
  if (url.pathname === '/parent/') url.pathname = '/parent/index.html';
  return { request: new Request(url, request) };
}

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}
function fail(message, status) { return response({ error: message }, status); }
function validChild(value) { return typeof value === 'string' && CHILDREN.has(value); }
function todayParts() {
  const parts = Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  return Object.fromEntries(parts.filter(p => p.type !== 'literal').map(p => [p.type, Number(p.value)]));
}
function validDiaryDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-(11|12)-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const max = m === 11 ? 30 : 25;
  if (d < 1 || d > max) return false;
  const now = todayParts();
  return s <= [now.year, String(now.month).padStart(2, '0'), String(now.day).padStart(2, '0')].join('-');
}
function familyAuthorized(request, env) {
  return !!env.CHRISTMAS_FAMILY_KEY && request.headers.get('X-Family-Key') === env.CHRISTMAS_FAMILY_KEY;
}
function parentAuthorized(request, env) {
  return !!env.CHRISTMAS_PARENT_KEY && request.headers.get('X-Parent-Key') === env.CHRISTMAS_PARENT_KEY;
}
async function safeJson(request) {
  try { return await request.json(); } catch { return null; }
}
function fileOk(file, allowed, maxBytes) {
  return file && typeof file.arrayBuffer === 'function' && allowed.has(file.type) && file.size > 0 && file.size <= maxBytes;
}
const mediaSuffix = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'audio/webm': 'webm', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/aac': 'aac', 'audio/3gpp': '3gp' };
async function api(request, env, pathname, url) {
  // The parent dashboard uses only its distinct parent key; no kid/app credential is needed.
  // Child API routes remain guarded by the existing family key.
  if (!env.DB) return fail('Family storage has not been configured yet.', 503);
  const path = pathname.slice('/api'.length);
  if (path.startsWith('/parent/')) {
    if (!parentAuthorized(request, env)) return fail('Parent key required or incorrect.', 403);
  } else {
    if (!env.CHRISTMAS_FAMILY_KEY) return fail('Family storage has not been configured yet.', 503);
    if (!familyAuthorized(request, env)) return fail('Family key required or incorrect.', 401);
  }
  if (request.method !== 'GET' && request.headers.get('Origin') && new URL(request.headers.get('Origin')).origin !== url.origin) {
    return fail('Invalid request origin.', 403);
  }
  const method = request.method;

  if (path === '/status' && method === 'GET') return response({ ready: true });

  // Parent-only check for changing a tablet's assigned child; no private data returned.
  if (path === '/parent/verify' && method === 'GET') return response({ ok: true });

  if (path === '/state' && method === 'GET') {
    const child = url.searchParams.get('child');
    if (!validChild(child)) return fail('Invalid child profile.', 400);
    const now = todayParts();
    const [wishes, completed, opened] = await Promise.all([
      env.DB.prepare('SELECT id, name, icon, favorite FROM wishes WHERE child = ? ORDER BY created_at DESC').bind(child).all(),
      env.DB.prepare('SELECT activity_id FROM activity_progress WHERE child = ?').bind(child).all(),
      env.DB.prepare('SELECT day FROM advent_openings WHERE child = ? AND year = ?').bind(child, now.year).all(),
    ]);
    return response({
      wishes: wishes.results.map(w => ({ ...w, favorite: Boolean(w.favorite) })),
      completed: completed.results.map(x => x.activity_id),
      opened: opened.results.map(x => x.day),
    });
  }

  // One self-assessed Naughty / Nice position per child and calendar year.
  // Both endpoints require the existing family key (enforced above).
  if (path === '/nice-meter' && method === 'GET') {
    const child = url.searchParams.get('child');
    if (!validChild(child)) return fail('Invalid child profile.', 400);
    const { year } = todayParts();
    const saved = await env.DB.prepare(
      'SELECT value, updated_at FROM naughty_nice_answers WHERE child = ? AND year = ?'
    ).bind(child, year).first();
    return response({ year, value: saved?.value ?? null, updatedAt: saved?.updated_at ?? null });
  }

  if (path === '/nice-meter' && method === 'POST') {
    const body = await safeJson(request);
    const { year } = todayParts();
    if (!validChild(body?.child) || !Number.isInteger(body?.year) || body.year !== year ||
      !Number.isInteger(body?.value) || body.value < 0 || body.value > 100) {
      return fail('Choose a position from 0 to 100 for this year.', 400);
    }
    await env.DB.prepare(
      'INSERT INTO naughty_nice_answers(child, year, value) VALUES (?, ?, ?) ' +
      'ON CONFLICT(child, year) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP'
    ).bind(body.child, year, body.value).run();
    return response({ year, value: body.value });
  }

  if (path === '/wishes' && method === 'POST') {
    const b = await safeJson(request);
    if (!validChild(b?.child) || typeof b?.name !== 'string' || !b.name.trim() || b.name.trim().length > 100 ||
        typeof b.icon !== 'string' || b.icon.length > 16) return fail('Invalid wish.', 400);
    const count = await env.DB.prepare('SELECT COUNT(*) AS total FROM wishes WHERE child = ?').bind(b.child).first();
    if (count.total >= 100) return fail('Wish list is full.', 409);
    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO wishes (id, child, name, icon, favorite, purchased) VALUES (?, ?, ?, ?, 0, 0)')
      .bind(id, b.child, b.name.trim(), b.icon).run();
    return response({ id }, 201);
  }

  const wishMatch = path.match(/^\/wishes\/([a-f0-9-]{36})$/);
  if (wishMatch && method === 'PATCH') {
    const b = await safeJson(request);
    if (!validChild(b?.child) || typeof b?.favorite !== 'boolean') return fail('Invalid update.', 400);
    const result = await env.DB.prepare('UPDATE wishes SET favorite = ? WHERE id = ? AND child = ?')
      .bind(b.favorite ? 1 : 0, wishMatch[1], b.child).run();
    return result.meta.changes ? response({ ok: true }) : fail('Wish not found.', 404);
  }
  if (wishMatch && method === 'DELETE') {
    const child = url.searchParams.get('child');
    if (!validChild(child)) return fail('Invalid child.', 400);
    const result = await env.DB.prepare('DELETE FROM wishes WHERE id = ? AND child = ?').bind(wishMatch[1], child).run();
    return result.meta.changes ? response({ ok: true }) : fail('Wish not found.', 404);
  }

  if (path === '/activities' && method === 'POST') {
    const b = await safeJson(request);
    if (!validChild(b?.child) || !Number.isInteger(b?.id) || b.id < 1 || b.id > 24 || typeof b.completed !== 'boolean') return fail('Invalid activity.', 400);
    if (b.completed) await env.DB.prepare('INSERT OR IGNORE INTO activity_progress(child, activity_id) VALUES (?, ?)').bind(b.child, b.id).run();
    else await env.DB.prepare('DELETE FROM activity_progress WHERE child = ? AND activity_id = ?').bind(b.child, b.id).run();
    return response({ ok: true });
  }

  if (path === '/advent' && method === 'POST') {
    const b = await safeJson(request);
    const now = todayParts();
    if (!validChild(b?.child) || !Number.isInteger(b?.day) || b.day < 1 || b.day > 24 ||
        now.month !== 12 || b.day > now.day) return fail('This surprise is not unlocked yet.', 400);
    await env.DB.prepare('INSERT OR IGNORE INTO advent_openings(child, year, day) VALUES (?, ?, ?)')
      .bind(b.child, now.year, b.day).run();
    return response({ ok: true });
  }

  if (path === '/diary' && method === 'GET') {
    const y = Number(url.searchParams.get('year'));
    const now = todayParts();
    if (!Number.isInteger(y) || y < 2026 || y > now.year) return fail('Invalid year.', 400);
    const rows = await env.DB.prepare('SELECT id, child, day, note, photo_key, audio_key FROM glitter_diary WHERE year = ? ORDER BY day DESC, child').bind(y).all();
    return response({ entries: rows.results.map(({ photo_key, audio_key, ...item }) => ({ ...item, hasPhoto: !!photo_key, hasAudio: !!audio_key })) });
  }

  if (path === '/diary' && method === 'POST') {
    if (!env.MEDIA) return fail('Glitter media storage has not been configured.', 503);
    if (!request.headers.get('content-type')?.includes('multipart/form-data')) return fail('Form upload required.', 400);
    // Bound the request; each file is validated separately below.
    if (Number(request.headers.get('content-length')) > 15000000) return fail('Upload is too large.', 413);
    let form;
    try { form = await request.formData(); } catch { return fail('Invalid upload.', 400); }
    const child = form.get('child');
    const day = form.get('day');
    const note = form.get('note');
    const photo = form.get('photo');
    const audio = form.get('audio');
    if (!validChild(child) || !validDiaryDate(day) || typeof note !== 'string' || note.length > 280)
      return fail('Invalid diary details.', 400);
    if (photo && !fileOk(photo, IMAGE_TYPES, 8000000)) return fail('Use a JPEG, PNG, WebP or HEIC photo under 8 MB.', 400);
    if (audio && !fileOk(audio, AUDIO_TYPES, 6000000)) return fail('Audio must be under 6 MB in a supported format.', 400);
    if (!photo && !audio && !note.trim()) return fail('Add a picture, voice message, or note.', 400);
    const year = Number(day.slice(0, 4));
    const old = await env.DB.prepare('SELECT * FROM glitter_diary WHERE child = ? AND day = ?').bind(child, day).first();
    const id = old?.id || crypto.randomUUID();
    const uploaded = [];
    let photoKey = old?.photo_key || null, audioKey = old?.audio_key || null;
    let photoType = old?.photo_type || null, audioType = old?.audio_type || null;
    try {
      for (const [kind, file] of [['photo', photo], ['audio', audio]]) {
        if (!file) continue;
        const key = 'glitter/' + year + '/' + day + '/' + child + '/' + crypto.randomUUID() + '.' + mediaSuffix[file.type];
        await env.MEDIA.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
        uploaded.push(key);
        if (kind === 'photo') { photoKey = key; photoType = file.type; }
        else { audioKey = key; audioType = file.type; }
      }
      await env.DB.prepare(
        'INSERT INTO glitter_diary(id, child, year, day, note, photo_key, photo_type, audio_key, audio_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ' +
        'ON CONFLICT(child, day) DO UPDATE SET note=excluded.note, photo_key=excluded.photo_key, photo_type=excluded.photo_type, audio_key=excluded.audio_key, audio_type=excluded.audio_type, updated_at=CURRENT_TIMESTAMP'
      ).bind(id, child, year, day, note.trim(), photoKey, photoType, audioKey, audioType).run();
    } catch (e) {
      await Promise.allSettled(uploaded.map(key => env.MEDIA.delete(key)));
      throw e;
    }
    await Promise.allSettled([old?.photo_key && old.photo_key !== photoKey ? env.MEDIA.delete(old.photo_key) : null,
      old?.audio_key && old.audio_key !== audioKey ? env.MEDIA.delete(old.audio_key) : null]);
    return response({ id }, old ? 200 : 201);
  }

  const mediaMatch = path.match(/^\/media\/([a-f0-9-]{36})\/(photo|audio)$/);
  if (mediaMatch && method === 'GET') {
    if (!env.MEDIA) return fail('Media storage not configured.', 503);
    const item = await env.DB.prepare('SELECT photo_key, audio_key, photo_type, audio_type FROM glitter_diary WHERE id = ?').bind(mediaMatch[1]).first();
    if (!item) return fail('Entry not found.', 404);
    const kind = mediaMatch[2];
    const key = kind === 'photo' ? item.photo_key : item.audio_key;
    const type = kind === 'photo' ? item.photo_type : item.audio_type;
    if (!key) return fail('Recording not found.', 404);
    const file = await env.MEDIA.get(key);
    if (!file) return fail('Recording not found.', 404);
    return new Response(file.body, { headers: { 'Content-Type': type || 'application/octet-stream', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  }


  // Parent dashboard can retrieve the same diary media without the child's APK credential.
  const parentMediaMatch = path.match(/^\/parent\/media\/([a-f0-9-]{36})\/(photo|audio)$/);
  if (parentMediaMatch && method === 'GET') {
    if (!env.MEDIA) return fail('Media storage not configured.', 503);
    const item = await env.DB.prepare('SELECT photo_key, audio_key, photo_type, audio_type FROM glitter_diary WHERE id = ?')
      .bind(parentMediaMatch[1]).first();
    if (!item) return fail('Diary entry not found.', 404);
    const kind = parentMediaMatch[2];
    const key = kind === 'photo' ? item.photo_key : item.audio_key;
    const type = kind === 'photo' ? item.photo_type : item.audio_type;
    if (!key) return fail('Media not found.', 404);
    const media = await env.MEDIA.get(key);
    if (!media) return fail('Media not found.', 404);
    return new Response(media.body, { headers: {
      'Content-Type': type || 'application/octet-stream',
      'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
    } });
  }

  if (path === '/parent/diary' && method === 'GET') {
    const year = Number(url.searchParams.get('year'));
    const now = todayParts();
    if (!Number.isInteger(year) || year < 2026 || year > now.year) return fail('Invalid year.', 400);
    const rows = await env.DB.prepare(
      'SELECT id, child, day, note, photo_key, audio_key FROM glitter_diary WHERE year = ? ORDER BY day DESC, child'
    ).bind(year).all();
    return response({ entries: rows.results.map(({ photo_key, audio_key, ...entry }) => ({
      ...entry, hasPhoto: Boolean(photo_key), hasAudio: Boolean(audio_key),
    })) });
  }

  if (path === '/parent/wishes' && method === 'GET') {
    if (!parentAuthorized(request, env)) return fail('Parent key required or incorrect.', 403);
    const rows = await env.DB.prepare('SELECT id, child, name, icon, favorite, purchased FROM wishes ORDER BY child, created_at DESC').all();
    return response({ wishes: rows.results.map(x => ({ ...x, favorite: Boolean(x.favorite), purchased: Boolean(x.purchased) })) });
  }
  const parentMatch = path.match(/^\/parent\/wishes\/([a-f0-9-]{36})$/);
  if (parentMatch && method === 'PATCH') {
    if (!parentAuthorized(request, env)) return fail('Parent key required or incorrect.', 403);
    const b = await safeJson(request);
    if (typeof b?.purchased !== 'boolean') return fail('Invalid update.', 400);
    const result = await env.DB.prepare('UPDATE wishes SET purchased = ? WHERE id = ?')
      .bind(b.purchased ? 1 : 0, parentMatch[1]).run();
    return result.meta.changes ? response({ ok: true }) : fail('Wish not found.', 404);
  }

  return fail('Not found.', 404);
}

export default {
  async fetch(request, env) {
    const routed = assetRequest(request);
    if (routed.redirect) return Response.redirect(routed.redirect, 308);
    const url = new URL(routed.request.url);
    if (url.pathname.startsWith('/api/')) {
      try { return await api(routed.request, env, url.pathname, url); }
      catch (error) { console.error('Christmas API failed:', error); return fail('Storage request failed. Please try again.', 500); }
    }
    return env.ASSETS.fetch(routed.request);
  },
};
