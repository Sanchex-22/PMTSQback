// pages/api/quotations/[id]/get.ts
import { PrismaClient } from "@prisma/client";
import cors from "../../../../lib/cors-middleware"; // ¡Asegúrate de que la ruta a cors-middleware sea correcta!

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
    // (Mantén aquí tu lógica de autenticación y autorización)
    // --- FIN AUTENTICACIÓN Y AUTORIZACIÓN ---

    // 1. Obtener la cotización actual de la DB
    let quote = await prisma.quote.findUnique({ // Usamos 'let' porque 'quote' podría ser reasignado
      where: {
        id: quoteId,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        course: { select: { id: true, name: true, abbr: true, imo_no: true } }, // Puedes seleccionar los campos que necesites
      },
    });

    if (!quote) {
      return res.status(404).json({ message: "Quotation not found." });
    }

    // 2. Verificar si la cotización ha expirado y si su estado es PENDING
    const now = new Date();
    if (quote.status === 'PENDING' && now > quote.expiresAt) {
      console.log(`[INFO] Quotation ${quoteId} has expired. Updating status to EXPIRED.`);
      // 3. Si ha expirado y está pendiente, actualizar su estado en la DB
      quote = await prisma.quote.update({ // Reasigna la cotización con el estado actualizado
        where: { id: quoteId },
        data: { status: 'EXPIRED' },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          course: { select: { id: true, name: true, abbr: true, imo_no: true } },
        },
      });
    }

    // 4. Devolver la cotización (ahora con el estado potencialmente actualizado)
    const hasExpired = new Date() > quote.expiresAt; // Esto seguirá siendo true si se acaba de expirar
    // Ya no necesitamos 'currentStatus' porque 'quote.status' ya está actualizado
    return res.status(200).json({
      ...quote,
      status: quote.status, // Será 'EXPIRED' si se actualizó
      hasExpired: hasExpired,
      expiresAt: quote.expiresAt.toISOString(),
      createdAt: quote.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching or updating quotation status:", error);
    return res.status(500).json({
      message: "Error fetching or updating quotation status",
      details: (error as Error)?.message || "Unknown error",
    });
  } finally {
    await prisma.$disconnect();
  }
}