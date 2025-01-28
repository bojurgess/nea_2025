<script lang="ts">
	import "../app.css";
	import type { Snippet } from "svelte";
	import type { LayoutData } from "./$types";
	import { Toaster } from "svelte-french-toast";
	let { children, data }: { data: LayoutData; children: Snippet } = $props();
</script>

{#if data.user}
	<div class="fixed top-0 flex h-18 w-full items-center justify-end p-4 shadow-[0px_5px_#000]">
		<button>
			<img
				src="/avatar_placeholder.png"
				alt="avatar"
				class="h-12 w-12 rounded-full"
				width="48px"
			/>
		</button>
	</div>
{/if}

<Toaster />

{@render children()}
