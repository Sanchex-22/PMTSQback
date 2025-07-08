// pages/api/users/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs'; // Importa bcryptjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Manejar solicitudes GET (obtener todos los usuarios)
  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        select: { // Selecciona solo los campos que quieres enviar al cliente (NO LA CONTRASEÑA)
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });
      return res.status(200).json(users);
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
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null, // Permite que el nombre sea opcional
          role: role || 'USER', // Asigna 'USER' por defecto si no se especifica un rol
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