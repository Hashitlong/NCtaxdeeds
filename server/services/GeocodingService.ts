/**
 * Geocoding Service - Converts property addresses to lat/long coordinates
 * Uses Google Maps Geocoding API via Manus proxy
 */

import { makeRequest } from '../_core/map';
import { getDb } from '../db';
import { properties } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

interface GeocodeResult {
  success: boolean;
  latitude?: string;
  longitude?: string;
  formattedAddress?: string;
  error?: string;
}

export class GeocodingService {
  /**
   * Geocode a single property address
   */
  async geocodeAddress(address: string, county: string): Promise<GeocodeResult> {
    try {
      // Construct full address with county and state
      const fullAddress = `${address}, ${county} County, North Carolina`;
      
      // Use Google Maps Geocoding API via Manus proxy
      const response = await makeRequest('/maps/api/geocode/json', {
        address: fullAddress,
      }) as any;

      if (response.status === 'OK' && response.results && response.results.length > 0) {
        const result = response.results[0];
        const location = result.geometry.location;
        
        return {
          success: true,
          latitude: location.lat.toString(),
          longitude: location.lng.toString(),
          formattedAddress: result.formatted_address,
        };
      } else {
        return {
          success: false,
          error: `Geocoding failed: ${response.status}`,
        };
      }
    } catch (error) {
      console.error('[GeocodingService] Error geocoding address:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Geocode a property by ID
   */
  async geocodeProperty(propertyId: number): Promise<GeocodeResult> {
    const db = await getDb();
    if (!db) {
      return { success: false, error: 'Database not available' };
    }

    try {
      // Get property from database
      const [property] = await db
        .select()
        .from(properties)
        .where(eq(properties.id, propertyId))
        .limit(1);

      if (!property) {
        return { success: false, error: 'Property not found' };
      }

      // Skip if already geocoded
      if (property.latitude && property.longitude) {
        return {
          success: true,
          latitude: property.latitude,
          longitude: property.longitude,
        };
      }

      // Skip if no address
      if (!property.address) {
        return { success: false, error: 'No address available' };
      }

      // Geocode the address
      const result = await this.geocodeAddress(property.address, property.county);

      // Save coordinates to database if successful
      if (result.success && result.latitude && result.longitude) {
        await db
          .update(properties)
          .set({
            latitude: result.latitude,
            longitude: result.longitude,
            geocodedAt: new Date(),
          })
          .where(eq(properties.id, propertyId));
      }

      return result;
    } catch (error) {
      console.error('[GeocodingService] Error geocoding property:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Geocode all properties that don't have coordinates yet
   * Returns count of successfully geocoded properties
   */
  async geocodeAllProperties(limit: number = 100): Promise<{
    total: number;
    successful: number;
    failed: number;
    skipped: number;
  }> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    // Get properties without coordinates that have addresses
    const propertiesToGeocode = await db
      .select()
      .from(properties)
      .where(eq(properties.isActive, 1))
      .limit(limit);

    const stats = {
      total: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
    };

    for (const property of propertiesToGeocode) {
      stats.total++;

      // Skip if already geocoded
      if (property.latitude && property.longitude) {
        stats.skipped++;
        continue;
      }

      // Skip if no address
      if (!property.address) {
        stats.skipped++;
        continue;
      }

      // Geocode with delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const result = await this.geocodeProperty(property.id);
      
      if (result.success) {
        stats.successful++;
        console.log(`[GeocodingService] Geocoded property ${property.id}: ${property.address}`);
      } else {
        stats.failed++;
        console.log(`[GeocodingService] Failed to geocode property ${property.id}: ${result.error}`);
      }
    }

    return stats;
  }

  /**
   * Get center point for North Carolina (for initial map view)
   */
  getNCCenter(): { lat: number; lng: number } {
    return {
      lat: 35.7596,
      lng: -79.0193,
    };
  }

  /**
   * Get bounds for North Carolina
   */
  getNCBounds(): { north: number; south: number; east: number; west: number } {
    return {
      north: 36.588,
      south: 33.842,
      east: -75.460,
      west: -84.322,
    };
  }
}
