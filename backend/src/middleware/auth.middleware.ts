import dotenv from "dotenv";
dotenv.config();

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    role: string;
  };
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const token = header.replace(
    "Bearer ",
    ""
  );

  const jwtSecret =
    process.env.JWT_SECRET;

  if (!jwtSecret) {

    console.error(
      "JWT_SECRET not found."
    );

    return res.status(500).json({
      message: "JWT Secret missing.",
    });

  }

  try {

    const decoded =
      jwt.verify(
        token,
        jwtSecret
      ) as {
        id: number;
        name: string;
        role: string;
      };

    const user = await prisma.user.findUnique({
  where: {
    id: decoded.id,
  },
});

if (!user) {

  return res.status(401).json({
    message: "User not found.",
  });

}

if (!user.isActive) {

  return res.status(401).json({
    message: "Your account has been disabled.",
  });

}

req.user = {
  id: user.id,
  name: user.name,
  role: user.role,
};

next();

  } catch (error) {

    console.error(
      "JWT Verify Error:",
      error
    );

    return res.status(401).json({
      message: "Invalid token.",
    });

  }
}

export function requireAdminOrManager(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {

  if (!req.user) {

    return res.status(401).json({
      message: "Unauthorized",
    });

  }

  if (
    req.user.role !== "Admin" &&
    req.user.role !== "Manager"
  ) {

    return res.status(403).json({
      message: "Access denied.",
    });

  }

  next();

}