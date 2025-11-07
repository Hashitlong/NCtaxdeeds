SELECT 
  COUNT(DISTINCT county) as counties_with_properties,
  COUNT(*) as total_properties
FROM properties
WHERE isActive = 1;

SELECT 
  county,
  COUNT(*) as property_count
FROM properties
WHERE isActive = 1
GROUP BY county
ORDER BY property_count DESC;
