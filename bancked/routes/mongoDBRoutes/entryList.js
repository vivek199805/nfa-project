import express from 'express';
import entryListController from '../../controllers/mongoDBController/entryListController.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = express.Router();

// ==================for controllers folder================

router.get("/entry-list",requireAuth, entryListController);
export default router;