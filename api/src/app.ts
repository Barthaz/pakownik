import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import packingListsRoutes from './routes/packingLists.routes.js';
import familyMembersRoutes from './routes/familyMembers.routes.js';
import { env } from './config/env.js';
import { getHealthReport } from './services/health.service.js';
import { renderHealthPage } from './views/healthPage.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

const app = express();

app.use(cors());
app.use(express.json());

let dbReady: Promise<void> | null = null;

function ensureDbReady(): Promise<void> {
  if (env.betaMode) return Promise.resolve();
  if (!dbReady) {
    dbReady = import('./config/db.js').then(({ prepareDb }) => prepareDb());
  }
  return dbReady;
}

app.use(async (_req, res, next) => {
  if (env.betaMode) {
    next();
    return;
  }

  try {
    await ensureDbReady();
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Baza danych niedostępna';
    res.status(503).json({ error: message });
  }
});

function wantsHtml(req: express.Request): boolean {
  if (req.query.format === 'json') return false;
  if (req.query.format === 'html') return true;
  const accept = req.headers.accept ?? '';
  return accept.includes('text/html');
}

app.get('/api/health', async (req, res) => {
  const report = await getHealthReport(version);
  const statusCode = report.status === 'error' ? 503 : 200;

  if (wantsHtml(req)) {
    res.status(statusCode).type('html').send(renderHealthPage(report));
    return;
  }

  res.status(statusCode).json({
    status: report.status === 'error' ? 'error' : 'ok',
    version: report.version,
    storage: report.storage,
    mode: report.mode,
    api: report.api,
    database: report.database,
    checkedAt: report.checkedAt,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/packing-lists', packingListsRoutes);
app.use('/api/family-members', familyMembersRoutes);

export default app;
