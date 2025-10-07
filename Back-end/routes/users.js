//schema input validations
//all fiels are required (username, password, nickname)
//passowrd length > 5
//check email input

// /register is where the user will input their information
const { createUser } = require('../controllers/users');
const { userLogIn } = require('../controllers/users');
const { deleteMyAccount } = require('../controllers/users');
const { getUserdata } = require('../controllers/users');
const { getPublicProfile } = require('../controllers/users');
const { updateUserProfile } = require('../controllers/users');
const { setAlias } = require('../controllers/users');
const { searchFriends } = require('../controllers/users');
const { addFriends } = require('../controllers/users');
const { requestResponse } = require('../controllers/users');
const { viewPendingRequests } = require('../controllers/users');
const { viewSentRequests } = require('../controllers/users'); // hanieh changed: import for sent requests endpoint
const { listFriends } = require('../controllers/users');
const { removeFriend } = require('../controllers/users');
const { removeAvatar } = require('../controllers/users');

const db = require('../queries/database');
const fs = require('fs'); //filesystem
const path = require('path'); //nodejs
const pump = require('pump'); //pump


async function userRoutes(fastify, options){
    fastify.post('/register', async (request, reply) => {
        try{
            const { username, password, email} = request.body;
            if(!username || !password || !email){
                return reply.code(400).send({error: 'All fields are required!'});
            }
            const newUser = await createUser(username, password, email);
            return reply.code(200).send({message: 'User registered successfully', userId: newUser.id});
        }
        catch(error){
            fastify.log.error("Registeration error:", error);
            return reply.code(500).send({error: error.message}); //debug
        }
    });


    //set alias for user
    fastify.post('/set-alias', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try{
            const { alias } = request.body;
            const userId = request.user.id;
            const result = await setAlias(userId, alias);
            return reply.send(result);
        }
        catch(error){
            console.error("Error setting alias:", error);
            return reply.code(400).send({error: error.message});
        }
    });

    
//log in authentication
fastify.post('/login', async (request, reply) => {
    try{
        // hanieh debug: log login request
        const { username, password } = request.body;
        console.log('[hanieh debug] login request:', { username, password });
        const userData = await userLogIn(username, password);
        // update status in DB
        db.prepare(`UPDATE users SET current_status = 'online', last_seen = CURRENT_TIMESTAMP WHERE id = ?`).run(userData.userId);

        //if valid, sign a token
        const token = fastify.jwt.sign({
            id: userData.userId, username: userData.username}, {
                // expiresIn: '2h'
            });
        //return token
        reply.send({message: 'Login successful', token, userId: userData.userId, current_status: 'online'}); //...userData
    }
    catch(error){
        console.log('[hanieh debug] login error:', error);
        return reply.code(400).send({error: error.message});
    }
});
    
//log out
fastify.post('/logout', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try{
        const userId = request.user.id;
        db.prepare("UPDATE users SET current_status = 'offline', last_seen = CURRENT_TIMESTAMP WHERE id = ?").run(userId);
        reply.send({ message: "Logged out successfully" });
    }
    catch(error){
        return reply.code(400).send({error: error.message});
    }
});

//status
fastify.get('/friends-status/:userId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try{
        console.log('[🚀 BACKEND STATUS] === FRIENDS STATUS REQUEST START ===');
        const { userId } = request.params;
        const authenticatedUserId = request.user.id;
        console.log('[🆔 BACKEND STATUS] URL userId:', userId);
        console.log('[🔐 BACKEND STATUS] Authenticated userId:', authenticatedUserId);
        
        // Use authenticated user ID instead of URL parameter for security
        const actualUserId = authenticatedUserId;
        
        // Check if authenticated user exists
        const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(actualUserId);
        console.log('[👤 BACKEND STATUS] Authenticated user lookup result:', user);
        
        if (!user) {
            console.log('[❌ BACKEND STATUS] Authenticated user not found!');
            return reply.code(404).send({error: 'User not found'});
        }
        
        // First, let's check what's in the friends table
        const allFriends = db.prepare('SELECT * FROM friends').all();
        console.log('[🔍 BACKEND STATUS] All friends in database:', allFriends);
        
        const allUsers = db.prepare('SELECT id, username, current_status, last_seen FROM users').all();
        console.log('[👥 BACKEND STATUS] All users in database:', allUsers);
        
        // First, update offline status for inactive users (5 minutes of inactivity)
        const inactiveThreshold = 1; // minutes
        const updateOfflineQuery = `
            UPDATE users 
            SET current_status = 'offline' 
            WHERE current_status = 'online' 
            AND last_seen < datetime('now', '-${inactiveThreshold} minutes')
        `;
        const offlineUpdates = db.prepare(updateOfflineQuery).run();
        console.log('[🕐 BACKEND STATUS] Set', offlineUpdates.changes, 'inactive users offline (inactive > 5 min)');
        
        // Get friends with their status (check both directions of friendship)
        const query = `SELECT DISTINCT u.id, u.username, u.current_status, u.last_seen, u.avatar 
                       FROM friends f 
                       JOIN users u ON (
                           (f.user_id = ? AND u.id = f.friend_id) OR 
                           (f.friend_id = ? AND u.id = f.user_id)
                       )
                       WHERE f.friend_request = 'accepted' AND u.id != ?`;
        console.log('[📝 BACKEND STATUS] Executing bidirectional query:', query);
        console.log('[📝 BACKEND STATUS] Query params:', [actualUserId, actualUserId, actualUserId]);
        
        const friends = db.prepare(query).all(actualUserId, actualUserId, actualUserId);
        console.log('[📊 BACKEND STATUS] Query result - number of friends:', friends.length);
        console.log('[👥 BACKEND STATUS] Friends data:', friends);
        
        // Convert last_seen to proper ISO format for frontend
        friends.forEach(friend => {
            if (friend.last_seen) {
                // Convert SQLite datetime to proper ISO format
                const lastSeenDate = new Date(friend.last_seen + ' UTC'); // Treat as UTC
                friend.last_seen = lastSeenDate.toISOString();
                console.log(`[🕐 BACKEND STATUS] Converted ${friend.username} last_seen to ISO:`, friend.last_seen);
            }
        });
        
        // Log each friend's status
        friends.forEach((friend, index) => {
            console.log(`[👤 BACKEND STATUS] Friend ${index + 1}: ${friend.username} (ID: ${friend.id})`);
            console.log(`[📊 BACKEND STATUS] - Status: ${friend.current_status}`);
            console.log(`[⏰ BACKEND STATUS] - Last seen: ${friend.last_seen}`);
            console.log(`[🖼️ BACKEND STATUS] - Avatar: ${friend.avatar}`);
        });
        
        const response = { userId: actualUserId, friends };
        console.log('[📤 BACKEND STATUS] Sending response:', response);
        console.log('[✅ BACKEND STATUS] === FRIENDS STATUS REQUEST END ===');
        
        reply.send(response);
    }
    catch(error){
        console.error('[❌ BACKEND STATUS] Error fetching friends status:', error);
        console.error('[🔍 BACKEND STATUS] Error stack:', error.stack);
        return reply.code(400).send({error: error.message});
    }
});



    //show registered users (maybe unnecessary)
    fastify.get('/users', async (request, reply) => {
        try{
            const users = db.prepare(`
                SELECT alias, username, avatar, player_matches, player_wins, created_at FROM users
                `).all();
            if(!users || users.length === 0){
                reply.code(404).send({error: 'No users found'});
            }
            return users;
        }
        catch(error){
            return reply.code(500).send({error: error.message});
        }
    });

    //fetch user own profile
    fastify.get('/me', {preHandler: [fastify.authenticate] }, async (request, reply) => {
        try {
            const id = request.user.id;
            const userData = await getUserdata(id); // hanieh edited: removed duplicate userData
            const { getUserStats } = require('../controllers/stats');
            const stats = await getUserStats(id);
            // Ranking and totalPlayers
            const allUsers = db.prepare('SELECT id, username FROM users').all();
            const userWinCounts = allUsers.map(u => ({
                id: u.id,
                wins: db.prepare('SELECT COUNT(*) as count FROM game_history WHERE user_id = ? AND user_score > opponent_score').get(u.id).count
            }));
            userWinCounts.sort((a, b) => b.wins - a.wins);
            const ranking = userWinCounts.findIndex(u => u.id === id) + 1;
            const totalPlayers = allUsers.length;
            stats.ranking = ranking;
            stats.totalPlayers = totalPlayers;
            console.log('[DEBUG /me] Called for user:', id);
            console.log('[DEBUG /me] userData:', userData);
            // perfectGames: win 5-0
            stats.perfectGames = db.prepare('SELECT COUNT(*) as count FROM game_history WHERE user_id = ? AND user_score = 5 AND opponent_score = 0').get(id).count;
            console.log('[DEBUG /me] stats from getUserStats:', stats);
            // comebacks: win after trailing (user was losing at any point, then won)
            stats.comebacks = db.prepare('SELECT COUNT(*) as count FROM game_history WHERE user_id = ? AND user_score > opponent_score AND opponent_score >= user_score - 2').get(id).count;
            // friends array and count
            stats.friends = userData.user.friends || [];
            stats.friendsCount = Array.isArray(stats.friends) ? stats.friends.length : 0;
            // averageMatchDuration (default 5 min)
            stats.averageMatchDuration = 5;
            // matchHistory for frontend
            stats.matchHistory = userData.gameHistory || [];
            // Remap stats fields for frontend compatibility
            if (typeof stats.perfectPlayerCount !== 'undefined') {
                stats.perfectGames = stats.perfectPlayerCount;
            }
            if (typeof stats.socialButterflyCount !== 'undefined') {
                stats.friends = stats.socialButterflyCount;
            }
            if (stats.achievements) {
                stats.winStreakMaster = stats.achievements.winStreakMaster;
                stats.centuryClub = stats.achievements.centuryClub;
                stats.perfectPlayer = stats.achievements.perfectPlayer;
                stats.socialButterfly = stats.achievements.socialButterfly;
            }
            stats.currentStreak = stats.currentStreak || 0;
            stats.longestStreak = stats.longestStreak || 0;
            stats.gamesPlayed = stats.gamesPlayed || 0;
            stats.averageScore = stats.averageScore || 0;
            stats.comebacks = stats.comebacks || 0;
            // --- Ensure bio is included in user object ---
            if (userData && userData.user && typeof userData.user.bio === 'undefined') {
                userData.user.bio = '';
            }
            // --- END bio patch ---
            console.log('[DEBUG /me] stats after ranking, totalPlayers, perfectGames, comebacks, friends:', stats);
            console.log('[DEBUG /me] stats after remapping:', stats);
            // Patch: ensure bio is present in user object in response
            const response = { ...userData, stats };
            if (userData && userData.user && typeof userData.user.bio !== 'undefined') {
                response.user = { ...userData.user, bio: userData.user.bio };
            }
            console.log('[DEBUG /me] Final response:', response);
            return reply.send(response);
        } catch (error) {
            console.error('[DEBUG /me] ERROR:', error);
            return reply.code(500).send({ error: error.message });
        }
    });

    // hanieh did it: PATCH /me to update user profile
    fastify.patch('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        // hanieh debug: log request.body for troubleshooting
        console.log('[hanieh debug] PATCH /me request.body:', request.body);
        try {
            const userId = request.user.id;
            // Accept both legacy and new frontend payloads
            let { username, email, password, alias, oldPassword, newPassword, confirmPassword, display_name, bio } = request.body;
            let updateFields = {};
            if (username) updateFields.username = username;
            if (email) updateFields.email = email;
            // Accept display_name from frontend and map to alias
            if (alias) updateFields.alias = alias;
            if (display_name) updateFields.alias = display_name;
            if (bio) updateFields.bio = bio;
            // Map newPassword to password if present and confirmed
            if (newPassword !== undefined) {
                if (confirmPassword !== undefined && newPassword !== confirmPassword) {
                    return reply.code(400).send({ error: 'New password and confirmation do not match.' });
                }
                password = newPassword;
            }
            if (password !== undefined) {
                if (!oldPassword) {
                    console.log('[hanieh debug] oldPassword missing in request.body');
                    return reply.code(400).send({ error: 'old password is required' });
                }
                updateFields.password = password;
                updateFields.oldPassword = oldPassword;
            }
            if (Object.keys(updateFields).length === 0) {
                return reply.code(400).send({ error: 'No fields to update' });
            }
            if (typeof updateUserProfile === 'function') {
                const result = await updateUserProfile(userId, updateFields);
                return reply.send({ message: 'Profile updated', result });
            } else {
                // Fallback: update directly (should not be used)
                return reply.send({ message: 'Profile updated (fallback)' });
            }
        } catch (error) {
            console.log('[hanieh debug] PATCH /me error:', error);
            return reply.code(500).send({ error: error.message });
        }
    });





    //let user upload files using multi-part

    fastify.post('/uploads', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try{
            const data = await request.file(); //single file
            if(!data){
                return reply.status(400).send({error: 'No file uploaded'});
            }
            // Accept only common image MIME types
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(data.mimetype)) {
                return reply.status(415).send({error: 'Unsupported file type. Allowed: PNG, JPEG, JPG, GIF, WEBP'});
            }
            const uploadDir = path.join(__dirname, '..', 'uploads');
            if(!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
            }
            const saveTo = path.join(uploadDir, data.filename);
            await pump(data.file, fs.createWriteStream(saveTo));

            // Save the filename in the user's avatar field in the database
            const userId = request.user.id;
            db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(data.filename, userId);

            reply.send({message: 'Uploaded!', file: data.filename});
        }
        catch(error){
            return reply.code(400).send({error: error.message});
        }
    });

    //remove avatar
    fastify.delete('/me/avatar', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try{
            const userId = request.user.id;
            const result = await removeAvatar(userId);
            return reply.send(result);
        }
        catch(error){
            return reply.code(400).send({error: error.message});
        }
    });


    //search for friends to add (will list available users first)
    fastify.get('/search-friends', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try{
            const userId = request.user.id;
            const listedFriends = await searchFriends(userId);
            reply.send(listedFriends);
        }
        catch(error){
            return reply.code(400).send({error: error.message});
        }
    });
    
    fastify.post('/add-friends', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try{
            const userId = request.user.id;
            const { friendId } = request.body;
            if(!friendId){
                return reply.code(400).send({error: 'friend id is required'});
            }

            const add = await addFriends(userId, friendId);
            reply.send(add);
        }
        catch(error){
            return reply.code(400).send({error: error.message});

        }
    });
   
    //for debug, list pending request
    fastify.get('/friend/requests', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try{
            const userId = request.user.id;  // logged-in user
            const pendingRequests = await viewPendingRequests(userId);
            reply.send({ pendingRequests });
        } catch(error){
            return reply.code(400).send({error: error.message});
        }
    });

    fastify.post('/friend/requests/:id/respond', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try{
            const requestId = request.params.id;
            const userId = request.user.id;
            const { action }= request.body;

            const response = await requestResponse(requestId, userId, action);
            reply.send(response);
        }
        catch(error){
            return reply.code(400).send({error: error.message});
        }
    });


    //list added friends
    fastify.get('/list-friends', {preHandler: [fastify.authenticate] }, async (request, reply) => {
        try{
            const authUserId = request.user.id;
            const myFriends = await listFriends(authUserId);
            return reply.send(myFriends);
        }
        catch(error){
            return reply.code(500).send({error: error.message});
        }
    });
    

    // hanieh changed: Added sent requests endpoint so sender can see their outgoing requests
    fastify.get('/friend/requests/sent', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try {
            const userId = request.user.id;
            const sentRequests = await viewSentRequests(userId);
            reply.send({ sentRequests });
        } catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });
    //for now, the delete friend is not working.
    fastify.delete('/friends/:friendId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try {
            const userId = request.user.id;
            const friendIdNum = Number(request.params.friendId);
            if (!friendIdNum) {
                return reply.code(400).send({ error: "Invalid friendId, friendId is required" });
            }
            await removeFriend(userId, friendIdNum);
            reply.send({ message: 'Friend removed successfully' });
        } catch (error) {
            return reply.code(400).send({ error: error.message });
        }
    });

    // Delete user account - requires password confirmation
    fastify.delete('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try {
            const userId = request.user.id;
            const { password } = request.body;
            
            if (!password) {
                return reply.code(400).send({ error: 'Password is required to delete account' });
            }
            
            console.log('[DEBUG] DELETE /me called for userId:', userId);
            const result = await deleteMyAccount(userId, password);
            
            // Account deleted successfully - return success message
            return reply.send(result);
        } catch (error) {
            console.error('[DEBUG] DELETE /me error:', error);
            return reply.code(400).send({ error: error.message });
        }
    });
    

// hanieh edited: removed stray closing brace after last route
}
module.exports = userRoutes;










