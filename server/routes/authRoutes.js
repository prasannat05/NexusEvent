const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/auth/register — Save or update user after Firebase signup/login
router.post('/register', verifyToken, async (req, res) => {
    try {
        const { displayName } = req.body;
        const { uid, email } = req.user;

        let user = await User.findOne({ uid });

        if (user) {
            // Update existing user — preserve their current role
            user.displayName = displayName || user.displayName;
            await user.save();
        } else {
            // Create new user
            // Auto-detect admin by email; otherwise always default to 'student'
            const assignedRole = email === 'admin@nexuscampus.com' ? 'admin' : 'student';
            user = await User.create({
                uid,
                email,
                displayName: displayName || email.split('@')[0],
                role: assignedRole
            });
        }

        res.status(200).json({ message: 'User registered', user });
    } catch (error) {
        console.error('Auth register error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// GET /api/auth/me — Get current user profile
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.user.uid });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

module.exports = router;
