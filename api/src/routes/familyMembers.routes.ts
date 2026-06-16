import { Router } from 'express';
import { FamilyMemberController } from '../controllers/familyMember.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const controller = new FamilyMemberController();

router.use(authMiddleware);

router.get('/', (req, res) => controller.getAll(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));
router.post('/:id/items', (req, res) => controller.createItem(req, res));
router.put('/:id/items/:itemId', (req, res) => controller.updateItem(req, res));
router.delete('/:id/items/:itemId', (req, res) => controller.deleteItem(req, res));

export default router;
