import { Request, Response } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "electra_secret";

export async function login(
  req: Request,
  res: Response
) {
  try {

    const {
      email,
      password,
    } = req.body;

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    const valid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!valid) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    const token =
      jwt.sign(
        {
          id: user.id,
          role: user.role,
        },
        JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Login failed.",
    });

  }
}