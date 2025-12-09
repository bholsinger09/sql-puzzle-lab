const express = require('express');
const router = express.Router();
const db = require('../models/database');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');

// Middleware to check if user is logged in
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

// List all challenges
router.get('/', requireAuth, async (req, res) => {
    try {
        await db.connect();
        const challenges = await Challenge.getAll();

        res.render('challenges/list', {
            title: 'Challenges - SQL Puzzle Lab',
            challenges,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading challenges:', error);
        res.status(500).render('error', {
            message: 'Error loading challenges',
            error: {}
        });
    }
});

// Daily challenge
router.get('/daily', requireAuth, async (req, res) => {
    try {
        await db.connect();
        const challenge = await Challenge.getDailyChallenge();

        if (!challenge) {
            return res.status(404).render('error', {
                message: 'No daily challenge available',
                error: {}
            });
        }

        // Check if user already completed this challenge
        const completed = await Submission.hasUserCompleted(req.session.user.id, challenge.id);

        res.render('challenges/daily', {
            title: 'Daily Challenge - SQL Puzzle Lab',
            challenge,
            completed,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading daily challenge:', error);
        res.status(500).render('error', {
            message: 'Error loading daily challenge',
            error: {}
        });
    }
});

// Individual challenge
router.get('/:id', requireAuth, async (req, res) => {
    try {
        await db.connect();
        const challenge = await Challenge.getById(req.params.id);

        if (!challenge) {
            return res.status(404).render('error', {
                message: 'Challenge not found',
                error: {}
            });
        }

        // Check if user already completed this challenge
        const completed = await Submission.hasUserCompleted(req.session.user.id, challenge.id);

        // Get recent submissions for this challenge
        const recentSubmissions = await Submission.getByChallenge(challenge.id, 10);

        res.render('challenges/detail', {
            title: `${challenge.title} - SQL Puzzle Lab`,
            challenge,
            completed,
            recentSubmissions,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading challenge:', error);
        res.status(500).render('error', {
            message: 'Error loading challenge',
            error: {}
        });
    }
});

module.exports = router;
