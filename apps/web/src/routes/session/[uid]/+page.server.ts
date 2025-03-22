import { db } from "$lib/server/db";
import type { Database } from "$lib/types";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, request }) => {
	const uid = params.uid;

	const [session]: [Database.SimpleJoinedTelemetrySession] = await db`
		SELECT
				telemetry_sessions.user_id,
				telemetry_sessions.uid,
				telemetry_sessions.start_date,
				telemetry_sessions.end_date,
				telemetry_sessions.total_distance,
				telemetry_sessions.weather,
				telemetry_sessions.time_of_day,
				telemetry_sessions.total_laps,
			COALESCE(
				JSON_AGG(ROW_TO_JSON(laps)) FILTER (WHERE laps IS NOT NULL), 
				'[]'
			) AS laps,
            to_json(tracks) AS track
        FROM telemetry_sessions
		JOIN tracks ON telemetry_sessions.track_id = tracks.id
		LEFT JOIN laps ON telemetry_sessions.uid = laps.session_uid
		WHERE telemetry_sessions.uid = ${uid}
		GROUP BY telemetry_sessions.uid, tracks.id
    `;

	const [user]: [Database.User] = await db`
		SELECT * FROM users WHERE users.id = ${session.userId}
	`;

	return { session, user };
};
