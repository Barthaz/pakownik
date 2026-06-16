import app from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.log(`Pakownik API running on port ${env.port} (beta: ${env.betaMode})`);
});
