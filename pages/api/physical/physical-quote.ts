// /pages/api/physical/physical-quote.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Mailgun from "mailgun.js";
import FormDataNode from "form-data";
import formidable, { File as FormidableFile } from "formidable"; // Importar File también si se usa explícitamente
import fs from "fs";
import cors from "../../../lib/cors-middleware";
import { physical_code } from "../../../data/codes";

export const config = {
  api: {
    bodyParser: false,
  },
};

if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
  throw new Error(
    "MAILGUN_API_KEY o MAILGUN_DOMAIN no están definidos en las variables de entorno."
  );
}

const mailgun = new Mailgun(FormDataNode);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

const ADMIN_EMAIL_RECIPIENT = "sanchex.dev02@gmail.com";

const EXPECTED_FILE_FIELDS = [
  "documento_identidad",
  "blood_count",
  "chemistry",
  "rh_type",
  "drug_test",
  "urinalysis",
  "stool_test",
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await cors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    return res.status(405).json({ message: `Método ${req.method} no permitido.` });
  }

  console.log("API Handler: /api/physical/physical-quote recibió una solicitud POST.");

  try {
    const data: { fields: formidable.Fields; files: formidable.Files } =
      await new Promise((resolve, reject) => {
        const form = formidable({
          multiples: true,
          keepExtensions: true,
          // Opcional: Establecer un límite de tamaño de archivo si es necesario
          // maxFileSize: 5 * 1024 * 1024, // 5MB por archivo
        });
        form.parse(req, (err, fields, files) => {
          if (err) {
            console.error("Error al parsear el formulario con formidable:", err);
            return reject(err);
          }
          console.log("Formidable: Campos de texto parseados:", Object.keys(fields));
          console.log("Formidable: Campos de archivo parseados (nombres):", Object.keys(files));
          // Log más detallado de los archivos parseados
          Object.entries(files).forEach(([fieldName, fileArray]) => {
            if (Array.isArray(fileArray)) {
              fileArray.forEach((file, index) => {
                console.log(`Formidable: Archivo [${fieldName}][${index}]: originalFilename=${file.originalFilename}, size=${file.size}, filepath=${file.filepath}`);
              });
            }
          });
          resolve({ fields, files });
        });
      });

    const { fields, files } = data;

    const posicion = fields.posicion?.[0] || "No proporcionado";
    const nombre = fields.nombre?.[0] || "No proporcionado";
    const peso = fields.peso?.[0] || "No proporcionado";
    const altura = fields.altura?.[0] || "No proporcionado";
    const direccion = fields.direccion?.[0] || "No proporcionado";
    const gafas = fields.gafas?.[0] || "No proporcionado";
    const condiciones = fields.condiciones?.[0] || "Ninguna especificada.";
    const prescripcion = fields.prescripcion?.[0] || "Ninguna especificada.";
    const cirugia = fields.cirugia?.[0] || "Ninguna especificada.";
    const tipo_vacuna = fields.tipo_vacuna?.[0] || "No proporcionado";
    const ultimo_positivo = fields.ultimo_positivo?.[0] || "No proporcionado";
    const ultimo_test = fields.ultimo_test?.[0] || "No proporcionado";

// ... (resto del código igual hasta el bucle) ...

    const attachments = [];
    console.log(attachments.length, "adjuntos preparados inicialmente.");
    console.log("--- Iniciando preparación de adjuntos ---");
    for (const fieldName of EXPECTED_FILE_FIELDS) {
      console.log(`Procesando campo de archivo esperado: ${fieldName}`);
      const fileArray = files[fieldName] as FormidableFile[] | undefined;

      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];
        console.log(`  Encontrado archivo para ${fieldName}: ${file.originalFilename}, tamaño: ${file.size}`);
        if (file.size > 0) {
          try {
            const fileBuffer = fs.readFileSync(file.filepath);
            
            // --- MODIFICACIÓN AQUÍ ---
            const uniqueFilename = `${fieldName}_'adjunto.dat'`;
            attachments.push({
              filename: uniqueFilename, // Usar el nombre de archivo único
              data: fileBuffer,
            });
            // --- FIN DE LA MODIFICACIÓN ---

            console.log(`    Adjunto '${uniqueFilename}' añadido. Total adjuntos ahora: ${attachments.length}`);
          } catch (fileError) {
            console.error(`  Error al leer el archivo ${fieldName} (${file.originalFilename}):`, fileError);
          }
        } else {
          console.log(`  Archivo para ${fieldName} (${file.originalFilename}) tiene tamaño 0, omitiendo.`);
        }
      } else {
        console.log(`  No se encontró archivo para el campo ${fieldName}.`);
      }
    }
    console.log("--- Finalizada preparación de adjuntos ---");
    attachments.forEach((att, idx) => console.log(`Adjunto ${idx}: ${att.filename}`));


    const emailSubject = `Nuevo Certificado Médico Recibido (${physical_code}): ${nombre}`;
    const emailHtmlBody = `
      <html>
        <body>
          <h2>Nuevo Certificado Médico Recibido</h2>
          <p>Se ha recibido un nuevo formulario de certificado médico.</p>
          <h3>Información Personal:</h3>
          <ul>
            <li><strong>Nombre:</strong> ${nombre}</li>
            <li><strong>Posición:</strong> ${posicion}</li>
            <li><strong>Peso:</strong> ${peso}</li>
            <li><strong>Altura:</strong> ${altura}</li>
            <li><strong>Dirección:</strong> ${direccion}</li>
            <li><strong>Gafas:</strong> ${gafas}</li>
          </ul>
          <h3>Información Médica:</h3>
          <ul>
            <li><strong>Condiciones:</strong> <pre>${condiciones}</pre></li>
            <li><strong>Prescripción:</strong> <pre>${prescripcion}</pre></li>
            <li><strong>Cirugía:</strong> <pre>${cirugia}</pre></li>
          </ul>
          <h3>Información COVID:</h3>
          <ul>
            <li><strong>Vacuna:</strong> ${tipo_vacuna}</li>
            <li><strong>Último Positivo:</strong> ${ultimo_positivo}</li>
            <li><strong>Último Test:</strong> ${ultimo_test}</li>
          </ul>
          <p>${attachments.length > 0 ? "Exámenes físicos adjuntos." : "No se adjuntaron exámenes."}</p>
        </body>
      </html>
    `;

    const emailData: any = {
      from: `Medical Certificates PMTSQ <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: ADMIN_EMAIL_RECIPIENT,
      subject: emailSubject,
      html: emailHtmlBody,
    };

    if (attachments.length > 0) {
      emailData.attachment = attachments; // Esto es correcto para múltiples adjuntos
    } else {
      console.log("No hay adjuntos para enviar con Mailgun.");
    }

    console.log(`Enviando correo a ${ADMIN_EMAIL_RECIPIENT} con ${attachments.length} adjuntos.`);

    const mailgunResponse = await mg.messages.create(
      process.env.MAILGUN_DOMAIN as string,
      emailData
    );

    console.log("Respuesta de Mailgun:", mailgunResponse);

    // Opcional: Limpiar archivos temporales si formidable no lo hace automáticamente
    // Esto es más seguro hacerlo DESPUÉS de que el correo se envió con éxito.
    Object.values(files).flat().forEach((file: FormidableFile) => {
        if (file && file.filepath) {
            fs.unlink(file.filepath, (err) => {
                if (err) console.error(`Error al eliminar archivo temporal ${file.filepath}:`, err);
                // else console.log(`Archivo temporal ${file.filepath} eliminado.`);
            });
        }
    });


    return res.status(200).json({
        success: true,
        message: "Formulario de certificado médico recibido y correo enviado.",
        mailgun_id: mailgunResponse.id
    });

  } catch (error: any) {
    console.error("Error en el handler de la API /api/physical/physical-quote:", error);
    let errorMessage = "Error interno del servidor al procesar la solicitud.";
    if (error.message) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    
    if (error.httpCode) { // Errores de formidable
        return res.status(error.httpCode).json({ message: errorMessage, success: false });
    }

    return res.status(500).json({ message: errorMessage, success: false });
  }
}