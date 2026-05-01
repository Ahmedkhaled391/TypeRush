import { Router } from "express";
import {
  signup,
  verifyEmail,
  login,
  refreshToken,
  logout,
  me,
  updateProfile,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/login", login);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, me);
authRouter.patch("/profile", requireAuth, updateProfile);
authRouter.patch("/profile-photo", requireAuth, updateProfile);

export default authRouter;
