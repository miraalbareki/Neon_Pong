// hanieh added: Standalone 1v1 match controller
const db = require('../queries/database');

async function createOneVOneMatch(player1Id, player2Input) {
    // hanieh added: If input is a string, treat as username and look up user ID
    let player2Id = player2Input;
    if (typeof player2Input === 'string') {
        const user = db.prepare('SELECT id FROM users WHERE username = ?').get(player2Input);
        if (!user) {
            throw new Error('Opponent username not found');
        }
        player2Id = user.id;
    }
    // hanieh added: Prevent playing against self
    if (player1Id === player2Id) {
        throw new Error('You cannot play against yourself in a 1v1 match.');
    }
    // hanieh added: Insert TWO records - one for each player's perspective
    // Record 1: From player1's perspective
    const insertResult1 = db.prepare(`INSERT INTO game_history (user_id, opponent_id, user_score, opponent_score, result, round, tournament_id) VALUES (?, ?, 0, 0, 'pending', '1v1', NULL)`).run(player1Id, player2Id);
    
    // Record 2: From player2's perspective (mirror record)
    const insertResult2 = db.prepare(`INSERT INTO game_history (user_id, opponent_id, user_score, opponent_score, result, round, tournament_id) VALUES (?, ?, 0, 0, 'pending', '1v1', NULL)`).run(player2Id, player1Id);
    
    return { 
        matchId: insertResult1.lastInsertRowid,
        mirrorMatchId: insertResult2.lastInsertRowid
    };
}

async function updateOneVOneMatchResult(matchId, player1Score, player2Score) {
    const match = db.prepare('SELECT id, user_id, opponent_id FROM game_history WHERE id = ?').get(matchId);
    if (!match) {
        throw new Error('No match found');
    }
    
    // Find the mirror match (the opponent's perspective)
    const mirrorMatch = db.prepare('SELECT id FROM game_history WHERE user_id = ? AND opponent_id = ? AND round = ? AND result = ?').get(match.opponent_id, match.user_id, '1v1', 'pending');
    
    let winner, loser;
    if (player1Score > player2Score) {
        winner = match.user_id;
        loser = match.opponent_id;
    } else if (player2Score > player1Score) {
        winner = match.opponent_id;
        loser = match.user_id;
    }
    
    // Update the original match (player1's perspective)
    db.prepare(`UPDATE game_history SET user_score = ?, opponent_score = ?, winner_id = ?, loser_id = ?, played_at = CURRENT_TIMESTAMP, result = 'finished' WHERE id = ?`).run(player1Score, player2Score, winner, loser, matchId);
    
    // Update the mirror match (player2's perspective) - swap the scores
    if (mirrorMatch) {
        db.prepare(`UPDATE game_history SET user_score = ?, opponent_score = ?, winner_id = ?, loser_id = ?, played_at = CURRENT_TIMESTAMP, result = 'finished' WHERE id = ?`).run(player2Score, player1Score, winner, loser, mirrorMatch.id);
    }
    
    return { success: true };
}

module.exports = { createOneVOneMatch, updateOneVOneMatchResult };