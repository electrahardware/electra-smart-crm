import { Router } from "express";

import {
  commitLeadImport,
  previewLeadImport,
} from "../controllers/import.controller";

const router = Router();

router.post("/leads/preview", previewLeadImport);

router.post("/leads/commit", commitLeadImport);

export default router;