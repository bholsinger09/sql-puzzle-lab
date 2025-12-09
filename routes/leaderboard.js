const express = require('express');
const router = express.Router();
const db = require('../models/database');
const User = require('../models/User');

// Middleware to check if user is logged in
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

// Global leaderboard
router.get('/', async (req, res) => {
    try {
        await db.connect();
        const leaderboard = await User.getLeaderboard(null, 50);

        res.render('leaderboard', {
            title: 'Global Leaderboard - SQL Puzzle Lab',
            leaderboard,
            classroom: null,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        res.status(500).render('error', {
            message: 'Error loading leaderboard',
            error: {}
        });
    }
});

// Classroom leaderboard
router.get('/classroom/:classroom', async (req, res) => {
    try {
        await db.connect();
        const classroom = req.params.classroom;
        const leaderboard = await User.getLeaderboard(classroom, 50);

        res.render('leaderboard', {
            title: `${classroom} Leaderboard - SQL Puzzle Lab`,
            leaderboard,
            classroom,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading classroom leaderboard:', error);
        res.status(500).render('error', {
            message: 'Error loading leaderboard',
            error: {}
        });
    }
});

module.exports = router;
