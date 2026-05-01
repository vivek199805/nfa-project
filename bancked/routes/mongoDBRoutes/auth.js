import express from "express";
import UserController from "../../controllers/mongoDBController/authController.js";
import { requireAuth } from "../../middleware/requireAuth.js";

const router = express.Router();

router.post("/register", UserController.registerUser);
router.post("/login", UserController.loginUser);
router.post("/verify-email", UserController.verifyEmail);
router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password", UserController.resetPassword);
router.post("/verify-otp", UserController.verifyOtp);
router.post("/resend-otp", UserController.resendOtp);
router.post("/change-password", requireAuth, UserController.changePassword);

export default router;
