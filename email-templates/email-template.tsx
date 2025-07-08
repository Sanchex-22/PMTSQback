// email-templates/email-template-generator.ts
import path from 'path';
import fs from 'fs';

// Cargar el logo y definir variables de contacto
const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.png');
const logoBase64 = fs.readFileSync(logoPath).toString('base64');
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '5073952801';

// --- INTERFACES (Sin cambios) ---
interface CourseSelection {
  name: string;
  type: 'new' | 'renewal';
}

// --- FUNCIÓN DEL GENERADOR DE EMAIL (Rediseñada) ---
export function generateEmailHTML(data: {
  name: string;
  lastName: string;
  quotationNumber: string;
  coursesWithPrices: { name: string; type: string; }[];
  renewalCoursesWithPrices: { name: string; type: string; }[];
}) {
  const {
    name,
    lastName,
    quotationNumber,
    coursesWithPrices,
    renewalCoursesWithPrices,
  } = data;

  const allSelectedCourses: CourseSelection[] = [
    ...coursesWithPrices.map(course => ({ name: course.name, type: 'new' as const })),
    ...renewalCoursesWithPrices.map(course => ({ name: course.name, type: 'renewal' as const })),
  ];

  // Textos para los enlaces de WhatsApp en ambos idiomas
  const whatsappTextEN = encodeURIComponent(
    `Hello, I am interested in validating my quotation #${quotationNumber}. Could you please guide me on the next steps and payment methods?`
  );
  const whatsappTextES = encodeURIComponent(
    `Hola, estoy interesado en validar mi cotización #${quotationNumber}. ¿Podrían indicarme los siguientes pasos y los métodos de pago?`
  );

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maritime Training Quotation / Cotización de Formación Marítima - ${quotationNumber}</title>
    <style>
      body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f2f5; }
      a { color: #ffffff; text-decoration: none; }
      .container { max-width: 650px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; }
      .header { background-color: #1e3a8a; color: white; padding: 25px; text-align: center; }
      .content { padding: 30px 40px; color: #333; line-height: 1.6; }
      .course-list li { background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #3b82f6; }
      .cta-block { background-color: #eef2ff; border: 1px dashed #a5b4fc; border-radius: 8px; padding: 25px; text-align: center; margin-top: 30px; }
      .whatsapp-button { display: inline-block; background-color: #25d366; color: #ffffff; padding: 14px 28px; border-radius: 50px; font-weight: bold; font-size: 16px; text-decoration: none; }
      .separator { padding: 20px 40px; }
      .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <img src="data:image/png;base64,${logoBase64}" alt="Company Logo" style="max-width: 110px; height: auto; margin-bottom: 15px;" />
        <h1 style="margin: 0; font-size: 26px; font-weight: 600;">Training Quotation</h1>
        <p style="margin: 5px 0 0; font-size: 16px; opacity: 0.9;">Reference: ${quotationNumber}</p>
      </div>

      <!-- ====== ENGLISH SECTION ====== -->
      <div class="content">
        <h2 style="font-size: 22px; color: #1e3a8a; margin-top: 0;">Hello, ${name} ${lastName}!</h2>
        <p style="font-size: 16px;">
          Thank you for your interest in our courses. We have generated a quotation based on your selection.
        </p>

        <div style="margin: 25px 0;">
          <h3 style="font-size: 18px; color: #333; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px;">Requested Courses</h3>
          <ul class="course-list" style="list-style-type: none; padding-left: 0;">
            ${allSelectedCourses.map(course => `
              <li>
                <strong style="font-size: 16px; color: #1e3a8a;">${course.name}</strong>
                <span style="display: block; font-size: 14px; color: #64748b;">Type: ${course.type === 'new' ? 'New Course' : 'Renewal'}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="cta-block">
          <h3 style="margin-top: 0; font-size: 20px; color: #312e81;">Ready to proceed?</h3>
          <p style="font-size: 16px; margin-bottom: 20px;">
            To validate this quotation and receive payment methods, please contact us via WhatsApp. An advisor will assist you personally.
          </p>
          <p style="font-size: 14px; color: #4338ca; margin-bottom: 25px;">
            <strong>Please have the attached PDF document ready.</strong>
          </p>
          <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappTextEN}" target="_blank" class="whatsapp-button">
            <img src="https://i.ibb.co/L01JknX/whatsapp-icon-white.png" alt="WhatsApp" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 8px;"/>
            Contact via WhatsApp
          </a>
        </div>
      </div>

      <!-- ====== SEPARATOR ====== -->
      <div class="separator">
        <hr style="border: none; border-top: 2px solid #eef2ff;">
      </div>

      <!-- ====== SPANISH SECTION ====== -->
      <div class="content" style="padding-top: 0;">
        <h2 style="font-size: 22px; color: #1e3a8a; margin-top: 0;">¡Hola, ${name} ${lastName}!</h2>
        <p style="font-size: 16px;">
          Gracias por tu interés en nuestros cursos. Hemos generado una cotización basada en tu selección.
        </p>

        <div style="margin: 25px 0;">
          <h3 style="font-size: 18px; color: #333; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px;">Cursos Solicitados</h3>
          <ul class="course-list" style="list-style-type: none; padding-left: 0;">
            ${allSelectedCourses.map(course => `
              <li>
                <strong style="font-size: 16px; color: #1e3a8a;">${course.name}</strong>
                <span style="display: block; font-size: 14px; color: #64748b;">Tipo: ${course.type === 'new' ? 'Curso Nuevo' : 'Renovación'}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="cta-block">
          <h3 style="margin-top: 0; font-size: 20px; color: #312e81;">¿Listo para continuar?</h3>
          <p style="font-size: 16px; margin-bottom: 20px;">
            Para validar esta cotización y recibir los métodos de pago, por favor contáctanos a través de WhatsApp. Un asesor te atenderá personalmente.
          </p>
          <p style="font-size: 14px; color: #4338ca; margin-bottom: 25px;">
            <strong>No olvides tener a mano el documento PDF adjunto.</strong>
          </p>
          <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappTextES}" target="_blank" class="whatsapp-button">
            <img src="https://i.ibb.co/L01JknX/whatsapp-icon-white.png" alt="WhatsApp" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 8px;"/>
            Contactar por WhatsApp
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0;">If you have any questions, feel free to reply to this email. / Si tienes alguna pregunta, no dudes en responder a este correo.</p>
        <p style="margin: 8px 0 0;">Panama Maritime Training Services, Inc.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}