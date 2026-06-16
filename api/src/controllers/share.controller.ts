import type { Request, Response } from 'express';
import { ShareService } from '../services/share.service.js';
import { param } from '../utils/param.js';

const service = new ShareService();

export class ShareController {
  async getShared(req: Request, res: Response) {
    try {
      const list = await service.getSharedList(param(req.params.shareId));
      res.json(list);
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  }

  async togglePacked(req: Request, res: Response) {
    try {
      const item = await service.togglePacked(param(req.params.shareId), param(req.params.itemId));
      res.json(item);
    } catch (err) {
      res.status(403).json({ error: (err as Error).message });
    }
  }

  async createItem(req: Request, res: Response) {
    try {
      const { category, name, quantity } = req.body;
      if (!category || !name || !quantity) {
        res.status(400).json({ error: 'Kategoria, nazwa i ilość są wymagane' });
        return;
      }
      const item = await service.createItem(param(req.params.shareId), {
        category,
        name,
        quantity: Number(quantity),
      });
      res.status(201).json(item);
    } catch (err) {
      res.status(403).json({ error: (err as Error).message });
    }
  }

  async updateItem(req: Request, res: Response) {
    try {
      const item = await service.updateItem(param(req.params.shareId), param(req.params.itemId), req.body);
      res.json(item);
    } catch (err) {
      res.status(403).json({ error: (err as Error).message });
    }
  }

  async deleteItem(req: Request, res: Response) {
    try {
      await service.deleteItem(param(req.params.shareId), param(req.params.itemId));
      res.status(204).send();
    } catch (err) {
      res.status(403).json({ error: (err as Error).message });
    }
  }
}
