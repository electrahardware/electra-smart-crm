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

export async function getUsers(
  _req: Request,
  res: Response
) {
  try {

    const users =
      await prisma.user.findMany({

        orderBy: {
          name: "asc",
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },

      });

    res.json(users);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Unable to load users.",
    });

  }
}

export async function createUser(
  req: Request,
  res: Response
) {
  try {

    const {
      name,
      email,
      password,
      role,
    } = req.body;

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Name, email and password are required.",
      });
    }

    const existing =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existing) {
      return res.status(400).json({
        message:
          "Email already exists.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await prisma.user.create({

        data: {

          name,

          email,

          password:
            hashedPassword,

          role:
            role || "Sales",

        },

      });

    res.status(201).json({

      id: user.id,

      name: user.name,

      email: user.email,

      role: user.role,

      isActive:
        user.isActive,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Unable to create user.",
    });

  }
}

export async function updateUser(
  req: Request,
  res: Response
) {
  try {

    const id =
      Number(req.params.id);

    const {
      name,
      email,
      role,
      isActive,
    } = req.body;

    const existing =
      await prisma.user.findFirst({

        where: {

          email,

          NOT: {
            id,
          },

        },

      });

    if (existing) {

      return res.status(400).json({

        message:
          "Email already exists.",

      });

    }

    const user =
      await prisma.user.update({

        where: {
          id,
        },

        data: {

          name,

          email,

          role,

          isActive,

        },

      });

    res.json({

      id: user.id,

      name: user.name,

      email: user.email,

      role: user.role,

      isActive: user.isActive,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message:
        "Unable to update user.",

    });

  }

}