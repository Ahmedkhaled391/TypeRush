import { Router } from "express";
import {
  getUserProgress,
  upsertAttempt,
  getRecentAttempts,
  getAggregateStats,
} from "../controllers/progress.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const progressRouter = Router();

progressRouter.get("/", requireAuth, getUserProgress);
progressRouter.post("/attempts", requireAuth, upsertAttempt);
progressRouter.get("/attempts/recent", requireAuth, getRecentAttempts);
progressRouter.get("/stats", requireAuth, getAggregateStats);

export default progressRouter;
