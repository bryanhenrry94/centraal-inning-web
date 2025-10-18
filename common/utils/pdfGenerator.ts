import puppeteer, { PaperFormat } from "puppeteer";
import fs from "fs";

export const generatePDF = async (
  html: string,
  pdfPath: string
): Promise<boolean> => {
  try {
    const pdf = await htmlToPDF(html);
    await fs.promises.writeFile(pdfPath, pdf);
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};

export const htmlToPDF = async (
  html: string,
  pdfPath?: string
): Promise<Buffer> => {
  try {
    const pdf = await new Promise<Buffer>(async (resolve) => {
      const options = {
        format: "A4" as PaperFormat,
        printBackground: true,
      };

      const browser = await puppeteer.launch({
        headless: true,
        executablePath:
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      });

      const page = await browser.newPage();
      await page.setContent(html);
      // Use pdfPath if provided, otherwise omit path
      const pdfBuffer = await page.pdf(
        pdfPath ? { ...options, path: pdfPath } : options
      );
      await browser.close();
      resolve(Buffer.from(pdfBuffer));
    });
    return pdf;
  } catch (error) {
    console.error("Error converting HTML to PDF:", error);
    throw error;
  }
};
