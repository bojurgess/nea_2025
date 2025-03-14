export interface SessionMetadata {
	sessionIp?: string;
	sessionCountry?: string;
	sessionCity?: string;
	sessionRegion?: string;
	deviceType?: string;
	userAgent?: string;
}

export namespace Database {
	export interface User {
		id: string;
		username: string;
		flag: string;
		avatar: string;
		hashedPassword: string;
		joinDate: Date;
	}

	export interface Session {
		id: string;
		userId: string;
		expiresAt: bigint;
		sessionIp?: string;
		sessionCountry?: string;
		sessionCity?: string;
		sessionRegion?: string;
		deviceType?: string;
		userAgent?: string;
	}

	export interface RefreshToken {
		jti: string;
		userId: string;
	}

	export interface Track {
		id: number;
		gpName: string;
		firstGp: string;
		realLapRecord: number;
		country: string;
		location: string;
		trackName: string;
		trackLength: number;
	}

	export interface TelemetrySession {
		userId: string;
		startDate: Date;
		endDate?: Date;
		uid: string;
		playerCarIndex: number;
		totalDistance: number;
		weather: number;
		timeOfDay: number;
		totalLaps: number;
		trackId: number;
		assists: number;
		carTelemetryData?: Telemetry.CarTelemetryData;
	}

	export interface Lap extends Telemetry.LapHistoryData {
		id: number;
		sessionUid: string;
	}

	export type SimpleTelemetrySession = Omit<
		TelemetrySession,
		"playerCarIndex" | "userId" | "carTelemetryData" | "trackId"
	> & { track: Database.Track; laps: Database.Lap[] };
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

	export interface LapHistoryData {
		lapTimeInMs: number;
		sector1TimeInMs: number;
		sector2TimeInMs: number;
		sector3TimeInMs: number;
		lapValidBitFlags: number;
	}

	export interface CarTelemetryData {
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
	}
}
