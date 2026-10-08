/**
 * SkillTrack Data Export Utilities
 * Provides seamless client-side CSV and JSON downloads.
 */

export function downloadBlob(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) {
  const sanitize = (val: unknown) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const lines = [
    headers.map(sanitize).join(','),
    ...rows.map((row) => row.map(sanitize).join(',')),
  ];

  downloadBlob(filename, lines.join('\r\n'), 'text/csv;charset=utf-8;');
}

export function exportJson(filename: string, data: unknown) {
  const formatted = JSON.stringify(data, null, 2);
  downloadBlob(filename, formatted, 'application/json;charset=utf-8;');
}
