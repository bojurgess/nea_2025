export namespace Telemetry {
	export interface Session {
		sessionUid?: string;
		playerCarIndex: number;
		startDate: string; // ISO 8601 string representation of DateTime<Utc>
		endDate?: string; // Optional ISO 8601 string representation of DateTime<Utc>
		sessionData: SessionData;
		motionData: MotionData;
		laps: LapHistoryData[];
	}

	export interface SessionData {
		sessionType: number;
		weather: number;
		trackTemperature: number;
		airTemperature: number;
		totalLaps: number;
		trackId: number;
		aiDifficulty: number;
		steeringAssist: number;
		brakingAssist: number;
		gearboxAssist: number;
		dynamicRacingLine: number;
		ruleSet: number;
		sessionDuration: number;
	}

	export interface MotionData {
		motionData: CarMotionData[];
		motionExData: MotionExData[];
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

	export interface CarMotionData {
		worldPositionX: number;
		worldPositionY: number;
		worldPositionZ: number;
		worldVelocityX: number;
		worldVelocityY: number;
		worldVelocityZ: number;
		worldForwardDirX: number;
		worldForwardDirY: number;
		worldForwardDirZ: number;
		worldRightDirX: number;
		worldRightDirY: number;
		worldRightDirZ: number;
		gForceLateral: number;
		gForceLongitudinal: number;
		gForceVertical: number;
		yaw: number;
		pitch: number;
		roll: number;
	}

	export interface LapHistoryData {
		id: number;
		lapTimeInMs: number;
		sector1TimeInMs: number;
		sector1TimeMinutes: number;
		sector2TimeInMs: number;
		sector2TimeMinutes: number;
		sector3TimeInMs: number;
		sector3TimeMinutes: number;
		lapValidBitFlags: number;
	}
}
