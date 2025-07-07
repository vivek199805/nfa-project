import express from 'express';
import BestFilmCriticController from '../../controllers/mongoDBController/bestFilmCriticController.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import upload from '../../middleware/uploadMiddleware.js'; 
import EditorController from '../../controllers/mongoDBController/editorController.js';
import PaymentController from '../../controllers/mongoDBController/paymentController.js';

import BestBookController from '../../controllers/mongoDBController/bestBookController.js';
import BookController from '../../controllers/mongoDBController/bookController.js';




const router = express.Router();

// ==================for controllers folder================

router.post("/create-entry",requireAuth,upload.none(), BestFilmCriticController.createFilmCritic);
router.get("/best-film-critic-entry-by/:id",requireAuth, BestFilmCriticController.bestFilmCriticById);
router.post("/update-entry",requireAuth,upload.any(), BestFilmCriticController.updateEntryById);
router.post("/best-film-critic-final-submit", requireAuth,upload.any(), BestFilmCriticController.finalSubmit);

//**********************BEAST BOOK CINEMA ENTRY********************//
router.post("/best-book-cinema-entry",requireAuth,upload.none(), BestBookController.createBook);
router.post("/best-book-cinema-update",requireAuth,upload.any(), BestBookController.updateEntryById);
router.post("/best-book-cinema-final-submit", requireAuth,upload.any(), BestBookController.finalSubmit);
router.get("/best-book-cinema-entry-by/:id", requireAuth,upload.any(), BestBookController.bestBookCinemaById);

//*****************************BOOKS******************************//
router.post("/store-book",requireAuth,upload.any(), BookController.storeBook);
router.post("/update-book",requireAuth,upload.any(), BookController.updateBook);
router.post("/list-book",requireAuth,upload.any(), BookController.listBook);
router.get("/get-book-by/:id",requireAuth,upload.any(), BookController.getBook);
router.get("/delete-book/:id",requireAuth,upload.any(), BookController.deleteBook);

// ======================== for EDITORS controller=====================
router.post("/store-editor",requireAuth, upload.any(), EditorController.storeEditor);
router.post("/update-editor", requireAuth, upload.any(), EditorController.updateEditor);
router.post("/list-editor",requireAuth, upload.any(), EditorController.listEditor);
// router.get("/get-editor-by/:id",requireAuth, upload.any(), EditorController.getEditor);
router.get("/delete-editor/:id",requireAuth, upload.any(), EditorController.deleteEditor);

//*****************************PAYMENT*****************************//
router.post("/generate-hash",requireAuth, upload.any(), PaymentController);

export default router;