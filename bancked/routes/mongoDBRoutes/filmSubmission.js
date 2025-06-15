import express from 'express';
import FilmController from '../../controllers/mongoDBController/filmController.js';
import upload from '../../middleware/uploadMiddleware.js'; 

const router = express.Router();

// ==================for controllers folder===============

// Feature film routes
router.post('/feature-create',upload.none(), FilmController.createFeatureSubmission);
router.get('/entry-list', FilmController.getFeatureSubmissions);
router.post('/feature-update',upload.any(), FilmController.updateFeatureSubmissionById);
router.get('/feature-entry-by/:id', FilmController.getFeatureSubmissionById);
// ======================== for producer controller=====================
router.post('/producer-list', FilmController.getAllProducersByFeatureId);
router.post('/store-producer',upload.any(), FilmController.addProducerToFeature);
router.post('/delete-producer',upload.any(), FilmController.deleteProducerById);
// ==================for director controllers===============
router.post('/director-list', FilmController.getAllDirectorsByFeatureId);
router.post('/store-director',upload.any(), FilmController.addDirectorToFeature);
router.post('/delete-director',upload.any(), FilmController.deleteDirectorById);
// ==================for actor controllers================
router.post('/actor-list', FilmController.getAllActorsByFeatureId);
router.post('/store-actor',upload.any(), FilmController.addActorToFeature);
router.post('/delete-actor',upload.any(), FilmController.deleteActorById);
// ==================for song controllers================
router.post('/song-list', FilmController.getAllSongByFeatureId);
router.post('/store-song',upload.any(), FilmController.addSongToFeature);
router.post('/delete-song',upload.any(), FilmController.deleteSongById);
// ==================for audiographer controllers================
router.post('/audiographer-list', FilmController.getAllAudiographerByFeatureId);
router.post('/store-audiographer',upload.any(), FilmController.addAudiographerToFeature);
router.post('/delete-audiographer',upload.any(), FilmController.deleteAudiographerById);

// Non-feature film routes
router.post('/non-feature-create', FilmController.createNonFeatureSubmission);
router.get('/non-feature-list', FilmController.getNonFeatureSubmissions);

export default router;
