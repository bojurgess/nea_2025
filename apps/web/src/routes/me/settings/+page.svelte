<script lang="ts">
	import { applyAction, enhance } from "$app/forms";
	import { onMount } from "svelte";
	import type { PageProps } from "./$types";
	import toast from "svelte-french-toast";

	const { data, form }: PageProps & { form?: { refreshToken: string } } = $props();

	let hasExistingRefreshToken: boolean = $state(data.hasRefreshToken);
	let formValue: string | null = $state(
		data.hasRefreshToken ? Array.from({ length: 32 }).fill("#").toString() : null,
	);
	let hasSubmittedForm = $state(false);

	let promptText = $derived(hasExistingRefreshToken ? "Rotate Token" : "Generate Token");

	let modal: HTMLDialogElement | undefined = $state();
	let isOpen: boolean = $state(false);

	onMount(() => {
		document.onkeyup = (ev) => {
			if (ev.key === "Escape") isOpen = false;
			return;
		};
	});

	let modalText = $derived(
		hasExistingRefreshToken
			? "This will refresh your existing token. Your current token will no longer work in the desktop app. <strong>CAUTION: This token can only be viewed once.</strong>"
			: "This will generate a new token that you can use in the desktop app. <strong>CAUTION: This token can only be viewed once.</strong>",
	);
</script>

<div
	style="opacity: {isOpen ? 100 : 0};"
	class="pointer-events-none fixed inset-0 z-[999] grid h-screen w-screen place-items-center bg-black/60 backdrop-blur-sm transition-opacity duration-300"
>
	<dialog
		bind:this={modal}
		class="pointer-events-auto absolute top-[50%] left-[50%] max-w-md translate-x-[-50%] translate-y-[-50%] flex-col space-y-8 bg-white p-8 shadow-[5px_5px_#000] open:flex"
	>
		<h3>{promptText}</h3>
		<span>{@html modalText}</span>
		<span class="space-y-3 space-x-2">
			<button
				type="button"
				class="button-box"
				onclick={() => {
					modal?.close();
					isOpen = false;
				}}>Cancel</button
			>
			<button
				type="submit"
				form="refresh_token_form"
				class="button-box border-amber-700 text-amber-700 shadow-[5px_5px_var(--color-amber-700)] transition-all hover:translate-y-1 hover:shadow-none focus:outline-hidden"
				onclick={() => {
					modal?.close();
					isOpen = false;
				}}>Continue</button
			>
		</span>
	</dialog>
</div>

<div class="flex h-screen w-full items-center justify-center">
	<form
		id="refresh_token_form"
		method="POST"
		action="/auth?/generateRefreshToken"
		use:enhance={() => {
			return async ({ result }) => {
				await applyAction(result);
				hasSubmittedForm = true;
				formValue = form!.refreshToken;
				hasExistingRefreshToken = true;
				navigator.clipboard.writeText(form!.refreshToken);
				toast.success("Copied token to clipboard.", {
					className:
						"!border !border-black !shadow-[5px_5px_#000] !transition-all !rounded-none",
					iconTheme: {
						primary: "#000",
						secondary: "#fff",
					},
				});
			};
		}}
	>
		<label class="flex flex-col">
			<h2 class="font-semibold">Refresh Token:</h2>
			<span class="flex flex-nowrap space-x-3">
				<input
					value={formValue}
					required
					class="h-full border-black shadow-[5px_5px_#000] transition-all focus:border-black focus:ring-black focus:outline-0 disabled:cursor-not-allowed"
					type={formValue?.startsWith("#") ? "password" : "text"}
					disabled={true}
				/>
				<button
					type="button"
					onclick={() => {
						modal?.showModal();
						isOpen = true;
					}}
					class="button-box">{promptText}</button
				>
			</span>
		</label>
	</form>
</div>
