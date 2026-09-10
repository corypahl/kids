const ROUTES = [
  { prefix: "/bedtime", binding: "BEDTIME" },
];

function findRoute(pathname) {
  return ROUTES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function renderPortalHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kids Hub · Cory Pahl</title>
  <style>
    :root {
      --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --bg: #0b0914;
      --card-bg: rgba(255, 255, 255, 0.05);
      --card-border: rgba(255, 255, 255, 0.1);
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #a29bfe;
      --accent-hover: #c4b5fd;
      --pink: #ff9ff3;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: var(--font-family);
      background: radial-gradient(circle at top center, #1e1145 0%, var(--bg) 80%);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
    }
    header {
      padding: 4rem 1.5rem 2rem;
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 600;
      background: rgba(162, 155, 254, 0.15);
      border: 1px solid rgba(162, 155, 254, 0.3);
      color: var(--accent);
      margin-bottom: 1rem;
      letter-spacing: 0.02em;
    }
    h1 {
      font-size: 2.75rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 0.75rem;
      background: linear-gradient(135deg, #ffffff 30%, #c4b5fd 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p.subtitle {
      color: var(--text-muted);
      font-size: 1.125rem;
      max-width: 520px;
      margin: 0 auto;
    }
    main {
      flex: 1;
      max-width: 960px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1.25rem;
      padding: 2rem;
      text-decoration: none;
      color: inherit;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      display: flex;
      flex-direction: column;
    }
    .card:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 40px -8px rgba(162, 155, 254, 0.2);
      border-color: rgba(162, 155, 254, 0.4);
    }
    .card-icon {
      font-size: 2.75rem;
      margin-bottom: 1.25rem;
    }
    .card h2 {
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card p {
      color: var(--text-muted);
      font-size: 0.95rem;
      flex: 1;
      margin-bottom: 1.75rem;
      line-height: 1.6;
    }
    .card-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-weight: 600;
      color: var(--accent);
      font-size: 0.95rem;
    }
    .card:hover .card-link {
      color: var(--accent-hover);
    }
    footer {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 2rem 1.5rem;
      text-align: center;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    footer a {
      color: var(--accent);
      text-decoration: none;
    }
    footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <header>
    <span class="badge">Family Monorepo Portal</span>
    <h1>Kids Hub</h1>
    <p class="subtitle">Playful apps and daily routines for Emma and Sophie.</p>
  </header>
  <main>
    <div class="grid">
      <a class="card" href="/bedtime/">
        <div class="card-icon">🌙</div>
        <h2>Bedtime Routine <span aria-hidden="true">&rarr;</span></h2>
        <p>Interactive routine wheel and checklist for bedtime tasks with celebratory sound effects and confetti.</p>
        <span class="card-link">Launch Routine &rarr;</span>
      </a>
    </div>
  </main>
  <footer>
    <p>Hosted on Cloudflare Workers &bull; <a href="https://corypahl.dev">Cory Pahl</a></p>
  </footer>
</body>
</html>`;
}

export async function routeRequest(request, env) {
  const url = new URL(request.url);

  if (url.pathname === "/" || url.pathname === "") {
    return new Response(renderPortalHtml(), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  }

  const route = findRoute(url.pathname);

  if (!route) {
    return new Response("Not Found", { status: 404 });
  }

  if (url.pathname === route.prefix) {
    url.pathname = `${route.prefix}/`;
    return Response.redirect(url, 308);
  }

  const service = env[route.binding];
  if (!service || typeof service.fetch !== "function") {
    return new Response("Downstream service is not configured", { status: 503 });
  }

  if (!route.preservePrefix) {
    url.pathname = url.pathname.slice(route.prefix.length) || "/";
  }

  return await service.fetch(new Request(url, request));
}

export default {
  fetch: routeRequest,
};
