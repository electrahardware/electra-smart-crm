import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";

import {
  getAllLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  deleteMultipleLeads,

  getFollowups,
  completeFollowup,

  getLeadNotes,
  addLeadNote,
  deleteLeadNote,

  createQuickLead,
  createQuickBulkLead,

  getNewLeadsToday,
  getNotifications,
} from "../controllers/lead.controller";

const router = Router();

/* --------------------------------------------------
   Authentication
--------------------------------------------------- */

router.use(requireAuth);

/* --------------------------------------------------
   Dashboard
--------------------------------------------------- */

router.get("/notifications", getNotifications);
router.get("/new-today", getNewLeadsToday);

/* --------------------------------------------------
   Follow-ups
--------------------------------------------------- */

router.get("/followups", getFollowups);
router.post("/:id/complete-followup", completeFollowup);

/* --------------------------------------------------
   Quick Lead
--------------------------------------------------- */

router.post("/quick", createQuickLead);
router.post("/quick-bulk", createQuickBulkLead);

/* --------------------------------------------------
   Lead Notes
--------------------------------------------------- */

router.get("/:id/notes", getLeadNotes);
router.post("/:id/notes", addLeadNote);
router.delete("/:id/notes/:noteId", deleteLeadNote);

/* --------------------------------------------------
   Leads CRUD
--------------------------------------------------- */

router.get("/test", (_req, res) => {

  res.json({
    success: true,
    message: "Lead Route Working",
  });

});

router.get("/", getAllLeads);
router.get("/:id", getLead);

router.post("/", createLead);
router.put("/:id", updateLead);

router.delete("/:id", deleteLead);
router.delete("/", deleteMultipleLeads);

/* --------------------------------------------------
   Reserved for Future Modules
---------------------------------------------------

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