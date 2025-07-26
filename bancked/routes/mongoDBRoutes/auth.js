import express from 'express';
// import checkAuth from '../middleware/check-auth.js';
import UserController from '../../controllers/mongoDBController/authController.js';
import { requireAuth } from '../../middleware/requireAuth.js';

const router = express.Router();

// ==================for controllers folder================

router.post("/register", UserController.registerUser);
router.post("/login", UserController.loginUser);
router.post('/verify-email', UserController.verifyEmail);
router.post('/forgot-password', UserController.forgotPassword);
// router.post('/forgot-password', UserController.forgotPasswordWithToken);
router.post('/reset-password', UserController.resetPassword);
router.post('/verify-otp', UserController.verifyOtp);
// router.post("/logout",requireAuth, UserController.logoutUser);
// router.get("/currentUser", UserController.getCurrentUser);
// router.post("/updateProfile", UserController.updateProfile);
router.post("/change-password",requireAuth, UserController.changePassword);

export default router;
