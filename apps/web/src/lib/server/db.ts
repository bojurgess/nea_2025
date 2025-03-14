import postgres, { type TransactionSql } from "postgres";
import { DATABASE_URL } from "$env/static/private";
import { tracks } from "$lib/tracks";

export const db = postgres(DATABASE_URL);

async function migrate(tx: TransactionSql) {
	return [
		`CREATE TABLE IF NOT EXISTS users (
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
			id INTEGER PRIMARY KEY,
			gp_name TEXT NOT NULL,
			first_gp DATE NOT NULL,
			real_lap_record INTEGER NOT NULL,
			country TEXT NOT NULL,
			location TEXT NOT NULL,
			track_name TEXT NOT NULL,
			track_length INTEGER NOT NULL
		);`,

		tx`CREATE TABLE IF NOT EXISTS telemetry_sessions (
			uid TEXT NOT NULL PRIMARY KEY,
			user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			player_car_index INTEGER NOT NULL,
			start_date TIMESTAMP NOT NULL,
			end_date TIMESTAMP,
			total_distance DOUBLE PRECISION NOT NULL,
			weather INTEGER NOT NULL,
			time_of_day INTEGER NOT NULL,
			total_laps INTEGER NOT NULL,
			track_id INTEGER NOT NULL REFERENCES tracks(id),
			assists INTEGER NOT NULL,
			car_telemetry_data JSONB
		);`,

		tx`CREATE TABLE IF NOT EXISTS laps (
			id INTEGER NOT NULl,
			session_uid TEXT NOT NULL REFERENCES telemetry_sessions(uid) ON DELETE CASCADE,
			lap_time_in_ms INTEGER NOT NULL,
			sector_1_time_in_ms INTEGER NOT NULL,
			sector_2_time_in_ms INTEGER NOT NULL,
			sector_3_time_in_ms INTEGER NOT NULL,
			lap_valid_bit_flags INTEGER NOT NULL,
			PRIMARY KEY (id, session_uid)
		);`,

		tx`INSERT INTO tracks ${tracks} ON CONFLICT DO NOTHING;`,
	];
}

try {
	await db.begin(migrate);
	console.log("Database migration and data insertion completed successfully.");
} catch (e) {
	console.error("Database migration failed:", e);
}
