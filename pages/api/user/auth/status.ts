// pages/api/user/auth/status.ts
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import cors from "../../../../lib/cors-middleware";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  await cors(req, res);
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // 1. Obtener el token del encabezado 'Authorization'
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No autenticado: No hay token" });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verificar el token (valida la firma y la expiración)
    const decodedPayload = jwt.verify(token, JWT_SECRET);

    // 3. (Opcional pero recomendado) Obtener datos frescos del usuario desde la BD
    const user = await prisma.user.findUnique({
      where: { id: decodedPayload.userId },
      // Seleccionar solo los campos que queremos devolver (nunca la contraseña)
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "No autenticado: Usuario no encontrado" });
    }

    // 4. Devolver los datos del usuario si el token es válido
    res.status(200).json({ user });
  } catch (error) {
    // jwt.verify lanzará un error si el token es inválido o ha expirado
    console.error("Error de verificación de token:", error);
    res
      .status(401)
      .json({ message: "No autenticado: Token inválido o expirado" });
  }
}