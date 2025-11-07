-- Fix County Name Standardization
-- Remove ", NC" suffix from all county names
-- Fix city/town names to their correct counties

-- Remove ", NC" suffix
UPDATE properties SET county = REPLACE(county, ', NC', '') WHERE county LIKE '%, NC';

-- Fix city/town names to correct counties
UPDATE properties SET county = 'Scotland' WHERE county = 'City of Laurinburg';
UPDATE properties SET county = 'Robeson' WHERE county IN ('City of Lumberton', 'Town of Maxton');
UPDATE properties SET county = 'Martin' WHERE county = 'Town of Williamston';

-- Verify results
SELECT COUNT(DISTINCT county) as unique_counties FROM properties WHERE isActive = 1;
