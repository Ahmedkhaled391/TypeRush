import { Router } from "express";
import {
  createMatch,
  joinMatchByCode,
  getMatchByCode,
} from "../controllers/match.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const matchRouter = Router();

matchRouter.post("/", requireAuth, createMatch);
matchRouter.post("/join", requireAuth, joinMatchByCode);
matchRouter.get("/:code", requireAuth, getMatchByCode);

export default matchRouter;
