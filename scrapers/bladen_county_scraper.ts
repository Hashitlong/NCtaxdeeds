import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import type { PropertyData } from './types';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

const execAsync = promisify(exec);

const BLADEN_PDF_URL = 'https://bladennc.govoffice3.com/vertical/Sites/%7B3428E8B4-BA8D-4BCE-9B92-0A719CB4C4FB%7D/uploads/Property_For_Sale.pdf';

export async function scrapeBladenCounty(): Promise<PropertyData[]> {
  console.log('[Bladen] Starting PDF scrape...');
  
  let pdfPath: string | null = null;
  let txtPath: string | null = null;
  
  try {
    // Download PDF to temp file
    pdfPath = join(tmpdir(), `bladen-${Date.now()}.pdf`);
    const response = await axios.get(BLADEN_PDF_URL, {
      responseType: 'arraybuffer',
      timeout: 30000
    });
    await writeFile(pdfPath, response.data);
    console.log('[Bladen] PDF downloaded');

    // Convert PDF to text using pdftotext
    txtPath = pdfPath.replace('.pdf', '.txt');
    await execAsync(`pdftotext "${pdfPath}" "${txtPath}"`);
    console.log('[Bladen] PDF converted to text');

    // Read the text file
    const { stdout } = await execAsync(`cat "${txtPath}"`);
    const text = stdout;

    // Parse the text to extract properties
    const properties: PropertyData[] = [];
    
    // Split into lines and process
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      
      // Look for numbered entries (e.g., "1. 0268-11-56-4839")
      const entryMatch = line.match(/^(\d+)\.\s+([\d-]+)$/);
      if (entryMatch) {
        const pin = entryMatch[2];
        
        // Next line should be parcel number
        const parcel = lines[i + 1] || '';
        
        // Next line should be acreage
        const acreage = lines[i + 2] || '';
        
        // Next line should be description/address
        const description = lines[i + 3] || '';
        
        // Next line should be sale price
        const salePriceText = lines[i + 4] || '';
        const salePriceMatch = salePriceText.match(/\$?([\d,]+\.?\d*)/);
        const salePrice = salePriceMatch ? parseFloat(salePriceMatch[1].replace(/,/g, '')) : undefined;
        
        // Next line should be assessed value
        const assessedValueText = lines[i + 5] || '';
        
        // Skip if we don't have valid data
        if (!pin || !description || !salePrice) {
          i++;
          continue;
        }

        const property: PropertyData = {
          county: standardizeCountyName('Bladen'),
          address: description,
          parcelId: pin,
          saleStatus: 'pending', // County-owned properties for sale
          openingBid: salePrice,
          legalDescription: acreage ? `${acreage} acres` : undefined,
          source: 'Bladen County',
        sourceType: 'county_website',
          sourceUrl: 'https://bladennc.govoffice3.com/vertical/Sites/%7B3428E8B4-BA8D-4BCE-9B92-0A719CB4C4FB%7D/uploads/Property_For_Sale.pdf'
        };

        properties.push(property);
        
        // Skip to next entry (6 lines per property)
        i += 6;
      } else {
        i++;
      }
    }

    console.log(`[Bladen] Successfully scraped ${properties.length} properties from PDF`);
    return properties;

  } catch (error) {
    console.error('[Bladen] PDF scraping failed:', error);
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
