import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { db } from "$lib/server/db";

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user } = locals;

	if (!session || !user) {
		return redirect(302, "/auth");
	}

	const [exists]: [{ jti: string; user_id: string }] =
		await db`SELECT * FROM refresh_tokens WHERE user_id = ${user.id}`;

	return { user, hasRefreshToken: exists ? true : false };
};
