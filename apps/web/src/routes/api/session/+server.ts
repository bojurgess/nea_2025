import type { RequestHandler } from "@sveltejs/kit";
import type { Telemetry } from "$lib/types";
import { db } from "$lib/server/db";
import { Auth } from "$lib/server/auth";
import { sql } from "bun";

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return new Response(null, { status: 500 });
	}
	const session: Telemetry.Session = await request.json();
	session.uid = Auth.generateID();

	await db`INSERT INTO telemetry_sessions ${sql({
		uid: session.uid,
		user_id: locals.user.id,
		player_car_index: session.playerCarIndex,
		start_date: session.startDate,
		total_distance: session.totalDistance,
		weather: session.weather,
		time_of_day: session.timeOfDay,
		total_laps: session.totalLaps,
		track_id: session.trackId,
		assists: session.assists,
	})}`;

	return new Response(JSON.stringify({ status: "success", session_uid: session.uid! }), {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "*", // Specify the url you wish to permit
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	});
};
