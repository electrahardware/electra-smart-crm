import { Router } from "express";

import {
  getQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
  deleteQuotation,
} from "../controllers/quotation.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", getQuotations);

router.get("/:id", getQuotation);

router.post("/", createQuotation);

router.put("/:id", updateQuotation);

router.delete("/:id", deleteQuotation);

export default router;
