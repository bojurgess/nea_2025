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
}
