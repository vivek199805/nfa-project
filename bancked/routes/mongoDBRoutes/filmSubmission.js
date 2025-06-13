import express from 'express';
import FilmController from '../../controllers/mongoDBController/filmController.js';

const router = express.Router();

// ==================for controllers folder===============

// Feature film routes
router.post('/feature-create', FilmController.createFeatureSubmission);
router.get('/feature-list', FilmController.getFeatureSubmissions);

// Non-feature film routes
router.post('/non-feature-create', FilmController.createNonFeatureSubmission);
router.get('/non-feature-list', FilmController.getNonFeatureSubmissions);

export default router;
