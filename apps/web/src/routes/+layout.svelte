<script lang="ts">
	import "../app.css";
	import type { Snippet } from "svelte";
	import type { LayoutData } from "./$types";
	let { children, data }: { data: LayoutData; children: Snippet } = $props();
</script>

{#if data.user}
	<p>Welcome back, {data.user.username}!</p>
	<form action="/auth?/logout" method="POST">
		<button type="submit">Logout</button>
	</form>
{/if}

{@render children()}
