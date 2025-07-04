import express from 'express';
import BestFilmCriticController from '../../controllers/mongoDBController/bestFilmCriticController.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = express.Router();

// ==================for controllers folder================

router.get("/create-entry",requireAuth, BestFilmCriticController.createFilmCritic);

export default router;