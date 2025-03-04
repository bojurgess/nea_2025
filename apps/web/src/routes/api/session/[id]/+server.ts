import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";

export const PUT: RequestHandler = async ({ request, params }) => {
	try {
		const sessionUid = params.id;
		const req: { endDate: string } = await request.json();

		const stmt = db.query(`
			UPDATE telemetry_sessions SET end_date = $endDate WHERE uid = $sessionUid
		`);
		stmt.run({
			sessionUid,
			endDate: req.endDate,
		});

		return new Response(null, {
			status: 200,
			headers: {
				"Access-Control-Allow-Origin": "*", // Specify the url you wish to permit
				"Access-Control-Allow-Methods": "POST, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
			},
		});
	} catch (err) {
		console.error(`Error handling PUT request: ${err}`);
		return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
	}
};
