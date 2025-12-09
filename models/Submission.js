const db = require('./database');

class Submission {
    static async create(userId, challengeId, query, isCorrect, executionTime) {
        const result = await db.run(
            `INSERT INTO submissions (user_id, challenge_id, query, is_correct, execution_time, submitted_at) 
       VALUES (?, ?, ?, ?, ?, datetime("now"))`,
            [userId, challengeId, query, isCorrect ? 1 : 0, executionTime]
        );
        return result.id;
    }

    static async getByUser(userId, limit = 50) {
        return await db.all(
            `SELECT s.*, c.title as challenge_title 
       FROM submissions s 
       JOIN challenges c ON s.challenge_id = c.id 
       WHERE s.user_id = ? 
       ORDER BY s.submitted_at DESC 
       LIMIT ?`,
            [userId, limit]
        );
    }

    static async getByChallenge(challengeId, limit = 50) {
        return await db.all(
            `SELECT s.*, u.username 
       FROM submissions s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.challenge_id = ? AND s.is_correct = 1 
       ORDER BY s.execution_time ASC, s.submitted_at ASC 
       LIMIT ?`,
            [challengeId, limit]
        );
    }

    static async hasUserCompleted(userId, challengeId) {
        const result = await db.get(
            'SELECT id FROM submissions WHERE user_id = ? AND challenge_id = ? AND is_correct = 1 LIMIT 1',
            [userId, challengeId]
        );
        return !!result;
    }
}

module.exports = Submission;
