import type { Database } from 'bun:sqlite';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';

class Auth {
	static DAY_IN_MS = 1000 * 60 * 60 * 24;
	static SESSION_COOKIE_NAME = 'auth_session';

	#db: Database;

	constructor(db: Database) {
		this.#db = db;
	}

	generateSessionToken(): string {
		const bytes = new Uint8Array(18);
		crypto.getRandomValues(bytes);
		return encodeBase32LowerCaseNoPadding(bytes);
	}

	createSession(token: string, userId: string): Session {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
		const session: Session = {
			id: sessionId,
			userId,
			expiresAt: new Date(Date.now() + Auth.DAY_IN_MS * 30)
		};
		const stmt = this.#db.query(
			`INSERT INTO sessions (id, user_id, expires_at) VALUES ($id, $userId, $expiresAt)`
		);
		stmt.run({ ...session, expiresAt: Math.floor(session.expiresAt.getTime() / 1000) });
		return session;
	}

	validateSessionToken(token: string): SessionValidationResult {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
		let stmt = this.#db.query(
			`SELECT sessions.*, users.username FROM sessions INNER JOIN users ON users.id = sessions.user_id WHERE id = $id`
		);
		const result = stmt.get({ id: sessionId }) as {
			id: string;
			username: string;
			user_id: string;
			expiresAt: number;
		};
		const session: Session = {
			id: result.id,
			userId: result.user_id,
			expiresAt: new Date(result.expiresAt)
		};
		const user: User = {
			id: result.user_id,
			username: result.username
		};
		if (Date.now() >= session.expiresAt.getTime()) {
			stmt = this.#db.query(`DELETE FROM sessions WHERE id = $id`);
			stmt.run({ id: session.id });
			return { session: null, user: null };
		}
		if (Date.now() >= session.expiresAt.getTime() - Auth.DAY_IN_MS * 15) {
			session.expiresAt = new Date(Date.now() + Auth.DAY_IN_MS * 30);
			stmt = this.#db.query(`UPDATE sessions SET expires_at = $expires_at WHERE id = $id`);
			stmt.run({ expires_at: Math.floor(session.expiresAt.getTime() / 1000), id: session.id });
		}
		return { session, user };
	}

	invalidateSession(sessionId: string): void {
		const stmt = this.#db.query(`DELETE FROM sessions WHERE id = $id`);
		stmt.run({ id: sessionId });
	}
}

type Session = { id: string; userId: string; expiresAt: Date };
type User = { id: string; username: string };

type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };
