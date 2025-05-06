<script lang="ts">
	import { beforeNavigate, goto } from "$app/navigation";
	import type { User } from "$lib/server/auth";
	import { ChevronDown, Menu, X } from "lucide-svelte";
	import { sineOut } from "svelte/easing";
	import { fade, fly } from "svelte/transition";
	import { Collapsible } from "melt/builders";
	import { tracks } from "$lib/tracks";
	import { iso3166ToCountryName } from "$lib/util";
	import { onMount } from "svelte";
	import { countryCodeToUnicode } from "$lib/util";

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Escape") {
			profileCollapsible.open = false;
			isSidebarOpen = false;
		}
	};

	$effect(() => {
		if (!window) return;
		window.addEventListener("keydown", handleKeyDown);
	});

	type Props = { user: User | null };
	let { user }: Props = $props();

	beforeNavigate(() => {
		profileCollapsible.open = false;
		tracksCollapsibleIsOpen = false;
		isSidebarOpen = false;
	});

	let tracksCollapsibleIsOpen = $state(false);

	const profileCollapsible = new Collapsible();
	const tracksCollapsible = new Collapsible({
		open: () => tracksCollapsibleIsOpen,
	});

	let closeTracksCollapsibleTimeout: number = $state(0);

	let mouseX = $state(0);
	let mouseY = $state(0);

	onMount(() => {
		window.addEventListener("mousemove", (e) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
		});
	});

	// we have to have dedicated functions for handling the opening and closing of the tracks collapsible due to it opening on hover
	function openTracksCollapsible(e: MouseEvent) {
		clearTimeout(closeTracksCollapsibleTimeout);
		tracksCollapsibleIsOpen = true;
	}
	// set a timeout that will close the collapsible after 500ms if the user isnt in the collapsible content area
	function closeTracksCollapsible(e: MouseEvent) {
		closeTracksCollapsibleTimeout = window.setTimeout(() => {
			const collapsibleContent = document.querySelector("#tracks-collapsible-content");

			if (collapsibleContent) {
				const rect = collapsibleContent.getBoundingClientRect();
				const inside =
					mouseX >= rect.left &&
					mouseX <= rect.right &&
					mouseY >= rect.top &&
					mouseY <= rect.bottom;

				if (!inside) {
					tracksCollapsibleIsOpen = false;
				}
			} else {
				tracksCollapsibleIsOpen = false;
			}
		}, 500);
	}

	let isSidebarOpen = $state(false);
</script>

<nav class="sticky top-0 flex h-24 w-full justify-center border-b bg-white">
	<div id="nav-desktop" class="hidden max-w-6xl grow items-center justify-between px-8 md:flex">
		<section>
			<a
				href="/"
				class="font-display hidden items-center text-xl font-bold font-stretch-200% no-underline md:flex"
				>Telemetry 🏎️</a
			>
		</section>
		<span class="flex items-center space-x-4">
			<section class="flex space-x-6">
				<a
					href="/users"
					class="font-display flex items-center text-xl font-bold font-stretch-200%"
				>
					Users
				</a>
				<div id="tracks-collapsible" class="z-10 flex flex-col">
					<button
						role="link"
						class="font-display flex items-center gap-1 text-xl font-bold font-stretch-200% decoration-1 transition-all hover:underline"
						{...tracksCollapsible.trigger}
						onclick={() => goto("/tracks")}
						onmouseenter={(e) => openTracksCollapsible(e)}
						onmouseleave={(e) => closeTracksCollapsible(e)}
					>
						<span>Tracks</span>
						{#if tracksCollapsible.open}
							<X size={16} />
						{:else}
							<ChevronDown size={16} />
						{/if}
					</button>

					{#if tracksCollapsible.open}
						<div
							id="tracks-collapsible-content"
							class="absolute top-24 left-0 flex w-full justify-center"
						>
							<!-- we add a mouseleave listener here as well to handle closing the collapsible when we leave the content area (slightly confusing) -->
							<div
								role="region"
								onmouseleave={() => (tracksCollapsibleIsOpen = false)}
								in:fade={{ duration: 200, easing: sineOut }}
								out:fade={{ duration: 200, easing: sineOut }}
								class="offset-shadow z-20 grid w-fit grid-cols-4 gap-x-8 gap-y-2 bg-white p-4 outline"
								{...tracksCollapsible.content}
							>
								{#each tracks as track}
									<a class="line-clamp-1" href={`/tracks/${track.id}`}>
										{countryCodeToUnicode(track.country)}
										{iso3166ToCountryName(track.country, track.id)}
									</a>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</section>
			<section class="flex h-full items-center space-x-4">
				{#if user}
					<div class="z-10 flex flex-col">
						<button
							{...profileCollapsible.trigger}
							aria-label="Toggle"
							class="button-box flex items-center gap-1"
						>
							<span>My Profile</span>
							{#if profileCollapsible.open}
								<X size={16} />
							{:else}
								<ChevronDown size={16} />
							{/if}
						</button>

						{#if profileCollapsible.open}
							<div
								in:fade={{ duration: 200, easing: sineOut }}
								out:fade={{ duration: 200, easing: sineOut }}
								class="offset-shadow absolute top-24 right-8 z-20 flex w-48 flex-col gap-1 bg-white p-4 outline"
								{...profileCollapsible.content}
							>
								<a href="/me">Profile</a>
								<hr class="w-full" />
								<a href="/me/settings">Settings</a>
								<hr class="w-full" />
								<form action="/auth?/logout" method="POST">
									<button
										class="text-red-500 underline [text-decoration-color:transparent] decoration-1 transition-all hover:[text-decoration-color:inherit]"
										>Log out</button
									>
								</form>
							</div>
						{/if}
					</div>
				{:else}
					<a href="/auth" class="button-box">Sign Up</a>
					<a href="/auth?form=login" class="button-box">Log In</a>
				{/if}
			</section>
		</span>
	</div>

	<div id="nav-mobile" class="flex w-full items-center justify-between px-8 md:hidden">
		<a href="/" class="flex text-xl no-underline md:hidden"> 🏎️ </a>
		<button onclick={() => (isSidebarOpen = !isSidebarOpen)}><Menu /></button>
	</div>
</nav>

{#if isSidebarOpen}
	<!-- ignoring here because the key handler is defined window-wide (only has an effect when sidebar is open) -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		aria-label="Close sidebar"
		tabindex={0}
		role="button"
		onclick={() => (isSidebarOpen = false)}
		transition:fade={{ duration: 200 }}
		class="fixed inset-0 bg-black/65 backdrop-blur-md"
	></div>
	<div
		in:fly={{ x: 500, duration: 200, easing: sineOut }}
		out:fly={{ x: 500, duration: 200, easing: sineOut }}
		class="fixed top-0 left-16 z-20 h-full w-full border-l bg-white py-12"
	>
		<button onclick={() => (isSidebarOpen = false)}>
			<X class="absolute top-4 left-4" />
		</button>
		<div class="flex h-full w-full flex-col items-center gap-6 pr-16">
			<h1 class="w-full text-center">Telemetry 🏎️</h1>
			<div class="w-full px-8">
				<h2>Navigation:</h2>
				<menu class="text-left">
					<li><a href="/">Home</a></li>
					<li><a href="/tracks">Tracks</a></li>
					<li><a href="/users">Users</a></li>
				</menu>
			</div>
			{#if user}
				<div class="w-full px-8">
					<h2>Account:</h2>
					<menu class="text-left">
						<li><a href="/me">Profile</a></li>
						<li><a href="/me/settings">Settings</a></li>
						<li>
							<form action="/auth?/logout" method="POST">
								<button
									class="text-red-500 underline [text-decoration-color:transparent] decoration-1 transition-all hover:[text-decoration-color:inherit]"
									>Log out</button
								>
							</form>
						</li>
					</menu>
				</div>
			{:else}
				<div class="w-full px-8">
					<h2>Account:</h2>
					<menu class="text-left">
						<li><a href="/auth?form=login">Log in</a></li>
						<li><a href="/auth">Sign up</a></li>
					</menu>
				</div>
			{/if}
		</div>
	</div>
{/if}
