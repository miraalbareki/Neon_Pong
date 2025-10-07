// #list all tournaments
// #fetch one tournament and display the players inside this tournament

const db = require('../queries/database');
const { createTournament,
        joinTournament,
        startTournament,
        updateMatchResults 
    } = require('../controllers/tournaments');




async function tournamentRoutes(fastify, options){
    //create a tournament, only logged in users can create a tournament
    //tournamentName, created_by, min_players, max_players
    fastify.post('/tournaments', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try{
            const { name, min_players, max_players, creator_alias } = request.body;
            const created_by = request.user.id;
            const tournamentCreated = await createTournament(name, created_by, creator_alias, min_players, max_players);
            reply.code(200).send({ message: 'Tournament created successfully', tournamentId: tournamentCreated.id });
        }
        catch(error){
            reply.code(500).send({ error: error.message });
        }
    });

    //delete tournaments (for debug)
    fastify.delete('/tournament-delete', async (request, reply) => {
        db.prepare('DELETE FROM tournaments').run();
        return { message: 'All tournaments deleted' };
    });
    //list all tournament (for debug)
    fastify.get('/tournaments', async (request, reply) => {
        try{
            const tournamentsList = db.prepare('SELECT * FROM tournaments').all();
            if (!tournamentsList.length) {
                return reply.code(404).send({ message: "No tournaments found" });
            }
            return reply.code(200).send(tournamentsList);
        }
        catch(error){
            return reply.code(500).send({ error: error.message });
        }
    });

    //get tournament by ID with matches
    fastify.get('/tournaments/:id', async (request, reply) => {
        try{
            const tournamentId = Number(request.params.id);
            const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournamentId);
            if (!tournament) {
                return reply.code(404).send({ message: "Tournament not found" });
            }

            // Get matches for this tournament
            const matches = db.prepare(`
                SELECT id as matchId, opponent_name, round, result, user_score, opponent_score
                FROM game_history 
                WHERE tournament_id = ? 
                ORDER BY id
            `).all(tournamentId);

            // Parse matches to get player info
            const formattedMatches = matches.map(match => {
                const [player1, player2] = match.opponent_name.split(' vs ');
                return {
                    matchId: match.matchId,
                    player1: { tournament_alias: player1 },
                    player2: { tournament_alias: player2 },
                    round: match.round,
                    result: match.result,
                    user_score: match.user_score,
                    opponent_score: match.opponent_score
                };
            });

            return reply.code(200).send({ 
                data: { 
                    tournament, 
                    matches: formattedMatches 
                } 
            });
        }
        catch(error){
            return reply.code(500).send({ error: error.message });
        }
    });

    fastify.post('/tournament/join', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try{
            const { tournamentId, tournamentAlias } = request.body;
            const joinGuest = await joinTournament(tournamentId, tournamentAlias);
            return reply.code(200).send(joinGuest);
        }
        catch(error){
            return reply.code(400).send({ error: error.message });
        }
    });

    //start the tournament
    fastify.post('/tournaments/:id/start', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try{
            const tournamentId = Number(request.params.id);
            const result = await startTournament(tournamentId);
            return reply.code(200).send(result);
        }
        catch(error){
            return reply.code(400).send({ error: error.message });
        }
    });


    //when the game ends, the results are submitted here via the fronted (sending an API)
    fastify.post('/tournaments/:id/finish', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try{
            const tournamentId = Number(request.params.id);
            const { matchId, userScore, opponentScore } = request.body;
            const loggedInUserId = request.user.id; // Get the authenticated user ID

            const result = await updateMatchResults(matchId, userScore, opponentScore, loggedInUserId);
            return reply.code(200).send(result);
        }
        catch(error){
            return reply.code(400).send({ error: error.message });
        }
    });
}

module.exports = tournamentRoutes;