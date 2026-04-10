import { PrismaClient } from "@prisma/client";
import cors from "../../../../../lib/cors-middleware";

const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
  await cors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "DELETE") return res.status(405).json({ message: "Method Not Allowed" });

  const { id } = req.query;
  if (!id || isNaN(parseInt(id as string))) {
    return res.status(400).json({ message: "ID de cotización inválido." });
  }

  const quoteId = parseInt(id as string);
  // ?hard=true para borrado permanente (solo admin)
  const hard = req.query.hard === "true";

  try {
    const existing = await prisma.quote.findUnique({ where: { id: quoteId } });
    if (!existing) return res.status(404).json({ message: "Cotización no encontrada." });

    if (hard) {
      // Eliminar items de cursos primero (FK constraint), luego la cotización
      await prisma.quoteCourse.deleteMany({ where: { quoteId } });
      await prisma.quote.delete({ where: { id: quoteId } });
      return res.status(200).json({ message: "Cotización eliminada permanentemente." });
    }

    // Soft delete
    await prisma.quote.update({
      where: { id: quoteId },
      data: { deletedAt: new Date() },
    });
    return res.status(200).json({ message: "Cotización eliminada correctamente." });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ message: "Cotización no encontrada." });
    return res.status(500).json({ message: "Error al eliminar la cotización.", details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
