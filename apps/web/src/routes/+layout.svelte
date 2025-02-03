<script lang="ts">
	import "../app.css";
	import type { Snippet } from "svelte";
	import type { LayoutData } from "./$types";
	import { Toaster } from "svelte-french-toast";
	let { children, data }: { data: LayoutData; children: Snippet } = $props();
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
