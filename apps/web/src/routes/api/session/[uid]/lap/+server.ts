import { db } from "$lib/server/db";
import type { Database, Telemetry } from "$lib/types";
import camelcaseKeys from "camelcase-keys";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, params }) => {
	let sessionUid = params.uid;
	const json: {
		lapNumber: number;
		totalDistance: number;
		lapTimeInMs: number;
		sector1TimeInMs: number;
		sector2TimeInMs: number;
		sector3TimeInMs: number;
		lapInvalid: boolean;
		assists: number;
		carTelemetry: Record<string, Telemetry.CarTelemetryData>;
	} = await request.json();

	const lap: Database.InsertLap = {
		id: json.lapNumber,
		sessionUid,
		lapTimeInMs: json.lapTimeInMs,
		sector1TimeInMs: json.sector1TimeInMs,
		sector2TimeInMs: json.sector2TimeInMs,
		sector3TimeInMs: json.sector3TimeInMs,
		lapInvalid: json.lapInvalid,
		assists: json.assists,
		carTelemetryData: json.carTelemetry,
	};

	try {
		// The database library doesnt like the type of carTelemetryData, but it works so it doesnt matter
		// @ts-expect-error
		await db`INSERT INTO laps ${db(lap)}`;
		await db`UPDATE telemetry_sessions SET total_distance = ${json.totalDistance} WHERE telemetry_sessions.uid = ${sessionUid}`;
		await db.notify(
			`session:${sessionUid}`,
			JSON.stringify({
				type: "new_lap",
				data: camelcaseKeys({ ...lap, carTelemetryData: null }, { deep: true }),
			}),
		);
		await db.notify(
			`session:${sessionUid}`,
			JSON.stringify({
				type: "update_total_distance",
				data: json.totalDistance,
			}),
		);

		return new Response(JSON.stringify({ status: "success" }), { status: 200 });
	} catch (e) {
		console.log({ ...json, carTelemetryData: null });
		console.error(e);

		return new Response(null, { status: 500 });
	}
};
