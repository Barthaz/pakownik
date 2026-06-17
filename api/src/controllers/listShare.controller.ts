import type { Request, Response } from 'express';
import { ListShareService } from '../services/listShare.service.js';
import { param } from '../utils/param.js';
import type { SharePermission } from '../models/types.js';

const service = new ListShareService();

const VALID_PERMISSIONS: SharePermission[] = ['readonly', 'checkoff', 'full_edit'];

export class ListShareController {
  async getShares(req: Request, res: Response) {
    try {
      const shares = await service.getSharesForList(param(req.params.id), req.user!.userId);
      res.json(shares);
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  }

  async createShare(req: Request, res: Response) {
    try {
      const { email, permission } = req.body;
      if (!email) {
        res.status(400).json({ error: 'Adres e-mail jest wymagany' });
        return;
      }
      const perm: SharePermission = VALID_PERMISSIONS.includes(permission)
        ? permission
        : 'checkoff';
      const share = await service.createShare(
        param(req.params.id),
        req.user!.userId,
        email,
        perm,
      );
      res.status(201).json(share);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }

  async deleteShare(req: Request, res: Response) {
    try {
      await service.deleteShare(
        param(req.params.id),
        param(req.params.shareId),
        req.user!.userId,
      );
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  }
}
