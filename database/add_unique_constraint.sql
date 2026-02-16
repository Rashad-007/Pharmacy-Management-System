-- Add unique constraint to prevent duplicate medicine names
-- This will automatically prevent duplicates at the database level

-- First, remove any existing duplicates
DELETE m1 FROM medicines m1
INNER JOIN medicines m2 
WHERE m1.id > m2.id 
AND m1.name = m2.name 
AND m1.batch_number = m2.batch_number;

-- Add unique constraint on medicine name + batch number combination
-- This prevents the same medicine with the same batch from being added twice
ALTER TABLE medicines 
ADD UNIQUE KEY unique_medicine_batch (name, batch_number);

-- Show the updated table structure
DESCRIBE medicines;
