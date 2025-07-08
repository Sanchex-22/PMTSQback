// pages/api/send-email.ts
import bcrypt from 'bcryptjs';
import Mailgun from "mailgun.js";
import { generateQuotationEmailHTML } from "../../email-templates/email-template-generator";
import { Course, PrismaClient, User } from "@prisma/client"; // Import User type
import { getAllCourses } from "../../db/courses";
import cors from "../../lib/cors-middleware";
import { courses_code } from "../../data/codes";
import { generatePdfBuffer } from "../../email-templates/generatePdfBuffer";
import { generateEmailHTML } from "../../email-templates/email-template";
const dotenv = require("dotenv");
dotenv.config();
const prisma = new PrismaClient();

if (!process.env.MAILGUN_API_KEY) {
  throw new Error("MAILGUN_API_KEY is not defined");
}

if (!process.env.MAILGUN_DOMAIN) {
  throw new Error("MAILGUN_DOMAIN is not defined");
}

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

if (!process.env.MAILGUN_API_KEY) {
  throw new Error("MAILGUN_API_KEY is not defined");
}

if (!process.env.CLIENT_PASS) {
  throw new Error("CLIENT_PASS is not defined");
}

// ===== LÓGICA DE CÁLCULOS MATEMÁTICOS - SURCHARGE EN DÓLARES =====
const governments = {
  panama: { label: "Panamá", surcharge: 5 },
  honduras: { label: "Honduras", surcharge: 20 },
  other: { label: "Otro", surcharge: 5 },
};

const getGovernmentInfo = (governmentValue: string) => {
  const normalizedGovValue =
    typeof governmentValue === "string"
      ? governmentValue.toLowerCase().trim()
      : "";
  return governments[normalizedGovValue] || governments.other;
};

const isPanamanian = (nationality: string) => {
  const normalizedNationality = nationality.toLowerCase().trim();
  return (
    normalizedNationality === "panamá" ||
    normalizedNationality === "panama" ||
    normalizedNationality === "panameño" ||
    normalizedNationality === "panameña"
  );
};

const getCoursePriceExcludingSurcharge = (course: Course, nationality: string) => {
  if (isPanamanian(nationality)) {
    return course.price_panamanian || 0;
  } else {
    return course.price_foreign || 0;
  }
};

export const getRenewalPriceExcludingSurcharge = (course: Course, nationality: string) => {
  if (isPanamanian(nationality)) {
    return (course.price_panamanian_renewal || 0) / 2;
  } else {
    return (course.price_foreign_renewal || 0) / 2;
  }
};

export default async function handler(req: any, res: any) {
  await cors(req, res);

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin as string);
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).send(`
      <html>
        <head><title>Servidor en funcionamiento</title></head>
        <body>
          <h1>¡El servidor está funcionando!</h1>
          <p>Ruta: <strong>/api/send-email</strong></p>
          <p>Puerto: <strong>${process.env.PORT || 3001}</strong></p>
        </body>
      </html>
    `);
  }

  try {
    const {
      name,
      lastName,
      document,
      nationality,
      email,
      phone,
      courses: selectedCourseIds = [],
      renewalCourses: selectedRenewalIds = [],
      government,
      submissionType,
    } = req.body;

    console.log("Received data:", req.body);

    if (!name || !email) {
      return res
        .status(400)
        .json({ message: "Faltan datos obligatorios en el formulario." });
    }

    if (selectedCourseIds.length === 0 && selectedRenewalIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Debe seleccionar al menos un curso." });
    }

    // ===== REALIZAR TODOS LOS CÁLCULOS EN EL BACKEND =====

    const govInfo = getGovernmentInfo(government);
    const surchargePerCourse = govInfo.surcharge;

    const allAvailableCourses: Course[] = await getAllCourses();

    const parsedSelectedCourseIds = selectedCourseIds.map((id: string) => parseInt(id, 10));
    const parsedSelectedRenewalIds = selectedRenewalIds.map((id: string) => parseInt(id, 10));

    const selectedCourses = allAvailableCourses.filter((course) =>
      parsedSelectedCourseIds.includes(course.id)
    );
    const selectedRenewalCourses = allAvailableCourses.filter((course) =>
      parsedSelectedRenewalIds.includes(course.id)
    );

    const coursesWithPrices = selectedCourses.map((course) => {
      const basePrice = getCoursePriceExcludingSurcharge(course, nationality);
      return {
        id: course.id,
        name: course.name,
        abbr: course.abbr,
        imo_no: course.imo_no,
        basePrice: basePrice,
        surchargePerItem: surchargePerCourse,
        type: "new",
      };
    });

    const renewalCoursesWithPrices = selectedRenewalCourses.map((course) => {
      const basePrice = getRenewalPriceExcludingSurcharge(course, nationality);
      return {
        id: course.id,
        name: course.name,
        abbr: course.abbr,
        imo_no: course.imo_no,
        basePrice: basePrice,
        surchargePerItem: surchargePerCourse,
        type: "renewal",
      };
    });
        const allQuotedItems = [
      ...coursesWithPrices,
      ...renewalCoursesWithPrices,
    ];

    // --- CÁLCULO DE TOTALES CON DESGLOSE ---

    const newCoursesBaseTotal = coursesWithPrices.reduce(
      (total, course) => total + course.basePrice,
      0
    );
    const newCoursesSurchargeTotal = coursesWithPrices.length * surchargePerCourse;
    const newCoursesTotal = newCoursesBaseTotal + newCoursesSurchargeTotal;

    const renewalCoursesBaseTotal = renewalCoursesWithPrices.reduce(
      (total, course) => total + course.basePrice,
      0
    );
    const renewalCoursesSurchargeTotal = renewalCoursesWithPrices.length * surchargePerCourse;
    const renewalCoursesTotal = renewalCoursesBaseTotal + renewalCoursesSurchargeTotal;

    const totalCost = newCoursesTotal + renewalCoursesTotal;

    let currentUser: User | null = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!currentUser) {
      const hashedPassword = await bcrypt.hash(`${process.env.CLIENT_PASS}`, 10);
      currentUser = await prisma.user.create({
        data: {
          email: email,
          password: hashedPassword, // Cambiar a un hash seguro en producción
          name: `${name} ${lastName}`,
          role: 'CLIENT',
        },
      });
    }

    let mainQuoteCourseId: number;
    if (selectedCourses.length > 0) {
      mainQuoteCourseId = selectedCourses[0].id;
    } else { // Si no hay cursos nuevos, debe haber renovaciones (validado al inicio)
      mainQuoteCourseId = selectedRenewalCourses[0].id;
    }

    // 3. Calcular la fecha de expiración (45 días desde ahora)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 45);

    const createdQuote = await prisma.quote.create({
      data: {
        userId: currentUser.id,
        quotedPrice: totalCost,
        status: "PENDING",
        expiresAt: expiresAt,
        government: government,
        courses: {
          create: allQuotedItems.map(item => ({
            courseId: item.id,
            type: item.type,
            basePrice: item.basePrice,
            surcharge: item.surchargePerItem,
          })),
        },
      },
    });

    // === FIN DE LÓGICA DE COTIZACIÓN TEMPORAL ===

    const quotationNumber = `PMTS/Q/${createdQuote.id}`; // Usar el ID generado por la DB
    const expirationDateForEmail = expiresAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const creationDateForEmail = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const htmlQuotation = generateQuotationEmailHTML({
      name,
      lastName,
      document,
      nationality,
      email,
      phone,
      newCoursesBaseTotal,
      newCoursesSurchargeTotal,
      renewalCoursesBaseTotal,
      renewalCoursesSurchargeTotal,
      coursesWithPrices,
      renewalCoursesWithPrices,
      newCoursesTotal,
      renewalCoursesTotal,
      totalCost,
      govInfo,
      quotationNumber: quotationNumber,
      expiresAtDate: expirationDateForEmail,
      date: creationDateForEmail,
    });
    const htmlContent = generateEmailHTML({
      name,
      lastName,
      quotationNumber: quotationNumber,
      coursesWithPrices,
      renewalCoursesWithPrices
    });

    const pdfBuffer = await generatePdfBuffer(htmlQuotation);
    console.log("PDF buffer generado:", pdfBuffer);
    const title = `PMTS Quotation (${courses_code}) - ${name} ${lastName} ($${totalCost.toFixed(2)})`;
    const result = await mg.messages.create(
      process.env.MAILGUN_DOMAIN || "",
      createEmailData(
        email,
        title,
        htmlContent,
        pdfBuffer,
        quotationNumber
      )
    );

    console.log("Email enviado con éxito:", result);
    // ===== DEVOLVER RESULTADOS CALCULADOS =====
    const response = {
      success: true,
      quotationId: createdQuote.id, // ID de la cotización en la DB
      quotationNumber: quotationNumber, // Número de cotización formateado
      expiresAt: expiresAt.toISOString(), // Fecha de expiración ISO string
      courses: coursesWithPrices.map(course => ({
        ...course,
        finalPrice: course.basePrice // Para el frontend, el precio individual sin recargo
      })),
      renewalCourses: renewalCoursesWithPrices.map(course => ({
        ...course,
        finalPrice: course.basePrice // Para el frontend, el precio individual sin recargo
      })),
      studentInfo: {
        name,
        lastName,
        document,
        nationality,
        email,
        phone,
      },
      newCoursesBaseTotal,
      newCoursesSurchargeTotal,
      renewalCoursesBaseTotal,
      renewalCoursesSurchargeTotal,
      totalCost,
      newCoursesTotal,
      renewalCoursesTotal,
      government: govInfo.label,
      governmentInfo: govInfo,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error al enviar el correo o crear la cotización:", error);
    await prisma.$disconnect();
    return res.status(500).json({
      message: "Error al procesar la cotización",
      details: (error as Error)?.message || "Desconocido",
    });
  } finally {
    await prisma.$disconnect();
  }
}

const createEmailData = (
  to: string,
  title: string,
  htmlContent: string,
  pdfBuffer: Buffer,
  quotationNumber: string
) => {
  const emailData: any = {
    from: `PMTS Quotations <noreply@${process.env.MAILGUN_DOMAIN}>`,
    to,
    cc: `${process.env.ADMIN_EMAIL || ""}`,
    subject: title,
    text: "PMTS Quotation PDF attached.",
    html: htmlContent,
  };

  if (pdfBuffer) {
    emailData.attachment = [
      {
        filename: `PMTS-Quotation-${quotationNumber || 0}.pdf`,
        data: pdfBuffer,
      },
    ];
  }

  return emailData;
};