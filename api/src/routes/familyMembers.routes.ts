import { Router } from 'express';
import { FamilyMemberController } from '../controllers/familyMember.controller.js';
import { FamilyMemberShareController } from '../controllers/familyMemberShare.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const controller = new FamilyMemberController();
const shareController = new FamilyMemberShareController();

router.use(authMiddleware);

router.get('/shares', (req, res) => shareController.getShares(req, res));
router.post('/shares', (req, res) => shareController.createShares(req, res));
router.delete('/shares/:shareId', (req, res) => shareController.deleteShare(req, res));

router.get('/', (req, res) => controller.getAll(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));
router.post('/:id/items', (req, res) => controller.createItem(req, res));
router.put('/:id/items/:itemId', (req, res) => controller.updateItem(req, res));
router.delete('/:id/items/:itemId', (req, res) => controller.deleteItem(req, res));

export default router;
