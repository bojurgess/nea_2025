import { db } from "$lib/server/db";
import type { Telemetry } from "$lib/types";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, params }) => {
	let sessionUid = params.id;
	const json: Telemetry.LapHistoryData = await request.json();

	const stmt = db.prepare(`INSERT INTO laps (
		id, session_uid, lap_time_in_ms, sector_1_time_in_ms, sector_1_time_minutes, sector_2_time_in_ms, sector_2_time_minutes, sector_3_time_in_ms, sector_3_time_minutes, lap_valid_bit_flags	
	) VALUES ($id, $sessionUid, $lapTimeInMs, $sector1TimeInMs, $sector1TimeMinutes, $sector2TimeInMs, $sector2TimeMinutes, $sector3TimeInMs, $sector3TimeMinutes, $lapValidBitFlags)`);
	stmt.run({ sessionUid, ...json });

	return new Response(JSON.stringify({ status: "success" }), { status: 200 });
};
