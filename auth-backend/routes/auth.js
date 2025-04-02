const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../models/db');
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
            [email, hashedPassword]
        );
        res.status(201).json({
            user_id: result.rows[0].id,
            email: result.rows[0].email,
            message: 'Registration successful',
        });
    } catch (err) {
        console.error("Error during registration:", err);
        if (err.code === '23505') {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Generate token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({
            user_id: user.id,
            email: user.email,
            token: token,
            message: 'Login successful',
        });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Update email route (protected)
router.post('/update-email', authenticateToken, async (req, res) => {
    const { user_id, new_email } = req.body;

    // Verify user is updating their own account
    if (req.user.id != user_id) {
        return res.status(403).json({ error: 'Unauthorized: You can only update your own account' });
    }

    try {
        // Check if email already exists
        const checkEmail = await pool.query('SELECT * FROM users WHERE email = $1', [new_email]);
        if (checkEmail.rows.length > 0) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // Update email
        await pool.query(
            'UPDATE users SET email = $1 WHERE id = $2',
            [new_email, user_id]
        );

        res.json({
            success: true,
            message: 'Email updated successfully',
            email: new_email
        });
    } catch (err) {
        console.error("Error updating email:", err);
        res.status(500).json({ error: 'Failed to update email' });
    }
});

// Update password route (protected)
// Check your auth.js file for a route defined like this:
router.post('/update-password', authenticateToken, async (req, res) => {
    const { user_id, current_password, new_password } = req.body;

    // Verify user is updating their own account
    if (req.user.id != user_id) {
        return res.status(403).json({ error: 'Unauthorized: You can only update your own account' });
    }

    try {
        // Get current user
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);
        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isValid = await bcrypt.compare(current_password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update password
        await pool.query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, user_id]
        );

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (err) {
        console.error("Error updating password:", err);
        res.status(500).json({ error: 'Failed to update password' });
    }
});



router.get('/test', (req, res) => {
    res.json({ message: 'Auth route is working' });
  });

// Get user profile route (protected)
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: result.rows[0]
        });
    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete account route (protected)
router.delete('/account', authenticateToken, async (req, res) => {
    try {
        // Delete user's data (in a real app, you might archive instead)
        await pool.query('DELETE FROM simulation_results WHERE user_id = $1', [req.user.id]);
        await pool.query('DELETE FROM uploaded_images WHERE user_id = $1', [req.user.id]);

        // Delete user account
        await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (err) {
        console.error("Error deleting account:", err);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

module.exports = router;