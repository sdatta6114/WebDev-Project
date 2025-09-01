// File: server/models/Stat.js
const mongoose = require('mongoose');

const StatSchema = new mongoose.Schema({
    // A unique key to ensure we only ever have one stats document
    key: { type: String, default: 'platformStats', unique: true }, 
    lifetimeUploads: { type: Number, default: 0 }
});

module.exports = mongoose.model('Stat', StatSchema);
