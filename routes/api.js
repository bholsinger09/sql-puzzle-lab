const express = require('express');
const router = express.Router();
const db = require('../models/database');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const User = require('../models/User');
const sqlValidator = require('../utils/sqlValidator');

// Middleware to check if user is logged in
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// Submit a query for validation
router.post('/validate', requireAuth, async (req, res) => {
    const { challengeId, query } = req.body;

    if (!challengeId || !query) {
        return res.status(400).json({ error: 'Challenge ID and query are required' });
    }

    try {
        await db.connect();

        // Get challenge details
        const challenge = await Challenge.getById(challengeId);
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Validate the query
        const validation = await sqlValidator.validate(
            query,
            challenge.dataset,
            challenge.expected_result
        );

        // Record submission
        await Submission.create(
            req.session.user.id,
            challengeId,
            query,
            validation.isCorrect,
            validation.executionTime
        );

        // Update user score if correct and first time completing
        if (validation.isCorrect) {
            const alreadyCompleted = await Submission.hasUserCompleted(
                req.session.user.id,
                challengeId
            );

            if (!alreadyCompleted) {
                const points = { easy: 10, medium: 25, hard: 50 }[challenge.difficulty] || 10;
                await User.updateScore(req.session.user.id, points);
                validation.pointsEarned = points;
            }
        }

        res.json(validation);
    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({
            error: 'An error occurred while validating your query',
            message: error.message
        });
    }
});

// Get hint for a challenge
router.post('/hint', requireAuth, async (req, res) => {
    const { challengeId } = req.body;

    if (!challengeId) {
        return res.status(400).json({ error: 'Challenge ID is required' });
    }

    try {
        await db.connect();

        const challenge = await Challenge.getById(challengeId);
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Get user's attempt count for this challenge
        const attempts = await db.all(
            'SELECT COUNT(*) as count FROM submissions WHERE user_id = ? AND challenge_id = ?',
            [req.session.user.id, challengeId]
        );
        const attemptCount = attempts[0]?.count || 0;

        // Parse hints
        const hints = JSON.parse(challenge.hints || '[]');

        // Return progressive hints based on attempt count
        const hintIndex = Math.min(attemptCount, hints.length - 1);
        const hint = hints[hintIndex] || 'No more hints available. Try reviewing the challenge description.';

        res.json({ hint, attemptCount: attemptCount + 1 });
    } catch (error) {
        console.error('Error getting hint:', error);
        res.status(500).json({ error: 'Error getting hint' });
    }
});

// Get dataset preview
router.get('/dataset/:name', requireAuth, async (req, res) => {
    const { name } = req.params;
    const validDatasets = ['movies', 'coffee_shop', 'employees', 'students'];

    if (!validDatasets.includes(name)) {
        return res.status(400).json({ error: 'Invalid dataset name' });
    }

    try {
        await db.connect();

        // Get table schema
        const schema = await db.all(`PRAGMA table_info(${name})`);

        // Get sample data (first 5 rows)
        const sampleData = await db.all(`SELECT * FROM ${name} LIMIT 5`);

        res.json({
            tableName: name,
            schema,
            sampleData
        });
    } catch (error) {
        console.error('Error getting dataset:', error);
        res.status(500).json({ error: 'Error loading dataset' });
    }
});

// Get user profile
router.get('/profile', requireAuth, async (req, res) => {
    try {
        await db.connect();

        const user = await User.findById(req.session.user.id);
        const submissions = await Submission.getByUser(req.session.user.id, 20);

        res.json({
            user,
            recentSubmissions: submissions
        });
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ error: 'Error loading profile' });
    }
});

module.exports = router;
