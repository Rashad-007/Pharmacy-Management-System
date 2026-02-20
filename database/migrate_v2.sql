-- Migration v2: Add gst_number to suppliers table
ALTER TABLE suppliers ADD COLUMN gst_number VARCHAR(20) AFTER city;

-- Verify
DESCRIBE suppliers;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_medicines FROM medicines;
SELECT COUNT(*) as total_suppliers FROM suppliers;
