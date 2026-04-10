// pages/api/users/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import cors from '../../../lib/cors-middleware';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Manejar solicitudes GET (obtener todos los usuarios, con paginación)
  if (req.method === 'GET') {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(10, parseInt(req.query.limit as string) || 50));
      const skip = (page - 1) * limit;

      // Solo usuarios con acceso al panel (no clientes)
      const adminFilter = { role: { in: ['ADMIN', 'SALES'] as any } };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: adminFilter,
          select: { id: true, email: true, name: true, role: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.user.count({ where: adminFilter }),
      ]);

      return res.status(200).json({
        data: users,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Error al obtener usuarios.', error });
    }
  }

  // Manejar solicitudes POST (crear un nuevo usuario)
  else if (req.method === 'POST') {
    const { email, password, name, role } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
    }

    try {
      // 1. Verificar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({ message: 'Ya existe un usuario con este correo electrónico.' });
      }

      // 2. Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10); // El segundo parámetro es el 'saltRounds'

      // 3. Crear el usuario en la base de datos
      const allowedRoles = ['ADMIN', 'SALES'];
      const assignedRole = allowedRoles.includes(role) ? role : 'SALES';

      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          role: assignedRole,
        },
        select: { // Selecciona solo los campos que quieres enviar al cliente (NO LA CONTRASEÑA)
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      return res.status(201).json(newUser);
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.code === 'P2002') { // Prisma error code for unique constraint violation
        return res.status(409).json({ message: 'Error de conflicto: El correo electrónico ya está en uso.' });
      }
      return res.status(500).json({ message: 'Error al crear el usuario.', details: error.message });
    }
  }

  // Manejar otros métodos HTTP no permitidos
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}