import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url, data }) => {
	const searchParams = url.searchParams;
	let query = searchParams.get("query");

	if (query) {
		return redirect(302, `/users/${query}`);
	}
	return data;
};
