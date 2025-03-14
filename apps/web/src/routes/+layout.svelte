<script lang="ts">
	import "../app.css";
	import { onMount, type Snippet } from "svelte";
	import type { LayoutData } from "./$types";
	import { Toaster } from "svelte-french-toast";
	import twemoji from "@twemoji/api";
	let { children, data }: { data: LayoutData; children: Snippet } = $props();

	onMount(() => {
		twemoji.parse(document.body, {
			folder: "svg",
			ext: ".svg",
		});
	});
</script>

{#if data.user}
	<span>
		Welcome back, {data.user.username}
		<form action="/auth?/logout" method="POST">
			<button class="font-bold">Log out</button>
		</form>
	</span>
{/if}

<Toaster />

{@render children()}

<style>
	:global(img.emoji) {
		height: 1em;
		width: 1em;
		margin: 0 0.05em 0 0.1em;
		vertical-align: -0.1em;
	}
</style>
