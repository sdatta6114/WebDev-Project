// File: server/routes/users.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const File = require('../models/File');
const auth = require('../middleware/auth');
const router = express.Router();

// --- Multer Configuration for Avatars ---
const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/avatars/';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Overwrite previous avatar for simplicity
        cb(null, `${req.user.id}${path.extname(file.originalname)}`);
    }
});
const uploadAvatar = multer({ storage: avatarStorage });

// Middleware for admin roles
const adminAuth = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ msg: 'Access denied.' });
    }
    next();
};

// Get all users and their files
router.get('/', [auth, adminAuth], async (req, res) => {
    try {
        const users = await User.find().select('-password').lean();
        const usersWithFiles = await Promise.all(
            users.map(async (user) => {
                const files = await File.find({ uploadedBy: user._id });
                return { ...user, files };
            })
        );
        res.json(usersWithFiles);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update user profile
router.patch('/me', auth, async (req, res) => {
    const { name } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { name } },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// --- NEW: Endpoint to upload user avatar ---
router.post('/avatar', [auth, uploadAvatar.single('avatar')], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded.' });
        }
        const user = await User.findById(req.user.id);
        user.avatarUrl = req.file.path;
        await user.save();
        res.json({ avatarUrl: user.avatarUrl });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Delete a user
router.delete('/:id', [auth, adminAuth], async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) return res.status(404).json({ msg: 'User not found' });

        if (req.user.role === 'admin' && userToDelete.role !== 'user') {
            return res.status(403).json({ msg: 'Admins can only remove users.' });
        }
        
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'User removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Approve an admin
router.patch('/approve/:id', auth, async (req, res) => {
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ msg: 'Only superadmins can approve accounts.' });
    }
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
