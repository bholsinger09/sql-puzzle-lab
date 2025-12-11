require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for local development
    hsts: false, // Disable HSTS for local development
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: './database'
    }),
    secret: process.env.SESSION_SECRET || 'sql-puzzle-lab-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
    }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: 0, // Disable caching for development
    etag: false
}));

// Log all requests for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Import routes
const indexRoutes = require('./routes/index');
const challengeRoutes = require('./routes/challenges');
const leaderboardRoutes = require('./routes/leaderboard');
const apiRoutes = require('./routes/api');

// Use routes
app.use('/', indexRoutes);
app.use('/challenges', challengeRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        message: 'Page not found',
        error: {}
    });
});

// Initialize database before starting server
const fs = require('fs');
const { execSync } = require('child_process');
const dbPath = path.join(__dirname, 'database', 'sql_puzzle_lab.db');

if (!fs.existsSync(dbPath)) {
    console.log('📁 Database not found, initializing...');
    try {
        execSync('node scripts/initDatabase.js', { stdio: 'inherit' });
        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
} else {
    console.log('✅ Database found at', dbPath);
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 SQL Puzzle Lab running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
