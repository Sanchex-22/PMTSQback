// pages/api/cron/expire-quotations.ts
import { PrismaClient } from "@prisma/client";
const dotenv = require("dotenv"); // Asegúrate de que dotenv esté configurado para este archivo
dotenv.config();

const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
  // --- SEGURIDAD: VERIFICAR LA CLAVE SECRETA DEL CRON JOB ---
  const CRON_SECRET = process.env.CRON_JOB_SECRET;

  // Si no hay una clave secreta configurada o la que viene en la cabecera es incorrecta,
  // devuelve un error de autorización.
  if (!CRON_SECRET || req.headers['x-cron-secret'] !== CRON_SECRET) {
    console.warn("Unauthorized attempt to access cron job.");
    return res.status(401).json({ message: "Unauthorized: Invalid cron secret." });
  }

  // Asegúrate de que solo se permita el método GET para este cron job
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const now = new Date(); // Fecha y hora actual

    // Busca todas las cotizaciones que están en estado PENDING
    // y cuya fecha de expiración es anterior a la fecha actual.
    const { count } = await prisma.quote.updateMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: now, // 'lt' significa 'less than' (anterior a)
        },
      },
      data: {
        status: "EXPIRED", // Actualiza el estado a EXPIRED
      },
    });

    console.log(`[CRON] ${count} quotations updated to EXPIRED.`);

    return res.status(200).json({
      success: true,
      message: `Successfully expired ${count} pending quotations.`,
      expiredCount: count,
    });
  } catch (error) {
    console.error("Error running cron job to expire quotations:", error);
    return res.status(500).json({
      message: "Error running cron job",
      details: (error as Error)?.message || "Unknown error",
    });
  } finally {
    await prisma.$disconnect();
  }
}