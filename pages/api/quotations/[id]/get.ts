// pages/api/quotations/[id]/get.ts
import { PrismaClient } from "@prisma/client";
import cors from "../../../../lib/cors-middleware"; // ¡NOTA: La ruta a cors-middleware ha cambiado!

const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
  await cors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { id } = req.query;

  if (!id || isNaN(parseInt(id as string))) {
    return res.status(400).json({ message: "Invalid quotation ID." });
  }

  try {
    const quoteId = parseInt(id as string);

    // --- AUTENTICACIÓN Y AUTORIZACIÓN: ¡CRÍTICO! ---
    // Aquí deberías integrar tu lógica de autenticación para verificar:
    // 1. Si el usuario está logueado.
    // 2. Si el usuario tiene rol 'ADMIN' o 'SALES', puede ver cualquier cotización.
    // 3. Si el usuario tiene rol 'CLIENT', solo puede ver las cotizaciones donde userId coincida con su propio ID.
    // Ejemplo (pseudocódigo, necesitas tus JWT/Session parsers aquí):
    /*
    const user = req.user; // Asume que el middleware de auth ya populó req.user
    if (!user) {
      return res.status(401).json({ message: "Authentication required." });
    }
    // Si necesitas el objeto completo de la cotización para la autorización:
    // const quoteToCheckAuth = await prisma.quote.findUnique({ where: { id: quoteId } });
    // if (!quoteToCheckAuth) { /* manejar 404 */ /* }
    // if (user.role === 'CLIENT' && user.id !== quoteToCheckAuth.userId) {
    //   return res.status(403).json({ message: "Forbidden: You can only view your own quotations." });
    // }
    */
    // --- FIN AUTENTICACIÓN Y AUTORIZACIÓN ---

    const quote = await prisma.quote.findUnique({
      where: {
        id: quoteId,
      },
      // Incluye los detalles del usuario y del curso para una vista completa
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            abbr: true,
            imo_no: true,
            price_panamanian: true,
            price_panamanian_renewal: true,
            price_foreign: true,
            price_foreign_renewal: true,
          },
        },
      },
    });

    if (!quote) {
      return res.status(404).json({ message: "Quotation not found." });
    }

    // Calcular si la cotización ha expirado
    const hasExpired = new Date() > quote.expiresAt;
    // Si la cotización está PENDIENTE pero ha expirado, cambia su estado a EXPIRED en la respuesta
    const currentStatus = hasExpired && quote.status === 'PENDING' ? 'EXPIRED' : quote.status;

    // Puedes devolver más detalles aquí si se almacenaron en el proceso de creación (ej. nationality, government info)
    return res.status(200).json({
      ...quote,
      status: currentStatus, // Asegura que el estado se refleje como EXPIRED si el tiempo pasó
      hasExpired: hasExpired,
      expiresAt: quote.expiresAt.toISOString(), // Formato ISO para fácil manejo en frontend
      createdAt: quote.createdAt.toISOString(),
    });
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