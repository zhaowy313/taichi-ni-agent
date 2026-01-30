import * as fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export async function ingestDocument(
  filePath: string,
  title: string,
  category: string,
  token: string,
  baseUrl: string = 'http://localhost:8787'
): Promise<void> {
  // Read file
  const text = await fs.readFile(filePath, 'utf-8');

  // Prepare payload
  const payload = {
    text,
    metadata: {
      title,
      category,
    },
  };

  // Send request
  const response = await fetch(`${baseUrl}/admin/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ingestion failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Ingestion successful:', result);
}

// CLI Execution Support
const __filename = fileURLToPath(import.meta.url);
const entryFile = process.argv[1];

// Loose check if this file is the entry point
if (entryFile && path.resolve(entryFile) === path.resolve(__filename)) {
    const args = process.argv.slice(2);
    if (args.length < 4) {
        console.error('Usage: npx tsx scripts/ingest_docs.ts <file> <title> <category> <token> [url]');
        process.exit(1);
    }
    const [file, title, category, token, url] = args;
    ingestDocument(file, title, category, token, url || 'http://localhost:8787').catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
}
