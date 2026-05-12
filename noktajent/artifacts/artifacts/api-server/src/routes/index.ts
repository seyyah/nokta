import { Router, type IRouter } from "express";
import healthRouter from "./health";
import supportRouter from "./support";
import anthropicRouter from "./anthropic";
import tasksRouter from "./tasks";
import projectsRouter from "./projects";
import agendaRouter from "./agenda";
import moodRouter from "./mood";
import agentsRouter from "./agents";

const router: IRouter = Router();

router.use("/health", healthRouter);
router.use("/support", supportRouter);
router.use("/anthropic", anthropicRouter);
router.use("/tasks", tasksRouter);
router.use("/projects", projectsRouter);
router.use("/agenda", agendaRouter);
router.use("/mood", moodRouter);
router.use("/agents", agentsRouter);

export default router;
