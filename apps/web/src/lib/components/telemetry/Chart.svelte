<script lang="ts">
	import type { Snippet } from "svelte";

	type Props = { title: string; children: Snippet };
	let { title, children }: Props = $props();
</script>

<div class="container-box flex w-full flex-col items-start py-6">
	<h2 class="text-center">{title}</h2>
	{@render children()}
</div>
