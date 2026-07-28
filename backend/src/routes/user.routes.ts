import { Router } from "express";
import {
  requireAuth,
  requireAdminOrManager,
} from "../middleware/auth.middleware";

import {
  login,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetPassword,
} from "../controllers/user.controller";

const router = Router();

router.post(
  "/login",
  login
);

router.use(requireAuth);

router.get(
  "/",
  requireAdminOrManager,
  getUsers
);

router.post(
  "/",
  requireAdminOrManager,
  createUser
);

router.put(
  "/:id",
  requireAdminOrManager,
  updateUser
);

router.patch(
  "/:id/password",
  requireAdminOrManager,
  resetPassword
);

router.patch(
  "/:id/status",
  requireAdminOrManager,
  toggleUserStatus
);

router.delete(
  "/:id",
  requireAdminOrManager,
  deleteUser
);

export default router;