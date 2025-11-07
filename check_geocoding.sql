SELECT 
  COUNT(*) as total_properties,
  SUM(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 ELSE 0 END) as geocoded,
  SUM(CASE WHEN latitude IS NULL OR longitude IS NULL THEN 1 ELSE 0 END) as not_geocoded,
  SUM(CASE WHEN address IS NULL THEN 1 ELSE 0 END) as no_address
FROM properties
WHERE isActive = 1;
