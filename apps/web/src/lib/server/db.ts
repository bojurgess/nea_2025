import { Database } from 'bun:sqlite';
import { DATABASE_URL } from '$env/static/private';

export const db = new Database(DATABASE_URL, {
	strict: true
});

db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY_KEY,
    username TEXT NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL    
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id)
    expires_at INTEGER NOT NULL
);`);
