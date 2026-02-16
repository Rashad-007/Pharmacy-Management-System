-- Add medicines with expiry dates for testing expiry warnings
-- Some will be expired, some expiring soon (within 14 days)

INSERT INTO medicines (name, generic_name, category, manufacturer, unit_price, stock_quantity, reorder_level, expiry_date, batch_number) VALUES
-- Expired medicines (already past expiry date)
('Expired Medicine 1', 'Test Generic', 'Analgesics', 'TestPharma', 5.00, 50, 20, '2024-01-15', 'EXP001'),
('Expired Medicine 2', 'Test Generic', 'Antibiotics', 'TestPharma', 8.00, 30, 15, '2025-12-01', 'EXP002'),

-- Expiring soon (within next 14 days from Feb 17, 2026)
('Expiring Soon 1', 'Test Generic', 'Vitamins', 'TestPharma', 10.00, 40, 20, '2026-02-25', 'EXP003'),
('Expiring Soon 2', 'Test Generic', 'Antacids', 'TestPharma', 6.00, 25, 15, '2026-02-28', 'EXP004'),

-- Good medicines (expiry far in future)
('Good Medicine 1', 'Test Generic', 'Analgesics', 'TestPharma', 7.00, 100, 30, '2027-06-15', 'GOOD001');
