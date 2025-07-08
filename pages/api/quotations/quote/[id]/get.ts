// pages/api/quotations/[id]/get.ts
import { PrismaClient } from "@prisma/client";
import cors from "../../../../../lib/cors-middleware";


const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
  await cors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { id } = req.query; // Obtener el ID de la URL, ej: /api/quotations/123

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: "A valid quotation ID is required." });
  }

  const quotationId = parseInt(id);

  try {
    // Usamos findUnique para obtener una sola cotización por su ID
    const quote = await prisma.quote.findUnique({
      where: {
        id: quotationId,
      },
      // El 'include' es la clave para traer toda la data relacionada
      include: {
        // 1. Incluimos la información del usuario
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        // 2. Incluimos los items de la cotización (desde la tabla intermedia QuoteCourse)
        courses: {
          // 3. Para cada item, incluimos los detalles completos del curso asociado
          include: {
            course: {
              select: {
                id: true,
                name: true,
                abbr: true,
                imo_no: true
              }
            }
          }
        }
      }
    });

    if (!quote) {
      return res.status(404).json({ message: "Quotation not found." });
    }

    // El resultado 'quote' ahora contiene el usuario y una lista de cursos con sus detalles.
    return res.status(200).json(quote);

  } catch (error) {
    console.error("Error fetching quotation:", error);
    return res.status(500).json({
      message: "Error fetching quotation",
      details: (error as Error)?.message || "Unknown error",
    });
  } finally {
    await prisma.$disconnect();
  }
}