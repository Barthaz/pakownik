import type { Request, Response } from 'express';
import { FamilyMemberService } from '../services/familyMember.service.js';
import { param } from '../utils/param.js';

const service = new FamilyMemberService();

export class FamilyMemberController {
  async getAll(req: Request, res: Response) {
    try {
      const members = await service.getAll(req.user!.userId);
      res.json(members);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name) {
        res.status(400).json({ error: 'Imię jest wymagane' });
        return;
      }
      const member = await service.create(req.user!.userId, name);
      res.status(201).json(member);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name) {
        res.status(400).json({ error: 'Imię jest wymagane' });
        return;
      }
      const member = await service.update(param(req.params.id), req.user!.userId, name);
      res.json(member);
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await service.delete(param(req.params.id), req.user!.userId);
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  }

  async createItem(req: Request, res: Response) {
    try {
      const { category, name, quantity } = req.body;
      if (!category || !name || !quantity) {
        res.status(400).json({ error: 'Kategoria, nazwa i ilość są wymagane' });
        return;
      }
      const item = await service.createItem(param(req.params.id), req.user!.userId, {
        category,
        name,
        quantity: Number(quantity),
      });
      res.status(201).json(item);
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  }

  async updateItem(req: Request, res: Response) {
    try {
      const item = await service.updateItem(
        param(req.params.id),
        param(req.params.itemId),
        req.user!.userId,
        req.body,
      );
      res.json(item);
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  }

  async deleteItem(req: Request, res: Response) {
    try {
      await service.deleteItem(param(req.params.id), param(req.params.itemId), req.user!.userId);
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  }
}
