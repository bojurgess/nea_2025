<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { LazyStore } from "@tauri-apps/plugin-store";
	import { onMount } from "svelte";

	const store = new LazyStore("credentials.json");

	let refreshToken = $state("");
	let response: TokenResponse | undefined = $state();
	let payload: JWTPayload | undefined = $state();

	interface TokenResponse {
		access_token: string;
		expires_at: string;
	}

	interface JWTPayload {
		username: string,
		iat: number,
		sub: string,
		exp: number
	}

	function decodeJWT(jwt: string): JWTPayload {
		const payload = jwt.split('.')[1];
		const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
		const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');

		return JSON.parse(atob(padded));
	}

	async function authenticate(		e?: SubmitEvent & {
			currentTarget: EventTarget & HTMLFormElement;
		}) {
		e?.preventDefault();
		// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
		try {
			response = await invoke<TokenResponse>("authenticate", { refreshToken });
			payload = decodeJWT(response.access_token);
			store.set("refresh_token", refreshToken);
		} catch (err) {
			console.error(err);
		}
	}

	onMount(async () => {
		refreshToken = await store.get("refresh_token") ?? ""
		if (refreshToken !== "") {
			await authenticate();
		}
	})

	$inspect(payload)
	$inspect(response?.access_token)
</script>

<main>
	{#if payload}
		Logged in as {payload.username}
	{/if}
	<form onsubmit={(e) => authenticate(e)}>
    <input bind:value={refreshToken} />
	<button type="submit">Save</button>
  </form>
</main>
