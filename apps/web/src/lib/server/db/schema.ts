import { integer, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: text("id").primaryKey(),
	username: text("username").notNull().unique(),
	avatar: text("avatar"),
	flag: text("flag"),
	hashed_password: text("hashed_password").notNull(),
	join_date: timestamp("join_date").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	user_id: text("user_id")
		.notNull()
		.references(() => users.id),
	expires_at: integer("expires_at").notNull(),
	session_ip: text("session_ip"),
	session_country: text("session_country"),
	session_city: text("session_city"),
	session_region: text("session_region"),
	device_type: text("device_type"),
	user_agent: text("user_agent"),
});

export const refreshTokens = pgTable("refresh_tokens", {
	jti: text("jti").primaryKey(),
	user_id: text("user_id")
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: "cascade" }),
});

export const tracks = pgTable("tracks", {
	id: integer("id").primaryKey(),
	gp_name: text("gp_name").notNull(),
	first_gp: timestamp("first_gp").notNull(),
	real_lap_record: integer("real_lap_record").notNull(),
	country: text("country").notNull(),
	location: text("location").notNull(),
	track_name: text("track_name").notNull(),
	track_length: integer("track_length").notNull(),
});

export const telemetrySessions = pgTable("telemetry_sessions", {
	uid: text("uid").primaryKey(),
	user_id: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	player_car_index: integer("player_car_index").notNull(),
	start_date: timestamp("start_date").notNull(),
	end_date: timestamp("end_date"),
	total_distance: integer("total_distance").notNull(),
	weather: integer("weather").notNull(),
	time_of_day: integer("time_of_day").notNull(),
	total_laps: integer("total_laps").notNull(),
	track_id: integer("track_id")
		.notNull()
		.references(() => tracks.id, { onDelete: "cascade" }),
	assists: integer("assists").notNull(),
	car_telemetry_data: jsonb("car_telemetry_data"),
});

export const laps = pgTable(
	"laps",
	{
		id: integer("id").notNull(),
		session_uid: text("session_uid")
			.notNull()
			.references(() => telemetrySessions.uid, { onDelete: "cascade" }),
		lap_time_in_ms: integer("lap_time_in_ms").notNull(),
		sector_1_time_in_ms: integer("sector_1_time_in_ms").notNull(),
		sector_2_time_in_ms: integer("sector_2_time_in_ms").notNull(),
		sector_3_time_in_ms: integer("sector_3_time_in_ms").notNull(),
		lap_valid_bit_flags: integer("lap_valid_bit_flags").notNull(),
	},
	(table) => [primaryKey({ columns: [table.id, table.session_uid] })],
);
