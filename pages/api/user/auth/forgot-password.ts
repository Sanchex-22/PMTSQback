import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import Mailgun from 'mailgun.js';
import cors from '../../../../lib/cors-middleware';

const prisma = new PrismaClient();

if (!process.env.MAILGUN_API_KEY) throw new Error('MAILGUN_API_KEY is not defined');
if (!process.env.MAILGUN_DOMAIN) throw new Error('MAILGUN_DOMAIN is not defined');

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'El correo es obligatorio.' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Siempre respondemos OK para no revelar si el correo existe
    if (!user) {
      return res.status(200).json({ message: 'Si el correo existe, recibirás las instrucciones.' });
    }

    // Solo usuarios de panel pueden recuperar contraseña
    if (user.role === 'CLIENT') {
      return res.status(200).json({ message: 'Si el correo existe, recibirás las instrucciones.' });
    }

    // Generar token seguro (hex de 32 bytes)
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'https://pmts-quote.vercel.app';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 40px 0;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="https://quote.panamamaritimetraining.com/pmts-logo.png" alt="PMTS" width="60" style="border-radius: 8px;" />
          </div>
          <h2 style="color: #1f2937; text-align: center; margin-bottom: 8px;">Recuperar contraseña</h2>
          <p style="color: #6b7280; text-align: center; margin-bottom: 32px;">
            Hola <strong>${user.name || user.email}</strong>, recibimos una solicitud para restablecer tu contraseña.
          </p>
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${resetUrl}"
               style="display: inline-block; background: #f97316; color: white; padding: 12px 32px;
                      border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Restablecer contraseña
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 13px; text-align: center;">
            Este enlace expira en <strong>1 hora</strong>.<br/>
            Si no solicitaste esto, ignora este correo.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #d1d5db; font-size: 11px; text-align: center;">
            Panama Maritime Training Services · noreply@${process.env.MAILGUN_DOMAIN}
          </p>
        </div>
      </body>
      </html>
    `;

    await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: `PMTS <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: email,
      subject: 'Restablecer contraseña - PMTS Panel',
      html,
    });

    return res.status(200).json({ message: 'Si el correo existe, recibirás las instrucciones.' });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
}
