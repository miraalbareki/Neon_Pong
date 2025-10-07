const fastify = require('fastify');

async function authRoutes(fastify, options) {
  // Google OAuth initiation route
  fastify.get('/auth/google', async (request, reply) => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&` +
      `scope=profile email&` +
      `response_type=code&` +
      `access_type=offline`;
    
    return reply.redirect(authUrl);
  });

  // Google OAuth callback route
  fastify.get('/auth/google/callback', async (request, reply) => {
    const { code } = request.query;
    
    if (!code) {
      return reply.redirect(`${process.env.FRONTEND_URL}/?error=no_code`);
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        }),
      });

      if (!tokenData.access_token) {
        return reply.redirect(`${process.env.FRONTEND_URL}/?error=token_failed`);
      } 
      const tokenData = await tokenResponse.json();
      
      if (!tokenData.access_token) {
        return reply.redirect(`${process.env.FRONTEND_URL}/?error=token_failed`);
      }

      // Get user profile from Google
      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      const profile = await profileResponse.json();
      
      if (!profile.id) {
        return reply.redirect(`${process.env.FRONTEND_URL}/?error=profile_failed`);
      }

      // Find or create user in database
      const db = fastify.db || require('../queries/database');
      const existingUser = db.prepare('SELECT id, username, alias, email, avatar FROM users WHERE google_id = ? OR email = ?').get(profile.id, profile.email);
      
      let user;
      if (existingUser) {
        user = existingUser;
      } else {
        const usernameToUse = profile.email || `google_${profile.id.substring(0, 10)}`;
        const aliasToUse = profile.name || profile.email || `user_${profile.id.substring(0, 6)}`;
        
        const insert = db.prepare('INSERT INTO users (alias, username, email, google_id) VALUES (?, ?, ?, ?)');
        const info = insert.run(aliasToUse, usernameToUse, profile.email, profile.id);
        
        user = db.prepare('SELECT id, username, alias, email, avatar FROM users WHERE id = ?').get(info.lastInsertRowid);
      }

      // Generate JWT token
      const token = fastify.jwt.sign({ 
        id: user.id, 
        username: user.username 
      }, { expiresIn: '2h' });

      // Redirect to frontend with token
      return reply.redirect(`${process.env.FRONTEND_URL}/#token=${encodeURIComponent(token)}`);
      
    } catch (error) {
      console.error('Google OAuth error:', error);
      return reply.redirect(`${process.env.FRONTEND_URL}/?error=oauth_failed`);
    }
  });
}

module.exports = authRoutes;
