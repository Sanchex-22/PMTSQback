import { Resend } from "resend"
import initMiddleware from "../../lib/init-middleware"
import Cors from "cors"
import { courses } from "../../data/courses"
import { generateQuotationEmailHTML } from "../../email-templates/email-template-generator"
const dotenv = require("dotenv")
dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)

// Configura el middleware CORS
const cors = initMiddleware(
  Cors({
    methods: ["POST", "GET", "OPTIONS"],
    origin: (origin, callback) => {
      const allowedOrigins = ["http://localhost:5173", "https://pmts-quote.vercel.app"]
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("No autorizado por CORS"))
      }
    },
  }),
)

// ===== LÓGICA DE CÁLCULOS MATEMÁTICOS - SURCHARGE EN DÓLARES =====

// Gobiernos/países disponibles para selección - SURCHARGE EN DÓLARES
const governments = {
  panama: { label: "Panamá", surcharge: 5 },
  colombia: { label: "Honduras", surcharge: 20 },
}

// Función para obtener información del gobierno
const getGovernmentInfo = (governmentValue) => {
  return governments[governmentValue] || governments.other
}

// Función para determinar si es panameño (más flexible)
const isPanamanian = (nationality) => {
  const normalizedNationality = nationality.toLowerCase().trim()
  return (
    normalizedNationality === "panamá" ||
    normalizedNationality === "panama" ||
    normalizedNationality === "panameño" ||
    normalizedNationality === "panameña"
  )
}

// Función para calcular precio con recargo EN DÓLARES (no porcentaje)
const calculatePriceWithSurcharge = (basePrice, surchargeAmount) => {
  return basePrice + surchargeAmount
}

// Función para obtener precio base de curso nuevo
const getCourseBasePrice = (course, nationality) => {
  if (isPanamanian(nationality)) {
    return course.price_panamanian || 0
  } else {
    return course.price_foreign || 0
  }
}

// Función para obtener precio base de renovación
const getRenewalBasePrice = (course, nationality) => {
  if (isPanamanian(nationality)) {
    return course.price_panamanian_renewal || 0
  } else {
    return course.price_foreign_renewal || 0
  }
}

// Función para calcular precio final de curso nuevo
const calculateCoursePrice = (course, nationality, government) => {
  const basePrice = getCourseBasePrice(course, nationality)
  const govInfo = getGovernmentInfo(government)
  return calculatePriceWithSurcharge(basePrice, govInfo.surcharge)
}

// Función para calcular precio final de renovación
const calculateRenewalPrice = (course, nationality, government) => {
  const basePrice = getRenewalBasePrice(course, nationality)
  const govInfo = getGovernmentInfo(government)
  return calculatePriceWithSurcharge(basePrice, govInfo.surcharge)
}

// ===== HANDLER PRINCIPAL =====

export default async function handler(req, res) {
  await cors(req, res)

  // ✅ Manejo manual de preflight (CORS)
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin)
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    return res.status(200).end()
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
    `)
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
    } = req.body

    console.log("Received data:", req.body)

    if (!name || !email) {
      return res.status(400).json({ message: "Faltan datos obligatorios en el formulario." })
    }

    if (selectedCourseIds.length === 0 && selectedRenewalIds.length === 0) {
      return res.status(400).json({ message: "Debe seleccionar al menos un curso." })
    }

    // ===== REALIZAR TODOS LOS CÁLCULOS EN EL BACKEND =====

    // Obtener información del gobierno
    const govInfo = getGovernmentInfo(government)

    // Filtrar cursos seleccionados
    const selectedCourses = courses.filter((course) => selectedCourseIds.includes(String(course.id)))

    const selectedRenewalCourses = courses.filter((course) => selectedRenewalIds.includes(String(course.id)))

    // Calcular precios para cursos nuevos
    const coursesWithPrices = selectedCourses.map((course) => {
      const basePrice = getCourseBasePrice(course, nationality)
      const finalPrice = calculateCoursePrice(course, nationality, government)

      return {
        id: course.id,
        name: course.name,
        abbr: course.abbr,
        imo_no: course.imo_no,
        basePrice,
        finalPrice,
        surchargeAmount: govInfo.surcharge,
        type: "new",
      }
    })

    // Calcular precios para renovaciones
    const renewalCoursesWithPrices = selectedRenewalCourses.map((course) => {
      const basePrice = getRenewalBasePrice(course, nationality)
      const finalPrice = calculateRenewalPrice(course, nationality, government)

      return {
        id: course.id,
        name: course.name,
        abbr: course.abbr,
        imo_no: course.imo_no,
        basePrice,
        finalPrice,
        surchargeAmount: govInfo.surcharge,
        type: "renewal",
      }
    })

    // Calcular totales
    const newCoursesTotal = coursesWithPrices.reduce((total, course) => total + course.finalPrice, 0)
    const renewalCoursesTotal = renewalCoursesWithPrices.reduce((total, course) => total + course.finalPrice, 0)
    const totalCost = newCoursesTotal + renewalCoursesTotal

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
    })

    // ===== ENVIAR EMAIL =====
    const { error } = await resend.emails.send({
      from: process.env.RESEND_EMAIL,
      to: "sanchex.dev02@gmail.com",
      subject: `Maritime Training Quotation - ${name} ${lastName} ($${totalCost.toFixed(2)})`,
      html: htmlContent,
    })

    // const { error2 } = await resend.emails.send({
    //   from: process.env.RESEND_EMAIL,
    //   to: email,
    //   subject: `Maritime Training Quotation - ${name} ${lastName} ($${totalCost.toFixed(2)})`,
    //   html: htmlContent,
    // })
    // Manejo de errores al enviar el correo
    if (error) {
      console.error(error)
      return res.status(500).json({ message: "Error al enviar el correo" })
    }

    // if (error2) {
    //   console.error(error)
    //   return res.status(500).json({ message: "Error al enviar el correo" })
    // }

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
    }

    return res.status(200).json(response)
  } catch (err) {
    console.error("Server Error:", err)
    return res.status(500).json({ message: "Error en el servidor" })
  }
}
