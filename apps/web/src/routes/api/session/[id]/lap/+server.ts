import { db } from "$lib/server/db";
import type { Telemetry } from "$lib/types";
import camelcaseKeys from "camelcase-keys";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, params }) => {
	let sessionUid = params.id;
	const json: Telemetry.LapHistoryData & { id: number } = await request.json();

	const lap = {
		id: json.id,
		session_uid: sessionUid,
		lap_time_in_ms: json.lapTimeInMs,
		sector_1_time_in_ms: json.sector1TimeInMs,
		sector_2_time_in_ms: json.sector2TimeInMs,
		sector_3_time_in_ms: json.sector3TimeInMs,
		lap_valid_bit_flags: json.lapValidBitFlags,
	};

	await db`INSERT INTO laps ${db(lap)}`;
	await db.notify(
		`session:${sessionUid}`,
		JSON.stringify({
			type: "new_lap",
			data: camelcaseKeys(lap, { deep: true }),
		}),
	);

	return new Response(JSON.stringify({ status: "success" }), { status: 200 });
};
