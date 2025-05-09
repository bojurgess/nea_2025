import { db } from "$lib/server/db";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const users: {
		id: string;
		username: string;
		joinDate: Date;
		flag: string;
	}[] = await db`
        SELECT id, username, flag, join_date FROM users
    `;

	if (!users) {
		error(404, {
			message: "Not found",
		});
	}

	console.log(Array.isArray(users));

	return { users: users.map((user) => ({ ...user, joinDate: user.joinDate.toISOString() })) };
};
