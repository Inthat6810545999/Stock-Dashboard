const translations = new Map<string, {value: string; expires: number}>();

export async function POST(request: Request) {
  let description: unknown;
  try { const body: unknown = await request.json(); description = body && typeof body === 'object' && 'description' in body ? body.description : undefined; } catch { return Response.json({error: 'Invalid request'}, {status: 400}); }
  if (typeof description !== 'string' || !description.trim() || description.length > 1500) {
    return Response.json({error: 'Invalid description'}, {status: 400});
  }
  const original = description.trim();
  const cached = translations.get(original);
  if (cached && cached.expires > Date.now()) return Response.json({translation: cached.value});
  try {
    const url = new URL('https://translate.googleapis.com/translate_a/single');
    url.search = new URLSearchParams({client: 'gtx', sl: 'en', tl: 'th', dt: 't', q: original}).toString();
    const response = await fetch(url, {signal: AbortSignal.timeout(7000)});
    if (!response.ok) throw new Error('Translation unavailable');
    const result: unknown = await response.json();
    const segments = Array.isArray(result) ? result[0] : null;
    const translation = Array.isArray(segments) ? segments.map(segment => Array.isArray(segment) ? segment[0] : '').filter((part): part is string => typeof part === 'string').join('') : '';
    if (!translation || !/[\u0E00-\u0E7F]/.test(translation)) throw new Error('Translation unavailable');
    if (translations.size > 1000) translations.clear();
    translations.set(original, {value: translation, expires: Date.now() + 24 * 60 * 60 * 1000});
    return Response.json({translation});
  } catch {
    return Response.json({error: 'Translation unavailable'}, {status: 503});
  }
}
