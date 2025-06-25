import express from 'express';
import FilmController from '../../controllers/mongoDBController/filmController.js';
import ProducerController from '../../controllers/mongoDBController/producerController.js';
import DirectorController from '../../controllers/mongoDBController/directorController.js';
import ActorController from '../../controllers/mongoDBController/actorController.js';
import SongController from '../../controllers/mongoDBController/songController.js'; 
import AudiographerController from '../../controllers/mongoDBController/audiographerController.js';
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
router.post('/producer-list',requireAuth, ProducerController.getAllProducersByFeatureId);
router.post('/store-producer', requireAuth, upload.any(), ProducerController.addProducerToFeature);
router.post('/delete-producer',requireAuth, upload.any(), ProducerController.deleteProducerById);
// ==================for director controllers===============
router.post('/director-list',requireAuth, DirectorController.getAllDirectorsByFeatureId);
router.post('/store-director',requireAuth, upload.any(), DirectorController.addDirectorToFeature);
router.post('/delete-director',requireAuth, upload.any(), DirectorController.deleteDirectorById);
// ==================for actor controllers================
router.post('/actor-list', requireAuth, ActorController.getAllActorsByFeatureId);
router.post('/store-actor', requireAuth, upload.any(), ActorController.addActorToFeature);
router.post('/delete-actor', requireAuth, upload.any(), ActorController.deleteActorById);
// ==================for song controllers================
router.post('/song-list',requireAuth, SongController.getAllSongByFeatureId);
router.post('/store-song', requireAuth, upload.any(), SongController.addSongToFeature);
router.post('/delete-song', requireAuth, upload.any(), SongController.deleteSongById);
// ==================for audiographer controllers================
router.post('/audiographer-list', requireAuth,  AudiographerController.getAllAudiographerByFeatureId);
router.post('/store-audiographer', requireAuth, upload.any(), AudiographerController.addAudiographerToFeature);
router.post('/delete-audiographer',requireAuth, upload.any(), AudiographerController.deleteAudiographerById);

// Non-feature film routes
router.post('/non-feature-create', requireAuth, upload.none(), FilmController.createNonFeatureSubmission);
router.get('/non-feature-list', requireAuth, FilmController.getNonFeatureSubmissions);
router.get('/non-feature-entry-by/:id',requireAuth, FilmController.getFilmDetailsById);
router.post('/non-feature-update', requireAuth, upload.any(), FilmController.updateFeatureNonfeatureById);

// final submission
router.post('/final-submit', requireAuth, upload.any(), FilmController.finalSubmit);

export default router;
