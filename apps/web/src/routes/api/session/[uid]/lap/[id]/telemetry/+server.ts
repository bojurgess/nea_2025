import { db } from "$lib/server/db";
import type { Telemetry } from "$lib/types";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
	const { id, uid: sessionUid } = params;

	try {
		// the limit 1 is for extra safety, getting 2 laps worth of results will tank performance
		const [telemetry]: [{ carTelemetryData: Record<string, Telemetry.CarTelemetryData> }] =
			await db`
            SELECT
				'carTelemetryData', car_telemetry_data::json
            FROM laps
            WHERE laps.id = ${id} AND laps.session_uid = ${sessionUid}
            LIMIT 1
        `;
		return new Response(JSON.stringify({ ...telemetry, id }), { status: 200 });
	} catch (error) {
		console.error(`ERROR on API endpoint GET /api/session/[uid]/lap/[id]/telemetry: `, error);
		return new Response(null, { status: 500 });
	}
};
