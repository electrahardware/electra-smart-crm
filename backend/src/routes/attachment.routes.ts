import { Router } from "express";
import upload from "../config/multer";
import { requireAuth } from "../middleware/auth.middleware";

import {
  uploadAttachment,
  getAttachments,
  deleteAttachment,
  downloadAttachment,
} from "../controllers/attachment.controller";

const router = Router();

router.use(requireAuth);

router.post(
  "/:leadId",
  upload.single("file"),
  uploadAttachment
);

router.get(
  "/file/:id",
  downloadAttachment,
);

router.get(
  "/:leadId",
  getAttachments
);

router.delete(
  "/:id",
  deleteAttachment
);

export default router;
