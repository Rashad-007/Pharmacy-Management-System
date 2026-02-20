const db = require('../config/database');
const bcrypt = require('bcrypt');

// Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, full_name, email, phone, role, is_active, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ success: true, count: users.length, data: users });
    } catch (error) { next(error); }
};

// Create user
exports.createUser = async (req, res, next) => {
    try {
        const { username, full_name, email, password, phone, role } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Username, email and password are required' });
        }
        const [existing] = await db.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'User with this email or username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (username, full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
            [username, full_name, email, hashedPassword, phone, role || 'pharmacist']
        );
        res.status(201).json({ success: true, message: 'User created successfully', data: { id: result.insertId } });
    } catch (error) { next(error); }
};

// Update user
exports.updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { full_name, phone, role, is_active } = req.body;
        await db.query(
            'UPDATE users SET full_name = ?, phone = ?, role = ?, is_active = ? WHERE id = ?',
            [full_name, phone, role, is_active, id]
        );
        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) { next(error); }
};

// Toggle user active status
exports.toggleUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE users SET is_active = NOT is_active WHERE id = ?', [id]);
        res.json({ success: true, message: 'User status updated' });
    } catch (error) { next(error); }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { new_password } = req.body;
        if (!new_password || new_password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }
        const hashedPassword = await bcrypt.hash(new_password, 10);
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, id]);
        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) { next(error); }
};
