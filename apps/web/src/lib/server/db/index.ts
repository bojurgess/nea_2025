import postgres from "postgres";
import { DATABASE_URL } from "$env/static/private";
import { tracks } from "$lib/tracks";

export const db = postgres(DATABASE_URL, { transform: { ...postgres.camel, undefined: null } });

await db`INSERT INTO tracks ${db(tracks)} ON CONFLICT DO NOTHING`;
