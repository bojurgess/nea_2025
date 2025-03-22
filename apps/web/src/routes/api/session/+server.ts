import type { RequestHandler } from "@sveltejs/kit";
import type { Database, Telemetry } from "$lib/types";
import { db } from "$lib/server/db";
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
		userId: locals.user.id,
		playerCarIndex: session.playerCarIndex,
		startDate: new Date(session.startDate),
		totalDistance: session.totalDistance,
		weather: session.weather,
		timeOfDay: session.timeOfDay,
		totalLaps: session.totalLaps,
		trackId: session.trackId,
	} as Database.InsertTelemetrySession)}`;

	const [track]: [Database.Track] = (
		await db`SELECT * FROM tracks WHERE tracks.id = ${session.trackId}`
	).map((o) => camelcaseKeys(o, { deep: true })) as [Database.Track];
	const eventData: Database.SimpleJoinedTelemetrySession = {
		uid: session.uid,
		userId: locals.user.id,
		endDate: null,
		startDate: new Date(session.startDate),
		totalDistance: session.totalDistance,
		weather: session.weather,
		timeOfDay: session.timeOfDay,
		totalLaps: session.totalLaps,
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
