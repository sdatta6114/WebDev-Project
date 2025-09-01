// File: server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises; // For file deletion
const User = require('../models/User');
const File = require('../models/File'); // Import File model
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        if (await User.findOne({ email })) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        
        if (role === 'superadmin') {
            const superadminExists = await User.findOne({ role: 'superadmin' });
            if (superadminExists) {
                return res.status(403).json({ msg: 'A Superadmin already exists. Cannot register another.' });
            }
        }
        
        const needsApproval = role === 'admin';

        const user = new User({ name, email, password, role, approved: !needsApproval });
        await user.save();
        
        res.status(201).json({ msg: 'User registered successfully. Admins require approval.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
        
        if (!user.approved) {
            return res.status(403).json({ msg: 'Your account is pending approval.' });
        }

        // --- NEW: Reactivate account on login ---
        if (!user.isActive) {
            user.isActive = true;
            await user.save();
        }

        const payload = { user: { id: user.id, name: user.name, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   GET /api/auth/me
// @desc    Get logged-in user data
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PATCH /api/auth/deactivate
// @desc    Deactivate the logged-in user's account
router.patch('/deactivate', authMiddleware, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { isActive: false });
        res.json({ msg: 'Account deactivated successfully.' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/auth/delete
// @desc    Permanently delete the logged-in user's account and files
router.delete('/delete', authMiddleware, async (req, res) => {
    try {
        // Find and delete all files by the user
        const files = await File.find({ uploadedBy: req.user.id });
        for (const file of files) {
            try {
                await fs.unlink(file.path); // Delete from server storage
            } catch (unlinkErr) {
                console.error(`Failed to delete file from disk: ${file.path}`, unlinkErr);
            }
        }
        await File.deleteMany({ uploadedBy: req.user.id }); // Delete from DB

        // Delete the user
        await User.findByIdAndDelete(req.user.id);
        res.json({ msg: 'Account permanently deleted.' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
