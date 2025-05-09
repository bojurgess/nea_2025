<script lang="ts">
	import "../app.css";
	import { onMount, type Snippet } from "svelte";
	import type { LayoutData } from "./$types";
	import { Toaster } from "svelte-french-toast";
	import twemoji from "@twemoji/api";
	import Footer from "$lib/components/Footer.svelte";
	import Navbar from "$lib/components/Navbar.svelte";
	import { page } from "$app/state";
	import { afterNavigate } from "$app/navigation";
	let { children, data }: { data: LayoutData; children: Snippet } = $props();
	let { user } = $derived(data);

	function parseEmoji() {
		twemoji.parse(document.body, {
			folder: "svg",
			ext: ".svg",
			/* @ts-ignore */
			callback: function (icon, options: { base: string; size: string; ext: string }) {
				switch (icon) {
					case "1f3ce":
						return false;
				}
				return "".concat(options.base, options.size, "/", icon, options.ext);
			},
		});
	}

	onMount(() => {
		parseEmoji();
	});

	afterNavigate(() => {
		parseEmoji();
	});
</script>

<Toaster />
{#if !page.error && !page.url.pathname.startsWith("/auth")}
	<Navbar {user} />
{/if}

<main class="z-0 flex w-full flex-col justify-center">
	<div class="flex w-full max-w-6xl place-self-center px-2 py-8 sm:justify-center sm:px-4">
		{@render children()}
	</div>
	<Footer />
</main>

<style>
	:global(img.emoji) {
		height: 1em;
		width: 1em;
		margin: 0 0.05em 0 0.1em;
		vertical-align: -0.1em;
	}
</style>
