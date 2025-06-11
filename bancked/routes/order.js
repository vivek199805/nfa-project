import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import OrderController from '../controllers/order.js';
const router = express.Router();

// ==================for controllers folder================

router.post("/create",requireAuth, OrderController.create);
router.post("/list",requireAuth, OrderController.orderHistory);
router.post("/recent",requireAuth, OrderController.recentOrder);

export default router;
