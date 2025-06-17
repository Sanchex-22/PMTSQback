import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core"; // puppeteer-core es correcto para AWS Lambda/Vercel

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
    // Eliminamos protocolTimeout ya que no es reconocido por el tipo LaunchOptions
    // Si necesitas un timeout general para el lanzamiento, Puppeteer tiene una opción 'timeout'
    // que por defecto es 30000ms. Si ese es un problema, puedes añadirlo:
    // timeout: 60000, // Timeout general para el lanzamiento en ms
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
    format: "A4",
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