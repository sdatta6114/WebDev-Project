// File: server/routes/files.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const File = require('../models/File');
const User = require('../models/User');
const Stat = require('../models/Stat');
const ActivityLog = require('../models/ActivityLog');
const router = express.Router();

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// @route   POST /api/files/upload
router.post('/upload', [auth, upload.single('file')], async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: 'No file uploaded.' });
        const newFile = new File({
            originalName: req.file.originalname,
            path: req.file.path,
            mimetype: req.file.mimetype,
            uploadedBy: req.user.id
        });
        await newFile.save();
        await Stat.findOneAndUpdate({ key: 'platformStats' }, { $inc: { lifetimeUploads: 1 } }, { upsert: true });
        const log = new ActivityLog({
            user: req.user.id,
            userName: req.user.name,
            userRole: req.user.role,
            action: 'uploaded',
            fileName: req.file.originalname
        });
        await log.save();
        res.status(201).json(newFile);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/files
router.get('/', auth, async (req, res) => {
    try {
        const files = await File.find({ uploadedBy: req.user.id }).sort({ uploadDate: -1 });
        res.json(files);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/files/stats
router.get('/stats', auth, async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const platformStats = await Stat.findOne({ key: 'platformStats' });
        const lifetimeUploads = platformStats ? platformStats.lifetimeUploads : 0;
        const currentFiles = await File.countDocuments();
        const deletedFiles24h = await ActivityLog.countDocuments({ action: 'deleted', timestamp: { $gte: twentyFourHoursAgo } });
        const myRecentFiles = await File.find({ uploadedBy: req.user.id }).sort({ uploadDate: -1 }).limit(5);
        res.json({ totalUploads: lifetimeUploads, deletedFiles24h, currentFiles, myRecentFiles });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// --- NEW: Endpoint to get all activity logs ---
// @route   GET /api/files/activity
router.get('/activity', auth, async (req, res) => {
    try {
        const logs = await ActivityLog.find().sort({ timestamp: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/files/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) return res.status(404).json({ msg: 'File not found.' });

        const loggedInUser = req.user;
        const fileOwner = await User.findById(file.uploadedBy);
        let isAuthorized = false;

        if (loggedInUser.role === 'superadmin') isAuthorized = true;
        else if (loggedInUser.role === 'admin' && (!fileOwner || fileOwner.role === 'user')) isAuthorized = true;
        else if (file.uploadedBy.toString() === loggedInUser.id) isAuthorized = true;

        if (!isAuthorized) return res.status(401).json({ msg: 'User not authorized.' });

        fs.unlink(file.path, async (err) => {
            if (err) console.error('Error deleting file from storage:', err);
            const log = new ActivityLog({
                user: loggedInUser.id,
                userName: loggedInUser.name,
                userRole: loggedInUser.role,
                action: 'deleted',
                fileName: file.originalName
            });
            await log.save();
            await File.findByIdAndDelete(req.params.id);
            res.json({ msg: 'File deleted successfully.' });
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
