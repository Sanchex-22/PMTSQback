import chromium from "@sparticuz/chromium"; // Usado solo si IS_SERVERLESS_ENV es true
import puppeteer, { PaperFormat } from "puppeteer-core";

export async function generatePdfBuffer(htmlContent: string): Promise<Buffer> {
  // Lógica de detección de entorno mejorada
  const IS_ON_VERCEL =  process.env.VERCEL === "1";
  const IS_PRODUCTION_BUILD = process.env.NODE_ENV === "production";
  const IS_SERVERLESS_ENV = IS_ON_VERCEL; // Usar esto para la lógica de Puppeteer

  console.log(`--- Environment Detection ---`);
  console.log(`process.env.VERCEL: ${process.env.VERCEL}`);
  console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`IS_ON_VERCEL (!!process.env.VERCEL): ${IS_ON_VERCEL}`);
  console.log(`IS_PRODUCTION_BUILD (NODE_ENV === "production"): ${IS_PRODUCTION_BUILD}`);
  console.log(`IS_SERVERLESS_ENV (para Puppeteer): ${IS_SERVERLESS_ENV}`);
  console.log(`-----------------------------`);

  let executablePath: string | undefined;
  let launchArgs: string[];
  let effectiveHeadlessOption: boolean | 'shell' = true; // Default para local y modo moderno

  if (IS_SERVERLESS_ENV) {
    console.log("Modo Serverless (Vercel): Usando @sparticuz/chromium.");
    // @sparticuz/chromium ya incluye args y configura headless por defecto
    // para ser compatible con entornos serverless.
    executablePath = await chromium.executablePath(); // Puede ser una URL remota o local si ya está cacheado
    launchArgs = chromium.args;
    // Map "shell" to "shell", otherwise use true/false
    effectiveHeadlessOption = chromium.headless === "shell" ? "shell" : !!chromium.headless; // Solo "shell", true o false

    if (!executablePath) {
      console.error("¡ERROR CRÍTICO EN VERCEL! @sparticuz/chromium.executablePath() devolvió nulo.");
      throw new Error("@sparticuz/chromium executablePath no se pudo obtener en Vercel.");
    }
  } else {
    console.log("Modo Local: Usando puppeteer (completo) y su Chromium instalado.");
    try {
      const puppeteerFull = require("puppeteer"); // Importa la versión completa de puppeteer
      executablePath = puppeteerFull.executablePath();
      launchArgs = [
        '--no-sandbox', // Común para desarrollo local, especialmente en Linux o CI
        '--disable-setuid-sandbox',
        // Puedes añadir más argumentos si los necesitas para local
      ];
      // effectiveHeadlessOption ya es 'new' por defecto, lo cual es bueno para local
    } catch (e) {
      console.error("Error al obtener executablePath de puppeteer (completo) localmente:", e);
      throw new Error("Puppeteer (completo) no está instalado o no pudo encontrar Chromium. Asegúrate de tener 'puppeteer' en devDependencies y haber ejecutado 'npm install'.");
    }
  }

  if (!executablePath) {
    throw new Error("Chromium executablePath no se pudo determinar (después de la lógica de entorno).");
  }

  console.log(`Intentando lanzar el navegador con:`);
  console.log(`  executablePath: ${executablePath}`);
  console.log(`  args: ${JSON.stringify(launchArgs)}`);
  console.log(`  headless: ${effectiveHeadlessOption}`);

  const browser = await puppeteer.launch({
    args: launchArgs,
    executablePath: executablePath,
    headless: effectiveHeadlessOption,
    // defaultViewport: IS_SERVERLESS_ENV ? chromium.defaultViewport : { width: 1920, height: 1080 }, // Opcional, @sparticuz podría no tener defaultViewport
    ignoreHTTPSErrors: true,
  });

  console.log("Navegador lanzado, creando nueva página...");
  const page = await browser.newPage();
  console.log("Página creada.");

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

  await browser.close();
  console.log("Navegador cerrado.");
  return pdfBuffer;
}