import dotenv from "dotenv";
dotenv.config();

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    role: string;
  };
}

export function requireAuth(
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

    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role,
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