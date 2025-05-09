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
            SELECT DISTINCT ON (laps.session_uid)
                laps.session_uid,
                laps.lap_time_in_ms,
                laps.sector1_time_in_ms,
                laps.sector2_time_in_ms,
                laps.sector3_time_in_ms,
                laps.assists,
                users.id AS user_id,
                users.username,
                users.flag AS user_flag
            FROM laps
            JOIN telemetry_sessions ON telemetry_sessions.uid = laps.session_uid
            JOIN users ON users.id = telemetry_sessions.user_id
            WHERE telemetry_sessions.track_id = ${id}
            ORDER BY laps.session_uid, laps.lap_time_in_ms ASC
        ),
        lap_counts AS (
            SELECT COUNT(*) AS lap_count
            FROM laps
            JOIN telemetry_sessions ON telemetry_sessions.uid = laps.session_uid
            WHERE telemetry_sessions.track_id = ${id}
        )
        SELECT
            (SELECT lap_count FROM lap_counts) AS lap_count,
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
            telemetry_sessions.track_id,
            telemetry_sessions.total_distance
        FROM best_laps
        JOIN telemetry_sessions ON telemetry_sessions.uid = best_laps.session_uid
        WHERE telemetry_sessions.track_id = ${id}
        GROUP BY telemetry_sessions.track_id, telemetry_sessions.total_distance;
    `;

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
