-- SQL script to safely remove duplicate properties
-- Strategy: For each (county, parcelId) group with duplicates, keep the OLDEST record and delete the rest

-- Step 1: Identify duplicates and mark which ones to DELETE
-- This query finds all duplicate IDs EXCEPT the oldest one in each group

-- First, let's see how many we'll delete (DRY RUN)
SELECT COUNT(*) as records_to_delete
FROM properties p1
WHERE p1.parcelId IS NOT NULL 
  AND p1.parcelId != ''
  AND EXISTS (
    SELECT 1 
    FROM properties p2 
    WHERE p2.county = p1.county 
      AND p2.parcelId = p1.parcelId
      AND p2.id < p1.id  -- Keep the one with LOWER id (older)
  );

-- Step 2: DELETE duplicates (keeps oldest record for each property)
-- Uncomment the line below to execute the deletion:

-- DELETE FROM properties
-- WHERE id IN (
--   SELECT id FROM (
--     SELECT p1.id
--     FROM properties p1
--     WHERE p1.parcelId IS NOT NULL 
--       AND p1.parcelId != ''
--       AND EXISTS (
--         SELECT 1 
--         FROM properties p2 
--         WHERE p2.county = p1.county 
--           AND p2.parcelId = p1.parcelId
--           AND p2.id < p1.id
--       )
--   ) AS duplicates_to_delete
-- );

-- Step 3: Verify cleanup
-- SELECT county, parcelId, COUNT(*) as count 
-- FROM properties 
-- WHERE parcelId IS NOT NULL AND parcelId != ''
-- GROUP BY county, parcelId 
-- HAVING COUNT(*) > 1;
-- (Should return 0 rows after cleanup)
