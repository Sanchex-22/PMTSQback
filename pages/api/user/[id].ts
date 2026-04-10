import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import cors from '../../../lib/cors-middleware';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  const userId = parseInt(id as string, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ message: 'ID inválido.' });
  }

  // GET - obtener usuario por ID
  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Error al obtener el usuario.', error });
    }
  }

  // PUT - actualizar usuario
  if (req.method === 'PUT') {
    const { email, name, role, password } = req.body;
    try {
      const updateData: any = {};
      if (email !== undefined) updateData.email = email;
      if (name !== undefined) updateData.name = name;
      if (role !== undefined) updateData.role = role;
      if (password) updateData.password = await bcrypt.hash(password, 10);

      const updated = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
      return res.status(200).json(updated);
    } catch (error: any) {
      if (error.code === 'P2025') return res.status(404).json({ message: 'Usuario no encontrado.' });
      if (error.code === 'P2002') return res.status(409).json({ message: 'El correo ya está en uso.' });
      return res.status(500).json({ message: 'Error al actualizar el usuario.', error });
    }
  }

  // DELETE - eliminar usuario
  if (req.method === 'DELETE') {
    try {
      await prisma.user.delete({ where: { id: userId } });
      return res.status(200).json({ message: 'Usuario eliminado correctamente.' });
    } catch (error: any) {
      if (error.code === 'P2025') return res.status(404).json({ message: 'Usuario no encontrado.' });
      return res.status(500).json({ message: 'Error al eliminar el usuario.', error });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
