import { Auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import type { Handle } from "@sveltejs/kit";
import { createSecretKey } from "node:crypto";
import { jwtVerify } from "jose";
import { JWT_ACCESS_SECRET } from "$env/static/private";
import { sql } from "bun";

const JWT_ACCESS_SECRET_KEY = createSecretKey(Buffer.from(JWT_ACCESS_SECRET, "utf-8"));

export const handle: Handle = async ({ event, resolve }) => {
	const { url, request } = event;

	if (url.pathname.startsWith("/api/")) {
		const authHeader = request.headers.get("Authorization");

		if (!authHeader?.startsWith("Bearer ")) {
			return new Response(null, { status: 401 });
		}

		const token = authHeader.substring(7);

		try {
			const { payload } = await jwtVerify<{ username: string; sub: string }>(
				token,
				JWT_ACCESS_SECRET_KEY,
				{
					algorithms: ["HS256"],
				},
			);
			const [{ id }]: [{ id: string }] =
				await db`SELECT id FROM users WHERE username = ${sql({ username: payload.username })}`;
			event.locals.user = { id, username: payload.username };
		} catch (err) {
			console.warn(`Invalid access token: ${err}`);
			return new Response(null, { status: 401 });
		}
	}

	const auth = new Auth(db);
	const token = event.cookies.get(Auth.SESSION_COOKIE_NAME) ?? null;
	if (token === null) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(token);
	if (session !== null) {
		auth.setSessionTokenCookie(event, token, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.session = session;
	event.locals.user = user;
	return resolve(event);
};
