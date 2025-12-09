const db = require('./database');

class Challenge {
    static async getAll() {
        return await db.all('SELECT * FROM challenges ORDER BY difficulty, id');
    }

    static async getById(id) {
        return await db.get('SELECT * FROM challenges WHERE id = ?', [id]);
    }

    static async getDailyChallenge() {
        const today = new Date().toISOString().split('T')[0];
        return await db.get(
            'SELECT * FROM challenges WHERE date = ? OR (date IS NULL AND is_daily = 1) ORDER BY RANDOM() LIMIT 1',
            [today]
        );
    }

    static async getByDifficulty(difficulty) {
        return await db.all('SELECT * FROM challenges WHERE difficulty = ?', [difficulty]);
    }

    static async create(challengeData) {
        const { title, description, dataset, difficulty, expected_result, hints, date, is_daily } = challengeData;
        const result = await db.run(
            `INSERT INTO challenges (title, description, dataset, difficulty, expected_result, hints, date, is_daily) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, dataset, difficulty, JSON.stringify(expected_result), JSON.stringify(hints || []), date, is_daily || 0]
        );
        return result.id;
    }
}

module.exports = Challenge;
