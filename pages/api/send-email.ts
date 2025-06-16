import Mailgun from "mailgun.js";
import initMiddleware from "../../lib/init-middleware";
import Cors from "cors";
// import { courses } from "../../data/courses"; // <-- REMOVE THIS LINE
import { generateQuotationEmailHTML } from "../../email-templates/email-template-generator";
import { generatePdfBuffer } from "../../email-templates/generatePdfBuffer";
const dotenv = require("dotenv");
dotenv.config();

// IMPORT PRISMA'S GENERATED TYPES AND FUNCTIONS
import { Course, PrismaClient } from "@prisma/client"; // Import Course type and PrismaClient
import { getAllCourses } from "../../db/courses";
// You no longer need this custom interface because Prisma generates one for you
// export interface Courses {
//   id: string;
//   name: string;
//   abbr: string;
//   imo_no?: string;
//   price_panamanian?: number;
//   price_foreign?: number;
//   price_panamanian_renewal?: number;
//   price_foreign_renewal?: number;
// }

// Initialize Prisma Client (if you haven't done so globally or in a separate utility)
// It's recommended to reuse a single PrismaClient instance.
// If you already have a global prisma client instance, you can use that instead.
const prisma = new PrismaClient(); // Added for context, but getAllCourses handles its own client internally for now

if (!process.env.MAILGUN_API_KEY) {
  throw new Error("MAILGUN_API_KEY is not defined");
}

if (!process.env.MAILGUN_DOMAIN) {
  throw new Error("MAILGUN_DOMAIN is not defined");
}

// Inicializa el cliente de Mailgun
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

if (!process.env.MAILGUN_API_KEY) {
  throw new Error("MAILGUN_API_KEY is not defined");
}

// Configura el middleware CORS
const cors = initMiddleware(
  Cors({
    methods: ["POST", "GET", "OPTIONS"],
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://pmts-quote.vercel.app",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No autorizado por CORS"));
      }
    },
  })
);

// ===== LÓGICA DE CÁLCULOS MATEMÁTICOS - SURCHARGE EN DÓLARES =====
const governments = {
  panama: { label: "Panamá", surcharge: 5 },
  honduras: { label: "Honduras", surcharge: 20 },
  other: { label: "Otro", surcharge: 5 },
};

const getGovernmentInfo = (governmentValue: string) => { // Added type for governmentValue
  const normalizedGovValue =
    typeof governmentValue === "string"
      ? governmentValue.toLowerCase().trim()
      : "";
  return governments[normalizedGovValue] || governments.other;
};

// Función para determinar si es panameño (más flexible)
const isPanamanian = (nationality: string) => { // Added type for nationality
  const normalizedNationality = nationality.toLowerCase().trim();
  return (
    normalizedNationality === "panamá" ||
    normalizedNationality === "panama" ||
    normalizedNationality === "panameño" ||
    normalizedNationality === "panameña"
  );
};

// Función para calcular precio con recargo EN DÓLARES (no porcentaje)
const calculatePriceWithSurcharge = (basePrice: number, surchargeAmount: number) => { // Added types
  return basePrice + surchargeAmount;
};

// Función para obtener precio base de curso nuevo
const getCourseBasePrice = (course: Course, nationality: string) => { // Using Prisma's Course type
  if (isPanamanian(nationality)) {
    return course.price_panamanian || 0;
  } else {
    return course.price_foreign || 0;
  }
};

// Función para obtener precio base de renovación
export const getRenewalBasePrice = (course: Course, nationality: string) => { // Using Prisma's Course type
  if (isPanamanian(nationality)) {
    return (course.price_panamanian_renewal || 0) / 2;
  } else {
    return (course.price_foreign_renewal || 0) / 2;
  }
};

// Función para calcular precio final de curso nuevo
const calculateCoursePrice = (course: Course, nationality: string, government: string) => { // Using Prisma's Course type
  const basePrice = getCourseBasePrice(course, nationality);
  const govInfo = getGovernmentInfo(government);
  return calculatePriceWithSurcharge(basePrice, govInfo?.surcharge);
};

// Función para calcular precio final de renovación
const calculateRenewalPrice = (course: Course, nationality: string, government: string) => { // Using Prisma's Course type
  const basePrice = getRenewalBasePrice(course, nationality);
  const govInfo = getGovernmentInfo(government);
  return calculatePriceWithSurcharge(basePrice, govInfo?.surcharge);
};

// ===== HANDLER PRINCIPAL =====

export default async function handler(req: any, res: any) { // Use 'any' for req/res if not using specific Next.js types
  await cors(req, res);

  // ✅ Manejo manual de preflight (CORS)
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
      courses: selectedCourseIds = [], // These are strings from the frontend
      renewalCourses: selectedRenewalIds = [], // These are strings from the frontend
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

    // Obtener información del gobierno
    const govInfo = getGovernmentInfo(government);

    // FETCH ALL COURSES FROM THE DATABASE FIRST
    const allAvailableCourses: Course[] = await getAllCourses(); // <--- NEW: Get courses from DB

    // Convert selectedCourseIds from strings to numbers for accurate filtering
    const parsedSelectedCourseIds = selectedCourseIds.map((id: string) => parseInt(id, 10));
    const parsedSelectedRenewalIds = selectedRenewalIds.map((id: string) => parseInt(id, 10));


    // Filter selected courses from the courses fetched from the DB
    const selectedCourses = allAvailableCourses.filter((course) =>
      parsedSelectedCourseIds.includes(course.id) // Compare numbers now
    );

    const selectedRenewalCourses = allAvailableCourses.filter((course) =>
      parsedSelectedRenewalIds.includes(course.id) // Compare numbers now
    );

    // Calcular precios para cursos nuevos
    const coursesWithPrices = selectedCourses.map((course) => {
      const basePrice = getCourseBasePrice(course, nationality);
      const finalPrice = calculateCoursePrice(course, nationality, government);

      return {
        id: course.id,
        name: course.name,
        abbr: course.abbr,
        imo_no: course.imo_no,
        basePrice,
        finalPrice,
        surchargeAmount: govInfo.surcharge,
        type: "new",
      };
    });

    // Calcular precios para renovaciones
    const renewalCoursesWithPrices = selectedRenewalCourses.map((course) => {
      const basePrice = getRenewalBasePrice(course, nationality);
      const finalPrice = calculateRenewalPrice(course, nationality, government);

      return {
        id: course.id,
        name: course.name,
        abbr: course.abbr,
        imo_no: course.imo_no,
        basePrice,
        finalPrice,
        surchargeAmount: govInfo.surcharge,
        type: "renewal",
      };
    });

    // Calcular totales
    const newCoursesTotal = coursesWithPrices.reduce(
      (total, course) => total + course.finalPrice,
      0
    );
    const renewalCoursesTotal = renewalCoursesWithPrices.reduce(
      (total, course) => total + course.finalPrice,
      0
    );
    const totalCost = newCoursesTotal + renewalCoursesTotal;

    // ===== GENERAR HTML PROFESIONAL PARA EMAIL =====
    const htmlContent = generateQuotationEmailHTML({
      name,
      lastName,
      document,
      nationality,
      email,
      phone,
      coursesWithPrices,
      renewalCoursesWithPrices,
      newCoursesTotal,
      renewalCoursesTotal,
      totalCost,
      govInfo,
    });

    const pdfBuffer = await generatePdfBuffer(htmlContent);
    console.log("PDF buffer generado:", pdfBuffer);
    const title = `PMTS Quotation - ${name} ${lastName} ($${totalCost.toFixed(2)})`
    const result = await mg.messages.create(
      process.env.MAILGUN_DOMAIN || "",
      createEmailData(
        email,
        title,
        htmlContent,
        pdfBuffer,
      )
    );

    console.log("Email enviado con éxito:", result);
    // ===== DEVOLVER RESULTADOS CALCULADOS =====
    const response = {
      success: true,
      courses: coursesWithPrices,
      renewalCourses: renewalCoursesWithPrices,
      studentInfo: {
        name,
        lastName,
        document,
        nationality,
        email,
        phone,
      },
      totalCost,
      newCoursesTotal,
      renewalCoursesTotal,
      government: govInfo.label,
      governmentInfo: govInfo,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    // Ensure Prisma Client is disconnected if this is a standalone handler (not a long-running server)
    // For Next.js API routes, Prisma generally recommends a single client instance outside the handler
    // but explicit disconnection for errors can be good.
    await prisma.$disconnect(); // Disconnect in case of error
    return res.status(500).json({
      message: "Error al enviar el correo",
      details: (error as Error)?.message || "Desconocido", // Cast error to Error for message property
    });
  } finally {
    // Also disconnect after successful operation if this is a short-lived script/function
    // For Next.js API routes, it's often handled by a global instance or context.
    // If PrismaClient is instantiated outside the handler, you wouldn't disconnect here.
    // Given the simple setup, keeping it here for now.
    await prisma.$disconnect(); // Disconnect after success too
  }
}

const createEmailData = (
  to: string, // Added type
  title: string, // Added type
  htmlContent: string, // Added type
  pdfBuffer: Buffer, // Added type
) => {
  const emailData: any = {
    from: `PMTS Quotations <noreply@${process.env.MAILGUN_DOMAIN}>`,
    to,
    cc: "sanchex.dev02@gmail.com",
    subject: title,
    text: "PMTS Quotation PDF attached.",
    html: htmlContent,
  };

  if (pdfBuffer) {
    emailData.attachment = [
      {
        filename: `PMTS-Quotation.pdf`,
        data: pdfBuffer,
        // contentType: "application/pdf", // This might be needed depending on Mailgun version
      },
    ];
  }

  return emailData;
};