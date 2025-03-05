import type { RequestHandler } from "@sveltejs/kit";
import type { Telemetry } from "$lib/types";
import { db } from "$lib/server/db";
import { MOTION_DATA_BUCKET, S3 } from "$lib/server/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Auth } from "$lib/server/auth";

export const POST: RequestHandler = async ({ request }) => {
	const session: Telemetry.Session = await request.json();
	console.log(session);
	const sessionUid = Auth.generateID();

	const stmt = db.query(`
		INSERT INTO telemetry_sessions (uid, player_car_index, start_date, end_date, total_distance, weather, time_of_day, total_laps, track_id, assists) 
		VALUES ($sessionUid, $playerCarIndex, $startDate, $endDate, $totalDistance, $weather, $timeOfDay, $totalLaps, $trackId, $assists)
	`);
	stmt.run({
		sessionUid: sessionUid,
		playerCarIndex: session.playerCarIndex,
		startDate: session.startDate,
		endDate: session.endDate ?? null,
		totalDistance: session.totalDistance,
		weather: session.weather,
		timeOfDay: session.timeOfDay,
		totalLaps: session.totalLaps,
		trackId: session.trackId,
		assists: session.assists,
	});

	const url = await getSignedUrl(
		S3,
		new PutObjectCommand({ Bucket: MOTION_DATA_BUCKET, Key: `${sessionUid}.json` }),
		{ expiresIn: 3600 },
	);

	return new Response(
		JSON.stringify({ status: "success", motion_upload_url: url, session_uid: sessionUid }),
		{
			status: 200,
			headers: {
				"Access-Control-Allow-Origin": "*", // Specify the url you wish to permit
				"Access-Control-Allow-Methods": "POST, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
			},
		},
	);
};
