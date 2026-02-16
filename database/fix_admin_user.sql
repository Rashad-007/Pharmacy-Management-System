-- Fix Admin User with Correct Password Hash
-- This script creates the admin user with password "admin123"

-- Delete existing admin user if exists
DELETE FROM users WHERE email = 'admin@spis.com';

-- Insert admin user with properly hashed password for "admin123"
INSERT INTO users (username, email, password_hash, role, full_name, is_active) 
VALUES (
  'admin', 
  'admin@spis.com', 
  '$2b$10$g1mOJpS7pIxikRtHnlruie.ch4NNw5WIrIgrP0qvyUupatWazb1Lju', 
  'admin', 
  'System Administrator',
  TRUE
);

-- Verify the user was created
SELECT id, username, email, role, is_active FROM users WHERE email = 'admin@spis.com';
