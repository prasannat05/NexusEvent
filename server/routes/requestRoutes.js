const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const User = require('../models/User');
const OrganizerRequest = require('../models/OrganizerRequest');

// POST / — Student submits organizer request
router.post('/', verifyToken, async (req, res) => {
    try {
        const { uid, email } = req.user;

        // Check if already requested
        const existing = await OrganizerRequest.findOne({ userId: uid });
        if (existing) {
            return res.status(400).json({ error: 'You have already submitted an organizer request' });
        }

        // Get displayName from the User model
        const user = await User.findOne({ uid });
        const displayName = user ? user.displayName : email.split('@')[0];

        const request = await OrganizerRequest.create({
            userId: uid,
            email,
            displayName
        });

        res.status(201).json({ message: 'Organizer request submitted', request });
    } catch (error) {
        console.error('Submit organizer request error:', error);
        res.status(500).json({ error: 'Failed to submit organizer request' });
    }
});

// GET / — Admin fetches all requests (sorted by createdAt desc)
router.get('/', verifyToken, async (req, res) => {
    try {
        const requests = await OrganizerRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error('Fetch organizer requests error:', error);
        res.status(500).json({ error: 'Failed to fetch organizer requests' });
    }
});

// GET /my-status — User checks their own request status
router.get('/my-status', verifyToken, async (req, res) => {
    try {
        const request = await OrganizerRequest.findOne({ userId: req.user.uid });
        res.json(request || null);
    } catch (error) {
        console.error('Check request status error:', error);
        res.status(500).json({ error: 'Failed to check request status' });
    }
});

// PATCH /:id/approve — Admin approves a request
router.patch('/:id/approve', verifyToken, async (req, res) => {
    try {
        const request = await OrganizerRequest.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Update the User's role to 'organizer'
        await User.findOneAndUpdate(
            { uid: request.userId },
            { role: 'organizer' }
        );

        res.json({ message: 'Request approved', request });
    } catch (error) {
        console.error('Approve request error:', error);
        res.status(500).json({ error: 'Failed to approve request' });
    }
});

// PATCH /:id/reject — Admin rejects a request
router.patch('/:id/reject', verifyToken, async (req, res) => {
    try {
        const request = await OrganizerRequest.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        res.json({ message: 'Request rejected', request });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({ error: 'Failed to reject request' });
    }
});

module.exports = router;
