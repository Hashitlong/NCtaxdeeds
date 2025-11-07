import pdf from 'pdf-parse';
import { PropertyData } from './types';

/**
 * PDF Parser for NC County Tax Foreclosure Lists
 * Handles various PDF formats from different counties
 */

interface PDFParseResult {
  properties: PropertyData[];
  rawText: string;
  pageCount: number;
}

/**
 * Parse a PDF buffer and extract property data
 */
export async function parsePDF(pdfBuffer: Buffer, county: string): Promise<PDFParseResult> {
  const data = await pdf(pdfBuffer);
  
  const properties: PropertyData[] = [];
  const rawText = data.text;
  const pageCount = data.numpages;

  // Try different parsing strategies based on common formats
  const parsedProperties = 
    parseTableFormat(rawText, county) ||
    parseListFormat(rawText, county) ||
    parseNoticeFormat(rawText, county);

  return {
    properties: parsedProperties,
    rawText,
    pageCount
  };
}

/**
 * Parse table-style PDF format
 * Common format: columns with headers like "Parcel ID | Owner | Address | Amount"
 */
function parseTableFormat(text: string, county: string): PropertyData[] | null {
  const properties: PropertyData[] = [];
  
  // Look for common table headers
  const hasTableHeaders = /parcel\s*(id|number)|tax\s*id|pin/i.test(text);
  if (!hasTableHeaders) return null;

  // Split into lines and process
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Try to extract parcel ID (various formats)
    const parcelMatch = line.match(/\b(\d{4,}[-\s]?\d+[-\s]?\d+)\b/);
    if (!parcelMatch) continue;

    const parcelId = parcelMatch[1].replace(/\s+/g, '-');
    
    // Try to extract address (look for street patterns)
    const addressMatch = line.match(/\d+\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s+(St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Ln|Lane|Blvd|Boulevard|Way|Ct|Court)/i);
    const address = addressMatch ? addressMatch[0] : null;

    // Try to extract dollar amounts
    const amountMatches = line.match(/\$[\d,]+\.?\d*/g);
    const openingBid = amountMatches && amountMatches.length > 0 
      ? parseFloat(amountMatches[0].replace(/[$,]/g, ''))
      : null;

    // Try to extract dates (MM/DD/YYYY or MM-DD-YYYY)
    const dateMatches = line.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/g);
    const saleDate = dateMatches && dateMatches.length > 0 
      ? parseDateString(dateMatches[0])
      : null;

    properties.push({
      county,
      parcelId,
      address,
      openingBid,
      saleDate,
      source: 'pdf',
      rawData: line
    });
  }

  return properties.length > 0 ? properties : null;
}

/**
 * Parse list-style PDF format
 * Common format: Property details in paragraph blocks
 */
function parseListFormat(text: string, county: string): PropertyData[] | null {
  const properties: PropertyData[] = [];
  
  // Split by common separators (multiple blank lines, page breaks, etc.)
  const blocks = text.split(/\n\s*\n+/);
  
  for (const block of blocks) {
    if (block.trim().length < 20) continue; // Skip tiny blocks
    
    // Extract parcel ID
    const parcelMatch = block.match(/(?:parcel|tax|pin)[\s#:]*(\d{4,}[-\s]?\d+[-\s]?\d+)/i);
    if (!parcelMatch) continue;
    
    const parcelId = parcelMatch[1].replace(/\s+/g, '-');
    
    // Extract address
    const addressMatch = block.match(/(?:address|located|property)[\s:]*(.+?)(?:\n|$)/i);
    const address = addressMatch ? addressMatch[1].trim() : null;
    
    // Extract owner
    const ownerMatch = block.match(/(?:owner|name)[\s:]*(.+?)(?:\n|$)/i);
    const owner = ownerMatch ? ownerMatch[1].trim() : null;
    
    // Extract amounts
    const bidMatch = block.match(/(?:opening\s*bid|minimum\s*bid|amount)[\s:]*\$?([\d,]+\.?\d*)/i);
    const openingBid = bidMatch ? parseFloat(bidMatch[1].replace(/,/g, '')) : null;
    
    // Extract sale date
    const saleDateMatch = block.match(/(?:sale\s*date|auction\s*date|date\s*of\s*sale)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    const saleDate = saleDateMatch ? parseDateString(saleDateMatch[1]) : null;
    
    // Extract upset deadline
    const upsetMatch = block.match(/(?:upset|challenge)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    const upsetBidCloseDate = upsetMatch ? parseDateString(upsetMatch[1]) : null;

    properties.push({
      county,
      parcelId,
      address,
      owner,
      openingBid,
      saleDate,
      upsetBidCloseDate,
      source: 'pdf',
      rawData: block.trim()
    });
  }

  return properties.length > 0 ? properties : null;
}

/**
 * Parse notice-style PDF format
 * Common format: Legal notices with "NOTICE OF SALE" headers
 */
function parseNoticeFormat(text: string, county: string): PropertyData[] {
  const properties: PropertyData[] = [];
  
  // Split by "NOTICE OF SALE" or similar headers
  const notices = text.split(/NOTICE\s+OF\s+(FORECLOSURE\s+)?SALE/i);
  
  for (const notice of notices) {
    if (notice.trim().length < 50) continue;
    
    // Extract parcel ID
    const parcelMatch = notice.match(/(?:parcel|tax|pin)[\s#:]*(\d{4,}[-\s]?\d+[-\s]?\d+)/i);
    if (!parcelMatch) continue;
    
    const parcelId = parcelMatch[1].replace(/\s+/g, '-');
    
    // Extract legal description
    const legalMatch = notice.match(/(?:being|described as|legal description)[\s:]*(.+?)(?:\n\n|\.(?:\s|$))/is);
    const legalDescription = legalMatch ? legalMatch[1].trim().substring(0, 500) : null;
    
    // Extract address
    const addressMatch = notice.match(/\d+\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s+(St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Ln|Lane)/i);
    const address = addressMatch ? addressMatch[0] : null;
    
    // Extract sale date and time
    const saleDateMatch = notice.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+at\s+(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
    const saleDate = saleDateMatch ? parseDateString(saleDateMatch[1]) : null;
    const saleTime = saleDateMatch ? saleDateMatch[2] : null;
    
    // Extract location
    const locationMatch = notice.match(/(?:courthouse|at the|held at)[\s:]*(.+?)(?:\n|$)/i);
    const saleLocation = locationMatch ? locationMatch[1].trim() : null;
    
    // Extract opening bid
    const bidMatch = notice.match(/\$?([\d,]+\.?\d*)/);
    const openingBid = bidMatch ? parseFloat(bidMatch[1].replace(/,/g, '')) : null;

    properties.push({
      county,
      parcelId,
      address,
      legalDescription,
      openingBid,
      saleDate,
      saleTime,
      saleLocation,
      source: 'pdf',
      rawData: notice.trim().substring(0, 1000)
    });
  }

  return properties;
}

/**
 * Parse date string in various formats to Date object
 */
function parseDateString(dateStr: string): Date | null {
  try {
    // Handle MM/DD/YYYY or MM-DD-YYYY
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      const month = parseInt(parts[0]);
      const day = parseInt(parts[1]);
      let year = parseInt(parts[2]);
      
      // Handle 2-digit years
      if (year < 100) {
        year += year < 50 ? 2000 : 1900;
      }
      
      return new Date(year, month - 1, day);
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Download and parse PDF from URL
 */
export async function downloadAndParsePDF(url: string, county: string): Promise<PDFParseResult> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  return parsePDF(buffer, county);
}
