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
    // Usamos findMany para obtener TODAS las cotizaciones
    const quotes = await prisma.quote.findMany({
      // Ordenamos las cotizaciones de la más reciente a la más antigua
      orderBy: {
        createdAt: 'desc',
      },
      // El 'include' es idéntico al de buscar una sola cotización,
      // pero se aplicará a cada una de las cotizaciones en la lista.
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
        // 2. Incluimos los items de la cotización
        courses: {
          // 3. Para cada item, incluimos los detalles del curso asociado
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

    if (!quotes) {
        // Aunque findMany devuelve [] si no encuentra nada, mantenemos esta comprobación por si acaso.
        return res.status(404).json({ message: "No quotations found." });
    }

    // El resultado 'quotes' es un array donde cada elemento es una cotización
    // completa con su usuario y su lista de cursos.
    return res.status(200).json(quotes);

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