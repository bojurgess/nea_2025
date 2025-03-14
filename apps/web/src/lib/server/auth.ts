import { db } from "./db";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import type { RequestEvent } from "@sveltejs/kit";
import { dev } from "$app/environment";

export class Auth {
	static DAY_IN_MS = 1000 * 60 * 60 * 24;
	static SESSION_COOKIE_NAME = "auth_session";

	#db: typeof db;

	constructor(conn: typeof db) {
		this.#db = conn;
	}

	generateSessionToken(): string {
		const bytes = new Uint8Array(18);
		crypto.getRandomValues(bytes);
		return encodeBase32LowerCaseNoPadding(bytes);
	}

	async createSession(token: string, userId: string): Promise<Session> {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
		const session: Session = {
			id: sessionId,
			userId,
			expiresAt: new Date(Date.now() + Auth.DAY_IN_MS * 30),
		};
		await this
			.#db`INSERT INTO sessions ${db({ id: sessionId, userId, expiresAt: Math.floor(session.expiresAt.getTime() / 1000) })}`;
		return session;
	}

	async validateSessionToken(token: string): Promise<SessionValidationResult> {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
		let [result]: [{ id: string; username: string; userId: string; expiresAt: number }] =
			await this
				.#db`SELECT sessions.*, users.username FROM sessions INNER JOIN users ON users.id = sessions.user_id WHERE sessions.id = ${sessionId}`;
		const session: Session = {
			id: result.id,
			userId: result.userId,
			expiresAt: new Date(result.expiresAt * 1000),
		};
		const user: User = {
			id: result.userId,
			username: result.username,
		};
		if (Date.now() >= session.expiresAt.getTime()) {
			await this.#db`DELETE FROM sessions WHERE id = ${session.id}`;
			return { session: null, user: null };
		}
		if (Date.now() >= session.expiresAt.getTime() - Auth.DAY_IN_MS * 15) {
			session.expiresAt = new Date(Date.now() + Auth.DAY_IN_MS * 30);
			await this
				.#db`UPDATE sessions SET expires_at = ${Math.floor(session.expiresAt.getTime() / 1000)} WHERE id = ${session.id}`;
		}
		return { session, user };
	}

	async invalidateSession(sessionId: string): Promise<void> {
		await this.#db`DELETE FROM sessions WHERE id = ${sessionId}`;
	}

	setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
		event.cookies.set(Auth.SESSION_COOKIE_NAME, token, {
			path: "/",
			expires: expiresAt,
			secure: !dev,
			sameSite: "lax",
			httpOnly: true,
		});
	}

	deleteSessionTokenCookie(event: RequestEvent): void {
		event.cookies.set(Auth.SESSION_COOKIE_NAME, "", {
			httpOnly: true,
			sameSite: "lax",
			maxAge: 0,
			path: "/",
		});
	}
}

export type Session = { id: string; userId: string; expiresAt: Date };
export type User = { id: string; username: string };

type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };
