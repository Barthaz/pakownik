import type { HealthReport } from '../services/health.service.js';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function statusLabel(status: HealthReport['status']): string {
  if (status === 'ok') return 'Działa';
  if (status === 'degraded') return 'Ograniczone';
  return 'Problem';
}

function dbStatusLabel(status: HealthReport['database']['status']): string {
  if (status === 'ok') return 'Połączono';
  if (status === 'skipped') return 'Nie dotyczy';
  return 'Błąd połączenia';
}

function formatCheckedAt(iso: string): string {
  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(iso));
}

export function renderHealthPage(report: HealthReport): string {
  const overallClass = report.status;
  const dbClass = report.database.status === 'ok' ? 'ok' : report.database.status === 'skipped' ? 'skipped' : 'error';
  const modeLabel = report.mode === 'beta' ? 'Beta' : 'Produkcja';

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pakownik API — status</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,500;0,9..40,700;1,9..40,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --cream: #faf7f2;
      --navy: #1e3a5f;
      --coral: #e8a87c;
      --sand: #d4a574;
      --muted: #6b7c93;
      --ok: #2f9e6b;
      --ok-bg: #e8f6ef;
      --warn: #c9892b;
      --warn-bg: #fff4e5;
      --err: #c94c4c;
      --err-bg: #fdecec;
      --card: rgba(255, 255, 255, 0.82);
      --shadow: 0 24px 60px rgba(30, 58, 95, 0.12);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      min-height: 100vh;
      font-family: Inter, system-ui, sans-serif;
      color: var(--navy);
      background:
        radial-gradient(circle at 12% 18%, rgba(232, 168, 124, 0.35), transparent 28%),
        radial-gradient(circle at 88% 12%, rgba(212, 165, 116, 0.28), transparent 24%),
        linear-gradient(160deg, #fff9f3 0%, var(--cream) 45%, #f3ece3 100%);
      padding: 2rem 1rem 3rem;
    }

    .wrap {
      max-width: 720px;
      margin: 0 auto;
    }

    .hero {
      text-align: center;
      margin-bottom: 2rem;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      background: rgba(30, 58, 95, 0.08);
      color: var(--navy);
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }

    .badge-dot {
      width: 0.55rem;
      height: 0.55rem;
      border-radius: 50%;
      background: var(--coral);
      box-shadow: 0 0 0 6px rgba(232, 168, 124, 0.25);
    }

    h1 {
      font-family: "DM Sans", sans-serif;
      font-size: clamp(2rem, 5vw, 2.75rem);
      line-height: 1.1;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: var(--muted);
      font-size: 1.05rem;
    }

    .panel {
      background: var(--card);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(30, 58, 95, 0.08);
      border-radius: 24px;
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .status-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(30, 58, 95, 0.08);
    }

    .status-banner.ok { background: linear-gradient(90deg, var(--ok-bg), transparent); }
    .status-banner.degraded { background: linear-gradient(90deg, var(--warn-bg), transparent); }
    .status-banner.error { background: linear-gradient(90deg, var(--err-bg), transparent); }

    .status-title {
      font-family: "DM Sans", sans-serif;
      font-size: 1.2rem;
      font-weight: 700;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.45rem 0.85rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .pill.ok { background: var(--ok-bg); color: var(--ok); }
    .pill.skipped { background: var(--warn-bg); color: var(--warn); }
    .pill.error { background: var(--err-bg); color: var(--err); }

    .pill::before {
      content: "";
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background: currentColor;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1px;
      background: rgba(30, 58, 95, 0.08);
    }

    .card {
      background: rgba(255, 255, 255, 0.92);
      padding: 1.25rem 1.35rem;
      min-height: 118px;
    }

    .card-label {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
      font-weight: 600;
      margin-bottom: 0.55rem;
    }

    .card-value {
      font-family: "DM Sans", sans-serif;
      font-size: 1.35rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 0.35rem;
    }

    .card-detail {
      color: var(--muted);
      font-size: 0.92rem;
      line-height: 1.45;
      word-break: break-word;
    }

    .footer {
      padding: 1rem 1.5rem 1.25rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem 1.25rem;
      justify-content: space-between;
      align-items: center;
      color: var(--muted);
      font-size: 0.88rem;
      border-top: 1px solid rgba(30, 58, 95, 0.08);
    }

    .footer a {
      color: var(--navy);
      text-decoration: none;
      font-weight: 600;
      border-bottom: 1px solid rgba(232, 168, 124, 0.8);
    }

    @media (max-width: 560px) {
      .grid { grid-template-columns: 1fr; }
      .status-banner { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header class="hero">
      <div class="badge"><span class="badge-dot"></span> Pakownik</div>
      <h1>Status API</h1>
      <p class="subtitle">Podgląd działania backendu list pakowania</p>
    </header>

    <main class="panel">
      <section class="status-banner ${overallClass}">
        <div>
          <div class="status-title">Ogólny stan usługi</div>
          <p class="card-detail">Ostatnie sprawdzenie: ${escapeHtml(formatCheckedAt(report.checkedAt))}</p>
        </div>
        <span class="pill ${overallClass}">${escapeHtml(statusLabel(report.status))}</span>
      </section>

      <section class="grid">
        <article class="card">
          <div class="card-label">Wersja API</div>
          <div class="card-value">v${escapeHtml(report.version)}</div>
          <div class="card-detail">Pakownik REST API</div>
        </article>

        <article class="card">
          <div class="card-label">Tryb pracy</div>
          <div class="card-value">${escapeHtml(modeLabel)}</div>
          <div class="card-detail">Magazyn: ${escapeHtml(report.storage === 'mysql' ? 'MySQL' : 'plik JSON')}</div>
        </article>

        <article class="card">
          <div class="card-label">API</div>
          <div class="card-value">Online</div>
          <div class="card-detail">Endpointy REST odpowiadają poprawnie</div>
        </article>

        <article class="card">
          <div class="card-label">Baza danych</div>
          <div class="card-value">${escapeHtml(dbStatusLabel(report.database.status))}</div>
          <div class="card-detail">${escapeHtml(report.database.detail ?? report.database.label)}</div>
        </article>
      </section>

      <footer class="footer">
        <span>JSON: <a href="/api/health?format=json">/api/health?format=json</a></span>
        <span>© Pakownik</span>
      </footer>
    </main>
  </div>
</body>
</html>`;
}
