import type { Request, Response } from 'express';
import { PackingListService } from '../services/packingList.service.js';
import { param } from '../utils/param.js';

const service = new PackingListService();

export class PackingListController {
  async getAll(req: Request, res: Response) {
    try {
      const lists = await service.getAll(req.user!.userId);
      res.json(lists);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const list = await service.getById(param(req.params.id), req.user!.userId);
      res.json(list);
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, selectedMemberIds, itemsByMember } = req.body;
      if (!name) {
        res.status(400).json({ error: 'Nazwa listy jest wymagana' });
        return;
      }
      const list = await service.create(
        req.user!.userId,
        name,
        selectedMemberIds ?? [],
        itemsByMember,
      );
      res.status(201).json(list);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const list = await service.update(param(req.params.id), req.user!.userId, req.body);
      res.json(list);
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

  async addMembers(req: Request, res: Response) {
    try {
      const { memberIds, itemsByMember } = req.body;
      if (!Array.isArray(memberIds)) {
        res.status(400).json({ error: 'memberIds musi być tablicą' });
        return;
      }
      const list = await service.addMembers(
        param(req.params.id),
        req.user!.userId,
        memberIds,
        itemsByMember,
      );
      res.json(list);
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
