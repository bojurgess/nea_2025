import type { Telemetry } from "$lib/types";
import {
	boolean,
	doublePrecision,
	integer,
	jsonb,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: text("id").primaryKey(),
	username: text("username").notNull().unique(),
	avatar: text("avatar"),
	flag: text("flag"),
	hashedPassword: text("hashed_password").notNull(),
	joinDate: timestamp("join_date").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id),
	expiresAt: integer("expires_at").notNull(),
	sessionIp: text("session_ip"),
	sessionCountry: text("session_country"),
	sessionCity: text("session_city"),
	sessionRegion: text("session_region"),
	deviceType: text("device_type"),
	userAgent: text("user_agent"),
});

export const refreshTokens = pgTable("refresh_tokens", {
	jti: text("jti").primaryKey(),
	userId: text("user_id")
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: "cascade" }),
});

export const tracks = pgTable("tracks", {
	id: integer("id").primaryKey(),
	gpName: text("gp_name").notNull(),
	firstGp: timestamp("first_gp").notNull(),
	realLapRecord: integer("real_lap_record").notNull(),
	country: text("country").notNull(),
	location: text("location").notNull(),
	trackName: text("track_name").notNull(),
	trackLength: integer("track_length").notNull(),
});

export const telemetrySessions = pgTable("telemetry_sessions", {
	uid: text("uid").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	playerCarIndex: integer("player_car_index").notNull(),
	startDate: timestamp("start_date").notNull(),
	endDate: timestamp("end_date"),
	totalDistance: doublePrecision("total_distance").notNull(),
	weather: integer("weather").notNull(),
	timeOfDay: integer("time_of_day").notNull(),
	totalLaps: integer("total_laps").notNull(),
	trackId: integer("track_id")
		.notNull()
		.references(() => tracks.id, { onDelete: "cascade" }),
});

export const laps = pgTable(
	"laps",
	{
		id: integer("id").notNull(),
		sessionUid: text("session_uid")
			.notNull()
			.references(() => telemetrySessions.uid, { onDelete: "cascade" }),
		lapTimeInMs: integer("lap_time_in_ms").notNull(),
		sector1TimeInMs: integer("sector1_time_in_ms").notNull(),
		sector2TimeInMs: integer("sector2_time_in_ms").notNull(),
		sector3TimeInMs: integer("sector3_time_in_ms").notNull(),
		lapInvalid: boolean("lap_invalid").notNull(),
		assists: integer("assists").notNull(),
		carTelemetryData:
			jsonb("car_telemetry_data").$type<Record<number, Telemetry.CarTelemetryData>>(),
	},
	(table) => [primaryKey({ columns: [table.id, table.sessionUid] })],
);
