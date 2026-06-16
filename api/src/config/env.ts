import dotenv from 'dotenv';

dotenv.config();

export const env = {
  betaMode: process.env.BETA_MODE !== 'false',
  jwtSecret: process.env.JWT_SECRET ?? 'pakownik-dev-secret',
  port: Number(process.env.PORT ?? 3001),
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_NAME ?? 'pakownik',
  },
};
