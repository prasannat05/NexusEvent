const mongoose = require('mongoose');

const organizerRequestSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    displayName: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OrganizerRequest', organizerRequestSchema);
