-- Add sample medicines for testing
-- These medicines have varying stock levels to demonstrate low stock warnings

INSERT INTO medicines (name, generic_name, category, manufacturer, unit_price, stock_quantity, reorder_level, expiry_date, batch_number) VALUES
('Ibuprofen 400mg', 'Ibuprofen', 'Analgesics', 'PharmaCorp', 4.50, 150, 30, '2026-11-30', 'BATCH004'),
('Cetirizine 10mg', 'Cetirizine', 'Antihistamines', 'MediLife', 2.00, 80, 20, '2026-09-15', 'BATCH005'),
('Metformin 500mg', 'Metformin', 'Antidiabetic', 'HealthPlus', 6.00, 5, 50, '2026-08-20', 'BATCH006'),
('Omeprazole 20mg', 'Omeprazole', 'Antacids', 'PharmaCorp', 5.50, 200, 40, '2027-01-10', 'BATCH007'),
('Amoxicillin 500mg', 'Amoxicillin', 'Antibiotics', 'MediLife', 8.00, 120, 25, '2026-12-15', 'BATCH008'),
('Aspirin 75mg', 'Aspirin', 'Analgesics', 'HealthPlus', 3.00, 10, 40, '2026-10-20', 'BATCH009'),
('Vitamin D3', 'Cholecalciferol', 'Vitamins', 'PharmaCorp', 12.00, 90, 20, '2027-03-01', 'BATCH010');

-- Note: Metformin (stock=5, reorder=50) and Aspirin (stock=10, reorder=40) will show as LOW STOCK
-- Note: Some medicines are expiring soon to test the expiry warning feature
