import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import type { Telemetry } from "$lib/types";

export const PUT: RequestHandler = async ({ request, params }) => {
	try {
		const sessionUid = params.id;
		const req: { endDate: string; carTelemetryData: Telemetry.MotionExData } =
			await request.json();
		console.log(req);

		await db`UPDATE telemetry_sessions SET end_date = ${req.endDate}, car_telemetry_data = ${JSON.stringify(req.carTelemetryData)} WHERE uid = ${sessionUid}`;

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
