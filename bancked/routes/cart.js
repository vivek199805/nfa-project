import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import CartController from '../controllers/cart.js';
const router = express.Router();

// ==================for controllers folder================

router.post("/create",requireAuth, CartController.addCartitem);
router.post("/list",requireAuth, CartController.cartList);
router.post("/update",requireAuth, CartController.updateQuantityOfCart);
router.post("/delete",requireAuth, CartController.removeItem);
router.post('/clear', requireAuth, CartController.clearCart);

export default router;
