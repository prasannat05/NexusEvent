const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true  // Firebase UID
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    passId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled'],
        default: 'confirmed'
    },
    registeredAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate registrations
ticketSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Ticket', ticketSchema);
