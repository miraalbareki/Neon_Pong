/*
a tournament is not just one game → it’s a set of games between multiple players.
# create a tournament
- fields: name, maxPlayers, createdBy (authUserId).
- add default status = "pending".

# join tournament
- checks: not already full, not already joined.


#make user write a unique nickname when joining the tournament > done
#make sure same nickname cant exist per tournament (handle inside the code) > done
*/
const db = require('../queries/database');


/*Changes Made: 
1. creator will automatically join the tournament upon creation (they are a logged in account).
whereas the rest of the players are not logged in accounts (guests) and will join as guests with a tournament_alias.

2. will change endpoints + api calls accordingly
*/

//creator will create a tournament and automatically join it
async function createTournament(name, created_by, creator_alias, min_players, max_players){
    //check logged in user who is creating the tournaments
    const creator = db.prepare('SELECT * FROM users WHERE id = ?').get(created_by);
    if(!creator){
        throw new Error('User not found');
    }

    const MIN_NAME_LENGTH = 3;
    if(!name){
        throw new Error('Tournament name is required');
    }
    if(typeof name !== 'string' || name.length < MIN_NAME_LENGTH){
        throw new Error(`Tournament name must be a string with at least ${MIN_NAME_LENGTH} characters`);
    }
    if(min_players < 2){
        throw new Error('Minimum players must be at least 2');
    }
    if(max_players < min_players){
        throw new Error('Maximum players must be greater than or equal to minimum players');
    }
    
    // Validate creator_alias
    if(!creator_alias || typeof creator_alias !== 'string' || creator_alias.trim().length === 0){
        throw new Error('Creator alias is required and must be a non-empty string');
    }
    const trimmedCreatorAlias = creator_alias.trim();
    if(trimmedCreatorAlias.length < 1 || trimmedCreatorAlias.length > 20){
        throw new Error('Creator alias must be between 1 and 20 characters');
    }
    
    //insert into tournaments table
    const insert = db.prepare(`INSERT INTO tournaments (name, created_by, creator_alias, min_players, max_players, status) VALUES (?, ?, ?, ?, ?, 'pending')`).run(name, created_by, trimmedCreatorAlias, min_players, max_players);
    console.log('Tournament Created Successfully! ID:', insert.lastInsertRowid);

    //automatically join the creator to the tournament
    const join = db.prepare(`INSERT INTO tournament_players (tournament_id, tournament_alias, status) VALUES (?, ?, 'joined')`).run(insert.lastInsertRowid, trimmedCreatorAlias);
    if(join.changes === 1){
        console.log('Creator joined the tournament successfully');
    }
    else{
        console.log('Error: Creator could not join the tournament');
    }
    return { id: insert.lastInsertRowid };  
}


//only guest players will join now, with only an alias
async function joinTournament(tournamentId, tournamentAlias){
    //check if tournament exists
    const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournamentId);
    if(!tournament){
        throw new Error('Tournament not found');
    }
    const count = db.prepare('SELECT COUNT(*) as total FROM tournament_players WHERE tournament_id = ?').get(tournamentId).total;
    if(count >= tournament.max_players){
        throw new Error('This tournament is full');
    }
    if(!tournamentAlias || tournamentAlias.trim().length === 0){
        throw new Error('Nickname is required for this tournament');
    }
    //check if alias is unique for this tournament
    const isAliasExists = db.prepare('SELECT * FROM tournament_players WHERE tournament_id = ? AND tournament_alias = ?').get(tournamentId, tournamentAlias);
    if(isAliasExists){
        throw new Error('This nickname is already taken in this tournament. Please choose another one.');
    }
    //insert into tournament_players table
    const insert = db.prepare('INSERT INTO tournament_players (tournament_id, tournament_alias, status) VALUES (?, ?, \'joined\')').run(tournamentId, tournamentAlias);
    if(insert.changes === 1){
        console.log('Player joined the tournament successfully');
        return { message: 'Joined tournament successfully', tournamentAlias };
    }
    else{
        throw new Error('Could not join the tournament');
    }
}

async function leaveTournament(tournamentId, tournamentAlias){
    const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournamentId);
    if(!tournament){
        throw new Error('Tournament not found');
    }
    
    
    const player = db.prepare('SELECT * FROM tournament_players WHERE tournament_id = ? AND tournament_alias = ?').get(tournamentId, tournamentAlias);
    if (!player) {
        throw new Error('This alias is not part of the tournament');
    }
    
    //players cant leave tournament if it already started (i will leave it for now)
   if (tournament.status === 'started') {
       throw new Error('Cannot leave a tournament that has already started');
   }
    //if the tournament is pending, allow anyone (including creator) to leave before starting the tournament
    const playerLeave = db.prepare('DELETE FROM tournament_players WHERE tournament_id = ? AND tournament_alias = ?').run(tournamentId, tournamentAlias);
    if (playerLeave.changes === 1) {
        console.log(`Player ${tournamentAlias} left the tournament successfully`);
        return { message: 'Left tournament successfully' };
    } else {
        throw new Error('Could not leave the tournament');
    }
}

async function insertMatch(tournamentId, players, round, shouldShuffle = true){
    // Use the provided players (don't query database again)
    if (!players || players.length < 2) {
        throw new Error('Not enough players to create a match');
    }

    // Only shuffle if not already shuffled
    if (shouldShuffle) {
        console.log('[🎲 BACKEND SHUFFLE] Using enhanced Fisher-Yates algorithm for tournament randomization');
        console.log('[🎲 BACKEND SHUFFLE] Players before shuffle:', players.map(p => p.tournament_alias));
        
        // Add timestamp-based entropy for better randomization
        const shuffleTimestamp = Date.now();
        console.log('[🎲 BACKEND SHUFFLE] Using timestamp for additional entropy:', shuffleTimestamp);
        
        for (let i = players.length - 1; i > 0; i--) {
            // Use proper Fisher-Yates algorithm
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
        }
        console.log('[🎲 BACKEND SHUFFLE] Players after enhanced shuffle:', players.map(p => p.tournament_alias));
    } else {
        console.log('[🎲 BACKEND SHUFFLE] Skipping shuffle - already shuffled at tournament level');
    }

    const matchMaking = [];

    for (let i = 0; i < players.length; i += 2) {
        const player1 = players[i];
        const player2 = players[i + 1];

        // Insert match into game_history as "pending"
        // We'll determine the user_id when the match is updated with results
        db.prepare(`INSERT INTO game_history (user_id, opponent_id, user_score, opponent_score, result, round, tournament_id, opponent_name) VALUES (NULL, NULL, 0, 0, 'pending', ?, ?, ?)`).run(round, tournamentId,`${player1.tournament_alias} vs ${player2.tournament_alias}`);

        const matchId = db.prepare("SELECT last_insert_rowid() as id").get().id;

        matchMaking.push({ player1, player2, matchId });
    }
    return { matchMaking };
}


async function createMatch(tournamentId){
    const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournamentId);
    if(!tournament){
        throw new Error('Tournament not found');
    }

    // Fetch players for this tournament (winners for final, joined for initial)
    // 🎲 DATABASE FIX: Add ORDER BY RANDOM() to prevent consistent player ordering
    const playersJoined = db.prepare(`
        SELECT tournament_alias 
        FROM tournament_players 
        WHERE tournament_id = ? AND status = 'joined'
        ORDER BY RANDOM()
    `).all(tournamentId);
    
    console.log(`[DEBUG] Players joined for tournament ${tournamentId} (DB randomized):`, playersJoined);
    
    const playersWinners = db.prepare(`
        SELECT tournament_alias 
        FROM tournament_players 
        WHERE tournament_id = ? AND status = 'winner'
        ORDER BY RANDOM()
    `).all(tournamentId);

    console.log(`[DEBUG] Players winners for tournament ${tournamentId}:`, playersWinners);

    // Use winners if available (for final match), otherwise use joined players (for semifinals)
    const players = playersWinners.length >= 2 ? playersWinners : playersJoined;

    console.log(`[DEBUG] Final players array for createMatch:`, players);
    console.log(`[DEBUG] Number of players:`, players.length);

    if (players.length < 2) {
        console.log(`[DEBUG] Not enough players (${players.length}) to create matches`);
        throw new Error('Not enough players to create matches');
    }

    const allMatches = [];
    if (players.length === 4) {
        console.log('[DEBUG] Creating semifinal matches for 4 players');
        // 🎲 SHUFFLE ALL 4 PLAYERS FIRST, then split into pairs
        console.log('[🎲 BACKEND FIX] Shuffling all 4 players together BEFORE creating pairs');
        console.log('[🎲 BACKEND FIX] Players before full shuffle:', players.map(p => p.tournament_alias));
        
        // Add timestamp-based entropy to improve randomization
        const shuffleTimestamp = Date.now();
        console.log('[🎲 BACKEND FIX] Using timestamp for additional entropy:', shuffleTimestamp);
        
        // Fisher-Yates shuffle on ALL players with proper randomization
        for (let i = players.length - 1; i > 0; i--) {
            // Use proper Fisher-Yates algorithm with Math.random()
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
        }
        
        console.log('[🎲 BACKEND FIX] Players after full shuffle:', players.map(p => p.tournament_alias));
        
        // NOW split into pairs (no more shuffling in insertMatch)
        const match1 = await insertMatch(tournamentId, players.slice(0, 2), 'semifinal', false);
        const match2 = await insertMatch(tournamentId, players.slice(2, 4), 'semifinal', false);
        allMatches.push(...match1.matchMaking, ...match2.matchMaking);
    } 
    else if (players.length === 2) {
        // final round
        const finalMatch = await insertMatch(tournamentId, players, 'final');
        allMatches.push(...finalMatch.matchMaking);
    } 
    else if (players.length === 1) {
        // announce champion
        await declareChampion(tournamentId, players[0]);
    }
    return allMatches;
}

async function startTournament(tournamentId){
    const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournamentId);
    if(!tournament){
        throw new Error('Tournament not found');
    }
    db.prepare(`UPDATE tournaments SET status = 'started' WHERE id = ?`).run(tournamentId);
  
    //start the match depending on the number of players (4 = semifinal / 2 = final)
    const matches = await createMatch(tournamentId);
    console.log('[DEBUG] Matches created and returned to frontend:', matches);
    return{ message: `Tournament ${tournament.name} has started!`, matches};
}

async function updateMatchResults(matchId, userScore, opponentScore, loggedInUserId = null){
    const match = db.prepare('SELECT * FROM game_history WHERE id = ?').get(matchId);
    if(!match){
        throw new Error('Match not found');
    }
    
    // Get tournament information to find the creator
    const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(match.tournament_id);
    
    //check results of players and decide winner/loser/draw
    const [alias1, alias2] = match.opponent_name.split(" vs ");

    let winnerAlias = null, loserAlias = null;
    let result = 'FINISHED';
    
    if(userScore > opponentScore){
        winnerAlias = alias1;
        loserAlias = alias2;
    }
    else if(userScore < opponentScore){
        winnerAlias = alias2;
        loserAlias = alias1;
    } else {
        result = 'DRAW';
    }

    // Determine if the logged-in user participated in this match
    // Only the tournament creator can be a logged-in user in tournaments
    let actualUserId = null;
    let actualUserScore = userScore;
    let actualOpponentScore = opponentScore;
    let actualResult = result;
    
    if (loggedInUserId && tournament && tournament.created_by === loggedInUserId) {
        const creatorAlias = tournament.creator_alias;
        
        if (creatorAlias === alias1) {
            // Creator played as alias1 (first player)
            actualUserId = loggedInUserId;
            actualUserScore = userScore;  // userScore represents alias1's score
            actualOpponentScore = opponentScore; // opponentScore represents alias2's score
            if (result === 'FINISHED') {
                actualResult = userScore > opponentScore ? 'WIN' : 'LOSS';
            } else {
                actualResult = result; // Keep original result if not FINISHED
            }
        } else if (creatorAlias === alias2) {
            // Creator played as alias2 (second player)
            actualUserId = loggedInUserId;
            actualUserScore = opponentScore;  // Creator's actual score is opponentScore
            actualOpponentScore = userScore;  // Creator's opponent score is userScore
            if (result === 'FINISHED') {
                actualResult = opponentScore > userScore ? 'WIN' : 'LOSS';
            } else {
                actualResult = result; // Keep original result if not FINISHED
            }
        } else {
            // Creator didn't participate in this match - record as "Did not participate"
            actualUserId = loggedInUserId;
            actualUserScore = 0;
            actualOpponentScore = 0;
            actualResult = 'DID_NOT_PARTICIPATE';
        }
    }
    // If no logged-in user or user is not the creator, keep actualUserId = null

    const updateMatch = db.prepare(`UPDATE game_history SET user_id = ?, user_score = ?, opponent_score = ?, result = ?, played_at = CURRENT_TIMESTAMP, opponent_name = ? WHERE id = ?
        `).run(actualUserId, actualUserScore, actualOpponentScore, actualResult, `${alias1} vs ${alias2}${winnerAlias ? " | Winner: " + winnerAlias : ""}`, matchId);

    if(updateMatch.changes === 0){
        throw new Error('Could not update match results');
    }
    
    const tournamentId = match.tournament_id;
    //check what round are we in to either advance players or announce champion
    if(match.round === 'semifinal' && winnerAlias){
        db.prepare(`
            UPDATE tournament_players 
            SET status = 'winner' 
            WHERE tournament_id = ? AND tournament_alias = ?
        `).run(tournamentId, winnerAlias);
        
        const semiFinalWinners = db.prepare(`
            SELECT tournament_alias 
            FROM tournament_players 
            WHERE tournament_id = ? AND status = 'winner'
        `).all(tournamentId);

        if (semiFinalWinners.length === 2) {
            await createMatch(tournamentId); // creates final
        }
    }
    else if (match.round === 'final' && winnerAlias) {
        const champion = db.prepare(`
            SELECT tournament_alias 
            FROM tournament_players 
            WHERE tournament_id = ? AND tournament_alias = ?
        `).get(tournamentId, winnerAlias);

        if (champion) {
            await declareChampion(tournamentId, champion);
        }
    }
    return { winnerAlias, loserAlias }; 
}

async function declareChampion(tournamentId, winner){
    if (!winner || !winner.tournament_alias) {
        throw new Error('Winner alias is required');
    }

    // mark the tournament as finished and record winner
    db.prepare(`
        UPDATE tournaments
        SET status = 'finished', finished_at = CURRENT_TIMESTAMP, creator_alias = ?
        WHERE id = ?
    `).run(winner.tournament_alias, tournamentId);

    return { tournamentId, champion: winner.tournament_alias };
}
module.exports = {
    createTournament,
    joinTournament,
    leaveTournament,
    insertMatch,
    createMatch,
    startTournament,
    updateMatchResults,
    declareChampion
};