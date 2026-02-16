-- Remove duplicate medicines from the database
-- This script keeps only the first occurrence of each medicine (lowest ID)

-- First, let's see what duplicates exist
SELECT name, COUNT(*) as count
FROM medicines
GROUP BY name
HAVING count > 1;

-- Delete duplicates, keeping only the one with the lowest ID
DELETE m1 FROM medicines m1
INNER JOIN medicines m2 
WHERE m1.id > m2.id 
AND m1.name = m2.name;

-- Verify duplicates are removed
SELECT name, COUNT(*) as count
FROM medicines
GROUP BY name
HAVING count > 1;

-- Show all remaining medicines
SELECT id, name, category, stock_quantity, unit_price 
FROM medicines 
ORDER BY name;
