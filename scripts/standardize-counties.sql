-- SQL script to standardize county names in the properties table
-- Removes ", NC" suffix and fixes city/town names to proper county names

-- Remove ", NC" suffix from all county names
UPDATE properties 
SET county = REPLACE(county, ', NC', '') 
WHERE county LIKE '%, NC';

-- Remove " County" suffix if present
UPDATE properties 
SET county = REPLACE(county, ' County', '') 
WHERE county LIKE '% County';

-- Fix city/town names to proper county names
UPDATE properties SET county = 'Scotland' WHERE county = 'City of Laurinburg';
UPDATE properties SET county = 'Robeson' WHERE county = 'City of Lumberton';
UPDATE properties SET county = 'Robeson' WHERE county = 'Town of Maxton';
UPDATE properties SET county = 'Martin' WHERE county = 'Town of Williamston';
UPDATE properties SET county = 'Halifax' WHERE county = 'City of Roanoke Rapids';
UPDATE properties SET county = 'Edgecombe' WHERE county = 'Town of Tarboro';

-- Trim any extra whitespace
UPDATE properties 
SET county = TRIM(county) 
WHERE county != TRIM(county);

-- Standardize capitalization (title case)
-- Note: MySQL doesn't have a built-in title case function, so we'll handle common cases
UPDATE properties SET county = 'Mecklenburg' WHERE LOWER(county) = 'mecklenburg';
UPDATE properties SET county = 'Wake' WHERE LOWER(county) = 'wake';
UPDATE properties SET county = 'Forsyth' WHERE LOWER(county) = 'forsyth';
UPDATE properties SET county = 'Guilford' WHERE LOWER(county) = 'guilford';
UPDATE properties SET county = 'Durham' WHERE LOWER(county) = 'durham';
UPDATE properties SET county = 'Buncombe' WHERE LOWER(county) = 'buncombe';
UPDATE properties SET county = 'Cabarrus' WHERE LOWER(county) = 'cabarrus';
UPDATE properties SET county = 'Catawba' WHERE LOWER(county) = 'catawba';
UPDATE properties SET county = 'Gaston' WHERE LOWER(county) = 'gaston';
UPDATE properties SET county = 'Alamance' WHERE LOWER(county) = 'alamance';
UPDATE properties SET county = 'Rutherford' WHERE LOWER(county) = 'rutherford';
UPDATE properties SET county = 'Cumberland' WHERE LOWER(county) = 'cumberland';
UPDATE properties SET county = 'Edgecombe' WHERE LOWER(county) = 'edgecombe';
UPDATE properties SET county = 'Hoke' WHERE LOWER(county) = 'hoke';
UPDATE properties SET county = 'Yadkin' WHERE LOWER(county) = 'yadkin';
UPDATE properties SET county = 'Anson' WHERE LOWER(county) = 'anson';
UPDATE properties SET county = 'Bladen' WHERE LOWER(county) = 'bladen';
UPDATE properties SET county = 'McDowell' WHERE LOWER(county) = 'mcdowell';

-- Verify results
SELECT 
  county, 
  COUNT(*) as property_count 
FROM properties 
GROUP BY county 
ORDER BY property_count DESC;

-- Show total unique counties (should be <= 100)
SELECT COUNT(DISTINCT county) as unique_counties FROM properties;
