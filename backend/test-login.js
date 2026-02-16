// Test script to verify login functionality
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testLogin() {
    console.log('🔍 Testing Login System...\n');

    // Connect to database
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'pharmacy_db'
    });

    console.log('✅ Connected to database\n');

    // Check if admin user exists
    const [users] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        ['admin@spis.com']
    );

    if (users.length === 0) {
        console.log('❌ Admin user does NOT exist in database');
        console.log('Creating admin user...\n');

        // Create admin user with proper hash
        const password_hash = await bcrypt.hash('admin123', 10);

        await connection.query(
            'INSERT INTO users (username, email, password_hash, role, full_name, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            ['admin', 'admin@spis.com', password_hash, 'admin', 'System Administrator', true]
        );

        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@spis.com');
        console.log('Password: admin123\n');
    } else {
        console.log('✅ Admin user EXISTS in database');
        console.log('Email:', users[0].email);
        console.log('Username:', users[0].username);
        console.log('Role:', users[0].role);
        console.log('Active:', users[0].is_active);
        console.log('Password Hash (first 30 chars):', users[0].password_hash.substring(0, 30) + '...\n');

        // Test password verification
        console.log('🔐 Testing password verification...');
        const testPassword = 'admin123';
        const isValid = await bcrypt.compare(testPassword, users[0].password_hash);

        if (isValid) {
            console.log('✅ Password "admin123" is CORRECT!');
            console.log('Login should work!\n');
        } else {
            console.log('❌ Password "admin123" is INCORRECT!');
            console.log('Updating password...\n');

            // Update with correct hash
            const newHash = await bcrypt.hash('admin123', 10);
            await connection.query(
                'UPDATE users SET password_hash = ? WHERE email = ?',
                [newHash, 'admin@spis.com']
            );

            console.log('✅ Password updated! Try logging in again.');
        }
    }

    await connection.end();
    console.log('\n✅ Test complete!');
}

testLogin().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
