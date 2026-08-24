/**
 * Lightweight, high-speed pure vector PDF generator for LaTeX resume fallback
 * Generates valid PDF-1.4 binary data when isolated external compiler is starting up
 * or running outside Docker.
 */

interface TextLine {
  text: string;
  size: number;
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
  isRule?: boolean;
  spacingBefore?: number;
  spacingAfter?: number;
}

export function generateSimplePdfFromTex(texSource: string): Uint8Array {
  // Extract text content and structured sections from LaTeX source
  const lines: TextLine[] = [];

  const rawLines = texSource.split('\n');
  let inItemize = false;

  for (let line of rawLines) {
    line = line.trim();
    if (!line || line.startsWith('%') || line.startsWith('\\documentclass') || line.startsWith('\\usepackage') || line.startsWith('\\pagestyle') || line.startsWith('\\begin{document}') || line.startsWith('\\end{document}') || line.startsWith('\\titleformat')) {
      continue;
    }

    if (line.includes('\\begin{itemize}')) {
      inItemize = true;
      continue;
    }
    if (line.includes('\\end{itemize}')) {
      inItemize = false;
      continue;
    }

    // Header Name: \Huge or \LARGE
    if (line.includes('\\Huge') || line.includes('\\LARGE') || line.includes('\\textbf{')) {
      const cleanName = line
        .replace(/\\Huge|\\LARGE|\\LARGE|\\scshape|\\textbf|\{|\}|\\\\|\$/g, '')
        .replace(/\\href\{[^}]+\}/g, '')
        .replace(/\\underline\{([^}]+)\}/g, '$1')
        .replace(/\\color\{[^}]+\}/g, '')
        .replace(/\\bfseries/g, '')
        .trim();

      if (cleanName && lines.length === 0) {
        lines.push({ text: cleanName, size: 18, bold: true, align: 'center', spacingAfter: 6 });
        continue;
      }
    }

    // Section header: \section{...}
    const sectionMatch = line.match(/\\section\{([^}]+)\}/);
    if (sectionMatch) {
      const secTitle = sectionMatch[1].replace(/\\&/g, '&').replace(/\\/g, '').trim();
      lines.push({ text: secTitle.toUpperCase(), size: 11, bold: true, spacingBefore: 12, spacingAfter: 3 });
      lines.push({ text: '', size: 0, isRule: true, spacingAfter: 6 });
      continue;
    }

    // Itemize bullet: \item
    if (line.startsWith('\\item')) {
      const cleanBullet = line
        .replace(/\\item\s*/, '')
        .replace(/\\small\{([^}]+)\}/g, '$1')
        .replace(/\\textbf\{([^}]+)\}/g, '$1')
        .replace(/\\textit\{([^}]+)\}/g, '$1')
        .replace(/\\href\{[^}]+\}\{([^}]+)\}/g, '$1')
        .replace(/\\href\{[^}]+\}/g, '')
        .replace(/\\underline\{([^}]+)\}/g, '$1')
        .replace(/\\&/g, '&')
        .replace(/\\%/g, '%')
        .replace(/\\\$/g, '$')
        .replace(/\\#/g, '#')
        .replace(/\\_/g, '_')
        .replace(/[\{\}]/g, '')
        .replace(/\\\\/g, '')
        .trim();

      if (cleanBullet) {
        lines.push({ text: `•  ${cleanBullet}`, size: 9, spacingAfter: 3 });
      }
      continue;
    }

    // Regular line / tabular row
    const cleanLine = line
      .replace(/\\textbf\{([^}]+)\}/g, '$1')
      .replace(/\\textit\{([^}]+)\}/g, '$1')
      .replace(/\\href\{[^}]+\}\{([^}]+)\}/g, '$1')
      .replace(/\\href\{[^}]+\}/g, '')
      .replace(/\\underline\{([^}]+)\}/g, '$1')
      .replace(/\\begin\{[^}]+\}|\\end\{[^}]+\}/g, '')
      .replace(/\\extracolsep\{[^}]+\}/g, '')
      .replace(/\\vspace\{[^}]+\}/g, '')
      .replace(/\\&/g, '&')
      .replace(/\\%/g, '%')
      .replace(/\\\$/g, '$')
      .replace(/\\#/g, '#')
      .replace(/\\_/g, '_')
      .replace(/[\{\}]/g, '')
      .replace(/\\\\/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanLine && cleanLine !== '&') {
      const isHeaderRow = lines.length < 3;
      lines.push({
        text: cleanLine,
        size: isHeaderRow ? 8.5 : 9,
        align: isHeaderRow ? 'center' : 'left',
        spacingAfter: 3,
      });
    }
  }

  // Construct PDF binary buffer
  const pageWidth = 595.28; // A4 pt
  const pageHeight = 841.89;
  const marginX = 40;
  const marginY = 40;

  let streamContent = 'BT\n';
  let currentY = pageHeight - marginY;

  for (const item of lines) {
    if (item.isRule) {
      streamContent += 'ET\n';
      streamContent += `0.2 w\n0.5 0.5 0.5 RG\n${marginX} ${currentY} m ${pageWidth - marginX} ${currentY} l S\n`;
      streamContent += 'BT\n';
      currentY -= (item.spacingAfter || 4);
      continue;
    }

    currentY -= (item.spacingBefore || 0);

    const fontName = item.bold ? '/F2' : '/F1';
    streamContent += `${fontName} ${item.size} Tf\n`;

    // Wrap long lines
    const maxCharsPerLine = Math.floor((pageWidth - marginX * 2) / (item.size * 0.52));
    const words = item.text.split(' ');
    let currentLineText = '';

    for (const word of words) {
      if ((currentLineText + ' ' + word).length > maxCharsPerLine) {
        // Render line
        const textX = item.align === 'center'
          ? Math.max(marginX, (pageWidth - currentLineText.length * item.size * 0.48) / 2)
          : marginX;

        const safeStr = currentLineText.replace(/[\(\)\\]/g, (m) => `\\${m}`);
        streamContent += `1 0 0 1 ${textX.toFixed(2)} ${currentY.toFixed(2)} Tm (${safeStr}) Tj\n`;
        currentY -= item.size + 2.5;
        currentLineText = word;
      } else {
        currentLineText = currentLineText ? currentLineText + ' ' + word : word;
      }
    }

    if (currentLineText) {
      const textX = item.align === 'center'
        ? Math.max(marginX, (pageWidth - currentLineText.length * item.size * 0.48) / 2)
        : marginX;

      const safeStr = currentLineText.replace(/[\(\)\\]/g, (m) => `\\${m}`);
      streamContent += `1 0 0 1 ${textX.toFixed(2)} ${currentY.toFixed(2)} Tm (${safeStr}) Tj\n`;
      currentY -= item.size + (item.spacingAfter || 3);
    }
  }

  streamContent += 'ET\n';

  const streamBytes = Buffer.from(streamContent, 'utf-8');

  // Build PDF Objects
  const objects = [
    // 1: Catalog
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    // 2: Pages
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    // 3: Page
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n`,
    // 4: Stream
    `4 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${streamContent}endstream\nendobj\n`,
    // 5: Font F1 (Helvetica)
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    // 6: Font F2 (Helvetica-Bold)
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
  ];

  let pdfHeader = '%PDF-1.4\n';
  let body = '';
  const xref: number[] = [0];

  let currentOffset = pdfHeader.length;

  for (const obj of objects) {
    xref.push(currentOffset);
    body += obj;
    currentOffset += Buffer.from(obj, 'utf-8').length;
  }

  const xrefOffset = currentOffset;
  let xrefTable = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (let i = 1; i < xref.length; i++) {
    xrefTable += `${xref[i].toString().padStart(10, '0')} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const fullPdf = pdfHeader + body + xrefTable + trailer;
  return new Uint8Array(Buffer.from(fullPdf, 'utf-8'));
}
