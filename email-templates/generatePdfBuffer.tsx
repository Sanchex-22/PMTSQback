import chromium from "chrome-aws-lambda";
import puppeteer, { PaperFormat } from "puppeteer-core";

export async function generatePdfBuffer(htmlContent: string): Promise<Buffer> {
  // Cambiamos la forma de detectar si estamos en un entorno serverless (Vercel)
  // process.env.VERCEL se establece a "1" por Vercel en todos los despliegues.
  // process.env.NODE_ENV también es útil. En Vercel, suele ser "production".
  // Para desarrollo local, NODE_ENV suele ser "development".
  const IS_SERVERLESS_ENV = !!process.env.VERCEL || process.env.NODE_ENV === "production";

  console.log(`IS_SERVERLESS_ENV: ${IS_SERVERLESS_ENV}`);
  console.log(`process.env.VERCEL: ${process.env.VERCEL}`);
  console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`process.env.AWS_EXECUTION_ENV (for reference): ${process.env.AWS_EXECUTION_ENV}`);


  let executablePath: string | undefined;
  let launchArgs: string[];

  if (IS_SERVERLESS_ENV) { // Usamos la nueva variable
    console.log("Modo Serverless: Usando chromium.executablePath y chromium.args.");
    executablePath = await chromium.executablePath;
    // Asegurarse de que los args son los de chrome-aws-lambda
    launchArgs = chromium.args.concat([
        '--font-render-hinting=none', // Puede mejorar la renderización de fuentes
        // '--disable-dev-shm-usage', // chromium.args ya suele incluir esto si es necesario
    ]);
    // Eliminar duplicados si chromium.args ya los tiene
    launchArgs = Array.from(new Set(launchArgs));

    // Es crucial que chrome-aws-lambda esté en 'dependencies' en tu package.json
    // y puppeteer-core también. 'puppeteer' (completo) debe estar en 'devDependencies'.
    if (!executablePath) {
        console.error("¡ERROR CRÍTICO! chromium.executablePath es nulo o indefinido en entorno serverless.");
        throw new Error("Chromium executablePath de chrome-aws-lambda no se pudo obtener. Verifica la instalación de chrome-aws-lambda.");
    }

  } else {
    console.log("Modo Local: Usando puppeteer (completo) executablePath().");
    try {
      const puppeteerFull = require("puppeteer");
      executablePath = puppeteerFull.executablePath();
      console.log(`Local executablePath encontrado: ${executablePath}`);
      launchArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ];
    } catch (e) {
      console.error("Error al obtener executablePath de puppeteer (completo) localmente:", e);
      throw new Error("Puppeteer (completo) no está instalado. Asegúrate de tener 'puppeteer' en devDependencies y haber ejecutado 'npm install'.");
    }
  }

  if (!executablePath) {
    // Esta condición ahora es más un seguro, el error específico debería haber saltado antes.
    throw new Error("Chromium executablePath no se pudo determinar (después de la lógica de entorno).");
  }

  console.log(`Intentando lanzar el navegador con executablePath: ${executablePath}`);
  console.log(`Argumentos de lanzamiento: ${JSON.stringify(launchArgs)}`);

  const headlessOption: boolean = IS_SERVERLESS_ENV
    ? (chromium.headless === false ? false : true) // En serverless, respetar config de chrome-aws-lambda o default a true
    : true; // En local, default a true (nuevo modo headless)

  console.log(`Opción headless determinada (booleana): ${headlessOption}`);

  const browser = await puppeteer.launch({
    args: launchArgs,
    defaultViewport: chromium.defaultViewport, // Sigue siendo útil usar el defaultViewport de chromium
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