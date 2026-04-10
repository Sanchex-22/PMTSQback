import { PrismaClient } from "@prisma/client";
import Mailgun from "mailgun.js";
import FormDataNode from "form-data";
import cors from "../../../../../lib/cors-middleware";
import { generateQuotationEmailHTML } from "../../../../../email-templates/email-template-generator";
import { generateEmailHTML } from "../../../../../email-templates/email-template";
import { generatePdfBuffer } from "../../../../../email-templates/generatePdfBuffer";

const prisma = new PrismaClient();

if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
  throw new Error("MAILGUN_API_KEY o MAILGUN_DOMAIN no están definidos.");
}

const mailgun = new Mailgun(FormDataNode);
const mg = mailgun.client({ username: "api", key: process.env.MAILGUN_API_KEY });

export default async function handler(req: any, res: any) {
  await cors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "PUT") return res.status(405).json({ message: "Method Not Allowed" });

  const { id } = req.query;
  if (!id || isNaN(parseInt(id as string))) {
    return res.status(400).json({ message: "ID de cotización inválido." });
  }

  const quoteId = parseInt(id as string);
  const { status, quotedPrice, resendEmail, adminNote } = req.body;

  try {
    const existing = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        courses: {
          include: {
            course: { select: { id: true, name: true, abbr: true, imo_no: true } },
          },
        },
      },
    });

    if (!existing) return res.status(404).json({ message: "Cotización no encontrada." });

    // Build update data
    const updateData: any = {};
    if (status && ["PENDING", "APPROVED", "REJECTED", "EXPIRED"].includes(status)) {
      updateData.status = status;
    }
    if (quotedPrice !== undefined && quotedPrice !== null) {
      const parsed = parseFloat(quotedPrice);
      if (!isNaN(parsed) && parsed >= 0) updateData.quotedPrice = parsed;
    }

    const updated = await prisma.quote.update({
      where: { id: quoteId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        courses: {
          include: {
            course: { select: { id: true, name: true, abbr: true, imo_no: true } },
          },
        },
      },
    });

    // Resend email if requested
    if (resendEmail) {
      const quote = updated;
      const userName = (quote.user.name || quote.user.email).split(" ");
      const name = userName[0] || "";
      const lastName = userName.slice(1).join(" ") || "";
      const quotationNumber = `PMTS/Q/${quote.id.toString().padStart(4, "0")}`;
      const finalPrice = quote.quotedPrice;

      // Build course lists from saved data
      const newCourses = quote.courses
        .filter((qc) => qc.type === "new")
        .map((qc) => ({
          id: qc.course.id,
          name: qc.course.name,
          abbr: qc.course.abbr,
          imo_no: qc.course.imo_no,
          basePrice: qc.basePrice,
          surchargePerItem: qc.surcharge,
          type: "new",
        }));

      const renewalCourses = quote.courses
        .filter((qc) => qc.type === "renewal")
        .map((qc) => ({
          id: qc.course.id,
          name: qc.course.name,
          abbr: qc.course.abbr,
          imo_no: qc.course.imo_no,
          basePrice: qc.basePrice,
          surchargePerItem: qc.surcharge,
          type: "renewal",
        }));

      const newCoursesBaseTotal = newCourses.reduce((s, c) => s + c.basePrice, 0);
      const newCoursesSurchargeTotal = newCourses.reduce((s, c) => s + c.surchargePerItem, 0);
      const renewalCoursesBaseTotal = renewalCourses.reduce((s, c) => s + c.basePrice, 0);
      const renewalCoursesSurchargeTotal = renewalCourses.reduce((s, c) => s + c.surchargePerItem, 0);
      const newCoursesTotal = newCoursesBaseTotal + newCoursesSurchargeTotal;
      const renewalCoursesTotal = renewalCoursesBaseTotal + renewalCoursesSurchargeTotal;

      const govInfo = { label: quote.government || "Otro", surcharge: 5 };
      const expiresAtDate = quote.expiresAt.toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      });
      const creationDate = quote.createdAt.toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      });

      const htmlQuotation = generateQuotationEmailHTML({
        name,
        lastName,
        document: "",
        nationality: "",
        email: quote.user.email,
        phone: "",
        newCoursesBaseTotal,
        newCoursesSurchargeTotal,
        renewalCoursesBaseTotal,
        renewalCoursesSurchargeTotal,
        coursesWithPrices: newCourses,
        renewalCoursesWithPrices: renewalCourses,
        newCoursesTotal,
        renewalCoursesTotal,
        totalCost: finalPrice,
        govInfo,
        quotationNumber,
        expiresAtDate,
        date: creationDate,
      });

      const htmlContent = generateEmailHTML({
        name,
        lastName,
        quotationNumber,
        coursesWithPrices: newCourses,
        renewalCoursesWithPrices: renewalCourses,
      });

      const pdfBuffer = await generatePdfBuffer(htmlQuotation);

      const subject = adminNote
        ? `[Actualización] Cotización ${quotationNumber} - PMTS`
        : `Cotización ${quotationNumber} - PMTS`;

      const emailData: any = {
        from: `PMTS Quotations <noreply@${process.env.MAILGUN_DOMAIN}>`,
        to: quote.user.email,
        cc: process.env.ADMIN_EMAIL || "",
        subject,
        html: adminNote
          ? `<p style="background:#fff3cd;padding:12px;border-radius:6px;font-family:sans-serif">
              <strong>Nota del administrador:</strong> ${adminNote}
             </p>` + htmlContent
          : htmlContent,
      };

      if (pdfBuffer) {
        emailData.attachment = [
          { filename: `PMTS-Quotation-${quotationNumber}.pdf`, data: pdfBuffer },
        ];
      }

      await mg.messages.create(process.env.MAILGUN_DOMAIN as string, emailData);
    }

    return res.status(200).json({
      message: resendEmail ? "Cotización actualizada y correo reenviado." : "Cotización actualizada.",
      quote: updated,
    });
  } catch (error) {
    console.error("Error updating quotation:", error);
    return res.status(500).json({
      message: "Error al actualizar la cotización",
      details: (error as Error)?.message || "Desconocido",
    });
  } finally {
    await prisma.$disconnect();
  }
}
