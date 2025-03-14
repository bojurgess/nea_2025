import { produce } from "sveltekit-sse";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";

export const POST: RequestHandler = async ({ params }) => {
	const sessionUid = params.id;

	return produce(async function start({ emit }) {
		await db.listen(`session:${sessionUid}`, (payload) => {
			const decoded: { type: string; data: Record<string, unknown> } = JSON.parse(payload);
			emit(decoded.type, JSON.stringify(decoded.data));
		});
	});
};
