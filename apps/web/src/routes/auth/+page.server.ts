import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { Auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { createSecretKey } from "node:crypto";
import { JWT_REFRESH_SECRET } from "$env/static/private";
import { SignJWT } from "jose";

const JWT_SECRET_KEY = createSecretKey(Buffer.from(JWT_REFRESH_SECRET, "utf-8"));

export const load: PageServerLoad = async ({ locals }) => {
	// authenticated users cant log in twice, dummy
	if (locals.user !== null) {
		return redirect(302, "/");
	}

	return;
};

export const actions: Actions = {
	register: async (event) => {
		const auth = new Auth(db);
		const { username, password, confirmPassword } = Object.fromEntries(
			(await event.request.formData()).entries(),
		) as { username: string; password: string; confirmPassword: string };

		if (password !== confirmPassword) {
			return fail(400, { message: "Password and Confirm Password must match" });
		}

		let stmt = db.query(`SELECT id FROM users WHERE username = $username`);
		const exists = stmt.get({ username });

		if (exists) {
			return fail(400, { message: "User with this name already exists" });
		}

		const hash = await Bun.password.hash(password);
		const userId = Auth.generateID();

		stmt = db.query(
			`INSERT INTO users (id, username, hashed_password) VALUES ($userId, $username, $hashedPassword)`,
		);
		stmt.run({ userId, username, hashedPassword: hash });

		const token = auth.generateSessionToken();
		const session = auth.createSession(token, userId);
		auth.setSessionTokenCookie(event, token, session.expiresAt);
		return redirect(303, "/");
	},

	login: async (event) => {
		const auth = new Auth(db);
		const { username, password } = Object.fromEntries(
			(await event.request.formData()).entries(),
		) as { username: string; password: string };

		let stmt = db.query(`SELECT hashed_password, id FROM users WHERE username = $username`);
		const { hashed_password: hashedPassword, id: userId } = stmt.get({ username }) as {
			hashed_password: string;
			id: string;
		};

		if (!hashedPassword) {
			return fail(400, { message: "Invalid username or password" });
		}

		const isPasswordValid = await Bun.password.verify(password, hashedPassword);
		if (!isPasswordValid) {
			return fail(400, { message: "Invalid username or password" });
		}

		const token = auth.generateSessionToken();
		const session = auth.createSession(token, userId);
		auth.setSessionTokenCookie(event, token, session.expiresAt);
		return redirect(303, "/");
	},

	logout: async (event) => {
		if (!event.locals.session) {
			return fail(400);
		}

		const auth = new Auth(db);
		const session = event.locals.session;

		auth.invalidateSession(session.id);
		auth.deleteSessionTokenCookie(event);

		return redirect(303, "/");
	},

	generateRefreshToken: async (event) => {
		if (!event.locals.session || !event.locals.user) {
			return fail(400);
		}

		const { user } = event.locals;

		// we should invalidate any old tokens
		let stmt = db.prepare(`DELETE FROM refresh_tokens WHERE user_id = $userId`);
		stmt.run({ userId: user.id });

		const jti = Auth.generateID();
		const refreshToken = await new SignJWT({ username: user.username })
			.setProtectedHeader({ alg: "HS256" })
			.setIssuedAt()
			.setJti(jti)
			.setSubject(user.id)
			.sign(JWT_SECRET_KEY);

		stmt = db.query(`INSERT INTO refresh_tokens (jti, user_id) VALUES ($jti, $userId)`);
		stmt.run({ jti, userId: user.id });

		return { refreshToken };
	},
};
