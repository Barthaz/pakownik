import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import packingListsRoutes from './routes/packingLists.routes.js';
import familyMembersRoutes from './routes/familyMembers.routes.js';
import sharedRoutes from './routes/shared.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/packing-lists', packingListsRoutes);
app.use('/api/family-members', familyMembersRoutes);
app.use('/api/shared', sharedRoutes);

export default app;
