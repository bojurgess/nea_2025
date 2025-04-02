import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";

export const load: PageServerLoad = async ({ params }) => {
	const result: { sum: number; trackId: number }[] = await db`
        SELECT SUM(total_distance), track_id FROM telemetry_sessions GROUP BY track_id
    `;

	const trackDistances = new Map<number, number>();
	for (const row of result) {
		trackDistances.set(row.trackId, row.sum);
	}

	const result2: { count: string; trackId: number }[] = await db`
        SELECT COUNT(*), telemetry_sessions.track_id
        FROM laps
        JOIN telemetry_sessions
        ON telemetry_sessions.uid = laps.session_uid
        GROUP BY telemetry_sessions.track_id
    `;

	const lapCounts = new Map<number, number>();
	for (const row of result2) {
		lapCounts.set(row.trackId, Number(row.count));
	}

	return {
		trackDistances,
		lapCounts,
	};
};
