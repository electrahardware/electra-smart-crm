import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "electra_secret";

console.log("LOGIN SECRET =", JWT_SECRET);
console.log("TOKEN WILL BE CREATED");

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

    if (!user.isActive) {

  return res.status(403).json({

    message:
      "Your account has been disabled. Please contact Administrator.",

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

    console.log(
  "LOGIN SECRET:",
  JWT_SECRET
);

    const token =
  jwt.sign(
    {
      id: user.id,
      name: user.name,
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

export async function toggleUserStatus(
  req: Request,
  res: Response
) {

  try {

    const id =
      Number(req.params.id);

    const {
      isActive,
    } = req.body;

    const user =
      await prisma.user.update({

        where: {
          id,
        },

        data: {
          isActive,
        },

      });

    res.json(user);

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message:
        "Unable to update user status.",

    });

  }

}

export async function deleteUser(
  req: AuthRequest,
  res: Response
) {

  try {

    const id =
      Number(req.params.id);

    const user =
      await prisma.user.findUnique({

        where: {
          id,
        },

      });

    if (!user) {

      return res.status(404).json({

        message:
          "User not found.",

      });

    }

    if (user.role === "Admin") {

      return res.status(400).json({

        message:
          "Owner cannot be deleted.",

      });

    }

    if (req.user?.id === id) {

  return res.status(400).json({

    message:
      "You cannot delete your own account.",

  });

}

    await prisma.user.delete({

      where: {
        id,
      },

    });

    res.json({

      success: true,

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message:
        "Unable to delete user.",

    });

  }

}

export async function resetPassword(
  req: Request,
  res: Response
) {

  try {

    const id =
      Number(req.params.id);

    const {
      password,
    } = req.body;

    if (!password) {

      return res.status(400).json({

        message:
          "Password is required.",

      });

    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    await prisma.user.update({

      where: {
        id,
      },

      data: {

        password:
          hashedPassword,

      },

    });

    res.json({

      success: true,

      message:
        "Password reset successfully.",

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      message:
        "Unable to reset password.",

    });

  }

}