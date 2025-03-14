import postgres from "postgres";
import { DATABASE_URL } from "$env/static/private";

export const db = postgres(DATABASE_URL, { transform: postgres.camel });
