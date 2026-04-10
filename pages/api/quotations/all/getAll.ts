// pages/api/quotations/get-all.ts
import { PrismaClient } from "@prisma/client";
import cors from "../../../../lib/cors-middleware";

const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
  await cors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const include = {
      user: { select: { id: true, name: true, email: true, role: true } },
      courses: {
        include: {
          course: { select: { id: true, name: true, abbr: true, imo_no: true } }
        }
      }
    };

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include,
      }),
      prisma.quote.count(),
    ]);

    return res.status(200).json({
      data: quotes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error("Error fetching all quotations:", error);
    return res.status(500).json({
      message: "Error fetching all quotations",
      details: (error as Error)?.message || "Unknown error",
    });
  } finally {
    await prisma.$disconnect();
  }
}