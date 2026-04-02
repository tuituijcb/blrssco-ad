/**
 * Games Guard Worker
 * - Blocks unauthorized iframe embedding of games.blrssco.com
 * - Shows a branded "Play" button page for blocked sites
 * - Passes through for allowed domains and direct access
 */

const BLOCK_PAGE_HTML = (redirectUrl) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Play on BLRSSCO</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #fff;
  }
  .container {
    text-align: center;
    padding: 2rem;
  }
  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  @media (max-height: 300px) {
    .icon { display: none; }
  }
  h1 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #f1f5f9;
  }
  p {
    color: #94a3b8;
    margin-bottom: 2rem;
    font-size: 0.95rem;
  }
  .play-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 2rem;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: #fff;
    text-decoration: none;
    border-radius: 9999px;
    font-size: 1.1rem;
    font-weight: 600;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
  }
  .play-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
  }
  .play-btn svg {
    width: 1.25rem;
    height: 1.25rem;
    fill: currentColor;
  }
</style>
</head>
<body>
<div class="container">
  <div class="icon">🎮</div>
  <h1>This game is hosted on BLRSSCO</h1>
  <p>Play it for free on our website</p>
  <a class="play-btn" href="${redirectUrl}" target="_top">
    <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
    Play Now
  </a>
</div>
</body>
</html>`;

function isAllowedSource(sourceHost, allowedDomains) {
  if (sourceHost === 'games.blrssco.com') return true;
  return allowedDomains.some(d => sourceHost === d || sourceHost.endsWith('.' + d));
}

function getSourceHost(referer, origin) {
  const sourceUrl = referer || origin;
  if (!sourceUrl) return null;
  try {
    return new URL(sourceUrl).hostname;
  } catch {
    return null;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const referer = request.headers.get('Referer') || '';
    const origin = request.headers.get('Origin') || '';
    const secFetchDest = request.headers.get('Sec-Fetch-Dest') || '';

    const allowedDomains = (env.ALLOWED_DOMAINS || '').split(',').map(d => d.trim());
    const redirectUrl = env.REDIRECT_URL || 'https://blrssco.com';

    const sourceHost = getSourceHost(referer, origin);
    const isIframe = secFetchDest === 'iframe';
    const isSubResource = ['script', 'style', 'image', 'font', 'audio', 'video', 'manifest', 'worker', 'sharedworker'].includes(secFetchDest);

    // Decision logic:
    // 1. Sub-resources (JS/CSS/images) from the game itself → always allow
    // 2. Has Referer from allowed domain → allow
    // 3. Has Referer from blocked domain → BLOCK (show Play button)
    // 4. No Referer + Sec-Fetch-Dest: iframe → BLOCK (iframe with stripped referer)
    // 5. No Referer + not iframe (direct access) → allow

    let shouldBlock = false;

    if (isSubResource && sourceHost) {
      // Case 1a: sub-resource with referer → check if allowed
      shouldBlock = !isAllowedSource(sourceHost, allowedDomains);
    } else if (isSubResource) {
      // Case 1b: sub-resource without referer → allow (same-origin or direct)
      shouldBlock = false;
    } else if (sourceHost) {
      // Case 2 & 3: has referer
      shouldBlock = !isAllowedSource(sourceHost, allowedDomains);
    } else if (isIframe) {
      // Case 4: no referer but detected as iframe → block
      shouldBlock = true;
    }
    // Case 5: no referer, not iframe → direct access, allow (shouldBlock stays false)

    if (shouldBlock) {
      return new Response(BLOCK_PAGE_HTML(redirectUrl), {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    }

    // Serve from R2 with directory index support
    let key = decodeURIComponent(url.pathname.slice(1));

    const keysToTry = [key];
    if (!key || key === '') {
      keysToTry.length = 0;
      keysToTry.push('index.html');
    } else if (key.endsWith('/')) {
      keysToTry.push(key + 'index.html');
    } else if (!key.includes('.')) {
      keysToTry.push(key + '/index.html');
      keysToTry.push(key + '.html');
    }

    let object = null;
    for (const k of keysToTry) {
      object = await env.GAMES_BUCKET.get(k);
      if (object) break;
    }

    if (!object) {
      return new Response('Not Found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('ETag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=86400');

    // CSP defense-in-depth: even if detection fails, browser enforces frame-ancestors
    const cspDomains = allowedDomains.flatMap(d => [d, '*.' + d]).join(' ');
    headers.set('Content-Security-Policy', `frame-ancestors 'self' ${cspDomains}`);

    return new Response(object.body, { headers });
  },
};
