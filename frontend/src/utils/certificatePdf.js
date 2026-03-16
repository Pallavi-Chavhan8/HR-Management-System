import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export const A4_SIZE_MM = {
  width: 210,
  height: 297,
};

export const exportElementAsA4Pdf = async ({ element, fileName = "experience-certificate.pdf" }) => {
  if (!element) {
    throw new Error("Certificate content was not found.");
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const imageData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const margin = 10;
  const maxWidth = A4_SIZE_MM.width - margin * 2;
  const maxHeight = A4_SIZE_MM.height - margin * 2;

  let renderWidth = maxWidth;
  let renderHeight = (canvas.height * renderWidth) / canvas.width;

  if (renderHeight > maxHeight) {
    renderHeight = maxHeight;
    renderWidth = (canvas.width * renderHeight) / canvas.height;
  }

  const offsetX = (A4_SIZE_MM.width - renderWidth) / 2;
  const offsetY = (A4_SIZE_MM.height - renderHeight) / 2;

  pdf.addImage(imageData, "PNG", offsetX, offsetY, renderWidth, renderHeight, undefined, "FAST");
  pdf.save(fileName);
};
