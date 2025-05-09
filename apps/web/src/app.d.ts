// See https://svelte.dev/docs/kit/types#app.d.ts

import type { Session, User } from "$lib/server/auth";

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: Session | null;
		}
	}

	interface Array<T> {
		quickSort(cmp?: (a: T, b: T) => number): T[];
	}
}

export {};
