import { Router } from "express";
import {
  requireAuth,
} from "../middleware/auth.middleware";

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
 getFollowups,
 getNewLeadsToday,
 getNotifications,
  completeFollowup,
  createQuickLead,
  createQuickBulkLead,
} from "../controllers/lead.controller";

const router = Router();
router.use(requireAuth);

router.get("/", getAllLeads);

router.get(
  "/followups",
  getFollowups
);

router.get(
  "/new-today",
  getNewLeadsToday
);

router.get(
  "/notifications",
  getNotifications
);

router.get("/:id", getLead);

router.post("/", createLead);

router.put("/:id", updateLead);

router.post(
  "/quick",
  createQuickLead
);

router.post(
  "/quick-bulk",
  createQuickBulkLead
);

router.post(
  "/:id/complete-followup",
  completeFollowup
);

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
  "/:id/notes/:noteId",
  deleteLeadNote
);

export default router;