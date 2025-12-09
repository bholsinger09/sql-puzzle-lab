const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '../database');
const dbPath = path.join(dbDir, 'sql_puzzle_lab.db');

// Create database directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('Creating database schema...');

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      classroom TEXT,
      total_score INTEGER DEFAULT 0,
      challenges_completed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Challenges table
  db.run(`
    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      dataset TEXT NOT NULL,
      difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')) NOT NULL,
      expected_result TEXT NOT NULL,
      hints TEXT,
      date DATE,
      is_daily INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Submissions table
  db.run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      challenge_id INTEGER NOT NULL,
      query TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      execution_time REAL,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (challenge_id) REFERENCES challenges(id)
    )
  `);

  // Create indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty)');
  db.run('CREATE INDEX IF NOT EXISTS idx_challenges_date ON challenges(date)');
  db.run('CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_submissions_challenge ON submissions(challenge_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_users_classroom ON users(classroom)');

  console.log('Database schema created successfully!');
  console.log('Creating sample datasets...');

  // Insert sample datasets
  insertDatasets(db);
});

function insertDatasets(db) {
  // Movies dataset
  db.run(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      director TEXT,
      year INTEGER,
      genre TEXT,
      rating REAL,
      box_office_millions REAL
    )
  `);

  const movies = [
    ['The Shawshank Redemption', 'Frank Darabont', 1994, 'Drama', 9.3, 28.3],
    ['The Godfather', 'Francis Ford Coppola', 1972, 'Crime', 9.2, 134.8],
    ['The Dark Knight', 'Christopher Nolan', 2008, 'Action', 9.0, 534.9],
    ['Pulp Fiction', 'Quentin Tarantino', 1994, 'Crime', 8.9, 107.9],
    ['Forrest Gump', 'Robert Zemeckis', 1994, 'Drama', 8.8, 330.5],
    ['Inception', 'Christopher Nolan', 2010, 'Sci-Fi', 8.8, 292.6],
    ['The Matrix', 'Wachowski Brothers', 1999, 'Sci-Fi', 8.7, 171.5],
    ['Goodfellas', 'Martin Scorsese', 1990, 'Crime', 8.7, 46.8],
    ['Interstellar', 'Christopher Nolan', 2014, 'Sci-Fi', 8.6, 188.0],
    ['Parasite', 'Bong Joon-ho', 2019, 'Thriller', 8.6, 53.4]
  ];

  const movieStmt = db.prepare('INSERT OR IGNORE INTO movies VALUES (?, ?, ?, ?, ?, ?, ?)');
  movies.forEach((movie, idx) => movieStmt.run(idx + 1, ...movie));
  movieStmt.finalize();

  // Coffee Shop dataset
  db.run(`
    CREATE TABLE IF NOT EXISTS coffee_shop (
      id INTEGER PRIMARY KEY,
      product_name TEXT NOT NULL,
      category TEXT,
      size TEXT,
      price REAL,
      cost REAL,
      calories INTEGER
    )
  `);

  const coffeeItems = [
    ['Espresso', 'Coffee', 'Small', 2.50, 0.50, 5],
    ['Americano', 'Coffee', 'Medium', 3.00, 0.60, 10],
    ['Cappuccino', 'Coffee', 'Medium', 4.00, 0.80, 120],
    ['Latte', 'Coffee', 'Large', 4.50, 0.90, 190],
    ['Mocha', 'Coffee', 'Large', 5.00, 1.00, 290],
    ['Cold Brew', 'Coffee', 'Medium', 4.00, 0.75, 5],
    ['Iced Latte', 'Coffee', 'Large', 4.75, 0.95, 170],
    ['Croissant', 'Pastry', null, 3.50, 1.20, 231],
    ['Blueberry Muffin', 'Pastry', null, 3.00, 1.00, 340],
    ['Bagel with Cream Cheese', 'Pastry', null, 4.00, 1.30, 290]
  ];

  const coffeeStmt = db.prepare('INSERT OR IGNORE INTO coffee_shop VALUES (?, ?, ?, ?, ?, ?, ?)');
  coffeeItems.forEach((item, idx) => coffeeStmt.run(idx + 1, ...item));
  coffeeStmt.finalize();

  // HR dataset
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      department TEXT,
      position TEXT,
      salary INTEGER,
      hire_date DATE,
      manager_id INTEGER
    )
  `);

  const employees = [
    ['John', 'Smith', 'Engineering', 'Senior Developer', 95000, '2020-01-15', null],
    ['Sarah', 'Johnson', 'Engineering', 'Developer', 75000, '2021-03-10', 1],
    ['Michael', 'Williams', 'Engineering', 'Developer', 72000, '2021-06-20', 1],
    ['Emma', 'Brown', 'Sales', 'Sales Manager', 85000, '2019-08-05', null],
    ['James', 'Davis', 'Sales', 'Sales Rep', 60000, '2022-02-14', 4],
    ['Olivia', 'Miller', 'Marketing', 'Marketing Director', 90000, '2018-11-01', null],
    ['William', 'Wilson', 'Marketing', 'Content Writer', 55000, '2021-09-15', 6],
    ['Sophia', 'Moore', 'HR', 'HR Manager', 80000, '2019-05-20', null],
    ['Daniel', 'Taylor', 'Engineering', 'Junior Developer', 65000, '2022-07-01', 1],
    ['Emily', 'Anderson', 'Sales', 'Sales Rep', 58000, '2022-04-10', 4]
  ];

  const empStmt = db.prepare('INSERT OR IGNORE INTO employees VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  employees.forEach((emp, idx) => empStmt.run(idx + 1, ...emp));
  empStmt.finalize();

  // School dataset
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      grade_level INTEGER,
      gpa REAL,
      major TEXT,
      enrollment_date DATE
    )
  `);

  const students = [
    ['Alice', 'Cooper', 12, 3.8, 'Computer Science', '2022-09-01'],
    ['Bob', 'Martin', 11, 3.5, 'Mathematics', '2023-09-01'],
    ['Charlie', 'Lee', 12, 3.9, 'Physics', '2022-09-01'],
    ['Diana', 'Garcia', 10, 3.6, 'Biology', '2024-09-01'],
    ['Ethan', 'Martinez', 12, 3.7, 'Computer Science', '2022-09-01'],
    ['Fiona', 'Robinson', 11, 3.4, 'Chemistry', '2023-09-01'],
    ['George', 'Clark', 10, 3.2, 'English', '2024-09-01'],
    ['Hannah', 'Rodriguez', 12, 4.0, 'Mathematics', '2022-09-01'],
    ['Ian', 'Lewis', 11, 3.3, 'History', '2023-09-01'],
    ['Julia', 'Walker', 10, 3.5, 'Art', '2024-09-01']
  ];

  const studentStmt = db.prepare('INSERT OR IGNORE INTO students VALUES (?, ?, ?, ?, ?, ?, ?)');
  students.forEach((student, idx) => studentStmt.run(idx + 1, ...student));
  studentStmt.finalize();

  // Insert sample challenges
  const challenges = [
    {
      title: 'Top Rated Movies',
      description: 'Write a query to find all movies with a rating greater than 9.0',
      dataset: 'movies',
      difficulty: 'easy',
      expected_result: JSON.stringify([
        { title: 'The Shawshank Redemption', rating: 9.3 },
        { title: 'The Godfather', rating: 9.2 }
      ]),
      hints: JSON.stringify([
        'Use SELECT to choose columns',
        'Use WHERE clause to filter ratings',
        'Compare rating with > operator'
      ])
    },
    {
      title: 'Coffee Shop Revenue',
      description: 'Calculate the total revenue if we sold one of each product',
      dataset: 'coffee_shop',
      difficulty: 'easy',
      expected_result: JSON.stringify([{ total_revenue: 38.25 }]),
      hints: JSON.stringify([
        'Use SUM() to add up prices',
        'Select from coffee_shop table',
        'Alias the result as total_revenue'
      ])
    },
    {
      title: 'Department Salaries',
      description: 'Find the average salary for each department, ordered by average salary descending',
      dataset: 'employees',
      difficulty: 'medium',
      expected_result: JSON.stringify([
        { department: 'Engineering', avg_salary: 76750 },
        { department: 'Marketing', avg_salary: 72500 },
        { department: 'Sales', avg_salary: 67666.67 },
        { department: 'HR', avg_salary: 80000 }
      ]),
      hints: JSON.stringify([
        'Use GROUP BY to group by department',
        'Use AVG() function for average',
        'ORDER BY avg_salary DESC'
      ])
    },
    {
      title: 'Honor Roll Students',
      description: 'Find all 12th grade students with GPA >= 3.7',
      dataset: 'students',
      difficulty: 'easy',
      expected_result: JSON.stringify([
        { first_name: 'Alice', last_name: 'Cooper', gpa: 3.8 },
        { first_name: 'Charlie', last_name: 'Lee', gpa: 3.9 },
        { first_name: 'Hannah', last_name: 'Rodriguez', gpa: 4.0 }
      ]),
      hints: JSON.stringify([
        'Filter with WHERE clause',
        'Use AND to combine conditions',
        'grade_level = 12 AND gpa >= 3.7'
      ])
    },
    {
      title: 'Nolan Filmography',
      description: 'Find all Christopher Nolan movies, ordered by year',
      dataset: 'movies',
      difficulty: 'easy',
      expected_result: JSON.stringify([
        { title: 'The Dark Knight', year: 2008 },
        { title: 'Inception', year: 2010 },
        { title: 'Interstellar', year: 2014 }
      ]),
      hints: JSON.stringify([
        "Use WHERE director = 'Christopher Nolan'",
        'ORDER BY year to sort',
        'Select title and year columns'
      ])
    }
  ];

  const challengeStmt = db.prepare(
    'INSERT OR IGNORE INTO challenges (title, description, dataset, difficulty, expected_result, hints) VALUES (?, ?, ?, ?, ?, ?)'
  );
  challenges.forEach(challenge => {
    challengeStmt.run(
      challenge.title,
      challenge.description,
      challenge.dataset,
      challenge.difficulty,
      challenge.expected_result,
      challenge.hints
    );
  });
  challengeStmt.finalize();

  console.log('Sample data inserted successfully!');
}

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('✅ Database initialization complete!');
    console.log(`📁 Database created at: ${dbPath}`);
  }
});
