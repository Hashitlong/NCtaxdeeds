/**
 * Standardizes county names to prevent duplicates and inconsistencies
 * 
 * Rules:
 * 1. Remove ", NC" suffix
 * 2. Remove " County" suffix
 * 3. Trim whitespace
 * 4. Convert to title case
 * 5. Map city/town names to their counties
 */

const CITY_TO_COUNTY_MAP: Record<string, string> = {
  "City of Laurinburg": "Scotland",
  "City of Lumberton": "Robeson",
  "Town of Maxton": "Robeson",
  "Town of Williamston": "Martin",
  "City of Roanoke Rapids": "Halifax",
  "Town of Tarboro": "Edgecombe",
};

export function standardizeCountyName(countyName: string | null | undefined): string {
  if (!countyName) return "";
  
  let standardized = countyName.trim();
  
  // Check if it's a city/town that needs to be mapped to a county
  if (CITY_TO_COUNTY_MAP[standardized]) {
    return CITY_TO_COUNTY_MAP[standardized];
  }
  
  // Remove ", NC" suffix
  standardized = standardized.replace(/, NC$/i, "");
  
  // Remove " County" suffix
  standardized = standardized.replace(/ County$/i, "");
  
  // Trim any remaining whitespace
  standardized = standardized.trim();
  
  // Convert to title case (first letter uppercase, rest lowercase)
  standardized = standardized
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  
  return standardized;
}
