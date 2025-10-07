// hanieh added: Register onevone route for standalone 1v1 matches
// This is for frontend 1v1 games, not tournaments
// I am responsible for frontend, so I added this route registration
const fastify = require('fastify')({logger: true});
// Serve static files from uploads directory
fastify.register(require('@fastify/static'), {
    root: require('path').join(__dirname, 'uploads'),
    prefix: '/uploads/',
});
// hanieh fixed: Enable CORS for all frontend requests (any origin)
fastify.register(require('@fastify/cors'), { 
    origin: true, // Allows requests from any origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
});

fastify.register(require('@fastify/multipart'));

const db = require('./queries/database');

// Make database available to routes
fastify.decorate('db', db);

fastify.register(require('./routes/users'));
fastify.register(require('./routes/tournaments'));
fastify.register(require('./routes/onevone')); // hanieh added
fastify.register(require('./routes/ai')); // hanieh added: AI match route
fastify.register(require('./routes/auth')); // Google OAuth routes
require('dotenv').config();
fastify.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET
});



//a reusable preHandler that verifies tokens and attaches the user to request.user
fastify.decorate('authenticate', async (request, reply) => {
    try{
        await request.jwtVerify();
        
        console.log('[🔐 AUTH DEBUG] JWT payload after verification:', request.user);
        console.log('[🔐 AUTH DEBUG] JWT user ID from token:', request.user.id);

        //fetch user from db, ensure user still exists
        const user = db.prepare('SELECT id, username, alias, avatar FROM users WHERE id = ?').get(request.user.id);
        console.log('[🔐 AUTH DEBUG] User from database:', user);
        
        if(!user){
            return reply.code(401).send({error: 'Invalid token (user not found)'});
        }
        request.user = user;
        console.log('[🔐 AUTH DEBUG] Final request.user set to:', request.user);
        
        // Update last_seen timestamp and set status to online for active users (heartbeat)
        db.prepare('UPDATE users SET last_seen = CURRENT_TIMESTAMP, current_status = ? WHERE id = ?').run('online', user.id);
        console.log('[💓 HEARTBEAT] Updated last_seen and set online status for user:', user.id);
    }
    catch(error){
        return reply.code(401).send({error: 'Not authenticated: ' + error.message});
    }
});


const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5001;
const start = async () => {
    try {
        await fastify.listen({port: PORT, host: '0.0.0.0'})
    }
    catch(error){
        fastify.log.error(error);
        process.exit(1);
    }
};

start();
