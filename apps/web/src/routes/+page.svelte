<script lang="ts">
	import type { PageData } from "./$types";

	type Props = { data: PageData };
	let { data }: Props = $props();
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-8">
	<div class="flex flex-col items-center gap-8 py-24">
		<h1 class="text-center">Welcome to F1 Telemetry 🏎️</h1>
		<span class="flex items-center space-x-4">
			{#if data.user}
				<a href="/me" class="button-box">Visit My Profile</a>
			{:else}
				<a href="/auth" class="button-box">Register</a>
				<a href="/auth?form=login" class="button-box">Log in</a>
			{/if}
		</span>
	</div>
	<div id="spacer"></div>
</div>
