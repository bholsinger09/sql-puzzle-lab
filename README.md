# SQL Puzzle Lab

A Progressive Web Application for learning SQL through daily challenges and interactive puzzles.

## Features

- 📅 **Daily SQL Challenges** - New puzzle every day
- 📊 **Built-in Datasets** - Movies, Coffee Shop, HR, School, and more
- ✅ **Instant Validation** - Get immediate feedback on your queries
- 💡 **Hints & Corrections** - Step-by-step guidance when you need it
- 🏆 **Leaderboards** - Compete with classmates and track progress
- 📱 **Progressive Web App** - Install and use offline

## Getting Started

### Installation

```bash
npm install
```

### Setup

1. Copy `.env.example` to `.env`
2. Update environment variables as needed
3. Initialize the database:

```bash
npm run init-db
```

### Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Visit `http://localhost:3000` in your browser.

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: SQLite3
- **Frontend**: EJS templates, vanilla JavaScript
- **PWA**: Service Worker, Web App Manifest

## Project Structure

```
SQL_Puzzle_Lab/
├── server.js              # Main application server
├── database/              # Database files and schemas
├── routes/                # Express routes
├── controllers/           # Route controllers
├── models/                # Data models
├── views/                 # EJS templates
├── public/                # Static assets (CSS, JS, images)
├── scripts/               # Database initialization scripts
└── datasets/              # Sample SQL datasets
```

## License

MIT
