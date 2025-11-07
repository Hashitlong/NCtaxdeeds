import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import type { PropertyData } from './types';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

const execAsync = promisify(exec);

const ANSON_PDF_URL = 'https://www.co.anson.nc.us/DocumentCenter/View/344/Tax-Foreclosure-Auction';

export async function scrapeAnsonCounty(): Promise<PropertyData[]> {
  console.log('[Anson] Starting PDF scrape...');
  
  let pdfPath: string | null = null;
  let txtPath: string | null = null;
  
  try {
    // Download PDF to temp file
    pdfPath = join(tmpdir(), `anson-${Date.now()}.pdf`);
    const response = await axios.get(ANSON_PDF_URL, {
      responseType: 'arraybuffer',
      timeout: 30000
    });
    await writeFile(pdfPath, response.data);
    console.log('[Anson] PDF downloaded');

    // Convert PDF to text using pdftotext
    txtPath = pdfPath.replace('.pdf', '.txt');
    await execAsync(`pdftotext "${pdfPath}" "${txtPath}"`);
    console.log('[Anson] PDF converted to text');

    // Read the text file
    const { stdout } = await execAsync(`cat "${txtPath}"`);
    const text = stdout;

    // Parse the text to extract properties
    const properties: PropertyData[] = [];
    
    // Split by property entries (separated by dashes)
    const entries = text.split(/\n-\n/).filter(e => e.trim());
    
    // Extract sale date from header
    let saleDate: Date | undefined;
    const dateMatch = text.match(/OCTOBER\s+(\d+)TH/i) || text.match(/([A-Z]+)\s+(\d+)(?:TH|ST|ND|RD)/i);
    if (dateMatch) {
      // For now, hardcode 2025 since the PDF doesn't include year
      const month = dateMatch[0].includes('OCTOBER') ? 9 : 9; // October = month 9 (0-indexed)
      const day = parseInt(dateMatch[1] || dateMatch[2]);
      saleDate = new Date(2025, month, day, 11, 0, 0);
    }

    for (const entry of entries) {
      // Skip header
      if (entry.includes('UPCOMING ANSON COUNTY') || entry.includes('COURTHOUSE')) {
        continue;
      }

      // Extract owner and parcel
      const ownerMatch = entry.match(/^([^–]+)\s*–\s*parcel\s+([\d-]+)/im);
      if (!ownerMatch) continue;

      const owner = ownerMatch[1].trim();
      const parcelId = ownerMatch[2].trim();

      // Extract opening bid
      const bidMatch = entry.match(/Opening bid:\s*\$\s*\$?([\d,]+\.?\d*)/i);
      const openingBid = bidMatch ? parseFloat(bidMatch[1].replace(/,/g, '')) : undefined;

      // Extract acreage
      const acreageMatch = entry.match(/([\d.]+)\s+Deeded acres/i);
      const acreage = acreageMatch ? acreageMatch[1] : undefined;

      const property: PropertyData = {
        county: standardizeCountyName('Anson'),
        parcelId: parcelId,
        owner: owner,
        saleDate: saleDate,
        saleTime: '11:00 AM',
        saleStatus: saleDate ? 'scheduled' : 'pending',
        openingBid: openingBid,
        legalDescription: acreage ? `${acreage} deeded acres` : undefined,
        source: 'Anson County',
        sourceType: 'county_website',
          sourceUrl: 'https://www.co.anson.nc.us/DocumentCenter/View/344/Tax-Foreclosure-Auction'
      };

      properties.push(property);
    }

    console.log(`[Anson] Successfully scraped ${properties.length} properties from PDF`);
    return properties;

  } catch (error) {
    console.error('[Anson] PDF scraping failed:', error);
    throw error;
  } finally {
    // Clean up temp files
    if (pdfPath) {
      try { await unlink(pdfPath); } catch {}
    }
    if (txtPath) {
      try { await unlink(txtPath); } catch {}
    }
  }
}
