const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/tickets/register/:eventId — RSVP to an event
router.post('/register/:eventId', verifyToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        // Check capacity
        if (event.attendees.length >= event.maxCapacity) {
            return res.status(400).json({ error: 'Event is at full capacity' });
        }

        // Check if already registered
        if (event.attendees.includes(req.user.uid)) {
            return res.status(400).json({ error: 'Already registered for this event' });
        }

        // Add to attendees
        event.attendees.push(req.user.uid);
        await event.save();

        // Create ticket
        const passId = `CAMPUS-${event._id.toString().slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        const ticket = await Ticket.create({
            userId: req.user.uid,
            eventId: event._id,
            passId,
            status: 'confirmed'
        });

        res.status(201).json({ message: 'Registration successful', ticket });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Already registered for this event' });
        }
        console.error('Register ticket error:', error);
        res.status(500).json({ error: 'Failed to register' });
    }
});

// DELETE /api/tickets/cancel/:eventId — Cancel RSVP
router.delete('/cancel/:eventId', verifyToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        // Remove from attendees
        event.attendees = event.attendees.filter(uid => uid !== req.user.uid);
        await event.save();

        // Update ticket status
        await Ticket.findOneAndUpdate(
            { userId: req.user.uid, eventId: req.params.eventId },
            { status: 'cancelled' }
        );

        res.json({ message: 'RSVP cancelled' });
    } catch (error) {
        console.error('Cancel ticket error:', error);
        res.status(500).json({ error: 'Failed to cancel' });
    }
});

// GET /api/tickets/my — Get my tickets
router.get('/my', verifyToken, async (req, res) => {
    try {
        const tickets = await Ticket.find({
            userId: req.user.uid,
            status: 'confirmed'
        }).populate('eventId');

        res.json(tickets);
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

module.exports = router;
