const db = require('./database');

class User {
    static async findByUsername(username) {
        return await db.get('SELECT * FROM users WHERE username = ?', [username]);
    }

    static async findById(id) {
        return await db.get('SELECT * FROM users WHERE id = ?', [id]);
    }

    static async create(username, passwordHash, classroom = null) {
        const result = await db.run(
            'INSERT INTO users (username, password_hash, classroom, created_at) VALUES (?, ?, ?, datetime("now"))',
            [username, passwordHash, classroom]
        );
        return result.id;
    }

    static async updateScore(userId, points) {
        return await db.run(
            'UPDATE users SET total_score = total_score + ?, challenges_completed = challenges_completed + 1 WHERE id = ?',
            [points, userId]
        );
    }

    static async getLeaderboard(classroom = null, limit = 50) {
        if (classroom) {
            return await db.all(
                `SELECT id, username, total_score, challenges_completed, classroom 
         FROM users WHERE classroom = ? 
         ORDER BY total_score DESC, challenges_completed DESC 
         LIMIT ?`,
                [classroom, limit]
            );
        } else {
            return await db.all(
                `SELECT id, username, total_score, challenges_completed, classroom 
         FROM users 
         ORDER BY total_score DESC, challenges_completed DESC 
         LIMIT ?`,
                [limit]
            );
        }
    }
}

module.exports = User;
