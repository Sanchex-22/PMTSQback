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
      // En producción, nos basamos en la configuración de chrome-aws-lambda.
      // Si chromium.headless es explícitamente false, no usamos headless.
      if (chromium.headless === false) {
        return false;
      }
      // Para cualquier otro valor (true, 'new', 'shell', undefined, u otra cadena),
      // interpretamos que se desea modo headless, lo que se traduce a `true`
      // para una opción booleana.
      return true;
    } else {
      // Para desarrollo local, la intención original era usar 'new',
      // lo que significa modo headless. Para una opción booleana, esto es `true`.
      return true;
    }
  };

  const headlessOption: boolean = determineHeadlessBooleanOption();
  console.log(`Opción headless determinada (booleana): ${headlessOption}`);

  const browser = await puppeteer.launch({
    args: launchArgs,
    defaultViewport: chromium.defaultViewport,
    executablePath: executablePath, // TypeScript infiere que es string aquí debido al throw anterior
    headless: headlessOption, // Ahora es un booleano, corrigiendo el error de tipo
    ignoreHTTPSErrors: true,
    protocolTimeout: 90000, // Aumentado para operaciones largas
  });

  console.log("Navegador lanzado, creando nueva página...");
  const page = await browser.newPage();
  console.log("Página creada.");

  // Aumentar el timeout de navegación por defecto si es necesario
  // page.setDefaultNavigationTimeout(60000);

  await page.setBypassCSP(true);
  console.log("CSP bypass configurado.");

  console.log("Estableciendo contenido HTML...");
  await page.setContent(htmlContent, {
    waitUntil: "networkidle0", // Espera a que la red esté inactiva
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