/**
 * Helper functions to extract details from ZLS foreclosure notices
 */

export interface NoticeDetails {
  owner: string | null;
  caseNumber: string | null;
  legalDescription: string | null;
  deedBookPage: string | null;
  depositRequired: string | null;
  noticeText: string;
}

/**
 * Parse foreclosure notice text and extract structured data
 */
export function parseNoticeText(noticeText: string): NoticeDetails {
  const details: NoticeDetails = {
    owner: null,
    caseNumber: null,
    legalDescription: null,
    deedBookPage: null,
    depositRequired: null,
    noticeText: noticeText
  };

  // Extract owner from case title (e.g., "COUNTY OF MOORE vs. JOHN DOE")
  const ownerMatch = noticeText.match(/vs\.\s+([^,]+?)(?:\s+DATED|\s+or\s+any\s+other|,)/i);
  if (ownerMatch) {
    details.owner = ownerMatch[1].trim();
  }

  // Extract case number (e.g., "23CVD001328-620")
  const caseMatch = noticeText.match(/\b(\d{2}CVD\d{6}-\d{3})\b/);
  if (caseMatch) {
    details.caseNumber = caseMatch[1];
  }

  // Extract legal description (text between "described as follows:" and "Subject to")
  const legalMatch = noticeText.match(/described as follows:\s*([\s\S]*?)\s*(?:Subject to|Parcel Identification)/i);
  if (legalMatch) {
    details.legalDescription = legalMatch[1].trim().replace(/\s+/g, ' ');
  }

  // Extract deed book and page references
  const bookPageMatches = noticeText.match(/Book\s+\d+,?\s+Page\s+\d+/gi);
  if (bookPageMatches && bookPageMatches.length > 0) {
    details.deedBookPage = bookPageMatches.join('; ');
  }

  // Extract deposit requirement
  const depositMatch = noticeText.match(/deposit of (\d+\s*percent|\$[\d,]+)/i);
  if (depositMatch) {
    details.depositRequired = depositMatch[1];
  }

  return details;
}
