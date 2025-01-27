import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { db } from "$lib/server/db";

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user } = locals;

	if (!session || !user) {
		return redirect(302, "/auth");
	}

	const stmt = db.prepare(`SELECT * FROM refresh_tokens WHERE user_id = $userId`);
	const exists = stmt.get({ userId: user.id }) as { jti: string; user_id: string };

	return { user, hasRefreshToken: exists ? true : false };
};
