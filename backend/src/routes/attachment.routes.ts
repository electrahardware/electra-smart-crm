import { Router } from "express";
import upload from "../config/multer";

import {
  uploadAttachment,
  getAttachments,
  deleteAttachment,
} from "../controllers/attachment.controller";

const router = Router();

router.post(
  "/:leadId",
  upload.single("file"),
  uploadAttachment
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