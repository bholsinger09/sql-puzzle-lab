const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Home page
router.get('/', async (req, res) => {
    try {
        await db.connect();
        const challenges = await db.all('SELECT id, title, difficulty FROM challenges LIMIT 6');

        res.render('index', {
            title: 'SQL Puzzle Lab',
            challenges,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading home page:', error);
        res.status(500).render('error', {
            message: 'Error loading page',
            error: {}
        });
    }
});

// About page
router.get('/about', (req, res) => {
    res.render('about', {
        title: 'About - SQL Puzzle Lab',
        user: req.session.user
    });
});

// Login page
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/challenges');
    }
    res.render('login', {
        title: 'Login - SQL Puzzle Lab',
        user: null
    });
});

// Login handler
router.post('/login', async (req, res) => {
    const { username, classroom } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        await db.connect();

        // Simple login - just store username (no password for demo)
        let user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

        if (!user) {
            // Create new user
            const result = await db.run(
                'INSERT INTO users (username, password_hash, classroom) VALUES (?, ?, ?)',
                [username, 'demo', classroom || null]
            );
            user = { id: result.id, username, classroom: classroom || null, total_score: 0, challenges_completed: 0 };
        }

        req.session.user = user;
        res.json({ success: true, redirect: '/challenges' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
