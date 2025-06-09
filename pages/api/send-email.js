// backend/api/send-email.js
import { Resend } from "resend";
import initMiddleware from "../../lib/init-middleware";
import Cors from 'cors';
import { courses } from "../../data/courses";

const resend = new Resend(process.env.RESEND_API_KEY);

// Configura el middleware CORS
const cors = initMiddleware(
  Cors({
    methods: ["POST", "GET", "HEAD"],
    origin: (origin, callback) => {
      const allowedOrigins = [
        // "http://localhost:5173",
        "https://pmts-quote.vercel.app/"
      ];
  
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No autorizado por CORS"));
      }
    }
  })
)
export default async (req, res) => {
  await cors(req, res);

  if (req.method === "GET") {
    return res.status(200).send(`
      <html>
        <head><title>Servidor en funcionamiento</title></head>
        <body>
          <h1>¡El servidor está funcionando!</h1>
          <p>Ruta: <strong>/api/send-email</strong></p>
          <p>Puerto: <strong>${process.env.PORT || 3000}</strong></p>
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
      courses: selectedCourseIds
    } = req.body;

    if (!name || !email || !selectedCourseIds?.length) {
      return res
        .status(400)
        .json({ message: "Faltan datos obligatorios en el formulario." });
    }

    const selectedCourses = courses.filter((course) =>
      selectedCourseIds.includes(String(course.id))
    );

    const htmlCourses = selectedCourses
      .map(
        (course) => `
          <div style="background-color: #e9f0ff; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px; color: #003366;">${course?.name}</h3>
            <span style="display: inline-block; background-color: #ffffff; padding: 5px 10px; border-radius: 6px; font-weight: bold; font-size: 13px;">IMO: ${course?.imo_no}</span>
          </div>
        `
      )
      .join("");

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f7fa; color: #333; padding: 20px;">
          <div style="max-width: 700px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h2 style="color: #2d6a4f;">${name} ${lastName}, ha cotizado los siguientes cursos</h2>
            <p style="margin-bottom: 30px;">Resumen de cursos :</p>
            <h3 style="color: #1d3557;">Cursos Seleccionados:</h3>
            ${htmlCourses}
            <div style="margin-top: 30px;">
              <h3 style="color: #1d3557;">Datos del estudiante:</h3>
              <p><strong>Nombre completo:</strong> ${name} ${lastName}</p>
              <p><strong>Documento:</strong> ${document}</p>
              <p><strong>Nacionalidad:</strong> ${nationality}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Teléfono:</strong> ${phone}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { error } = await resend.emails.send({
      from: process.env.RESEND_EMAIL,
      to: "sanchex.dev02@gmail.com",
      subject: `Cotizacion de ${name} ${lastName} - PMTSQ`,
      html: htmlContent
    });

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al enviar el correo" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
