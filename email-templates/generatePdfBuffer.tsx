import chromium from "@sparticuz/chromium";
import puppeteer, { PaperFormat, PuppeteerLaunchOptions } from "puppeteer-core";

// Para forzar a @sparticuz/chromium a descargar el bundle completo que incluye
// muchas de las dependencias .so. Esto es crucial para entornos como Vercel.
// Estas variables de entorno deben estar configuradas en tu proyecto Vercel.
// - SPARTICUZ_CHROMIUM_SHOULD_SKIP_DOWNLOAD -> false (o no definida)
// - SPARTICUZ_CHROMIUM_MINIO_SKIP_DOWNLOAD -> true (si no usas MinIO)
// La mayoría de las veces, @sparticuz/chromium maneja esto bien por defecto si
// no encuentra un Chromium existente. Asegúrate de que no haya variables que le digan
// que *no* descargue (como SPARTICUZ_CHROMIUM_SHOULD_SKIP_DOWNLOAD=true).
// Vercel típicamente tiene un entorno donde la descarga es necesaria la primera vez.

export async function generatePdfBuffer(htmlContent: string): Promise<Buffer> {
  // --- Detección de Entorno ---
  const IS_ON_VERCEL = process.env.VERCEL === "1";
  const IS_SERVERLESS_ENV = IS_ON_VERCEL; // Usar esto para la lógica de Puppeteer

  console.log(`--- Environment Detection ---`);
  console.log(`process.env.VERCEL: ${process.env.VERCEL}`);
  console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`IS_ON_VERCEL (process.env.VERCEL === "1"): ${IS_ON_VERCEL}`);
  console.log(`IS_SERVERLESS_ENV (para Puppeteer): ${IS_SERVERLESS_ENV}`);
  console.log(`-----------------------------`);

  let executablePath: string | undefined;
  let launchOptions: PuppeteerLaunchOptions = {}; // Objeto para opciones de lanzamiento

  if (IS_SERVERLESS_ENV) {
    console.log("Modo Serverless (Vercel): Configurando con @sparticuz/chromium.");

    // @sparticuz/chromium empaqueta las dependencias.
    // La llamada a executablePath() debería devolver la ruta al binario desempaquetado.
    // Los args y headless mode también son proporcionados por la librería para compatibilidad.
    try {
      console.log("Intentando obtener executablePath de @sparticuz/chromium...");
      executablePath = await chromium.executablePath(); // OJO: La documentación puede variar, a veces es chromium.executablePath sin await si ya está cargado. Pero la versión moderna suele ser asíncrona para permitir la descarga.
      console.log(`@sparticuz/chromium executablePath obtenido: ${executablePath}`);

      if (!executablePath) {
        throw new Error("@sparticuz/chromium.executablePath() devolvió nulo o indefinido.");
      }

      launchOptions = {
        args: chromium.args,
        executablePath: executablePath,
        headless: chromium.headless, // Usar el modo headless recomendado por @sparticuz/chromium (suele ser 'new' o true)
        // defaultViewport: chromium.defaultViewport, // Puedes usar esto si @sparticuz/chromium lo provee
      };
      console.log("@sparticuz/chromium launchOptions configuradas:", launchOptions);

    } catch (error) {
      console.error("Error configurando @sparticuz/chromium:", error);
      throw new Error(`Fallo al configurar @sparticuz/chromium: ${error.message}`);
    }

  } else {
    console.log("Modo Local: Usando puppeteer (completo) y su Chromium instalado.");
    try {
      const puppeteerFull = require("puppeteer"); // Importa la versión completa de puppeteer
      executablePath = puppeteerFull.executablePath();

      launchOptions = {
        executablePath: executablePath,
        headless: true, // Modo headless para local
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      };
      console.log("Puppeteer (local) launchOptions configuradas:", launchOptions);

    } catch (e) {
      console.error("Error al obtener executablePath de puppeteer (completo) localmente:", e);
      throw new Error("Puppeteer (completo) no está instalado o no pudo encontrar Chromium. Asegúrate de tener 'puppeteer' en devDependencies y haber ejecutado 'npm install'.");
    }
  }

  if (!launchOptions.executablePath) {
    // Este log es redundante si los errores anteriores saltan, pero es un buen seguro.
    console.error("Fallo crítico: El executablePath final es nulo o indefinido.");
    throw new Error("Chromium executablePath no se pudo determinar (después de la lógica de entorno).");
  }

  console.log(`--- Intentando lanzar el navegador ---`);
  console.log(`  Executable Path: ${launchOptions.executablePath}`);
  console.log(`  Headless Mode: ${launchOptions.headless}`);
  console.log(`  Args: ${JSON.stringify(launchOptions.args)}`);
  console.log(`-----------------------------------`);

  let browser;
  try {
    browser = await puppeteer.launch({
      ...launchOptions, // Aplicar todas las opciones determinadas
      ignoreHTTPSErrors: true, // Opción general de Puppeteer
      // timeout: 60000, // Timeout general para el lanzamiento si es necesario (def. 30s)
    });
  } catch (error) {
    console.error("Error al lanzar el navegador de Puppeteer:", error);
    // Añadir más detalles del error si es posible
    if (error.message && error.message.includes("ENOENT")) {
        console.error("Error ENOENT: El sistema no puede encontrar el archivo especificado en executablePath.");
    } else if (error.message && error.message.includes("loading shared libraries")) {
        console.error("Error de librerías compartidas: Faltan dependencias del sistema para Chromium.");
        console.error("Asegúrate de que @sparticuz/chromium esté en la versión correcta y configurado para incluir dependencias para Vercel/Lambda.");
    }
    throw new Error(`Fallo al lanzar el navegador: ${error.message}`);
  }

  console.log("Navegador lanzado, creando nueva página...");
  const page = await browser.newPage();
  console.log("Página creada.");

  try {
    await page.setBypassCSP(true);
    console.log("CSP bypass configurado.");

    console.log("Estableciendo contenido HTML...");
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
      timeout: 90000,
    });
    console.log("Contenido HTML establecido.");

    console.log("Generando PDF...");
    const pdfBuffer = await page.pdf({
      format: "a4" as PaperFormat,
      printBackground: true,
      margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
      },
      timeout: 90000,
    });
    console.log("PDF generado.");

    return pdfBuffer;

  } catch (pageError) {
    console.error("Error durante las operaciones de la página (setContent, pdf):", pageError);
    throw new Error(`Error en la página de Puppeteer: ${pageError.message}`);
  } finally {
    if (browser) {
      console.log("Cerrando navegador...");
      await browser.close();
      console.log("Navegador cerrado.");
    }
  }
}