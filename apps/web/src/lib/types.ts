import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type {
	laps,
	refreshTokens,
	sessions,
	telemetrySessions,
	tracks,
	users,
} from "./server/db/schema";

export interface SessionMetadata {
	sessionIp?: string;
	sessionCountry?: string;
	sessionCity?: string;
	sessionRegion?: string;
	deviceType?: string;
	userAgent?: string;
}

export namespace Database {
	export type User = InferSelectModel<typeof users>;
	export type Session = InferSelectModel<typeof sessions>;
	export type RefreshToken = InferSelectModel<typeof refreshTokens>;
	export type Track = InferSelectModel<typeof tracks>;
	export type TelemetrySession = InferSelectModel<typeof telemetrySessions>;
	export type Lap = InferSelectModel<typeof laps>;

	export type InsertUser = InferInsertModel<typeof users>;
	export type InsertSession = InferInsertModel<typeof sessions>;
	export type InsertRefreshToken = InferInsertModel<typeof refreshTokens>;
	export type InsertTrack = InferInsertModel<typeof tracks>;
	export type InsertTelemetrySession = InferInsertModel<typeof telemetrySessions>;
	export type InsertLap = InferInsertModel<typeof laps>;
	// export interface User {
	// 	id: string;
	// 	username: string;
	// 	flag: string;
	// 	avatar: string;
	// 	hashedPassword: string;
	// 	joinDate: Date;
	// }
	//
	// export interface Session {
	// 	id: string;
	// 	userId: string;
	// 	expiresAt: number;
	// 	sessionIp?: string;
	// 	sessionCountry?: string;
	// 	sessionCity?: string;
	// 	sessionRegion?: string;
	// 	deviceType?: string;
	// 	userAgent?: string;
	// }
	//
	// export interface RefreshToken {
	// 	jti: string;
	// 	userId: string;
	// }
	//
	// export interface Track {
	// 	id: number;
	// 	gpName: string;
	// 	firstGp: string;
	// 	realLapRecord: number;
	// 	country: string;
	// 	location: string;
	// 	trackName: string;
	// 	trackLength: number;
	// }
	//
	// export interface TelemetrySession {
	// 	userId: string;
	// 	startDate: Date;
	// 	endDate?: Date;
	// 	uid: string;
	// 	playerCarIndex: number;
	// 	totalDistance: number;
	// 	weather: number;
	// 	timeOfDay: number;
	// 	totalLaps: number;
	// 	trackId: number;
	// 	assists: number;
	// 	carTelemetryData?: Telemetry.CarTelemetryData;
	// }
	//
	// export interface Lap extends Telemetry.LapHistoryData {
	// 	id: number;
	// 	sessionUid: string;
	// }
	//
	// export type JoinedTelemetrySession = TelemetrySession & {
	// 	track: Database.Track;
	// 	laps: Database.Lap[];
	// };
	//
	// export type SimpleTelemetrySession = Omit<
	// 	TelemetrySession,
	// 	"playerCarIndex" | "carTelemetryData" | "trackId"
	// > & { track: Database.Track; laps: Database.Lap[] };
}

export namespace Telemetry {
	export interface Session {
		uid?: string;
		playerCarIndex: number;
		startDate: string; // ISO 8601 format
		endDate?: string; // ISO 8601 format
		totalDistance: number;
		weather: number;
		timeOfDay: number;
		totalLaps: number;
		trackId: number;
		assists: number;
	}

	export interface CarTelemetryData {
		speed: number;
		throttle: number;
		steer: number;
		brake: number;
		clutch: number;
		gear: number;
		engineRpm: number;
		drs: number;
		brakesTemperature: [number, number, number, number];
		tyresSurfaceTemperature: [number, number, number, number];
		tyresInnerTemperature: [number, number, number, number];
		engineTemperature: number;
		tyresPressure: [number, number, number, number];
		surfaceType: [number, number, number, number];
		currentLapTimeInMs: number;
	}
}
