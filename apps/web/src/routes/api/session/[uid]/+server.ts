import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";

export const PUT: RequestHandler = async ({ request, params }) => {
	try {
		const sessionUid = params.uid;
		const req: {
			endDate: string;
			totalLaps: number;
		} = await request.json();

		if (await isSessionEmpty(sessionUid)) {
			await db`DELETE FROM telemetry_sessions WHERE uid = ${sessionUid}`;
			return new Response(null, { status: 200 });
		}

		await db`UPDATE telemetry_sessions SET end_date = ${req.endDate}, total_laps = ${req.totalLaps} WHERE uid = ${sessionUid}`;

		await db.notify(
			`session:${sessionUid}`,
			JSON.stringify({
				type: "session_ended",
				data: {
					endDate: req.endDate,
					totalLaps: req.totalLaps,
				},
			}),
		);

		return new Response(null, {
			status: 200,
		});
	} catch (err) {
		console.error(`Error handling PUT request: ${err}`);
		return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
	}
};

const isSessionEmpty = async (uid: string) => {
	return (await db`SELECT COUNT(*) FROM laps WHERE laps.session_uid = ${uid}`)[0].count === 0;
};
