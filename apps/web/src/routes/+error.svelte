<script lang="ts">
	import { page } from "$app/state";

	import { ArrowLeft } from "lucide-svelte";
</script>

<div class="space-y-4 place-self-center">
	<article>
		<h1 class="leading-none">{page.status}</h1>
		<span>{page.error?.message}</span>
	</article>

	<button
		onclick={() => history.back()}
		class="flex items-center gap-1 transition-transform hover:[&>svg]:-translate-x-2"
	>
		<ArrowLeft size={16} class="transition-transform " />
		<span
			class="underline [text-decoration-color:transparent] decoration-1 transition-all hover:[text-decoration-color:inherit]"
			>Take me back!</span
		>
	</button>
</div>
