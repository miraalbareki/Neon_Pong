// hanieh wrote: Backend dashboard stats generator for user profile
const db = require('../queries/database');

function getWeeklyStats(userId) {
  // Group matches by week (ISO week number)
  const rows = db.prepare(`
    SELECT strftime('%W', played_at) AS week, 
           SUM(CASE WHEN user_score > opponent_score THEN 1 ELSE 0 END) AS wins,
           SUM(CASE WHEN user_score < opponent_score THEN 1 ELSE 0 END) AS losses,
           COUNT(*) AS gamesPlayed
    FROM game_history
    WHERE user_id = ?
    GROUP BY week
    ORDER BY week DESC
    LIMIT 5
  `).all(userId);
  return rows.map(r => ({ week: `Week ${r.week}`, wins: r.wins, losses: r.losses, gamesPlayed: r.gamesPlayed }));
}

function getSkillProgression(userId) {
  // Skill progression: show per game (date and score)
  const rows = db.prepare(`
    SELECT played_at, user_score
    FROM game_history
    WHERE user_id = ?
    ORDER BY played_at ASC
    LIMIT 20
  `).all(userId);
  return rows.map(r => ({ date: r.played_at, score: r.user_score }));
}

function getDashboardStats(userId) {
  // hanieh wrote: Aggregate stats for dashboard
  console.log('[DEBUG] getDashboardStats called for userId:', userId);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  console.log('[DEBUG] Fetched user:', user);
  if (!user) throw new Error('User not found');
  // Fetch matches where user is either user_id or opponent_id
  const matches = db.prepare('SELECT * FROM game_history WHERE user_id = ? OR opponent_id = ? ORDER BY played_at DESC').all(userId, userId);
  // Attach opponent info (username, avatar) for each match
  const matchesWithOpponent = matches.map(m => {
    let isUserPlayer = m.user_id === userId;
    let opponentId = isUserPlayer ? m.opponent_id : m.user_id;
    
    // For tournament matches with guest players, use opponent_name instead of looking up user
    if (!opponentId && m.opponent_name) {
      return {
        ...m,
        opponent: m.opponent_name,
        opponentAvatar: 'tournament-player.jpg', // Special avatar for tournament players
        isUserPlayer
      };
    }
    
    // For AI matches (opponent_id is null and no opponent_name)
    if (!opponentId && !m.opponent_name) {
      return {
        ...m,
        opponent: 'AI Opponent',
        opponentAvatar: 'ai-avatar.svg', // Special AI avatar
        isUserPlayer
      };
    }
    
    const opponent = db.prepare('SELECT username, avatar FROM users WHERE id = ?').get(opponentId);
    return {
      ...m,
      opponent: opponent ? opponent.username : 'Unknown',
      opponentAvatar: opponent ? opponent.avatar : null,
      isUserPlayer
    };
  });
  console.log('[DEBUG] Fetched matches:', matches);
  console.log('[DEBUG] Matches with opponent info:');
  matchesWithOpponent.forEach((m, i) => {
    console.log(`[MATCH ${i}] ID:${m.id} opponent:"${m.opponent}" opponent_name:"${m.opponent_name}" opponent_id:${m.opponent_id}`);
  });
  // Count wins/losses for this user (regardless of role)
  const wins = matchesWithOpponent.filter(m =>
    (m.isUserPlayer && m.user_score > m.opponent_score) ||
    (!m.isUserPlayer && m.opponent_score > m.user_score)
  ).length;
  const losses = matchesWithOpponent.filter(m =>
    (m.isUserPlayer && m.user_score < m.opponent_score) ||
    (!m.isUserPlayer && m.opponent_score < m.user_score)
  ).length;
  const gamesPlayed = matchesWithOpponent.length;
  const winRate = gamesPlayed ? Math.round((wins / gamesPlayed) * 100) : 0;
  // (already declared above with correct logic)
  console.log('[DEBUG] Calculated stats:', { wins, losses, gamesPlayed, winRate });
  // Streaks (simple: count consecutive wins)
  let currentStreak = 0, longestStreak = 0, streak = 0;
  for (const m of matches) {
    if (m.user_score > m.opponent_score) {
      streak++;
      if (streak > longestStreak) longestStreak = streak;
    } else {
      streak = 0;
    }
  }
  currentStreak = streak;
  // Play time: use default 5 min/game
  let totalPlayTime = 0;
  let averageMatchDuration = 1;
  if (matches.length > 0 && matches[0].duration !== undefined) {
    totalPlayTime = matches.reduce((sum, m) => sum + (m.duration || 1), 0);
    averageMatchDuration = Math.round(totalPlayTime / matches.length);
  } else {
    totalPlayTime = gamesPlayed * 1;
    averageMatchDuration = 1;
  }
  // Rank: calculate by win rate (highest win rate = rank 1)
  const totalPlayers = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  // Get win rates for all users
  const allUsers = db.prepare('SELECT id FROM users').all();
  const userWinRates = allUsers.map(u => {
    const userMatches = db.prepare('SELECT * FROM game_history WHERE user_id = ?').all(u.id);
    const userWins = userMatches.filter(m => m.user_score > m.opponent_score).length;
    const userGames = userMatches.length;
    const winRate = userGames ? (userWins / userGames) : 0;
    return { id: u.id, winRate };
  });
  // Sort by win rate descending, then by most games played, then by id
  userWinRates.sort((a, b) => {
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
    const aGames = db.prepare('SELECT COUNT(*) AS count FROM game_history WHERE user_id = ?').get(a.id).count;
    const bGames = db.prepare('SELECT COUNT(*) AS count FROM game_history WHERE user_id = ?').get(b.id).count;
    if (bGames !== aGames) return bGames - aGames;
    return a.id - b.id;
  });
  const ranking = userWinRates.findIndex(u => u.id === user.id) + 1;
  console.log('[DEBUG] Final dashboardStats:', {
    ranking,
    totalPlayers,
    winRate,
    wins,
    losses,
    currentStreak,
    longestStreak,
    totalPlayTime,
    averageMatchDuration
  });
  // Advanced stats
  const averageScore = matches.length ? Math.round(matches.reduce((sum, m) => sum + m.user_score, 0) / matches.length) : 0;
  const perfectGames = matches.filter(m => m.user_score === 21 && m.opponent_score === 0).length;
  const comebacks = matches.filter(m => m.user_score > m.opponent_score && m.user_score < 10).length;
  const preferredGameMode = '1v1';
  // Compose result
  return {
    ranking,
    totalPlayers,
    winRate,
    wins,
    losses,
    currentStreak,
    longestStreak,
    totalPlayTime,
    averageMatchDuration,
    weeklyStats: getWeeklyStats(userId),
    skillProgression: (() => {
      const progression = getSkillProgression(userId);
      console.log('[DEBUG] Skill progression:', progression);
      return progression;
    })(),
    averageScore,
    perfectGames,
    comebacks,
    preferredGameMode,
    matchHistory: matchesWithOpponent
  };
}

module.exports = { getDashboardStats };
