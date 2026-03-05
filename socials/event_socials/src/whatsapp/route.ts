import { Router } from "express";
import { healthcheck, listClients, createClient, getClientStatus, deleteClient } from "./controller";

const router = Router();

router.get("/healthcheck", healthcheck);
router.get("/clients", listClients);
router.post("/clients", createClient);
router.get("/clients/:id", getClientStatus);
router.delete("/clients/:id", deleteClient);

export default router;