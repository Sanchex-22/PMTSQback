import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import cors from '../../../lib/cors-middleware';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(10, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    // Clientes únicos derivados de cotizaciones (usuarios que han cotizado)
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          quotes: { some: {} }, // solo usuarios con al menos una cotización
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { quotes: true } },
          quotes: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { createdAt: true, quotedPrice: true, status: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: { quotes: { some: {} } } }),
    ]);

    const data = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      totalQuotes: u._count.quotes,
      lastQuote: u.quotes[0] ?? null,
    }));

    return res.status(200).json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return res.status(500).json({ message: 'Error al obtener clientes.' });
  }
}
