const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class SQLValidator {
    constructor() {
        this.datasetDbs = {};
    }

    // Get or create a temporary database for a dataset
    getDatasetDb(dataset) {
        if (!this.datasetDbs[dataset]) {
            const dbPath = path.join(__dirname, '../database/sql_puzzle_lab.db');
            this.datasetDbs[dataset] = new sqlite3.Database(dbPath);
        }
        return this.datasetDbs[dataset];
    }

    // Execute user's SQL query
    executeQuery(query, dataset) {
        return new Promise((resolve, reject) => {
            const db = this.getDatasetDb(dataset);
            const startTime = Date.now();

            // Security: Only allow SELECT statements
            const trimmedQuery = query.trim().toLowerCase();
            if (!trimmedQuery.startsWith('select')) {
                return reject(new Error('Only SELECT queries are allowed'));
            }

            // Prevent potentially dangerous operations
            const dangerousKeywords = ['drop', 'delete', 'insert', 'update', 'alter', 'create', 'truncate'];
            for (const keyword of dangerousKeywords) {
                if (trimmedQuery.includes(keyword)) {
                    return reject(new Error(`Keyword '${keyword}' is not allowed`));
                }
            }

            db.all(query, [], (err, rows) => {
                const executionTime = Date.now() - startTime;

                if (err) {
                    reject(err);
                } else {
                    resolve({
                        rows,
                        executionTime,
                        rowCount: rows.length
                    });
                }
            });
        });
    }

    // Normalize results for comparison
    normalizeResults(results) {
        if (!Array.isArray(results)) return results;

        return results.map(row => {
            const normalized = {};
            for (const key in row) {
                // Round numbers to 2 decimal places for comparison
                if (typeof row[key] === 'number') {
                    normalized[key] = Math.round(row[key] * 100) / 100;
                } else {
                    normalized[key] = row[key];
                }
            }
            return normalized;
        });
    }

    // Compare two result sets
    compareResults(userResults, expectedResults) {
        const normalizedUser = this.normalizeResults(userResults);
        const normalizedExpected = this.normalizeResults(expectedResults);

        // Check if row counts match
        if (normalizedUser.length !== normalizedExpected.length) {
            return {
                isCorrect: false,
                message: `Row count mismatch: expected ${normalizedExpected.length}, got ${normalizedUser.length}`
            };
        }

        // Check if results are empty
        if (normalizedUser.length === 0) {
            return {
                isCorrect: true,
                message: 'Query returned no rows (as expected)'
            };
        }

        // Compare column names
        const userColumns = Object.keys(normalizedUser[0] || {}).sort();
        const expectedColumns = Object.keys(normalizedExpected[0] || {}).sort();

        if (JSON.stringify(userColumns) !== JSON.stringify(expectedColumns)) {
            return {
                isCorrect: false,
                message: `Column mismatch: expected [${expectedColumns.join(', ')}], got [${userColumns.join(', ')}]`
            };
        }

        // Compare each row
        for (let i = 0; i < normalizedUser.length; i++) {
            const userRow = normalizedUser[i];
            const expectedRow = normalizedExpected[i];

            for (const column of userColumns) {
                if (userRow[column] !== expectedRow[column]) {
                    return {
                        isCorrect: false,
                        message: `Value mismatch in row ${i + 1}, column '${column}': expected ${expectedRow[column]}, got ${userRow[column]}`
                    };
                }
            }
        }

        return {
            isCorrect: true,
            message: 'Perfect! Your query returned the correct results.'
        };
    }

    // Validate user's query against expected results
    async validate(userQuery, dataset, expectedResults) {
        try {
            // Execute user's query
            const result = await this.executeQuery(userQuery, dataset);

            // Parse expected results if string
            const expected = typeof expectedResults === 'string'
                ? JSON.parse(expectedResults)
                : expectedResults;

            // Compare results
            const comparison = this.compareResults(result.rows, expected);

            return {
                ...comparison,
                executionTime: result.executionTime,
                rowCount: result.rowCount,
                results: result.rows.slice(0, 10) // Return first 10 rows for preview
            };
        } catch (error) {
            return {
                isCorrect: false,
                message: `Query error: ${error.message}`,
                executionTime: 0,
                rowCount: 0,
                results: []
            };
        }
    }

    // Generate hints based on common mistakes
    generateHint(userQuery, expectedQuery, attemptNumber) {
        const hints = [
            'Start by identifying which table contains the data you need.',
            'Think about which columns should appear in your SELECT statement.',
            'Consider what filtering conditions you need in the WHERE clause.',
            'Check if you need to use aggregate functions like COUNT, SUM, or AVG.',
            'Remember to use GROUP BY when using aggregate functions with other columns.'
        ];

        if (attemptNumber <= hints.length) {
            return hints[attemptNumber - 1];
        }

        return 'Review the challenge description carefully and try breaking down the problem into smaller steps.';
    }

    // Close all database connections
    closeAll() {
        Object.values(this.datasetDbs).forEach(db => {
            db.close();
        });
        this.datasetDbs = {};
    }
}

module.exports = new SQLValidator();
