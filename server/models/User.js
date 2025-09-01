// File: server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    approved: { type: Boolean, default: true },
    avatarUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true } // Add this line
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await require('bcryptjs').genSalt(10);
    this.password = await require('bcryptjs').hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);
