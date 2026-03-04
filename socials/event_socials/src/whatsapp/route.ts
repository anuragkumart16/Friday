import {Router} from "express";
import { healthcheck } from "./controller";

const router = Router();

router.get("/healthcheck", healthcheck)

export default router;