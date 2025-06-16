import express from 'express';
import FilmController from '../../controllers/mongoDBController/filmController.js';
import upload from '../../middleware/uploadMiddleware.js'; 
import { requireAuth } from '../../middleware/requireAuth.js';

const router = express.Router();

// ==================for controllers folder===============

// Feature film routes
router.post('/feature-create',requireAuth,upload.none(), FilmController.createFeatureSubmission);
router.get('/entry-list',requireAuth, FilmController.getFilmEntryList);
router.post('/feature-update', requireAuth, upload.any(), FilmController.updateFeatureNonfeatureById);
router.get('/feature-entry-by/:id',requireAuth, FilmController.getFilmDetailsById);
// ======================== for producer controller=====================
router.post('/producer-list',requireAuth, FilmController.getAllProducersByFeatureId);
router.post('/store-producer', requireAuth, upload.any(), FilmController.addProducerToFeature);
router.post('/delete-producer',requireAuth, upload.any(), FilmController.deleteProducerById);
// ==================for director controllers===============
router.post('/director-list',requireAuth, FilmController.getAllDirectorsByFeatureId);
router.post('/store-director',requireAuth, upload.any(), FilmController.addDirectorToFeature);
router.post('/delete-director',requireAuth, upload.any(), FilmController.deleteDirectorById);
// ==================for actor controllers================
router.post('/actor-list', requireAuth, FilmController.getAllActorsByFeatureId);
router.post('/store-actor', requireAuth, upload.any(), FilmController.addActorToFeature);
router.post('/delete-actor', requireAuth, upload.any(), FilmController.deleteActorById);
// ==================for song controllers================
router.post('/song-list',requireAuth, FilmController.getAllSongByFeatureId);
router.post('/store-song', requireAuth, upload.any(), FilmController.addSongToFeature);
router.post('/delete-song', requireAuth, upload.any(), FilmController.deleteSongById);
// ==================for audiographer controllers================
router.post('/audiographer-list', requireAuth,  FilmController.getAllAudiographerByFeatureId);
router.post('/store-audiographer', requireAuth, upload.any(), FilmController.addAudiographerToFeature);
router.post('/delete-audiographer',requireAuth, upload.any(), FilmController.deleteAudiographerById);

// Non-feature film routes
router.post('/non-feature-create', requireAuth, upload.none(), FilmController.createNonFeatureSubmission);
router.get('/non-feature-list', requireAuth, FilmController.getNonFeatureSubmissions);
router.get('/non-feature-entry-by/:id',requireAuth, FilmController.getFilmDetailsById);
router.post('/non-feature-update', requireAuth, upload.any(), FilmController.updateFeatureNonfeatureById);

export default router;
