import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export async function generatePdfBuffer(htmlContent) {
  // Detectamos si estamos en entorno serverless (AWS Lambda o Vercel)
  const isServerless = !!process.env.AWS_EXECUTION_ENV || process.env.VERCEL === "1";

  // Elegimos la ruta del ejecutable
  const executablePath = isServerless
    ? await chromium.executablePath
    : require("puppeteer").executablePath();

  const browser = await puppeteer.launch({
    args: isServerless ? chromium.args : [],
    defaultViewport: isServerless ? chromium.defaultViewport : null,
    executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  await page.setBypassCSP(true);
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "a4",
    printBackground: true,
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
  });

  await browser.close();
  return pdfBuffer;
}
