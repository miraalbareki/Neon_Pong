// hanieh added: Standalone AI match routes
const { saveAIMatchResult } = require('../controllers/ai');

async function aiRoutes(fastify, options) {
    // hanieh added: Submit result for an AI match
    fastify.post('/ai/finish', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try {
            const userId = request.user.id;
            const { playerScore, aiScore } = request.body;
            const result = await saveAIMatchResult(userId, playerScore, aiScore);
            return reply.code(200).send(result);
        } catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
}

module.exports = aiRoutes; // hanieh added
