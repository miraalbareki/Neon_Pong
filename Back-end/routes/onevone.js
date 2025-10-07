// hanieh added: Standalone 1v1 match routes
const { createOneVOneMatch, updateOneVOneMatchResult } = require('../controllers/onevone');

async function onevoneRoutes(fastify, options) {
    // Create a new 1v1 match
    fastify.post('/onevone/start', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try {
            const player1Id = request.user.id;
            const { player2Username } = request.body;
            const result = await createOneVOneMatch(player1Id, player2Username);
            return reply.code(200).send(result);
        } catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });

        // hanieh added: /onevone/start - Start a new 1v1 match
        // hanieh added: /onevone/finish - Submit result for a 1v1 match
    // Submit result for a 1v1 match
    fastify.post('/onevone/finish', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { matchId, player1Score, player2Score } = request.body;
            const result = await updateOneVOneMatchResult(matchId, player1Score, player2Score);
            return reply.code(200).send(result);
        } catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
}

module.exports = onevoneRoutes;
// hanieh added