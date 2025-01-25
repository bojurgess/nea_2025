import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { Auth } from "$lib/server/auth";
import { db } from "$lib/server/db";

export const load: PageServerLoad = async ({ locals }) => {
	// authenticated users cant log in twice, dummy
	if (locals.user !== null) {
		return redirect(302, "/");
	}

	return;
};

const generateUserId = () => {
	const BASE_62_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const encodeBase62 = (n: number) => {
		let out = "";
		while (n > 0) {
			out = BASE_62_CHARSET[n % 62] + out;
			n = Math.floor(n / 62);
		}
		return out;
	};

	const timestamp = Date.now();
	const entropy = Math.floor(Math.random() * 62 ** 6);

	const encodedTimestamp = encodeBase62(timestamp);
	const encodedEntropy = encodeBase62(entropy);

	return (encodedTimestamp + encodedEntropy).padEnd(15, "0").slice(0, 15);
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
		const userId = generateUserId();

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
};
