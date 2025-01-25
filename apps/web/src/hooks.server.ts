import { Auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const auth = new Auth(db);
	const token = event.cookies.get(Auth.SESSION_COOKIE_NAME) ?? null;
	if (token === null) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = auth.validateSessionToken(token);
	if (session !== null) {
		auth.setSessionTokenCookie(event, token, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.session = session;
	event.locals.user = user;
	return resolve(event);
};
