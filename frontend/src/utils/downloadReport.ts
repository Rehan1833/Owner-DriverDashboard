interface DownloadReportOptions {
  fileName: string;
  title: string;
  format: 'PDF' | 'Excel' | 'CSV';
  headers: string[];
  rows: (string | number)[][];
  summary?: string;
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
    csv += `SmartOps Manufacturing Ltd. - Executive Operations Platform\n`;
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
    // Construct PDF / Text Report File
    let doc = `========================================================================\n`;
    doc += `               SMARTOPS MANUFACTURING LTD. - OPERATIONAL REPORT         \n`;
    doc += `========================================================================\n\n`;
    doc += `REPORT TITLE:    ${title.toUpperCase()}\n`;
    doc += `GENERATED ON:    ${dateStr}\n`;
    if (summary) doc += `SUMMARY:         ${summary}\n`;
    doc += `TOTAL RECORDS:   ${rows.length}\n`;
    doc += `\n------------------------------------------------------------------------\n\n`;

    // Format headers and rows into tabular text
    if (headers.length > 0) {
      doc += headers.join('  |  ') + '\n';
      doc += headers.map(h => '-'.repeat(h.length)).join('--+--') + '\n';
    }

    if (rows.length === 0) {
      doc += `\n[ NO RECORDS FOUND IN SYSTEM DATABASE - DATASET IS EMPTY ]\n`;
    } else {
      rows.forEach((row, i) => {
        doc += `${i + 1}. ` + row.join('  |  ') + '\n';
      });
    }

    doc += `\n\n------------------------------------------------------------------------\n`;
    doc += `End of Report - SmartOps Logistics & Telemetry Management Console\n`;

    const blob = new Blob([doc], { type: 'application/pdf;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${sanitizedFileName}_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
