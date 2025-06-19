// pages/api/quotations/[id]/approve.ts
import { PrismaClient } from "@prisma/client";
import cors from "../../../../lib/cors-middleware"; // Ajusta la ruta si es necesario

const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
  await cors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { id } = req.query;

  if (!id || isNaN(parseInt(id as string))) {
    return res.status(400).json({ message: "Invalid quotation ID." });
  }

  try {
    const quoteId = parseInt(id as string);

    // --- AUTORIZACIÓN: ¡CRÍTICO! ---
    // SOLO los usuarios 'ADMIN' o 'SALES' deberían poder aprobar cotizaciones.
    // Ejemplo (pseudocódigo):
    /*
    const user = req.user; // Asume que el middleware de auth ya populó req.user
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SALES')) {
      return res.status(403).json({ message: "Forbidden: You do not have permission to approve quotations." });
    }
    */
    // --- FIN AUTORIZACIÓN ---

    const existingQuote = await prisma.quote.findUnique({
      where: { id: quoteId },
    });

    if (!existingQuote) {
      return res.status(404).json({ message: "Quotation not found." });
    }

    // Opcional: Podrías añadir lógica para evitar aprobar una cotización ya expirada o rechazada.
    // if (existingQuote.status !== 'PENDING') {
    //   return res.status(400).json({ message: `Quotation is already in ${existingQuote.status} status and cannot be approved.` });
    // }

    const updatedQuote = await prisma.quote.update({
      where: {
        id: quoteId,
      },
      data: {
        status: "APPROVED",
      },
    });

    return res.status(200).json({
      message: "Quotation approved successfully.",
      quote: {
        id: updatedQuote.id,
        status: updatedQuote.status,
        quotedPrice: updatedQuote.quotedPrice,
        expiresAt: updatedQuote.expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error approving quotation:", error);
    return res.status(500).json({
      message: "Error approving quotation",
      details: (error as Error)?.message || "Unknown error",
    });
  } finally {
    await prisma.$disconnect();
  }
}