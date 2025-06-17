import chromium from "chrome-aws-lambda";
import puppeteer, { PaperFormat } from "puppeteer-core"; // Importa PaperFormat

// Añadimos tipos para los parámetros y el valor de retorno para mayor claridad
export async function generatePdfBuffer(htmlContent: string): Promise<Buffer> {
  const isProduction = !!process.env.AWS_EXECUTION_ENV;
  console.log(`isProduction: ${isProduction}`);

  let executablePath: string | undefined; // Tipo más preciso
  let launchArgs: string[]; // Tipo más preciso

  if (isProduction) {
    console.log("Usando chromium.executablePath para producción.");
    executablePath = await chromium.executablePath;
    // chromium.args ya es un array de strings, no necesita conversión
    launchArgs = Array.isArray(chromium.args) ? chromium.args : [];
  } else {
    console.log("Usando puppeteer.executablePath() para local.");
    try {
      // Requiere dinámicamente puppeteer (completo) solo para desarrollo local
      const puppeteerFull = require("puppeteer");
      executablePath = puppeteerFull.executablePath();
      console.log(`Local executablePath encontrado: ${executablePath}`);
      launchArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // '--disable-dev-shm-usage', // Útil si corres en Docker localmente
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
  console.log(`Argumentos de lanzamiento: ${JSON.stringify(launchArgs)}`);

  // Función para determinar el valor booleano de headless
  const determineHeadlessBooleanOption = (): boolean => {
    if (isProduction) {
      if (chromium.headless === false) {
        return false;
      }
      return true;
    } else {
      return true;
    }
  };

  const headlessOption: boolean = determineHeadlessBooleanOption();
  console.log(`Opción headless determinada (booleana): ${headlessOption}`);

  const browser = await puppeteer.launch({
    args: launchArgs,
    defaultViewport: chromium.defaultViewport,
    executablePath: executablePath,
    headless: headlessOption,
    ignoreHTTPSErrors: true,
    // timeout: 60000, // Opcional: Timeout general para el lanzamiento
  });

  console.log("Navegador lanzado, creando nueva página...");
  const page = await browser.newPage();
  console.log("Página creada.");

  await page.setBypassCSP(true);
  console.log("CSP bypass configurado.");

  console.log("Estableciendo contenido HTML...");
  await page.setContent(htmlContent, {
    waitUntil: "networkidle0",
    timeout: 90000, // Timeout para el establecimiento del contenido
  });
  console.log("Contenido HTML establecido.");

  console.log("Generando PDF...");
  const pdfBuffer = await page.pdf({
    format: "a4" as PaperFormat, // Cambiado "A4" a "a4" y añadido un type assertion
    printBackground: true,
    margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
    },
    timeout: 90000, // Timeout para la generación del PDF
  });
  console.log("PDF generado.");

  await browser.close();
  console.log("Navegador cerrado.");
  return pdfBuffer;
}