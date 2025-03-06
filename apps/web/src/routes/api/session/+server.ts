import type { RequestHandler } from "@sveltejs/kit";
import type { Telemetry } from "$lib/types";
import { db } from "$lib/server/db";
import { MOTION_DATA_BUCKET, S3 } from "$lib/server/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Auth } from "$lib/server/auth";
import { sql } from "bun";

export const POST: RequestHandler = async ({ request }) => {
	const session: Telemetry.Session = await request.json();
	session.uid = Auth.generateID();

	await db`INSERT INTO telemetry_sessions ${sql(session)}`;

	const url = await getSignedUrl(
		S3,
		new PutObjectCommand({ Bucket: MOTION_DATA_BUCKET, Key: `${session.uid!}.json` }),
		{ expiresIn: 3600 },
	);

	return new Response(
		JSON.stringify({ status: "success", motion_upload_url: url, session_uid: session.uid! }),
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
