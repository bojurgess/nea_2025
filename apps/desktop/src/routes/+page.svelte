<script lang="ts">
	import { invoke } from '@tauri-apps/api/core';
	import { LazyStore } from '@tauri-apps/plugin-store';
	import { onDestroy, onMount } from 'svelte';

	const store = new LazyStore('credentials.json');

	let refreshToken = $state('');
	let addr = $state('127.0.0.1:20777');
	let response: TokenResponse | undefined = $state();
	let payload: JWTPayload | JWTError | undefined = $state();
	let timeout: Timer | undefined = $state();

	interface TokenResponse {
		access_token: string;
		expires_at: string;
	}

	interface JWTPayload {
		username: string;
		iat: number;
		sub: string;
		exp: number;
	}

	interface JWTError {
		error: string;
	}

	function decodeJWT(jwt: string): JWTPayload {
		const payload = jwt.split('.')[1];
		const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
		const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

		return JSON.parse(atob(padded));
	}

	async function authenticate(
		e?: SubmitEvent & {
			currentTarget: EventTarget & HTMLFormElement;
		}
	) {
		e?.preventDefault();
		// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
		try {
			response = await invoke<TokenResponse>('authenticate', { refreshToken });
			payload = decodeJWT(response.access_token);
			await store.set('refresh_token', refreshToken);
			await store.set('access_token', response.access_token);

			let expiresAt = new Date(payload.exp * 1000);
			timeout = setTimeout(() => authenticate(), expiresAt.getTime() - Date.now());

			await beginListen();
		} catch (err) {
			await store.delete('refresh_token');
			refreshToken = '';
			payload = {
				error: 'Invalid refresh token'
			};
			timeout?.unref();
		}
	}

	async function beginListen() {
		try {
			await invoke('listen_for_telemetry', { addr });
			console.log('Listening for telemetry');
		} catch (err) {
			console.error(err);
		}
	}

	onMount(async () => {
		refreshToken = (await store.get('refresh_token')) ?? '';
		if (refreshToken !== '') {
			await authenticate();
		}
	});

	onDestroy(() => {
		timeout?.unref();
	});
</script>

<main class="flex h-full w-full flex-col items-center justify-center">
	<h1 class="text-3xl font-bold">Telemetry</h1>

	{#if payload}
		{#if 'error' in payload}
			<span>Invalid refresh token. Please try again.</span>
		{:else}
			<span>
				Currently logged in as <strong>{payload.username}</strong>
			</span>
		{/if}
	{/if}

	<div>
		<form
			onsubmit={(e) => authenticate(e)}
			class="flex max-w-md flex-col items-center space-y-8 p-4"
		>
			<label class="flex flex-col">
				<span class="font-semibold">Listen Address</span>
				<div class="space-x-2">
					<input
						bind:value={addr}
						required
						class="border-black shadow-[5px_5px_#000] transition-all focus:border-black focus:ring-black focus:outline-0"
					/>
					<button type="submit" class="button-box">Save</button>
				</div>
			</label>
			<label class="flex flex-col">
				<span class="font-semibold">Refresh Token</span>
				<div class="space-x-2">
					<input
						bind:value={refreshToken}
						required
						class="border-black shadow-[5px_5px_#000] transition-all focus:border-black focus:ring-black focus:outline-0"
					/>
					<button type="submit" class="button-box">Save</button>
				</div>
			</label>
		</form>
	</div>
</main>
