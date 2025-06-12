import express from 'express';
import LangController from '../../controllers/mongoDBController/languagesController.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = express.Router();

// ==================for controllers folder================

router.get("/get-languages",requireAuth, LangController);
export default router;