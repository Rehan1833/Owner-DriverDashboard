interface DownloadReportOptions {
  fileName: string;
  title: string;
  format: 'PDF' | 'Excel' | 'CSV';
  headers: string[];
  rows: (string | number)[][];
  summary?: string;
}

function escapePdfText(text: string): string {
  return String(text ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function generateValidPDF(
  title: string,
  dateStr: string,
  summary: string | undefined,
  headers: string[],
  rows: (string | number)[][]
): Blob {
  const lines: string[] = [];

  // Header Title
  lines.push(`BT /F1 16 Tf 50 750 Td (${escapePdfText(title)}) Tj ET`);

  // Subtitle & Timestamp
  lines.push(`BT /F2 10 Tf 50 732 Td (Generated on: ${escapePdfText(dateStr)}) Tj ET`);
  if (summary) {
    lines.push(`BT /F2 10 Tf 50 718 Td (Summary: ${escapePdfText(summary)}) Tj ET`);
  }

  // Top Divider Line
  lines.push('50 706 512 1 re f');

  let y = 686;

  // Table Headers
  if (headers.length > 0) {
    const headerStr = headers.join('  |  ');
    lines.push(`BT /F1 10 Tf 50 ${y} Td (${escapePdfText(headerStr.slice(0, 110))}) Tj ET`);
    y -= 14;
    lines.push(`50 ${y} 512 0.5 re f`);
    y -= 14;
  }

  // Rows
  if (rows.length === 0) {
    lines.push(`BT /F2 10 Tf 50 ${y} Td ([ NO RECORDS FOUND IN SYSTEM DATABASE ]) Tj ET`);
  } else {
    rows.forEach((row, i) => {
      if (y < 50) return;
      const rowStr = `${i + 1}. ` + row.join('  |  ');
      lines.push(`BT /F2 9 Tf 50 ${y} Td (${escapePdfText(rowStr.slice(0, 110))}) Tj ET`);
      y -= 14;
    });
  }

  // Footer Divider & Text
  lines.push('50 42 512 0.5 re f');
  lines.push('BT /F2 8 Tf 50 28 Td (SmartOps Enterprise Fleet & Telemetry Console - Confidential Report) Tj ET');

  const streamContent = lines.join('\n');
  const streamLength = streamContent.length;

  const pdfObjects = [
    `%PDF-1.4`,
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj`,
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`,
    `6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`
  ];

  let body = pdfObjects[0] + '\n';
  const offsets: number[] = [0];

  for (let i = 1; i < pdfObjects.length; i++) {
    offsets.push(body.length);
    body += pdfObjects[i] + '\n';
  }

  const startxref = body.length;
  let xref = `xref\n0 ${pdfObjects.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }

  xref += `trailer\n<< /Size ${pdfObjects.length} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;

  const fullPdf = body + xref;
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(fullPdf);

  return new Blob([uint8Array], { type: 'application/pdf' });
}

export const downloadReport = ({
  fileName,
  title,
  format,
  headers,
  rows,
  summary
}: DownloadReportOptions) => {
  const dateStr = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  });

  const sanitizedFileName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_');

  if (format === 'Excel' || format === 'CSV') {
    // Construct CSV content with UTF-8 BOM so Excel opens it correctly with formatting
    let csv = '\uFEFF';
    csv += `SmartOps Enterprise Fleet Platform\n`;
    csv += `Report Title: ${title}\n`;
    csv += `Generated Date: ${dateStr}\n`;
    if (summary) csv += `Summary: ${summary}\n`;
    csv += `\n`;

    // Add headers
    csv += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';

    // Add rows or empty message
    if (rows.length === 0) {
      csv += `"No records found (Empty dataset)",` + headers.slice(1).map(() => '""').join(',') + '\n';
    } else {
      rows.forEach(row => {
        csv += row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',') + '\n';
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${sanitizedFileName}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // Generate valid %PDF-1.4 binary Blob
    const pdfBlob = generateValidPDF(title, dateStr, summary, headers, rows);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${sanitizedFileName}_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
