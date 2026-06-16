import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'E-mail i hasło są wymagane' });
        return;
      }
      const result = await authService.register(email, password);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'E-mail i hasło są wymagane' });
        return;
      }
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err) {
      res.status(401).json({ error: (err as Error).message });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.json(user);
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  }
}
