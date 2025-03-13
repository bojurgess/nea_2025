import type { PageServerLoad } from "./$types";
import { sql } from "bun";
import type { Database } from "$lib/types";
import camelcaseKeys from "camelcase-keys";

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	const bestLapsStmt = sql`
		SELECT DISTINCT ON (telemetry_sessions.track_id)
			lap.lap_time_in_ms,
			to_json(tracks) AS track
        FROM laps lap
        JOIN telemetry_sessions ON lap.session_uid = telemetry_sessions.uid
        JOIN tracks ON telemetry_sessions.track_id = tracks.id
        WHERE telemetry_sessions.user_id = ${user.id}
        ORDER BY telemetry_sessions.track_id, lap.lap_time_in_ms;
    `;

	const sessionsStmt = sql`
		SELECT
			telemetry_sessions.total_laps,
			telemetry_sessions.start_date,
			telemetry_sessions.end_date,
			telemetry_sessions.assists,
			telemetry_sessions.weather,
			COALESCE(ARRAY_AGG(ROW_TO_JSON(laps)), '{}'::json[]) AS laps,
			to_json(tracks) AS track
		FROM telemetry_sessions
		JOIN tracks ON telemetry_sessions.track_id = tracks.id
		LEFT JOIN laps ON telemetry_sessions.uid = laps.session_uid
		WHERE user_id = ${user.id}
		GROUP BY telemetry_sessions.uid, tracks.id
		ORDER BY end_date DESC;
	`;

	const lapCountsStmt = sql`
		SELECT telemetry_sessions.track_id, COUNT(*) AS lap_count
        FROM laps
        JOIN telemetry_sessions ON laps.session_uid = telemetry_sessions.uid
        GROUP BY telemetry_sessions.track_id
        ORDER BY lap_count DESC
    `;

	type DatabaseResult = [
		{ lapTimeInMs: number; track: Database.Track }[],
		({
			totalLaps: number;
			startDate: Date;
			endDate: Date;
			assists: number;
			weather: number;
		} & { track: Database.Track } & { laps: Database.Lap[] })[],
		{ trackId: number; lapCount: number }[],
	];

	let [bestLaps, sessions, lapCounts]: DatabaseResult = (
		await Promise.all([bestLapsStmt, sessionsStmt, lapCountsStmt])
	).map((o) => camelcaseKeys(o, { deep: true })) as DatabaseResult;

	return {
		user,
		bestLaps,
		sessions,
		lapCounts,
	};
};
