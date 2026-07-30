import { Router } from "express";
import { authorize, requireAuth } from "../middleware/auth.middleware";

import {
  addLeadNote,
  completeFollowup,
  createLead,
  createQuickBulkLead,
  createQuickLead,
  deleteLead,
  deleteLeadNote,
  deleteMultipleLeads,
  getAllLeads,
  getFollowups,
  getLead,
  getLeadNotes,
  getNewLeadsToday,
  getNotifications,
  updateLead,
} from "../controllers/lead.controller";

const router = Router();

/* --------------------------------------------------
   Authentication
--------------------------------------------------- */

router.use(requireAuth);

/* --------------------------------------------------
   Dashboard
--------------------------------------------------- */

router.get(
  "/notifications",
  authorize("Owner", "Sales Manager", "Sales Executive"),
  getNotifications,
);

router.get(
  "/new-today",
  authorize("Owner", "Sales Manager", "Sales Executive"),
  getNewLeadsToday,
);

/* --------------------------------------------------
   Follow-ups
--------------------------------------------------- */

router.get(
  "/followups",
  authorize("Owner", "Sales Manager", "Sales Executive"),
  getFollowups,
);

router.post(
  "/:id/complete-followup",
  authorize("Owner", "Sales Manager", "Sales Executive"),
  completeFollowup,
);

/* --------------------------------------------------
   Quick Lead
--------------------------------------------------- */

router.post(
  "/quick",
  authorize("Owner", "Sales Manager", "Sales Executive"),
  createQuickLead,
);

router.post(
  "/quick-bulk",
  authorize("Owner", "Sales Manager", "Sales Executive"),
  createQuickBulkLead,
);

/* --------------------------------------------------
   Lead Notes
--------------------------------------------------- */

router.get(
  "/:id/notes",
  authorize("Owner", "Sales Manager", "Sales Executive"),
  getLeadNotes,
);

router.post(
  "/:id/notes",
  authorize("Owner", "Sales Manager", "Sales Executive"),
  addLeadNote,
);

router.delete(
  "/:id/notes/:noteId",
  authorize("Owner", "Sales Manager"),
  deleteLeadNote,
);

/* --------------------------------------------------
   Leads CRUD
--------------------------------------------------- */

router.get("/test", (_req, res) => {
  res.json({
    success: true,
    message: "Lead Route Working",
  });
});

router.get(
  "/",
  authorize("Owner", "Sales Manager", "Sales Executive"),
  getAllLeads,
);

router.get(
  "/:id",
  authorize("Owner", "Sales Manager", "Sales Executive"),
  getLead,
);

router.post(
  "/",
  authorize("Owner", "Sales Manager", "Sales Executive"),
  createLead,
);

router.put(
  "/:id",
  authorize("Owner", "Sales Manager", "Sales Executive"),
  updateLead,
);

router.delete("/:id", authorize("Owner", "Sales Manager"), deleteLead);

router.delete("/", authorize("Owner"), deleteMultipleLeads);

/* --------------------------------------------------
   Reserved for Future Modules

Attachments
router.get("/:id/attachments");
router.post("/:id/attachments");

Calls
router.get("/:id/calls");
router.post("/:id/calls");

WhatsApp
router.post("/:id/send-whatsapp");

Quotation
router.get("/:id/quotations");
router.post("/:id/quotations");

Documents
router.get("/:id/documents");

--------------------------------------------------- */

export default router;
