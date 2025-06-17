// /pages/api/license/license-quote.ts

import type { NextApiRequest, NextApiResponse } from "next";
import Mailgun from "mailgun.js";
import FormData from "form-data"; // Necesario para que Mailgun funcione en Node.js
import formidable from "formidable";
import fs from "fs"; // Módulo 'File System' de Node.js para leer archivos
import cors from "../../../lib/cors-middleware";
import { license_code } from "../../../data/codes";

export const config = {
  api: {
    bodyParser: false,
  },
};

if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
  throw new Error("Las variables de entorno de Mailgun no están definidas.");
}

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

// --- EL HANDLER PRINCIPAL ---
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Aplicar el middleware de CORS
  await cors(req, res);
  // Manejar preflight CORS OPTIONS manualmente
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin as string);
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  try {
    const data: { fields: formidable.Fields; files: formidable.Files } =
      await new Promise((resolve, reject) => {
        const form = formidable({});
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({ fields, files });
        });
      });

    const { fields, files } = data;

    const nombre = fields.nombre?.[0] || "No proporcionado";
    const apellido = fields.apellido?.[0] || "";
    const correo = fields.correo?.[0];
    const telefono = fields.telefono?.[0] || "No proporcionado";
    const direccion = fields.direccion?.[0] || "No proporcionado";
    const licencias = fields.licencias?.[0] || "Sin información adicional.";

    if (!correo) {
      return res.status(400).json({ message: "El campo de correo es requerido." });
    }
    
    const documentoFile = files.documento?.[0];
    if (!documentoFile) {
        return res.status(400).json({ message: "El documento es requerido." });
    }

    const fileBuffer = fs.readFileSync(documentoFile.filepath);

    const emailSubject = `Nueva Solicitud de Licencia (${license_code}): ${nombre} ${apellido}`;
    const emailHtmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">Nueva Solicitud de Licencia Recibida</h2>
          <p>Se ha recibido una nueva solicitud a través del formulario web.</p>
          <hr>
          <h3>Detalles del Solicitante:</h3>
          <ul>
            <li><strong>Nombre Completo:</strong> ${nombre} ${apellido}</li>
            <li><strong>Correo Electrónico:</strong> ${correo}</li>
            <li><strong>Teléfono:</strong> ${telefono}</li>
            <li><strong>Dirección:</strong> ${direccion}</li>
          </ul>
          <h3>Consulta sobre Licencias:</h3>
          <p style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
            ${licencias.replace(/\n/g, '<br>')}
          </p>
          <hr>
          <p>El documento de identificación (cédula/pasaporte) se encuentra adjunto a este correo.</p>
        </body>
      </html>
    `;

    const emailData = {
      from: `PMTSQ Licenses <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: "sanchex.dev02@gmail.com", // <-- CAMBIA ESTO AL CORREO DONDE QUIERES RECIBIR LAS NOTIFICACIONES
      cc: "sanchex.dev02@gmail.com", // Opcional
      subject: emailSubject,
      html: emailHtmlBody,
      attachment: [
        {
          filename: documentoFile.originalFilename || "documento.pdf", // Usamos el nombre original del archivo
          data: fileBuffer,
        },
      ],
    };

    const mailgunResponse = await mg.messages.create(process.env.MAILGUN_DOMAIN, emailData);
    
    console.log("Correo enviado con éxito:", mailgunResponse);

    // Enviar una respuesta de éxito al frontend
    return res.status(200).json({ success: true, message: "Solicitud recibida y correo enviado." });

  } catch (error) {
    console.error("Error en el handler de la API:", error);
    return res.status(500).json({ message: "Error interno del servidor al procesar la solicitud." });
  }
}