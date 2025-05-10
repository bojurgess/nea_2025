import { db } from "$lib/server/db";
import { tracks } from "$lib/tracks";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { Database } from "$lib/types";

type Lap = Omit<Database.Lap, "carTelemetryData"> & {
	user: Omit<Database.User, "avatar" | "hashedPassword" | "joinDate">;
};

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	const track = tracks.find((t) => t.id === Number(id));
	if (!track) {
		error(404);
	}

	const [result]: [{ lapCount: string; laps: Lap[]; trackId: number; totalDistance: number }] =
		await db`
        WITH best_laps AS (
            SELECT DISTINCT ON (users.id)
                laps.session_uid,
                laps.lap_time_in_ms,
                laps.sector1_time_in_ms,
                laps.sector2_time_in_ms,
                laps.sector3_time_in_ms,
                laps.assists,
                users.id AS user_id,
                users.username,
                users.flag AS user_flag,
                telemetry_sessions.total_distance,
                telemetry_sessions.track_id
            FROM laps
            JOIN telemetry_sessions ON telemetry_sessions.uid = laps.session_uid
            JOIN users ON users.id = telemetry_sessions.user_id
            WHERE telemetry_sessions.track_id = ${id}
            ORDER BY users.id, laps.lap_time_in_ms ASC
        ),
        lap_counts AS (
            SELECT COUNT(*) AS lap_count
            FROM laps
            JOIN telemetry_sessions ON telemetry_sessions.uid = laps.session_uid
            WHERE telemetry_sessions.track_id = ${id}
        ),
        total_track_distance AS (
            SELECT SUM(telemetry_sessions.total_distance) AS total_distance
            FROM telemetry_sessions
            WHERE telemetry_sessions.track_id = ${id}
        )
        SELECT
            (SELECT lap_count FROM lap_counts) AS lap_count,
            (SELECT total_distance FROM total_track_distance) AS total_distance,
            json_agg(
                json_build_object(
                    'sessionUid', best_laps.session_uid,
                    'lapTimeInMs', best_laps.lap_time_in_ms,
                    'sector1TimeInMs', best_laps.sector1_time_in_ms,
                    'sector2TimeInMs', best_laps.sector2_time_in_ms,
                    'sector3TimeInMs', best_laps.sector3_time_in_ms,
                    'assists', best_laps.assists,
                    'user', json_build_object(
                        'id', best_laps.user_id,
                        'username', best_laps.username,
                        'flag', best_laps.user_flag
                    )
                ) ORDER BY best_laps.lap_time_in_ms
            ) AS laps,
            best_laps.track_id
        FROM best_laps
        GROUP BY best_laps.track_id;
    `;
	console.log(`Laps: `, result.laps);

	if (!result) {
		return {
			track,
			lapCount: 0,
			laps: [],
			totalDistance: 0,
		};
	}

	return {
		track,
		lapCount: Number(result.lapCount),
		laps: result.laps,
		totalDistance: result.totalDistance,
	};
};
