import type { PageServerLoad } from "./$types";
import type { Database } from "$lib/types";
import { db } from "$lib/server/db";

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	const bestLaps: { lapTimeInMs: number; track: Database.Track }[] = await db`
		SELECT DISTINCT ON (telemetry_sessions.track_id)
			lap.lap_time_in_ms,
			to_json(tracks) AS track
        FROM laps lap
        JOIN telemetry_sessions ON lap.session_uid = telemetry_sessions.uid
        JOIN tracks ON telemetry_sessions.track_id = tracks.id
        WHERE telemetry_sessions.user_id = ${user.id}
        ORDER BY telemetry_sessions.track_id, lap.lap_time_in_ms;
    `;

	const sessions: Database.SimpleTelemetrySession[] = await db`
		SELECT
			telemetry_sessions.uid,
			telemetry_sessions.start_date,
			telemetry_sessions.end_date,
			telemetry_sessions.total_distance,
			telemetry_sessions.weather,
			telemetry_sessions.time_of_day,
			telemetry_sessions.total_laps,
			telemetry_sessions.assists,
			COALESCE(
				JSON_AGG(ROW_TO_JSON(laps)) FILTER (WHERE laps IS NOT NULL), 
				'[]'
			) AS laps, to_json(tracks) AS track
		FROM telemetry_sessions
		JOIN tracks ON telemetry_sessions.track_id = tracks.id
		LEFT JOIN laps ON telemetry_sessions.uid = laps.session_uid
		WHERE user_id = ${user.id}
		GROUP BY telemetry_sessions.uid, tracks.id
		ORDER BY end_date DESC;
	`;

	const tracks: Database.Track[] = await db`SELECT * FROM tracks`;

	return {
		user,
		bestLaps,
		sessions,
		tracks,
	};
};
