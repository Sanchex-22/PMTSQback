import chromium from "@sparticuz/chromium-min";
import puppeteer, { type Browser } from 'puppeteer';
import puppeteerCore, { type Browser as BrowserCore } from 'puppeteer-core';

export async function generatePdfBuffer(htmlContent: string): Promise<Buffer> {
    let browser: Browser | BrowserCore | undefined;
    try {
        // finalHTML comes from my code's logic (you can just ignore it here)
        // THE CORE LOGIC
        if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
            // Configure the version based on your package.json (for your future usage).
            const executablePath = await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar')
            browser = await puppeteerCore.launch({
                executablePath,
                // You can pass other configs as required
                args: chromium.args,
                headless: true
            })
        } else {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            })
        }
        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0'
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10px',
                right: '10px',
                bottom: '10px',
                left: '10px'
            }
        });

        await browser.close();
        // Ensure the result is a Node.js Buffer
        return Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
    } catch (error) {
        if (browser) {
            console.log("Cerrando navegador...");
            await browser.close();
            console.log("Navegador cerrado.");
        }
        throw error;
    }
}