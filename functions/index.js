const { onRequest } = require('firebase-functions/v2/https');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// ── Models ──────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    role: { type: String, enum: ['student', 'organizer', 'admin'], default: 'student' },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    maxCapacity: { type: Number, required: true, min: 1 },
    attendees: [{ type: String }],
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Event = mongoose.model('Event', eventSchema);

const ticketSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    passId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    registeredAt: { type: Date, default: Date.now }
});
ticketSchema.index({ userId: 1, eventId: 1 }, { unique: true });
const Ticket = mongoose.model('Ticket', ticketSchema);

// ── Firebase Admin ──────────────────────────────────────────────────
const admin = require('firebase-admin');
if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'nexuscampus-pras' });
}

// ── Auth Middleware ─────────────────────────────────────────────────
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split('Bearer ')[1];
    try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// ── MongoDB Connection (cached for Cloud Functions) ─────────────────
const MONGODB_URI = 'mongodb+srv://nexusadmin:nexus12345@nexuscampus.uq1tlkh.mongodb.net/nexuscampus_db?retryWrites=true&w=majority&appName=NexusCampus';
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(MONGODB_URI);
        isConnected = true;
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        throw error;
    }
};

// ── Express App ─────────────────────────────────────────────────────
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Ensure DB connection before every request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// ── Auth Routes ─────────────────────────────────────────────────────
app.post('/api/auth/register', verifyToken, async (req, res) => {
    try {
        const { role, displayName } = req.body;
        const { uid, email } = req.user;

        let user = await User.findOne({ uid });
        if (user) {
            user.displayName = displayName || user.displayName;
            if (role) user.role = role;
            await user.save();
        } else {
            user = await User.create({
                uid, email,
                displayName: displayName || email.split('@')[0],
                role: role || 'student'
            });
        }
        res.status(200).json({ message: 'User registered', user });
    } catch (error) {
        console.error('Auth register error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

app.get('/api/auth/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.user.uid });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// ── Event Routes ────────────────────────────────────────────────────
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.get('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json(event);
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

app.post('/api/events', verifyToken, async (req, res) => {
    try {
        const { title, date, location, maxCapacity } = req.body;
        if (!title || !date || !location || !maxCapacity) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const event = await Event.create({
            title, date, location,
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

app.delete('/api/events/:id', verifyToken, async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        await Ticket.deleteMany({ eventId: req.params.id });
        res.json({ message: 'Event deleted' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// ── Ticket Routes ───────────────────────────────────────────────────
app.post('/api/tickets/register/:eventId', verifyToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (event.attendees.length >= event.maxCapacity) {
            return res.status(400).json({ error: 'Event is at full capacity' });
        }
        if (event.attendees.includes(req.user.uid)) {
            return res.status(400).json({ error: 'Already registered for this event' });
        }
        event.attendees.push(req.user.uid);
        await event.save();

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

app.delete('/api/tickets/cancel/:eventId', verifyToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        event.attendees = event.attendees.filter(uid => uid !== req.user.uid);
        await event.save();
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

app.get('/api/tickets/my', verifyToken, async (req, res) => {
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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Export as Firebase Cloud Function ────────────────────────────────
exports.api = onRequest({ region: 'us-central1', timeoutSeconds: 30 }, app);
