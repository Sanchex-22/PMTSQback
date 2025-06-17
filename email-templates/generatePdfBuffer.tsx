import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export async function generatePdfBuffer(htmlContent) {
  const isProduction = !!process.env.AWS_EXECUTION_ENV;
  console.log(`isProduction: ${isProduction}`);

  let executablePath;
  let launchArgs; // Variable para los argumentos

  if (isProduction) {
    console.log("Usando chromium.executablePath para producción.");
    executablePath = await chromium.executablePath;
    launchArgs = chromium.args; // Args de chrome-aws-lambda para producción
  } else {
    console.log("Usando puppeteer.executablePath() para local.");
    try {
      const puppeteerFull = require("puppeteer");
      executablePath = puppeteerFull.executablePath();
      console.log(`Local executablePath encontrado: ${executablePath}`);
      // Argumentos más seguros y comunes para local:
      launchArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // Puedes añadir '--disable-dev-shm-usage' si alguna vez corres esto en Docker localmente
        // '--disable-gpu', // A veces ayuda si hay problemas con la GPU
      ];
    } catch (e) {
      console.error("Error al obtener executablePath de puppeteer (completo):", e);
      throw new Error("Puppeteer (completo) no está instalado o no pudo encontrar Chromium. Asegúrate de tener 'puppeteer' en devDependencies y haber ejecutado 'npm install'.");
    }
  }

  if (!executablePath) {
    throw new Error("Chromium executablePath no se pudo determinar.");
  }

  console.log(`Intentando lanzar el navegador con executablePath: ${executablePath}`);
  console.log(`Argumentos de lanzamiento: ${JSON.stringify(launchArgs)}`); // Log para ver los args

const browser = await puppeteer.launch({
  args: launchArgs,
  defaultViewport: chromium.defaultViewport,
  executablePath: executablePath as string,
  headless: isProduction
    ? (typeof chromium.headless === 'string' ? 'new' : chromium.headless)
    : 'new',
  ignoreHTTPSErrors: true,
  protocolTimeout: 60000,
});

  console.log("Navegador lanzado, creando nueva página...");
  const page = await browser.newPage();
  console.log("Página creada.");

  await page.setBypassCSP(true);
  console.log("CSP bypass configurado.");

  console.log("Estableciendo contenido HTML...");
  await page.setContent(htmlContent, {
    waitUntil: "networkidle0", // Espera a que la red esté inactiva
    timeout: 60000, // También puedes aumentar el timeout aquí si el contenido es complejo
  });
  console.log("Contenido HTML establecido.");

  console.log("Generando PDF...");
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
    }
  });
  console.log("PDF generado.");

  await browser.close();
  console.log("Navegador cerrado.");
  return pdfBuffer;
}