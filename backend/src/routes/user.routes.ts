import { Router } from "express";
import {
  login,
  getUsers,
  createUser,
} from "../controllers/user.controller";

const router = Router();

router.post(
  "/login",
  login
);

router.get(
  "/",
  getUsers
);

router.post(
  "/",
  createUser
);

export default router;