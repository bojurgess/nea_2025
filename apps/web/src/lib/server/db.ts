import { Database } from "bun:sqlite";
import { DATABASE_URL } from "$env/static/private";

export const db = new Database(DATABASE_URL, {
	strict: true,
});

db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL    
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    jti TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS telemetry_sessions (
    uid TEXT NOT NULL PRIMARY KEY,
    player_car_index INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    session_data TEXT NOT NULL
    motion_blob_url TEXT
);

CREATE TABLE IF NOT EXISTS laps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_uid INTEGER NOT NULL REFERENCES telemetry_sessions(uid),
    lap_data TEXT NOT NULL,
);`);
