<script lang="ts">
	import { enhance } from "$app/forms";
	import type { SessionMetadata } from "$lib/types.js";
	import { onMount } from "svelte";
	import type { ActionData, PageData } from "./$types.js";

	type Props = { data: PageData; form: ActionData };
	let { data, form }: Props = $props();

	let isRegisterForm: boolean = $state(data.isRegisterForm);
	let sessionMetadata: SessionMetadata = $state({});

	const formatDisplayString = (input: string): string => {
		const substrings = input.split(/(?=[A-Z])/);
		return substrings
			.map((str) => {
				return str[0].toUpperCase() + str.slice(1);
			})
			.join(" ");
	};

	const prepareSessionMetadata = async () => {
		try {
			const res = await fetch("https://ipapi.co/json/");
			const json = await res.json();
			sessionMetadata = {
				sessionIp: json.ip,
				sessionCountry: json.country_code,
				sessionCity: json.city,
				sessionRegion: json.region,
				deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
				userAgent: navigator.userAgent,
			};
		} catch (e) {
			console.error(`Failed to gather session metadata: ${e}`);
		}
	};

	onMount(() => {
		prepareSessionMetadata();
	});
</script>

{#snippet formInput(type: "text" | "password", name: string)}
	<label class="flex flex-col">
		<span class="font-semibold">{formatDisplayString(name)}</span>
		<input
			required
			class="border-black transition-all focus:border-black focus:ring-black focus:outline-0"
			{type}
			{name}
		/>
	</label>
{/snippet}

{#snippet authForm(type: "register" | "login")}
	{form?.message}
	<div class="flex h-full w-full justify-center">
		<form
			method="POST"
			action="?/{type}"
			class="flex max-w-xl flex-col items-center space-y-8 p-4"
			use:enhance
		>
			<h1 class="text-2xl font-bold">{formatDisplayString(type)}</h1>
			<div class="flex w-full flex-col">
				{@render formInput("text", "username")}
				{@render formInput("password", "password")}

				{#if type === "register"}
					{@render formInput("password", "confirmPassword")}
				{/if}
			</div>

			<button
				type="submit"
				class="border border-black p-2 px-8 transition-all hover:translate-y-1 focus:translate-y-1"
				>{type[0].toUpperCase() + type.slice(1)}</button
			>

			{#if type === "register"}
				<span
					>Already a user? <button
						onclick={() => (isRegisterForm = false)}
						type="button"
						class="font-semibold underline">Sign in</button
					></span
				>
			{:else}
				<span
					>Not a user? <button
						onclick={() => (isRegisterForm = true)}
						type="button"
						class="font-semibold underline">Register</button
					></span
				>
			{/if}

			<input type="hidden" name="sessionIp" value={sessionMetadata.sessionIp} />
			<input type="hidden" name="sessionCountry" value={sessionMetadata.sessionCountry} />
			<input type="hidden" name="sessionCity" value={sessionMetadata.sessionCity} />
			<input type="hidden" name="sessionRegion" value={sessionMetadata.sessionRegion} />
			<input type="hidden" name="deviceType" value={sessionMetadata.deviceType} />
			<input type="hidden" name="userAgent" value={sessionMetadata.userAgent} />
		</form>
	</div>
{/snippet}

{#if isRegisterForm}
	{@render authForm("register")}
{:else}
	{@render authForm("login")}
{/if}

<style>
	*:focus {
		outline: none;
	}

	form > button[type="submit"] {
		box-shadow: 5px 5px #000;
	}

	form > button[type="submit"]:hover {
		box-shadow: none;
	}

	form > button[type="submit"]:focus {
		box-shadow: none;
	}
</style>
