import { Router } from "express";
import healthRouter from "./health.routes.js";
import authRouter from "./auth.routes.js";
import progressRouter from "./progress.routes.js";
import matchRouter from "./match.routes.js";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/progress", progressRouter);
apiRouter.use("/matches", matchRouter);

export default apiRouter;
