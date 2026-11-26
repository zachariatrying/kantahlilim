import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface TextItemLike {
  str?: string;
  transform?: number[];
}

/**
 * Extracts text from a PDF file entirely on-device, grouping tokens by Y-coordinate
 * so hospital lab table rows (Test Name | Result | Unit | Reference) stay on the same line.
 */
export async function extractLabTextFromPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  const pageLines: string[] = [];
  for (let p = 1; p <= pdf.numPages; p += 1) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const rows = new Map<number, Array<{ x: number; text: string }>>();

    for (const rawItem of content.items) {
      const item = rawItem as TextItemLike;
      const text = (item.str ?? '').trim();
      if (!text) continue;
      const x = item.transform?.[4] ?? 0;
      const y = Math.round((item.transform?.[5] ?? 0) / 3) * 3;
      const arr = rows.get(y) ?? [];
      arr.push({ x, text });
      rows.set(y, arr);
    }

    const sortedYs = [...rows.keys()].sort((a, b) => b - a);
    for (const y of sortedYs) {
      const cols = rows.get(y)!.sort((a, b) => a.x - b.x);
      pageLines.push(cols.map((c) => c.text).join(' '));
    }
  }

  return pageLines.join('\n');
}
