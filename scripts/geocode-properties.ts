/**
 * Script to geocode all properties that don't have coordinates yet
 * Run with: tsx scripts/geocode-properties.ts
 */

import { GeocodingService } from '../server/services/GeocodingService';

async function main() {
  console.log('[Geocoding] Starting batch geocoding process...');
  
  const service = new GeocodingService();
  
  try {
    // Geocode up to 500 properties (adjust limit as needed)
    const stats = await service.geocodeAllProperties(500);
    
    console.log('\n[Geocoding] Batch geocoding complete!');
    console.log(`Total properties processed: ${stats.total}`);
    console.log(`Successfully geocoded: ${stats.successful}`);
    console.log(`Failed: ${stats.failed}`);
    console.log(`Skipped (already geocoded or no address): ${stats.skipped}`);
    
    if (stats.successful > 0) {
      console.log('\n✅ Properties are now ready to display on the map!');
    }
    
    if (stats.failed > 0) {
      console.log('\n⚠️  Some properties failed to geocode. Check logs for details.');
    }
    
  } catch (error) {
    console.error('[Geocoding] Error during batch geocoding:', error);
    process.exit(1);
  }
}

main();
