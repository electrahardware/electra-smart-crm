import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function getAuditLogs(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string)?.trim() || "";
    const module = (req.query.module as string)?.trim() || "";
    const action = (req.query.action as string)?.trim() || "";
    const user = (req.query.user as string)?.trim() || "";
    const fromDate = (req.query.fromDate as string)?.trim() || "";

    const toDate = (req.query.toDate as string)?.trim() || "";

    const where: Prisma.AuditLogWhereInput = {};

    if (module) {
      where.module = module;
    }

    if (action) {
      where.action = action;
    }

    if (user) {
      where.userName = {
        contains: user,
        mode: Prisma.QueryMode.insensitive,
      };
    }

    // ------------------------
    // Date Filter
    // ------------------------

    if (fromDate || toDate) {
      where.createdAt = {};

      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }

      if (toDate) {
        const end = new Date(toDate);

        end.setHours(23, 59, 59, 999);

        where.createdAt.lte = end;
      }
    }

    if (search) {
      where.OR = [
        {
          userName: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          module: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          entityName: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          action: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.auditLog.count({
        where,
      }),
    ]);

    res.json({
      data: logs,
      total,
      page,
      limit,
    });
  } catch (error: any) {
    console.error("===== AUDIT ERROR =====");
    console.error(error);
    console.error(error.message);
    console.error(error.code);
    console.error(error.meta);

    res.status(500).json({
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
  }
}
