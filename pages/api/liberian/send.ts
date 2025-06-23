// /pages/api/liberia/submit-application.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Mailgun from "mailgun.js";
import FormDataNode from "form-data";
import formidable, { File as FormidableFile } from "formidable";
import fs from "fs";
import path from "path"; // Import path para obtener extensiones de archivo
import cors from "../../../lib/cors-middleware";
import { liberia_code } from "../../../data/codes";
// Puedes crear un código de solicitud específico para este formulario
// import { liberia_app_code } from "../../../data/codes";

// --- VALIDACIÓN DE VARIABLES DE ENTORNO ---
if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
  throw new Error(
    "MAILGUN_API_KEY o MAILGUN_DOMAIN no están definidos en las variables de entorno."
  );
}

// --- CONFIGURACIÓN DE MAILGUN ---
const mailgun = new Mailgun(FormDataNode);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

// --- CONFIGURACIÓN DE LA API ROUTE ---
export const config = {
  api: {
    bodyParser: false, // ¡Esencial! formidable se encarga del parseo.
  },
};

// --- HANDLER PRINCIPAL ---
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
    return res
      .status(405)
      .json({ message: `Método ${req.method} no permitido.` });
  }

  console.log(
    "API Handler: /api/liberia/submit-application recibió una solicitud POST."
  );

  try {
    // 1. PARSEAR EL FORMULARIO CON FORMIDABLE
    const { fields, files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      const form = formidable({
        multiples: true,
        keepExtensions: true,
        maxFileSize: 15 * 1024 * 1024,
      }); // 15MB por archivo
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Error al parsear el formulario con formidable:", err);
          return reject(err);
        }
        console.log(
          "Formidable: Campos de texto parseados:",
          Object.keys(fields)
        );
        console.log(
          "Formidable: Campos de archivo parseados:",
          Object.keys(files)
        );
        resolve({ fields, files });
      });
    });

    // 2. EXTRAER Y ORGANIZAR LOS DATOS DEL FORMULARIO

    // --- Información Personal ---
    const personalInfo = {
      fullName: fields.fullName?.[0] || "N/A",
      passport: fields.passport?.[0] || "N/A",
      nationality: fields.nationality?.[0] || "N/A",
      cocFlag: fields.cocFlag?.[0] || "N/A",
      email: fields.email?.[0] || "N/A",
      phone: fields.phone?.[0] || "N/A",
      birthDate: fields.birthDate?.[0] || "N/A",
      address: fields.address?.[0] || "N/A",
      currentRankText: fields.currentRankText?.[0] || "N/A",
      totalExperience: fields.totalExperience?.[0] || "N/A",
      lastVessel: fields.lastVessel?.[0] || "N/A",
      vesselTypes: fields.vesselTypes?.[0] || "N/A",
      otherCurrentRank: fields.otherCurrentRank?.[0] || "N/A",
      currentRankDetail: fields.currentRankDetail?.[0] || "N/A",
    };

    const rankApplying = fields.rankApplying?.[0] || "N/A";
    const comments = fields.comments?.[0] || "Sin comentarios adicionales.";

    // 3. PREPARAR LOS ARCHIVOS ADJUNTOS
    const attachments = [];

    // --- Función auxiliar para añadir archivos al array de adjuntos ---
    const addAttachment = (
      fileInput: FormidableFile | FormidableFile[] | undefined,
      defaultName: string
    ) => {
      const file = Array.isArray(fileInput) ? fileInput[0] : fileInput;
      if (file && file.size > 0) {
        try {
          const fileBuffer = fs.readFileSync(file.filepath);
          const ext = path.extname(file.originalFilename || ".dat");
          attachments.push({
            filename: `${defaultName}${ext}`,
            data: fileBuffer,
          });
          console.log(`Adjunto añadido: ${defaultName}${ext}`);
        } catch (fileError) {
          console.error(`Error al leer el archivo ${defaultName}:`, fileError);
        }
      }
    };

    // --- Añadir archivos principales ---
    addAttachment(files.idPhotoFile, "ID_Photo");
    addAttachment(files.passportPhotoFile, "Passport_Photo");
    addAttachment(files.rlm105File, "RLM-105_Form");

    // --- Procesar y añadir certificados ---
    const certificatesJSON = fields.certificatesMetadata?.[0];
    const certificateFiles = files.certificateFiles as
      | FormidableFile[]
      | undefined;
    let certificateDetailsHtml =
      "<li>No se proporcionaron detalles de certificados.</li>";

    if (certificatesJSON) {
      // Solo necesitamos el JSON para empezar
      try {
        const certsInfo = JSON.parse(certificatesJSON);
        certificateDetailsHtml = ""; // Limpiar el valor por defecto

        console.log(
          `Procesando ${certsInfo.length} metadatos de certificados.`
        );

        // Iteramos sobre los METADATOS, no sobre los archivos
        certsInfo.forEach((cert: any, index: number) => {
          // Construir HTML para el cuerpo del correo (esto ya estaba bien)
          certificateDetailsHtml += `
              <li>
                <strong>${
                  cert.courseName || "Sin Nombre"
                }</strong> (Requerido: ${cert.required ? "Sí" : "No"})
                <ul>
                  <li>Número: ${cert.certificateNumber || "N/A"}</li>
                  <li>Fecha Emisión: ${cert.issueDate || "N/A"}</li>
                  <li>Fecha Vencimiento: ${cert.expiryDate || "N/A"}</li>
                  <li>Autoridad: ${cert.issuingAuthority || "N/A"}</li>
                </ul>
              </li>
            `;

          // ✨ LA CORRECCIÓN CLAVE ESTÁ AQUÍ ✨
          // Buscamos el archivo usando la clave dinámica que coincide con el índice
          const fileKey = `certificateFile_${index}`;
          const fileInput = files[fileKey]; // files['certificateFile_0'], files['certificateFile_1'], etc.

          console.log(`Buscando archivo con clave: ${fileKey}`);

          // El resto de la lógica de adjuntar es la misma, pero usando 'fileInput'
          if (fileInput) {
            const cleanCourseName = (
              cert.courseName || `certificate_${index}`
            ).replace(/[\s/]/g, "_");
            // La función 'addAttachment' ya maneja si el input es un array o un solo archivo
            addAttachment(fileInput, cleanCourseName);
          } else {
            console.log(`No se encontró archivo para la clave ${fileKey}.`);
          }
        });
      } catch (jsonError) {
        console.error("Error al parsear el JSON de certificados:", jsonError);
        certificateDetailsHtml =
          "<li>Error al procesar la lista de certificados.</li>";
      }
    } else {
      console.log(
        "No se encontraron metadatos de certificados ('certificatesMetadata')."
      );
    }

    // 4. CONSTRUIR EL CUERPO DEL CORREO ELECTRÓNICO
    const emailSubject = `Formulario Liberia (${liberia_code}): ${personalInfo.fullName}`;
    const emailHtmlBody = `
      <html>
        <body style="font-family: sans-serif; line-height: 1.6;">
          <h2>Nueva Solicitud de Examen - Oficiales de Liberia</h2>
          <p>Se ha recibido un nuevo formulario de solicitud. A continuación se detallan los datos:</p>
          
          <h3>👤 Información del Aplicante</h3>
          <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <tr><td style="width: 30%;"><strong>Nombre Completo:</strong></td><td>${personalInfo.fullName}</td></tr>
            <tr><td><strong>Pasaporte:</strong></td><td>${personalInfo.passport}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${personalInfo.email}</td></tr>
            <tr><td><strong>Teléfono:</strong></td><td>${personalInfo.phone}</td></tr>
            <tr><td><strong>Nacionalidad:</strong></td><td>${personalInfo.nationality}</td></tr>
            <tr><td><strong>Bandera del COC:</strong></td><td>${personalInfo.cocFlag}</td></tr>
            <tr><td><strong>Fecha de Nacimiento:</strong></td><td>${personalInfo.birthDate}</td></tr>
            <tr><td><strong>Dirección:</strong></td><td>${personalInfo.address}</td></tr>
          </table>

          <h3>⚓ Información Profesional</h3>
          <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <tr><td style="width: 30%;"><strong>Rango Actual (Texto):</strong></td><td>${personalInfo.currentRankText}</td></tr>
            <tr><td><strong>Rango Actual (Detalle):</strong></td><td>${personalInfo.currentRankDetail}</td></tr>
            <tr><td><strong>Otro Rango (si aplica):</strong></td><td>${personalInfo.otherCurrentRank}</td></tr>
            <tr><td><strong>Experiencia Total:</strong></td><td>${personalInfo.totalExperience}</td></tr>
            <tr><td><strong>Último Buque:</strong></td><td>${personalInfo.lastVessel}</td></tr>
            <tr><td><strong>Tipos de Buque:</strong></td><td>${personalInfo.vesselTypes}</td></tr>
          </table>

          <h3>🎯 Solicitud</h3>
          <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
             <tr><td style="width: 30%;"><strong>Rango al que Aplica:</strong></td><td>${rankApplying}</td></tr>
          </table>

          <h3>📄 Certificados Registrados</h3>
          <ul>
            ${certificateDetailsHtml}
          </ul>

          <h3>💬 Comentarios Adicionales</h3>
          <p style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;">${comments}</p>
          
          <hr>
          <p>Se han adjuntado <strong>${attachments.length}</strong> archivo(s) a este correo.</p>
        </body>
      </html>
    `;

    // 5. ENVIAR EL CORREO CON MAILGUN
    const emailData: any = {
      from: `Liberia Applications <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: "sanchex.dev02@gmail.com", // O tu email de administrador
      subject: emailSubject,
      html: emailHtmlBody,
      attachment: attachments,
    };

    console.log(
      `Enviando correo a 'sanchex.dev02@gmail.com' con ${attachments.length} adjuntos.`
    );
    const mailgunResponse = await mg.messages.create(
      process.env.MAILGUN_DOMAIN as string,
      emailData
    );
    console.log("Respuesta de Mailgun:", mailgunResponse);

    // 6. LIMPIAR ARCHIVOS TEMPORALES
    Object.values(files)
      .flat()
      .forEach((file: FormidableFile) => {
        if (file && file.filepath) {
          fs.unlink(file.filepath, (err) => {
            if (err)
              console.error(
                `Error al eliminar archivo temporal ${file.filepath}:`,
                err
              );
          });
        }
      });

    // 7. ENVIAR RESPUESTA AL CLIENTE
    return res.status(200).json({
      success: true,
      message: "Formulario de solicitud recibido y correo enviado con éxito.",
      mailgun_id: mailgunResponse.id,
    });
  } catch (error: any) {
    console.error(
      "Error en el handler de la API /api/liberia/submit-application:",
      error
    );
    let errorMessage = "Error interno del servidor al procesar la solicitud.";
    if (error.message) errorMessage = error.message;

    // Limpiar archivos temporales también en caso de error (si existen)
    if (error.files) {
      Object.values(error.files)
        .flat()
        .forEach((file: any) => {
          if (file && file.filepath) fs.unlink(file.filepath, () => {});
        });
    }

    return res
      .status(error.httpCode || 500)
      .json({ message: errorMessage, success: false });
  }
}
