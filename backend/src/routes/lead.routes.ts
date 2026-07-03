import { Router } from "express";

import {
  createLead,
  deleteLead,
  getAllLeads,
  getLead,
  updateLead,
} from "../controllers/lead.controller";

const router = Router();

router.get("/", getAllLeads);

router.get("/:id", getLead);

router.post("/", createLead);

router.put("/:id", updateLead);

router.delete("/:id", deleteLead);

export default router;