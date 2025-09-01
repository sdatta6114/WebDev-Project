// File: server/models/ActivityLog.js
const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: { type: String, enum: ['uploaded', 'deleted'], required: true },
    fileName: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
