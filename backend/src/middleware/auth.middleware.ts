import dotenv from "dotenv";
dotenv.config();

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    role: string;
  };
}

export function isLeadPrivileged(role?: string) {
  return role === "Owner" || role === "Sales Manager";
}

/**
 * Central ownership check for resources that belong to a lead. Owners and
 * sales managers can access every lead; sales executives can access only
 * leads assigned to their own name.
 */
export async function requireLeadAccess(
  req: AuthRequest,
  res: Response,
  leadId: number,
): Promise<boolean> {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }

  if (!Number.isInteger(leadId) || leadId <= 0) {
    res.status(400).json({ message: "Invalid Lead ID" });
    return false;
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { leadOwner: true },
  });

  if (!lead) {
    res.status(404).json({ message: "Lead not found." });
    return false;
  }

  if (!isLeadPrivileged(req.user.role) && lead.leadOwner !== req.user.name) {
    res.status(403).json({ message: "You do not have access to this lead." });
    return false;
  }

  return true;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
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

  const token = header.replace("Bearer ", "");

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("JWT_SECRET not found.");

    return res.status(500).json({
      message: "JWT Secret missing.",
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as {
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
    console.error("JWT Verify Error:", error);

    return res.status(401).json({
      message: "Invalid token.",
    });
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    next();
  };
}
