const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    maxCapacity: {
        type: Number,
        required: true,
        min: 1
    },
    attendees: [{
        type: String  // Firebase UIDs
    }],
    createdBy: {
        type: String,  // Firebase UID of organizer/admin
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', eventSchema);
