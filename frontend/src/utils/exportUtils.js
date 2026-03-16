import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const sanitizeFileName = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "record";

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.setAttribute("download", fileName);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export const exportRecordsAsCSV = (records, fileName) => {
  if (!Array.isArray(records) || records.length === 0) {
    return;
  }

  const headers = Object.keys(records[0]);
  const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  const csvRows = [
    headers.join(","),
    ...records.map((row) => headers.map((header) => escapeCsv(row[header])).join(",")),
  ];

  downloadBlob(new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" }), fileName);
};

export const exportRecordsAsJSON = (records, fileName) => {
  const payload = JSON.stringify(records, null, 2);
  downloadBlob(new Blob([payload], { type: "application/json;charset=utf-8;" }), fileName);
};

export const exportRecordsAsExcel = (records, fileName, sheetName = "Report") => {
  if (!Array.isArray(records) || records.length === 0) {
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(records);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
};

export const exportRecordsAsPDF = (records, fileName, title = "Report") => {
  if (!Array.isArray(records) || records.length === 0) {
    return;
  }

  const headers = Object.keys(records[0]);
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text(title, 14, 16);

  autoTable(doc, {
    startY: 22,
    head: [headers],
    body: records.map((row) => headers.map((header) => String(row[header] ?? ""))),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(fileName);
};

export const exportRecords = ({ records, format, fileName, title, sheetName }) => {
  if (!Array.isArray(records) || records.length === 0) {
    return;
  }

  if (format === "csv") {
    exportRecordsAsCSV(records, fileName);
    return;
  }

  if (format === "xlsx") {
    exportRecordsAsExcel(records, fileName, sheetName);
    return;
  }

  if (format === "pdf") {
    exportRecordsAsPDF(records, fileName, title);
    return;
  }

  if (format === "json") {
    exportRecordsAsJSON(records, fileName);
  }
};
