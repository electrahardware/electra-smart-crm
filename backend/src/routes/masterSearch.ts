import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
const prisma = new PrismaClient();

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();

    if (!q) {
      return res.json([]);
    }

    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          {
            customerName: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            shopName: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            mobile: {
              contains: q,
            },
          },
          {
            secondaryMobile: {
              contains: q,
            },
          },
          {
            whatsapp: {
              contains: q,
            },
          },
          {
            gst: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            city: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            district: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            state: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            area: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: q,
              mode: "insensitive",
            },
          },
        ],
      },

      select: {
        id: true,
        customerName: true,
        mobile: true,
        whatsapp: true,
        shopName: true,
        city: true,
        state: true,
        status: true,
        leadOwner: true,
      },

      take: 20,

      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(leads);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Master Search Failed",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid Lead ID",
      });
    }

    const lead = await prisma.lead.findUnique({
      where: {
        id,
      },
      include: {
        notesHistory: true,
        activities: true,
        attachments: true,
        calls: true,
        timeline: true,
        quotations: true,
      },
    });

    if (!lead) {
      return res.status(404).json({
        message: "Lead Not Found",
      });
    }

    res.json(lead);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default router;
