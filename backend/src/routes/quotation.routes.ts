import { Router } from "express";

import {
  getQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
  deleteQuotation,
} from "../controllers/quotation.controller";

const router = Router();

router.get("/", getQuotations);

router.get("/:id", getQuotation);

router.post("/", createQuotation);

router.put("/:id", updateQuotation);

router.delete("/:id", deleteQuotation);

export default router;