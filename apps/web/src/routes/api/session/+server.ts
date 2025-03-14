import type { RequestHandler } from "@sveltejs/kit";
import type { Database, Telemetry } from "$lib/types";
import { db } from "$lib/server/db";
import { Auth } from "$lib/server/auth";
import camelcaseKeys from "camelcase-keys";
import { generateID } from "$lib/id";

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return new Response(null, { status: 401 });
	}
	const session: Telemetry.Session = await request.json();
	session.uid = generateID();

	await db`INSERT INTO telemetry_sessions ${db({
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

	const [track]: [Database.Track] = (
		await db`SELECT * FROM tracks WHERE tracks.id = ${session.trackId}`
	).map((o) => camelcaseKeys(o, { deep: true })) as [Database.Track];
	const eventData: Database.SimpleTelemetrySession = {
		uid: session.uid,
		startDate: new Date(session.startDate),
		totalDistance: session.totalDistance,
		weather: session.weather,
		timeOfDay: session.timeOfDay,
		totalLaps: session.totalLaps,
		assists: session.assists,
		track,
		laps: [],
	};

	await db.notify(
		`user:${locals.user.id}`,
		JSON.stringify({
			type: "new_session",
			data: eventData,
		}),
	);

	return new Response(JSON.stringify({ status: "success", session_uid: session.uid! }), {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "*", // Specify the url you wish to permit
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	});
};
