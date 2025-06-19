// email-templates/email-template-generator.ts
import path from 'path';
import fs from 'fs';

const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.png');
const logo = fs.readFileSync(logoPath).toString('base64');
const WhatsappNumber = process.env.WHATSAPP_NUMBER || '5073952801';
const whatsappText = encodeURIComponent(
  'Hello, I would like to inquire about the payment methods for my quotation.'
);

export function generateQuotationEmailHTML(data: {
  name: string
  lastName: string
  document: string
  nationality: string
  email: string
  phone: string
  // Propiedades para los desgloses de totales (base y surcharge)
  newCoursesBaseTotal: number
  newCoursesSurchargeTotal: number
  renewalCoursesBaseTotal: number
  renewalCoursesSurchargeTotal: number
  // Los arrays de cursos individuales que solo tienen 'basePrice'
  coursesWithPrices: {
    id: number;
    name: string;
    abbr: string;
    imo_no: string;
    basePrice: number;
    surchargePerItem: number;
    type: string;
  }[]
  renewalCoursesWithPrices: {
    id: number;
    name: string;
    abbr: string;
    imo_no: string;
    basePrice: number;
    surchargePerItem: number;
    type: string;
  }[]
  newCoursesTotal: number // Total de cursos nuevos (base + su surcharge total)
  renewalCoursesTotal: number // Total de renovaciones (base + su surcharge total)
  totalCost: number
  govInfo: any
  quotationNumber: string // Ahora es OBLIGATORIO y se pasa desde el handler
  date: string // Fecha de creación, se pasa desde el handler
  expiresAtDate: string // ¡NUEVO! Fecha de expiración formateada, se pasa desde el handler
}) {
  const {
    name,
    lastName,
    document,
    nationality,
    email,
    phone,
    // Desestructurar todas las propiedades de totales y fechas
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
    quotationNumber,
    date,
    expiresAtDate, // Usar la fecha de expiración pasada
  } = data

  // Combinar todos los cursos para la tabla de "SERVICE DETAILS"
  const allCourses = [
    ...coursesWithPrices.map((course, index) => ({
      ...course,
      displayName: course.name,
      number: index + 1,
      displayPrice: course.basePrice, // Para la tabla, el precio unitario y total es el BASE
    })),
    ...renewalCoursesWithPrices.map((course, index) => ({
      ...course,
      displayName: `${course.name} (Renewal)`,
      number: coursesWithPrices.length + index + 1,
      displayPrice: course.basePrice, // Para la tabla, el precio unitario y total es el BASE
    })),
  ]

  // Calcular los totales que irán en las líneas de "Sub Total" y "Certificate Government Fee"
  const overallBaseTotal = newCoursesBaseTotal + renewalCoursesBaseTotal;
  const overallSurchargeTotal = newCoursesSurchargeTotal + renewalCoursesSurchargeTotal;


  return `
 <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Maritime Training Quotation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f7fa;">
      <div style="max-width: 800px; margin: 0 auto; background-color: #ffffff; color: #333333; line-height: 1;">

        <!-- Header -->
        <div style="background-color: #1e40af; color: white; padding: 30px 40px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 120px; vertical-align: middle; padding-right: 10px;">
                <!-- Logo -->
                <img src="${logo ? `data:image/png;base64,${logo}` : '/placeholder.svg?...'}" alt="Company Logo" style="max-width: 100px; height: auto;" />
              </td>

              <td style="vertical-align: middle; text-align: left;">
                <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: bold;">
                  Panama Maritime Training Services, Inc.
                </h1>
                <p style="margin: 0 0 16px 0; font-size: 16px; font-style: italic;">
                  Maritime Training Tailored to You
                </p>
                <div style="font-size: 14px; opacity: 0.9;">
                  <p style="margin: 4px 0;">77th Street, San Francisco, InterMaritime Building</p>
                  <p style="margin: 4px 0;">Phone: +(507) 395-2801 / +(507) 322-0013</p>
                </div>
              </td>

              <td>
                <h2 style="margin: 0 0 0px 0; font-size: 12px; color: white; font-weight: bold;">
                  QUOTATION #${quotationNumber}
                </h2>
              </td>
            </tr>
          </table>
        </div>

        <!-- Quotation Info and Participant Information Side by Side -->
        <div style="padding: 30px 40px 20px; border-bottom: 2px solid #e5e7eb;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 50%; padding-right: 20px; vertical-align: top;">
                <div style="font-size: 14px;">
                  <p style="margin: 4px 0;"><strong>Number:</strong> ${quotationNumber}</p>
                  <p style="margin: 4px 0;"><strong>Date:</strong> ${date}</p>
                  <p style="margin: 4px 0;"><strong>Valid until:</strong> ${expiresAtDate}</p> <!-- Usa la nueva fecha de expiración -->
                  <p style="margin: 4px 0;"><strong>Prepared by:</strong> PMTS Team</p>
                </div>
              </td>
              <td style="width: 50%; padding-left: 20px; vertical-align: top;">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #374151; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">
                  PARTICIPANT'S INFORMATION
                </h3>
                <div style="font-size: 14px;">
                  <p style="margin: 6px 0;"><strong>Name:</strong> ${name.toUpperCase()} ${lastName.toUpperCase()}</p>
                  <p style="margin: 6px 0;"><strong>Nationality:</strong> ${nationality.toUpperCase()}</p>
                  <p style="margin: 6px 0;"><strong>Document:</strong> ${document}</p>
                  <p style="6px 0;"><strong>Email:</strong> ${email}</p>
                  <p style="margin: 6px 0;"><strong>Phone:</strong> ${phone}</p>
                  <p style="margin: 6px 0;"><strong>Government/Institution:</strong> ${govInfo.label}</p>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Compact Services Table with Integrated Totals -->
        <div style="padding: 20px 40px;">
          <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #374151; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">
            SERVICE DETAILS
          </h3>

          <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db; font-size: 13px;">
            <!-- Table Header -->
            <tr style="background-color: #f9fafb;">
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; font-weight: bold;">NO.</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left; font-weight: bold;">SERVICE DETAILS</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; font-weight: bold;">QTY</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right; font-weight: bold;">UNIT PRICE</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right; font-weight: bold;">PRICE</th>
            </tr>

            <!-- Service Rows -->
            ${allCourses
              .map(
                (course, index) => `
            <tr style="background-color: ${index % 2 === 0 ? "#ffffff" : "#f9fafb"};">
              <td style="border: 1px solid #e5e7eb; padding: 8px; font-weight: bold;">${course.number}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px;">
                ${course.displayName}
                ${course.abbr ? `<br><small style="color: #6b7280;">Code: ${course.abbr}</small>` : ""}
                ${course.imo_no ? `<br><small style="color: #6b7280;">IMO: ${course.imo_no}</small>` : ""}
              </td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">1</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">$${course.displayPrice.toFixed(2)}</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right; font-weight: bold;">$${course.displayPrice.toFixed(2)}</td>
            </tr>
            `,
              )
              .join("")}

            <!-- Subtotal Row -->
            <tr style="background-color: #f3f4f6;">
              <td colspan="4" style="border: 1px solid #d1d5db; padding: 8px; text-align: right; font-weight: bold;">Sub Total</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right; font-weight: bold;">$${overallBaseTotal.toFixed(2)}</td>
            </tr>

            <!-- Government Fee Row -->
            <tr style="background-color: #f3f4f6;">
              <td colspan="4" style="border: 1px solid #d1d5db; padding: 8px; text-align: right; font-weight: bold;">Certificate Government Fee</td>
              <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right; font-weight: bold;">$${overallSurchargeTotal.toFixed(2)}</td>
            </tr>

            <!-- Grand Total Row -->
            <tr style="background-color: #1e40af; color: white;">
              <td colspan="4" style="border: 1px solid #1e40af; padding: 12px; text-align: right; font-weight: bold; font-size: 16px;">Grand Total</td>
              <td style="border: 1px solid #1e40af; padding: 12px; text-align: right; font-weight: bold; font-size: 16px;">$${totalCost.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <!-- Payment Information -->
        <div style="padding: 20px 40px 40px;">
          <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #374151; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">
            PAYMENT INFORMATION
          </h3>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="width: 50%; padding-right: 10px; vertical-align: top;">
                <!-- Local Payment -->
                <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; border: 1px solid #bae6fd; height: 100%; box-sizing: border-box;">
                  <h4 style="margin: 0 0 12px 0; color: #0369a1;">LOCAL PAYMENT INFO.</h4>
                    <a href="https://wa.me/${WhatsappNumber}?text=${whatsappText}"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 relative"
                    >Ask about the payment methods on WhatsApp.Click here</a>
                </div>
              </td>
              <td style="width: 50%; padding-left: 10px; vertical-align: top;">
                <!-- International Payment -->
                <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; border: 1px solid #bbf7d0; height: 100%; box-sizing: border-box;">
                  <h4 style="margin: 0 0 12px 0; color: #166534;">PAYMENT INFO. ABROAD</h4>
                    <a href="https://wa.me/${WhatsappNumber}?text=${whatsappText}"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 relative"
                    >Ask about the payment methods on WhatsApp.Click here</a>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px 40px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0;">
            This quotation is valid for 15 days. Please contact us for any questions or clarifications.
          </p>
            <p style="margin: 4px 0;">Phone: +(507) 395-2801 / +(507) 322-0013</p>
            <p style="4px 0;">Email: info@panamamaritimetraining.com</p>
            <p style="margin: 4px 0;">Web: www.panamamaritimetraining.com</p>
        </div>
      </div>
    </body>
    </html>
  `
}