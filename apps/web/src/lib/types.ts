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

	export interface MotionExData {
		suspensionPosition: [number, number, number, number];
		suspensionVelocity: [number, number, number, number];
		suspensionAcceleration: [number, number, number, number];
		wheelSpeed: [number, number, number, number];
		wheelSlipRatio: [number, number, number, number];
		wheelSlipAngle: [number, number, number, number];
		wheelLatForce: [number, number, number, number];
		wheelLongForce: [number, number, number, number];
		heightOfCogAboveGround: number;
		localVelocityX: number;
		localVelocityY: number;
		localVelocityZ: number;
		angularVelocityX: number;
		angularVelocityY: number;
		angularVelocityZ: number;
		angularAccelerationX: number;
		angularAccelerationY: number;
		angularAccelerationZ: number;
		frontWheelsAngle: number;
		wheelVertForce: [number, number, number, number];
	}
}
