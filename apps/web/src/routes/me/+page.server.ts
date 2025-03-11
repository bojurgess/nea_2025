import type { PageServerLoad } from "./$types";
import { sql } from "bun";
import type { Telemetry, Track } from "$lib/types";
import camelcaseKeys from "camelcase-keys";

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	const bestLapsStmt = sql`SELECT DISTINCT ON (telemetry_session.track_id) lap.lap_time_in_ms, track.*
        FROM laps lap
        JOIN telemetry_sessions telemetry_session ON lap.session_uid = telemetry_session.uid
        JOIN tracks track ON telemetry_session.track_id = track.id
        WHERE telemetry_session.user_id = ${user.id}
        ORDER BY telemetry_session.track_id, lap.lap_time_in_ms;
    `;
	const sessionsStmt = sql`SELECT * FROM telemetry_sessions WHERE user_id = ${user.id} ORDER BY end_date DESC;`;
	const lapCountsStmt = sql`SELECT telemetry_sessions.track_id, COUNT(*) AS lap_count
        FROM laps
        JOIN telemetry_sessions ON laps.session_uid = telemetry_sessions.uid
        GROUP BY telemetry_sessions.track_id
        ORDER BY lap_count DESC
    `;
	const databaseResults: any = await Promise.all([bestLapsStmt, sessionsStmt, lapCountsStmt]);
	const [bestLaps, sessions, lapCounts]: [
		(Track & { lapTimeInMs: number })[],
		Telemetry.Session[],
		{ trackId: number; lapCount: number }[],
	] = databaseResults.map(
		(o: any) => camelcaseKeys(o, { deep: true }), // Apply camelcase to each array
	);

	return {
		user,
		bestLaps,
		sessions,
		lapCounts,
	};
};
