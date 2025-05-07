import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "$env/static/private";
import { db } from "$lib/server/db";
import { json, type RequestHandler } from "@sveltejs/kit";
import { jwtVerify, SignJWT } from "jose";
import { createSecretKey } from "node:crypto";

const JWT_ACCESS_SECRET_KEY = createSecretKey(Buffer.from(JWT_ACCESS_SECRET, "utf-8"));
const JWT_REFRESH_SECRET_KEY = createSecretKey(Buffer.from(JWT_REFRESH_SECRET, "utf-8"));

export const POST: RequestHandler = async ({ request }) => {
	const { refresh_token } = await request.json();

	try {
		const { payload } = await jwtVerify<{ username: string }>(
			refresh_token,
			JWT_REFRESH_SECRET_KEY,
		);
		const { jti, sub, username } = {
			username: payload.username,
			jti: payload.jti ?? null,
			sub: payload.sub ?? null,
		};

		const [exists]: [{ jti: string; user_id: string }] =
			await db`SELECT * FROM refresh_tokens WHERE jti = ${jti} AND user_id = ${sub}`;
		if (!exists) {
			throw new Error("JTI does not exist in database");
		}

		const accessToken = await new SignJWT({ username })
			.setProtectedHeader({ alg: "HS256" })
			.setIssuedAt()
			.setSubject(sub!)
			.setExpirationTime("1h")
			.sign(JWT_ACCESS_SECRET_KEY);

		return json({
			access_token: accessToken,
			expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
		});
	} catch (err) {
		console.warn(`Invalid refresh token entered: ${err}`);
		return json({ error: "Invalid or expired refresh token" }, { status: 401 });
	}
};
