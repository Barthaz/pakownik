import type { Request, Response } from 'express';
import { FamilyMemberShareService } from '../services/familyMemberShare.service.js';
import type { FamilyMemberSharePermission } from '../models/types.js';
import { param } from '../utils/param.js';

const service = new FamilyMemberShareService();

export class FamilyMemberShareController {
  async getShares(req: Request, res: Response) {
    try {
      const shares = await service.getSharesByOwner(req.user!.userId);
      res.json(shares);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  async createShares(req: Request, res: Response) {
    try {
      const { memberIds, email, permission } = req.body as {
        memberIds?: string[];
        email?: string;
        permission?: FamilyMemberSharePermission;
      };

      if (!email || !memberIds?.length) {
        res.status(400).json({ error: 'E-mail i co najmniej jeden członek są wymagane' });
        return;
      }

      const shares = await service.createShares(
        req.user!.userId,
        memberIds,
        email,
        permission ?? 'full_edit',
      );
      res.status(201).json(shares);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }

  async deleteShare(req: Request, res: Response) {
    try {
      await service.deleteShare(param(req.params.shareId), req.user!.userId);
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  }
}
