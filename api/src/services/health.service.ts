export interface HealthReport {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  storage: 'mysql' | 'file';
  mode: 'beta' | 'production';
  api: { status: 'ok' };
  database: {
    status: 'ok' | 'error' | 'skipped';
    label: string;
    detail?: string;
  };
  checkedAt: string;
}

export async function getHealthReport(version: string): Promise<HealthReport> {
  const { env } = await import('../config/env.js');
  const checkedAt = new Date().toISOString();
  const mode = env.betaMode ? 'beta' : 'production';
  const storage = env.betaMode ? 'file' : 'mysql';

  if (env.betaMode) {
    const onVercel = Boolean(process.env.VERCEL);
    return {
      status: onVercel ? 'error' : 'ok',
      version,
      storage,
      mode,
      api: { status: 'ok' },
      database: {
        status: onVercel ? 'error' : 'skipped',
        label: 'Plik JSON (tryb beta)',
        detail: onVercel
          ? 'Na Vercel wymagane BETA_MODE=false i MySQL — zapis do pliku jest niemożliwy (read-only FS)'
          : 'Persystencja lokalna — bez MySQL',
      },
      checkedAt,
    };
  }

  try {
    const { pingDb } = await import('../config/db.js');
    await pingDb();
    return {
      status: 'ok',
      version,
      storage,
      mode,
      api: { status: 'ok' },
      database: {
        status: 'ok',
        label: 'MySQL',
        detail: `${env.db.host}:${env.db.port} · ${env.db.name}`,
      },
      checkedAt,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Połączenie niedostępne';
    return {
      status: 'error',
      version,
      storage,
      mode,
      api: { status: 'ok' },
      database: {
        status: 'error',
        label: 'MySQL',
        detail: message,
      },
      checkedAt,
    };
  }
}
