import { Router } from "express";

import {
  createLead,
  deleteLead,
  deleteMultipleLeads,
  getAllLeads,
  getLead,
  updateLead,
  addLeadNote,
  getLeadNotes,
  deleteLeadNote,
  getTodayFollowups,
} from "../controllers/lead.controller";

const router = Router();

router.get("/", getAllLeads);

router.get(
  "/today-followups",
  getTodayFollowups
);

router.get("/:id", getLead);

router.post("/", createLead);

router.put("/:id", updateLead);

router.delete("/:id", deleteLead);

/* Bulk Delete */
router.delete("/", deleteMultipleLeads);

/* Lead Notes */

router.get(
  "/:id/notes",
  getLeadNotes
);

router.post(
  "/:id/notes",
  addLeadNote
);

router.delete(
  "/notes/:noteId",
  deleteLeadNote
);

export default router;