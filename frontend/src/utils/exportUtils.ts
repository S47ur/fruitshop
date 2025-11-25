import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const exportToPdf = async (
  title: string,
  headers: string[],
  data: (string | number)[][],
  fileName: string
) => {
  // Create a temporary container for the table
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.top = "-9999px";
  container.style.left = "0";
  container.style.width = "800px"; // Fixed width for A4-like ratio
  container.style.padding = "40px";
  container.style.background = "#ffffff";
  container.style.fontFamily = "'Microsoft YaHei', 'SimHei', sans-serif"; // Use system Chinese fonts

  // Build HTML content
  const tableRows = data
    .map(
      (row) => `
      <tr>
        ${row.map((cell) => `<td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; color: #334155;">${cell}</td>`).join("")}
      </tr>
    `
    )
    .join("");

  const tableHeader = `
    <thead>
      <tr style="background-color: #f8fafc;">
        ${headers.map((h) => `<th style="border: 1px solid #e2e8f0; padding: 10px; font-size: 12px; font-weight: bold; color: #0f172a; text-align: left;">${h}</th>`).join("")}
      </tr>
    </thead>
  `;

  container.innerHTML = `
    <h1 style="font-size: 24px; color: #0f172a; margin-bottom: 20px; text-align: center;">${title}</h1>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      ${tableHeader}
      <tbody>
        ${tableRows}
      </tbody>
    </table>
    <div style="text-align: right; font-size: 10px; color: #94a3b8; margin-top: 20px;">
      生成时间: ${new Date().toLocaleString("zh-CN")}
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    
    // A4 size: 210mm x 297mm
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Multi-page support
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
};

export const exportMonthlyReport = async (
  month: string,
  stats: { label: string; value: string }[],
  fileName: string
) => {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.top = "-9999px";
  container.style.left = "0";
  container.style.width = "600px";
  container.style.padding = "40px";
  container.style.background = "#ffffff";
  container.style.fontFamily = "'Microsoft YaHei', 'SimHei', sans-serif";

  const statsHtml = stats
    .map(
      (stat) => `
      <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f1f5f9;">
        <span style="color: #64748b; font-size: 14px;">${stat.label}</span>
        <strong style="color: #0f172a; font-size: 16px;">${stat.value}</strong>
      </div>
    `
    )
    .join("");

  container.innerHTML = `
    <div style="border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h1 style="font-size: 22px; color: #0f172a; margin: 0 0 10px 0; text-align: center;">月度经营报表</h1>
      <p style="text-align: center; color: #64748b; margin: 0 0 30px 0;">${month}</p>
      <div style="display: flex; flex-direction: column;">
        ${statsHtml}
      </div>
      <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8;">
        FruitShop ERP 系统自动生成
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 20, pdfWidth, imgHeight);
    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
};

