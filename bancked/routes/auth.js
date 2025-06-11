import express from 'express';
// import checkAuth from '../middleware/check-auth.js';
import UserController from '../controllers/user.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// ==================for controllers folder================

router.post("/register", UserController.createUser);
router.post("/logout",requireAuth, UserController.logoutUser);
router.get("/currentUser", UserController.getCurrentUser);
router.post("/login", UserController.loginUser);
router.post("/updateProfile", UserController.updateProfile);
// router.get("/profile", UserController.getUser);
// router.put("/updateProfile", UserController.updateProfile);
router.post("/update-password",requireAuth, UserController.updatePassword);

export default router;
