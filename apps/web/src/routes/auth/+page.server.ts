import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { Auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { createSecretKey } from "node:crypto";
import { JWT_REFRESH_SECRET } from "$env/static/private";
import { SignJWT } from "jose";
import { generateID } from "$lib/id";

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
			console.warn("Registration failed: password and confirm password do not match");
			return fail(400, { message: "Password and Confirm Password must match" });
		}

		let [exists]: [{ id: string }] =
			await db`SELECT id FROM users WHERE username = ${username}`;

		if (exists) {
			console.warn("Registration failed: user with this name already exists");
			return fail(400, { message: "User with this name already exists" });
		}

		const hash = await Bun.password.hash(password);
		const userId = generateID();

		await db`INSERT INTO users ${db({ id: userId, username, hashed_password: hash })}`;

		const token = auth.generateSessionToken();
		const session = await auth.createSession(token, userId);
		auth.setSessionTokenCookie(event, token, session.expiresAt);
		return redirect(303, "/");
	},

	login: async (event) => {
		const auth = new Auth(db);
		const { username, password } = Object.fromEntries(
			(await event.request.formData()).entries(),
		) as { username: string; password: string };

		let [{ hashed_password: hashedPassword, id: userId }]: [
			{ hashed_password: string; id: string },
		] = await db`SELECT hashed_password, id FROM users WHERE username = ${username}`;

		if (!hashedPassword) {
			return fail(400, { message: "Invalid username or password" });
		}

		const isPasswordValid = await Bun.password.verify(password, hashedPassword);
		if (!isPasswordValid) {
			return fail(400, { message: "Invalid username or password" });
		}

		const token = auth.generateSessionToken();
		const session = await auth.createSession(token, userId);
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
		await db`DELETE FROM refresh_tokens WHERE user_id = ${user.id}`;

		const jti = generateID();
		const refreshToken = await new SignJWT({ username: user.username })
			.setProtectedHeader({ alg: "HS256" })
			.setIssuedAt()
			.setJti(jti)
			.setSubject(user.id)
			.sign(JWT_SECRET_KEY);

		await db`INSERT INTO refresh_tokens ${db({ jti, user_id: user.id })}`;

		return { refreshToken };
	},
};
