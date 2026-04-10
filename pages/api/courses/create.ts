import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import cors from '../../../lib/cors-middleware';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { name, abbr, imo_no, price_panamanian, price_panamanian_renewal, price_foreign, price_foreign_renewal } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'El nombre del curso es obligatorio.' });
  }

  try {
    const newCourse = await prisma.course.create({
      data: {
        name,
        abbr: abbr || null,
        imo_no: imo_no || null,
        price_panamanian: price_panamanian != null ? parseFloat(price_panamanian) : null,
        price_panamanian_renewal: price_panamanian_renewal != null ? parseFloat(price_panamanian_renewal) : null,
        price_foreign: price_foreign != null ? parseFloat(price_foreign) : null,
        price_foreign_renewal: price_foreign_renewal != null ? parseFloat(price_foreign_renewal) : null,
      },
    });
    return res.status(201).json(newCourse);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'Ya existe un curso con ese nombre.' });
    return res.status(500).json({ message: 'Error al crear el curso.', error });
  }
}
