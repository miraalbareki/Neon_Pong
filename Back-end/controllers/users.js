//ask the user to register with their information
//give the user previlidge to choose avatar/delete avatar
//check user input
//user can change username/change password
//here we are fetching the data
//fetch users from database
//get user by id will fetch the specific user's data depending on its id
// const getUserById = (userId, ())
//sql or query
//note (if(!username || !email || !password)) (if they are not provided) console.log(all fields required)
//authenticate users is a MUST for security
// In better-sqlite3, when you run a modifying query (like INSERT, UPDATE, or DELETE) using .run(), it returns an object with information about what happened. One of the properties is changes.

const db = require('../queries/database');
const bcrypt = require('bcryptjs');
// const multer = require('multer');

//insert a new user into the database
async function createUser(username, password, email){

    //validate username input
    const MAX_USERNAME_LENGTH = 15;
    const MIN_PASSWORD_LENGTH = 6;
    //regular expression: It checks for something like name@example.com but doesn’t allow spaces, multiple @, or missing dots.
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if(username.length > MAX_USERNAME_LENGTH){
        throw new Error(`Username cannot exceed ${MAX_USERNAME_LENGTH} characters`);
    }
    //validate password input and password is not empty
    if((password.length < MIN_PASSWORD_LENGTH) || !strongPasswordRegex.test(password)){
        throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long and include uppercase, lowercase, number, and special character`);
    }

    if(email && !EMAIL_REGEX.test(email)){
        throw new Error('Invalid email format');
    }


    // hanieh debug: log registration attempt
    console.log('[hanieh debug] createUser called with:', { username, email });
    const hashedPassword = bcrypt.hashSync(password, 10);
    const stmt = db.prepare(`
        INSERT INTO users (username, password, avatar, email, alias)
        VALUES (?, ?, 'default.jpg', ?, ?)
    `);
    try{
        // Use username as default alias
        const sql = stmt.run(username, hashedPassword, email, username);
        console.log('[hanieh debug] User Created Successfully!', sql);
        return { id: sql.lastInsertRowid };
    }
    catch(error){
        console.error('[hanieh debug] SQL Error:', error);
        if(error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.code === 'SQLITE_CONSTRAINT'){
            throw new Error('Username or email already exists');
        }
        throw error;
    }
};


async function setAlias(userId, alias){
    //is user who wants to set an alias exist
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if(!user){
        throw new Error('User not found');
    }

    const MAX_NAME_LENGTH = 15;
    if(!alias || alias.length > MAX_NAME_LENGTH){
        throw new Error(`Alias is required and max ${MAX_NAME_LENGTH} character are allowed`);
    }
    const exists = db.prepare('SELECT id FROM users WHERE alias = ?').get(alias);
    if (exists) {
        throw new Error('Alias already taken');
    }
    db.prepare('UPDATE users SET alias = ? WHERE id = ?').run(alias, userId);
    return { message: 'Alias updated successfully', alias};

}


async function userLogIn(username, password){
    //validate input
    if(!username || !password){
        throw new Error('All fields are required');
    }

    //search for user in database
    const stmt = db.prepare(`SELECT id, username, password FROM users WHERE username = ?`);
    const user = stmt.get(username); //for a single row
    console.log('[hanieh debug] userLogIn fetched user:', user);
    if(!user){
        throw new Error('Invalid username or password');
    }

    //compare hashed password with the entered password
    const isMatched = bcrypt.compareSync(password, user.password);
    console.log('[hanieh debug] bcrypt.compare result:', isMatched);
    if(!isMatched){
        throw new Error('invalid username or password');
    }
    //return user info
    return {userId: user.id, username: user.username};
}


//A logged-in player opening their own dashboard would call getUserdata().
//this is for authentcated users (who logged in and their token/session ID matches the requested profile ID)
//The userId should not come from the client. You should take it from the JWT/session of the logged-in user (so they can only see their own data).
//userId = authenticatedUserId, ID from auth (their own profile). / ID from session/JWT (your own profile).
async function getUserdata(userId){
    const fetchData = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if(!fetchData){
        throw new Error(`User with ID ${userId} not found`);
    }

    // Join opponent info and map fields for frontend compatibility
    // Include both regular matches AND tournament matches where user was the creator
    const getGameHistory = db.prepare(`
        SELECT gh.*, u.username AS opponent, u.avatar AS opponentAvatar
        FROM game_history gh
        LEFT JOIN users u ON u.id = gh.opponent_id
        LEFT JOIN tournaments t ON t.id = gh.tournament_id
        WHERE gh.user_id = ? 
           OR (gh.tournament_id IS NOT NULL AND t.created_by = ?)
        ORDER BY gh.played_at DESC
    `).all(userId, userId);
    console.log('[DEBUG] getUserdata for userId:', userId);
    console.log('[DEBUG] Fetched user:', fetchData);
    console.log('[DEBUG] Fetched gameHistory:', getGameHistory);
    if(!getGameHistory){
        throw new Error('Error fetching game history');
    }
    // Map fields for frontend
    const mappedHistory = getGameHistory.map(row => {
        let result;
        let gameType;
        
        // Determine game type
        if (row.round === 'ai') {
            gameType = 'ai';
        } else if (row.round === '1v1') {
            gameType = '1v1';
        } else {
            gameType = 'tournament';
        }
        
        // Determine result based on different result formats
        if (row.result === 'WIN') {
            result = 'win';
        } else if (row.result === 'LOSS') {
            result = 'loss';
        } else if (row.result === 'DID_NOT_PARTICIPATE') {
            result = 'DID_NOT_PARTICIPATE'; // Keep uppercase for frontend compatibility
        } else if (row.result === 'finished' || row.result === 'FINISHED') {
            // For older matches, calculate result from scores
            result = row.user_score > row.opponent_score ? 'win' : 'loss';
        } else if (row.result === 'pending') {
            result = 'pending';
        } else {
            // Default calculation for unknown result types
            result = row.user_score > row.opponent_score ? 'win' : 'loss';
        }
        
        return {
            id: row.id,
            // hanieh added: Use opponent_name for tournament matches, otherwise show AI Opponent for AI matches
            opponent: row.opponent_id === null ? (row.opponent_name || 'AI Opponent') : (row.user_id === row.opponent_id ? 'You' : (row.opponent || 'Unknown')),
            // hanieh added: Use proper AI avatar for AI matches
            opponentAvatar: row.opponent_id === null ? (row.opponent_name ? '/uploads/default.jpg' : '/uploads/ai-avatar.svg') : (row.opponentAvatar ? `/uploads/${row.opponentAvatar}` : ''),
            score: `${row.user_score}-${row.opponent_score}`,
            gameType: gameType,
            result: result,
            date: row.played_at
        };
    });
    // Fetch accepted friends (bidirectional)
    const friends = db.prepare(`
        SELECT u.id, u.username, u.avatar, u.current_status
        FROM users u
        JOIN friends f ON (
            (f.user_id = ? AND f.friend_id = u.id)
            OR (f.friend_id = ? AND f.user_id = u.id)
        )
        WHERE f.friend_request = 'accepted'
    `).all(userId, userId);
    // hanieh changed: return friends inside user object for frontend compatibility
    return {user: {...fetchData, friends}, gameHistory: mappedHistory};
}



//Viewing another player’s profile in a match lobby or leaderboard would call getPublicProfile().
//this is for when users view other people's profiles: they will be allowed to view specific info excluding sensitive data
//ID from request (any profile). / ID from URL/request param (someone else’s profile).
async function getPublicProfile(targetUserId){ //or username
    const fetchData = db.prepare('SELECT username, alias, avatar, player_matches, player_wins, created_at FROM users WHERE id = ?').get(targetUserId);
    if(!fetchData){
        throw new Error(`User with ID ${targetUserId} not found`);
    }

    const getGameHistory = db.prepare(`SELECT * FROM game_history WHERE user_id = ? ORDER BY played_at DESC`).all(targetUserId);
    //db.prepare().all() always returns an array (even if empty). So this if will never trigger, unless there’s a DB error.
    if(!getGameHistory){
        throw new Error('Error fetching game history');
    }
    //return an object that contains user data and their game history
    return {user: fetchData, gameHistory: getGameHistory};
}
/*
Validate file types.
Limit file sizes.
Sanitize filenames.
Store the image path in DB, not the image itself (unless small).
Handle uploads securely.
*/



//update user information (nickname/username/password/avatar) using one function
async function updateUserProfile(userId, updates){
    //fetch user
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if(!user){
        throw new Error('Error fetching user');
    }

    const MAX_USERNAME_LENGTH = 15;
    const MAX_NAME_LENGTH = 10;
    const MIN_PASSWORD_LENGTH = 6;
    // 1. Username
    if(updates.username){
        const usernameExists = db.prepare('SELECT 1 FROM users WHERE username = ?').get(updates.username);
        if(usernameExists){
            throw new Error('Username already taken, choose another one');
        }
        if(updates.username.length > MAX_USERNAME_LENGTH){
            throw new Error(`Username cannot exceed ${MAX_USERNAME_LENGTH} characters`);
        }
        db.prepare('UPDATE users SET username = ? WHERE id = ?').run(updates.username, userId);
    }

    // 2. Alias
    if(updates.alias){
        const aliasExists = db.prepare('SELECT 1 FROM users WHERE alias = ?').get(updates.alias);
        if(aliasExists){
            throw new Error('alias already taken, choose another one');
        }
        if(updates.alias.length > MAX_NAME_LENGTH){
            throw new Error(`alias cannot exceed ${MAX_NAME_LENGTH} characters`);
        }
        db.prepare('UPDATE users SET alias = ? WHERE id = ?').run(updates.alias, userId);
    }

    // 3. Password
    if(updates.password){
        // Accept oldPassword from updates or from a separate argument (for PATCH /me compatibility)
        const oldPassword = updates.oldPassword || updates._oldPassword;
        if(!oldPassword){
            throw new Error('old password is required');
        }
    const validPassword = bcrypt.compareSync(oldPassword, user.password);
        if(!validPassword){
            throw new Error('old password is incorrect!');
        }
    const hashedPassword = bcrypt.hashSync(updates.password, 10);
        db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, userId);
    }

    // 4. Avatar (file upload handled separately via /uploads endpoint)
    // if(updates.avatar){
    //     // For simplicity, store base64 string directly (in production, save file and store path)
    //     db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(updates.avatar, userId);
    // }

    // 5. Bio
    if(updates.bio){
        db.prepare('UPDATE users SET bio = ? WHERE id = ?').run(updates.bio, userId);
    }

    // 6. Skill Level
    if(updates.skillLevel){
        db.prepare('UPDATE users SET skillLevel = ? WHERE id = ?').run(updates.skillLevel, userId);
    }

    return { message: 'Profile updated successfully!' };
    
}

//add remove avatar function
async function removeAvatar(userId){
    const user = db.prepare(`SELECT id, avatar FROM users WHERE id = ?`).get(userId);
    if(!user){
        throw new Error('User not found');
    }
    if(user.avatar === 'default.jpg'){
        throw new Error('No custom avatar to remove');
    }
    db.prepare(`UPDATE users SET avatar = 'default.jpg' WHERE id = ?`).run(userId);
    return { message: 'Avatar removed, reverted to default' };
}




//1. search friends
//2. add friends

async function searchFriends(userId) {
    
    //1. query users who are not in the friend list of the logged in user (the query takes care of excluding already friend users (vise versa) + list all the not friends users)
    //show users (excluding the logged in user) + (exculde all the users in the logged in user that are listed as friends) + (exclude users who added the logged in user)
        const listUsers = db.prepare(`SELECT u.id, u.username FROM users u WHERE u.id != ? AND u.id NOT IN (SELECT f.friend_id FROM friends f WHERE f.user_id = ?)
        AND u.id NOT IN (SELECT f.user_id FROM friends f WHERE f.friend_id = ?)`).all(userId, userId, userId);
    // hanieh changed it: return empty array instead of error if no users found
    console.log('[hanieh debug] searchFriends called for userId:', userId);
    // Show all users except self
    const allUsers = db.prepare('SELECT id, username FROM users WHERE id != ?').all(userId);
    console.log('[hanieh debug] all other users:', allUsers);
    // Show all friends and pending requests
    const friendRows = db.prepare('SELECT * FROM friends WHERE user_id = ? OR friend_id = ?').all(userId, userId);
    console.log('[hanieh debug] friend/pending rows:', friendRows);
    console.log('[hanieh debug] filtered users:', listUsers);
    return ({users: listUsers});

}


/*

User A (sends a friend request) to User B
User B (accept or reject) 
*/
async function addFriends(userId, friendId){
    // hanieh debug: log addFriends attempt
    console.log('[hanieh debug] addFriends called with:', { userId, friendId });
    //check if users exists
    const checkUsers = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    const checkFriends = db.prepare('SELECT id FROM users WHERE id = ?').get(friendId);
    if (!checkUsers || !checkFriends){
        console.log('[hanieh debug] addFriends: user not found');
        throw new Error('User not found');
    }

    //prevent duplicates, logged in user shouldnt be the same as friend id
    if(userId === friendId){
        console.log('[hanieh debug] addFriends: cannot add self');
        throw new Error('you cannot add yourself as a friend');
    }

    //check that this user is not in the friend list and this user is not in the list of this friend
    const friendshipExist = db.prepare('SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)').get(userId, friendId, friendId, userId);
    if(friendshipExist){
        console.log('[hanieh debug] addFriends: friendship already exists');
        throw new Error('Friendship already exists');
    }

    //when a logged in user add a friend, the add request should go to them and show the notfication + reject or accept the add request
    // logged in user wants to add a user user_id add friend_id make friend_request = 'pending'
    //backend check: users exist, not the same user as logged in user, not already friends or a pending request
    db.prepare(`INSERT INTO friends (user_id, friend_id, friend_request) VALUES (?, ?, 'pending')`).run(userId, friendId);
    console.log('[hanieh debug] addFriends: friend request sent');
    //return messages (request sent)
    return {message: "Friend request sent!", friendId};
}

async function requestResponse(requestId, userId, action){
    //check that the request exists so we can accept or reject
    const request = db.prepare(`SELECT friend_id FROM friends WHERE id = ?`).get(requestId);
    if(!request){
        throw new Error('No requests available');
    }

    //dispaly the friend requests from users
    // const viewPendingRequests = 


    //only logged in user can accept/reject a request (receiver of the request)
    if(request.friend_id !== userId){
        throw new Error('Not authorized to make changes');
    }

    //check the request
    if(action === 'accepted'){
        db.prepare(`UPDATE friends SET friend_request = 'accepted' WHERE id = ?`).run(requestId);
        // hanieh debug: log accepted friends after update
        const accepted = db.prepare(`SELECT * FROM friends WHERE id = ?`).get(requestId);
        console.log('[hanieh debug] Accepted friend request row:', accepted);
        return {message: "Friend request accepted!"};
    }
    else if(action === 'rejected'){
        db.prepare(`UPDATE friends SET friend_request = 'rejected' WHERE id = ?`).run(requestId);
        return {message: "Friend request rejected!"};
    }
    else{
        throw new Error('Invalid action');
    }

}

async function viewPendingRequests(userId){
    // hanieh changed: join users table to get sender username for pending requests
    // hanieh changed: return property as 'pendingRequests' (array) for frontend compatibility
    const viewRequests = db.prepare(`
        SELECT f.id, f.user_id AS sender_id, u.username AS sender_username
        FROM friends f
        JOIN users u ON u.id = f.user_id
        WHERE f.friend_id = ? AND f.friend_request = 'pending'
    `).all(userId);
    console.log('[hanieh debug] viewPendingRequests for userId:', userId);
    console.log('[hanieh debug] pending requests:', viewRequests);
    return {pendingRequests: Array.isArray(viewRequests) ? viewRequests : []};
}


async function listFriends(userId){
    //list all added users
    //get status info from friends tables
    //get profile status from users

    //check who is checking to show the list accordinglly
    const users = db.prepare(`SELECT u.username , u.alias, u.avatar, f.friend_request FROM friends f
        JOIN users u ON (u.id = CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END)
        WHERE (f.user_id = ? OR f.friend_id = ?) AND f.friend_request = 'accepted'`).all(userId, userId, userId);
    // if(!users || users.length === 0){
    //     throw new Error('Friends List is empty');
    // }
    return users;
}

// hanieh changed: Added viewSentRequests for sender to see outgoing requests
// hanieh changed: Now returns receiver username for each sent request
async function viewSentRequests(userId) {
    // Returns requests sent by the logged-in user that are still pending, with receiver username
    const sentRequests = db.prepare(`
        SELECT f.id, f.friend_id AS receiver_id, u.username AS receiver_username
        FROM friends f
        JOIN users u ON u.id = f.friend_id
        WHERE f.user_id = ? AND f.friend_request = 'pending'
        `).all(userId);
        console.log('[hanieh debug] viewSentRequests for userId:', userId);
        console.log('[hanieh debug] sent requests:', sentRequests);
    return Array.isArray(sentRequests) ? sentRequests : [];
}


async function removeFriend(userId, friendId){
    //check if useres exists
    const checkUsers = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    const checkFriends = db.prepare('SELECT id FROM users WHERE id = ?').get(friendId);
    if (!checkUsers || !checkFriends){
        throw new Error('User not found');
    }

    //prevent duplicates, logged in user shouldnt be the same as friend id
    if(userId === friendId){
        throw new Error('you cannot remove yourself as a friend');
    }

    //check that this user is in the friend list of the logged in user
    const friendshipExist = db.prepare(`SELECT * FROM friends WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)) AND friend_request = 'accepted'`).get(userId, friendId, friendId, userId);

    if(!friendshipExist){
        throw new Error('Friendship does not exist');
    }

    //remove a friend from the list
    //remove row from friendship table
    db.prepare('DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)').run(userId, friendId, friendId, userId);
    return {message: "Friend removed successfully!"}; 
}

module.exports = {
    createUser,
    userLogIn,
    getUserdata,
    getPublicProfile,
    removeAvatar,
    setAlias,
    searchFriends,
    addFriends,
    removeFriend,
    requestResponse,
    viewPendingRequests,
    // hanieh changed: Added viewSentRequests for sender to see outgoing requests
    viewSentRequests,
    listFriends,
    updateUserProfile
};