import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export async function generatePdfBuffer(htmlContent) {
  const isProduction = !!process.env.AWS_EXECUTION_ENV;

  const executablePath = isProduction
    ? await chromium.executablePath
    : require("puppeteer").executablePath();

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: executablePath,
    headless: isProduction ? chromium.headless : true,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  await page.setBypassCSP(true);
  await page.setContent(htmlContent, {
    waitUntil: "networkidle0",
  });

  const pdfBuffer = await page.pdf({
    format: "a4",
    printBackground: true,
    margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
    }
  });

  await browser.close();
  return pdfBuffer;
}