import { Router } from "express";
import { authorize, requireAuth } from "../middleware/auth.middleware";

import {
  createUser,
  deleteUser,
  getUsers,
  login,
  resetPassword,
  toggleUserStatus,
  updateUser,
} from "../controllers/user.controller";

const router = Router();

/* --------------------------------------------------
   Public
--------------------------------------------------- */

router.post("/login", login);

/* --------------------------------------------------
   Authentication
--------------------------------------------------- */

router.use(requireAuth);

/* --------------------------------------------------
   User Management (Owner Only)
--------------------------------------------------- */

router.get("/", authorize("Owner"), getUsers);

router.post("/", authorize("Owner"), createUser);

router.put("/:id", authorize("Owner"), updateUser);

router.patch("/:id/password", authorize("Owner"), resetPassword);

router.patch("/:id/status", authorize("Owner"), toggleUserStatus);

router.delete("/:id", authorize("Owner"), deleteUser);

export default router;
