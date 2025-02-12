import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";

// Function to download as PDF
export async function downloadAsPDF(content: string, fileName: string) {
  try {
    const pdf = new jsPDF();
    const element = document.createElement("div");
    element.innerHTML = content;
    document.body.appendChild(element);

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save(`${fileName}.pdf`);

    document.body.removeChild(element);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF.");
  }
}

// Function to download as DOCX
export async function downloadAsDOCX(content: string, fileName: string) {
  try {
    const doc = new Document({
      sections: [
        {
          children: [new Paragraph({ children: [new TextRun(content)] })],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${fileName}.docx`);
  } catch (error) {
    console.error("Error generating DOCX:", error);
    throw new Error("Failed to generate Word document.");
  }
}
