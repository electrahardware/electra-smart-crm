import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "electra_secret";

export interface AuthRequest
  extends Request {

  user?: {
    id: number;
    role: string;
  };

}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {

  const header =
    req.headers.authorization;

  if (
    !header ||
    !header.startsWith("Bearer ")
  ) {

    return res.status(401).json({
      message: "Unauthorized",
    });

  }

  const token =
    header.replace(
      "Bearer ",
      ""
    );

  try {

    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      ) as {
        id: number;
        role: string;
      };

    req.user = decoded;

    next();

  } catch {

    return res.status(401).json({
      message: "Invalid token.",
    });

  }

}