import type { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import type { JwtPayload } from '../models/types.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const authService = new AuthService();

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Brak autoryzacji' });
    return;
  }

  try {
    const token = header.slice(7);
    req.user = authService.verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Nieprawidłowy token' });
  }
}
