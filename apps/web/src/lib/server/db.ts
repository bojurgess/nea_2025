import { SQL, type TransactionSQL } from "bun";
import { DATABASE_URL } from "$env/static/private";

export const db = new SQL({
	url: DATABASE_URL,
});

async function createTables(tx: TransactionSQL) {
	return await Promise.all([
		tx`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        hashed_password TEXT NOT NULL    
    );`,
		tx`CREATE TABLE IF NOT EXISTS sessions (
        id TEXT NOT NULL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at BIGINT NOT NULL,
        session_ip TEXT,
        session_country TEXT,
        session_city TEXT,
        session_region TEXT,
        device_type TEXT,
        user_agent TEXT
    );`,
		tx`CREATE TABLE IF NOT EXISTS refresh_tokens (
        jti TEXT NOT NULL PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
    );`,
		tx`CREATE TABLE IF NOT EXISTS tracks (
        id SERIAL PRIMARY KEY,
        gp_name TEXT UNIQUE NOT NULL,
        first_gp TEXT NOT NULL,
        real_lap_record INTEGER NOT NULL,
        country TEXT NOT NULL,
        location TEXT NOT NULL,
        track_name TEXT NOT NULL,
        track_length INTEGER NOT NULL
    );`,
		tx`CREATE TABLE IF NOT EXISTS telemetry_sessions (
        uid TEXT NOT NULL PRIMARY KEY,
        player_car_index INTEGER NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        total_distance DOUBLE PRECISION NOT NULL,
        weather INTEGER NOT NULL,
        time_of_day INTEGER NOT NULL,
        total_laps INTEGER NOT NULL,
        track_id INTEGER NOT NULL REFERENCES tracks(id),
        assists INTEGER NOT NULL
    );`,
		tx`CREATE TABLE IF NOT EXISTS laps (
        id SERIAL,
        session_uid TEXT NOT NULL REFERENCES telemetry_sessions(uid) ON DELETE CASCADE,
        lap_time_in_ms INTEGER NOT NULL,
        sector_1_time_in_ms INTEGER NOT NULL,
        sector_2_time_in_ms INTEGER NOT NULL,
        sector_3_time_in_ms INTEGER NOT NULL,
        lap_valid_bit_flags INTEGER NOT NULL,
        PRIMARY KEY (id, session_uid)
    );`,
	]);
}

await db.begin(createTables);
