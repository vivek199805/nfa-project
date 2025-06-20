import express from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import PaymentController from '../controllers/payment.js';
const router = express.Router();

// ==================for controllers folder================

router.post("/create",requireAuth, PaymentController.createPayment);
router.post("/get-payments",requireAuth, PaymentController.getPayments);
router.post("/update",requireAuth, PaymentController.updatePayment);
router.post("/delete",requireAuth, PaymentController.deletePayment);

export default router;
