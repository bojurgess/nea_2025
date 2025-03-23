import { db } from "$lib/server/db";
import type { Database } from "$lib/types";
import type { PageServerLoad } from "./$types";

type SessionSelect = Omit<Database.TelemetrySession, "userId" | "playerCarIndex" | "trackId">;
type LapSelect = Omit<Database.Lap, "carTelemetryData" | "sessionUid">[];
type TrackSelect = Omit<Database.Track, "firstGp" | "realLapRecord" | "location" | "trackLength">;
type UserSelect = Omit<Database.User, "hashedPassword">;

type RowSelect = [SessionSelect & { lap: LapSelect; track: TrackSelect; user: UserSelect }];

export const load: PageServerLoad = async ({ params, request }) => {
	const uid = params.uid;

	const [session]: RowSelect = await db`
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
					'lapValidBitFlags', laps.lap_valid_bit_flags,
					'assists', assists
				)
			) AS laps,
			json_build_object(
				'id', tracks.id,
				'gpName', tracks.gp_name,
				'country', tracks.country,
				'trackName', tracks.track_name
			) AS track,
			json_build_object(
				'id', users.id,
				'username', users.username,
				'avatar', users.avatar,
				'flag', users.flag,
				'joinDate', users.join_date
			) AS user
        FROM telemetry_sessions
		JOIN users ON telemetry_sessions.user_id = users.id
		JOIN tracks ON telemetry_sessions.track_id = tracks.id
		LEFT JOIN laps ON telemetry_sessions.uid = laps.session_uid
		WHERE telemetry_sessions.uid = ${uid}
		GROUP BY
			telemetry_sessions.uid,
			telemetry_sessions.start_date,
			telemetry_sessions.end_date,
			telemetry_sessions.total_distance,
			telemetry_sessions.weather,
			telemetry_sessions.time_of_day,
			telemetry_sessions.total_laps,
			tracks.id,
			users.id
    `;

	console.log(session);

	return { session, user: session.user.id };
};
