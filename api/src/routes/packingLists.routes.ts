import { Router } from 'express';
import { PackingListController } from '../controllers/packingList.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const controller = new PackingListController();

router.use(authMiddleware);

router.get('/', (req, res) => controller.getAll(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));
router.post('/:id/members', (req, res) => controller.addMembers(req, res));
router.post('/:id/items', (req, res) => controller.createItem(req, res));
router.put('/:id/items/:itemId', (req, res) => controller.updateItem(req, res));
router.delete('/:id/items/:itemId', (req, res) => controller.deleteItem(req, res));

export default router;
