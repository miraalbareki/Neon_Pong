// hanieh added: AI match controller
const db = require('../queries/database');

async function saveAIMatchResult(userId, playerScore, aiScore) {
    // hanieh added: Insert AI match with opponent_id = NULL
    db.prepare(`INSERT INTO game_history (user_id, opponent_id, user_score, opponent_score, winner_id, loser_id, played_at, result, round, tournament_id) VALUES (?, NULL, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'finished', 'ai', NULL)`).run(
        userId,
        playerScore,
        aiScore,
        playerScore > aiScore ? userId : null,
        aiScore > playerScore ? userId : null
    );
    return { success: true };
}

module.exports = { saveAIMatchResult }; // hanieh added
