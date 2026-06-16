import { Router } from 'express';
import { ShareController } from '../controllers/share.controller.js';

const router = Router();
const controller = new ShareController();

router.get('/:shareId', (req, res) => controller.getShared(req, res));
router.patch('/:shareId/items/:itemId', (req, res) => controller.togglePacked(req, res));
router.post('/:shareId/items', (req, res) => controller.createItem(req, res));
router.put('/:shareId/items/:itemId', (req, res) => controller.updateItem(req, res));
router.delete('/:shareId/items/:itemId', (req, res) => controller.deleteItem(req, res));

export default router;
