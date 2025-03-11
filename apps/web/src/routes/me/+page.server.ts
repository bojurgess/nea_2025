import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { sql } from "bun";

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	const best_laps = await sql`SELECT DISTINCT ON (ts.track_id) l.*
        FROM laps l
        JOIN telemetry_sessions ts ON l.session_uid = ts.uid
        WHERE l.
    `;
};
