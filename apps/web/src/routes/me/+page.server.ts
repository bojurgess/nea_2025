import type { PageServerLoad } from "./$types";
import type { Database } from "$lib/types";
import { db } from "$lib/server/db";

type SessionSelect = Omit<Database.TelemetrySession, "userId" | "playerCarIndex" | "trackId">;
type LapsSelect = Omit<Database.Lap, "carTelemetryData" | "sessionUid">[];
type TrackSelect = Omit<Database.Track, "firstGp" | "realLapRecord" | "location" | "trackLength">;
type UserSelect = Omit<Database.User, "hashedPassword">;

type RowSelect = SessionSelect & { laps: LapsSelect; track: TrackSelect; user: UserSelect };

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

	// TODO: replace this type
	const sessions: RowSelect[] = await db`
		SELECT
			telemetry_sessions.uid,
			telemetry_sessions.start_date,
			telemetry_sessions.end_date,
			telemetry_sessions.total_distance,
			telemetry_sessions.weather,
			telemetry_sessions.time_of_day,
			telemetry_sessions.total_laps,
			json_agg(
				json_build_object(
					'id', laps.id,
					'lapTimeInMs', laps.lap_time_in_ms,
					'sector1TimeInMs', laps.sector1_time_in_ms,
					'sector2TimeInMs', laps.sector2_time_in_ms,
					'sector3TimeInMs', laps.sector3_time_in_ms,
					'lapInvalid', laps.lap_invalid,
					'assists', assists
				)
			) AS laps,
			json_build_object(
				'id', tracks.id,
				'gpName', tracks.gp_name,
				'country', tracks.country,
				'trackName', tracks.track_name
			) AS track
		FROM telemetry_sessions
		JOIN tracks ON telemetry_sessions.track_id = tracks.id
		LEFT JOIN laps ON telemetry_sessions.uid = laps.session_uid
		WHERE user_id = ${user.id}
		GROUP BY
			telemetry_sessions.uid,
			telemetry_sessions.start_date,
			telemetry_sessions.end_date,
			telemetry_sessions.total_distance,
			telemetry_sessions.weather,
			telemetry_sessions.time_of_day,
			telemetry_sessions.total_laps,
			tracks.id
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
