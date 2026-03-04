import { Router } from 'express';
import * as Controller from '../controllers/inventory.controller.js';

const router = Router();

router.post('/', Controller.createItem);
router.get('/', Controller.getAllItems);
router.get('/:id', Controller.getItemById);
router.put('/:id', Controller.updateItem);
router.delete('/:id', Controller.softDelete);
router.delete('/:id/hard', Controller.hardDelete);

export default router;


