const Database = require('better-sqlite3');
const db = new Database('database.db');


async function createTables() {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        alias TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password TEXT,
        email TEXT UNIQUE,
        bio TEXT,
        avatar TEXT DEFAULT 'default.jpg',
        current_status TEXT DEFAULT 'offline',
        last_seen DATETIME,
        google_id TEXT,
        player_matches INTEGER DEFAULT 0,
        player_wins INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS game_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,              -- allow NULL for guest-only matches
        opponent_id INTEGER,          -- allow NULL for guest-only matches
        user_score INTEGER NOT NULL,
        opponent_score INTEGER NOT NULL,
        result TEXT NOT NULL, /* 'WIN', 'LOSS', 'DRAW' */
        winner_id INTEGER NULL,
        loser_id INTEGER NULL,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        round TEXT,
        tournament_id INTEGER,        /* NEW: link match to a tournament */
        opponent_name TEXT,           /* NEW: for guest players in local tournaments */
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
        FOREIGN KEY (opponent_id) REFERENCES users (id) ON DELETE SET NULL,
        FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS tournaments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        min_players INTEGER DEFAULT 2,
        max_players INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        winner_id INTEGER NULL,
        finished_at TIMESTAMP NULL,
        created_by INTEGER NULL,
        creator_alias TEXT NOT NULL,
        player_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id),
        FOREIGN KEY (player_id) REFERENCES users (id),
        FOREIGN KEY (winner_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS tournament_players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tournament_id INTEGER NOT NULL,
        tournament_alias TEXT NOT NULL,
        status TEXT DEFAULT 'joined',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE,
        UNIQUE (tournament_id, tournament_alias)
      );

      CREATE TABLE IF NOT EXISTS friends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        friend_id INTEGER NOT NULL,
        friend_request TEXT DEFAULT 'pending',
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (friend_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);
    
    // Create migrations table to track applied migrations
    db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Run migrations only once
    runMigrations();
    
    console.log("✅ Tables created successfully");
  }
  catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error;
  }
}

// Migration system - runs migrations only once
function runMigrations() {
  const migrations = [
    {
      name: 'add_opponent_name_column',
      sql: 'ALTER TABLE game_history ADD COLUMN opponent_name TEXT'
    },
    {
      name: 'add_last_seen_column',
      sql: 'ALTER TABLE users ADD COLUMN last_seen DATETIME'
    },
    {
      name: 'add_creator_alias_column',
      sql: 'ALTER TABLE tournaments ADD COLUMN creator_alias TEXT'
    }
    // Add future migrations here
  ];

  migrations.forEach(migration => {
    try {
      // Check if migration was already applied
      const applied = db.prepare('SELECT name FROM migrations WHERE name = ?').get(migration.name);
      
      if (!applied) {
        // Run the migration
        db.prepare(migration.sql).run();
        
        // Mark as applied
        db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migration.name);
        
        console.log(`✅ Applied migration: ${migration.name}`);
      }
    } catch (error) {
      // Skip if column already exists or other expected errors
      if (error.message.includes('duplicate column name') || error.message.includes('already exists')) {
        // Mark as applied even if it already existed
        try {
          db.prepare('INSERT OR IGNORE INTO migrations (name) VALUES (?)').run(migration.name);
        } catch (e) {
          // Ignore if already marked
        }
        console.log(`⚠️  Migration ${migration.name} already applied`);
      } else {
        console.error(`❌ Migration ${migration.name} failed:`, error.message);
      }
    }
  });
}
    
  
// Create tables immediately
createTables();

// Export db so other files can use it
module.exports = db;

