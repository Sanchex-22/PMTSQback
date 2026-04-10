import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import cors from '../../../lib/cors-middleware';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  const courseId = parseInt(id as string, 10);

  if (isNaN(courseId)) {
    return res.status(400).json({ message: 'ID inválido.' });
  }

  // GET - obtener curso por ID
  if (req.method === 'GET') {
    try {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) return res.status(404).json({ message: 'Curso no encontrado.' });
      return res.status(200).json(course);
    } catch (error) {
      return res.status(500).json({ message: 'Error al obtener el curso.', error });
    }
  }

  // PUT - actualizar curso
  if (req.method === 'PUT') {
    const { name, abbr, imo_no, price_panamanian, price_panamanian_renewal, price_foreign, price_foreign_renewal } = req.body;
    try {
      const updated = await prisma.course.update({
        where: { id: courseId },
        data: {
          ...(name !== undefined && { name }),
          ...(abbr !== undefined && { abbr }),
          ...(imo_no !== undefined && { imo_no }),
          ...(price_panamanian !== undefined && { price_panamanian: parseFloat(price_panamanian) }),
          ...(price_panamanian_renewal !== undefined && { price_panamanian_renewal: parseFloat(price_panamanian_renewal) }),
          ...(price_foreign !== undefined && { price_foreign: parseFloat(price_foreign) }),
          ...(price_foreign_renewal !== undefined && { price_foreign_renewal: parseFloat(price_foreign_renewal) }),
        },
      });
      return res.status(200).json(updated);
    } catch (error: any) {
      if (error.code === 'P2025') return res.status(404).json({ message: 'Curso no encontrado.' });
      if (error.code === 'P2002') return res.status(409).json({ message: 'Ya existe un curso con ese nombre.' });
      return res.status(500).json({ message: 'Error al actualizar el curso.', error });
    }
  }

  // DELETE - soft delete
  if (req.method === 'DELETE') {
    try {
      await prisma.course.update({
        where: { id: courseId },
        data: { deletedAt: new Date() },
      });
      return res.status(200).json({ message: 'Curso eliminado correctamente.' });
    } catch (error: any) {
      if (error.code === 'P2025') return res.status(404).json({ message: 'Curso no encontrado.' });
      return res.status(500).json({ message: 'Error al eliminar el curso.', error });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
