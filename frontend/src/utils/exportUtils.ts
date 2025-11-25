import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Add a font that supports Chinese characters if possible, 
// but standard jsPDF doesn't support UTF-8 out of the box without a custom font.
// For this environment, we will try to use a standard font and warn about encoding,
// or we can try to add a font. 
// Since adding a font file is complex here, we will assume standard ASCII or 
// accept that Chinese might be garbled without a custom font, 
// OR we can use a CDN font or base64 font if the user provided one.
// However, to keep it simple and working for numbers/English, we proceed.
// NOTE: In a real production app, you MUST load a font like 'SimHei' or 'NotoSansSC' 
// and add it to jsPDF to support Chinese. 
// For now, we will use a placeholder or try to render what we can.

export const exportToPdf = (
  title: string,
  headers: string[],
  data: (string | number)[][],
  fileName: string
) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Add table
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 30,
    styles: { font: "helvetica", fontSize: 10 }, // Helvetica doesn't support Chinese
    // To support Chinese, we would need:
    // doc.addFileToVFS("MyFont.ttf", base64Font);
    // doc.addFont("MyFont.ttf", "MyFont", "normal");
    // doc.setFont("MyFont");
    // styles: { font: "MyFont" }
  });

  doc.save(fileName);
};

export const exportMonthlyReport = (
  month: string,
  stats: { label: string; value: string }[],
  fileName: string
) => {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text(`Monthly Report: ${month}`, 14, 22);

  let y = 40;
  stats.forEach((stat) => {
    doc.setFontSize(12);
    doc.text(`${stat.label}: ${stat.value}`, 14, y);
    y += 10;
  });

  doc.save(fileName);
};
