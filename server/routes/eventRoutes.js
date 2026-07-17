const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/events — List all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// GET /api/events/:id — Get single event
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json(event);
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

// POST /api/events — Create a new event (organizer/admin only)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, date, location, maxCapacity } = req.body;

        if (!title || !date || !location || !maxCapacity) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const event = await Event.create({
            title,
            date,
            location,
            maxCapacity: parseInt(maxCapacity),
            attendees: [],
            createdBy: req.user.uid
        });

        res.status(201).json({ message: 'Event created', event });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// DELETE /api/events/:id — Delete an event
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        // Also remove all related tickets
        await Ticket.deleteMany({ eventId: req.params.id });

        res.json({ message: 'Event deleted' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

module.exports = router;
