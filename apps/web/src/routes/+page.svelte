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
	<div class="flex border-t p-8 pb-0">
		Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam ex libero, ullamcorper id
		scelerisque a, congue non nisi. Nunc malesuada mi id porta tristique. Suspendisse elit
		lacus, maximus in fringilla et, aliquet vitae dui. Etiam quam turpis, tempus eget sodales
		quis, laoreet sed massa. Maecenas porttitor ultricies urna, nec aliquet arcu eleifend eu.
		Mauris at arcu dignissim, porttitor erat vitae, euismod urna. Curabitur molestie sapien
		pellentesque auctor eleifend. Nam non quam lorem. Nulla facilisis elit vitae facilisis
		tempor. Maecenas tempor tincidunt pharetra. Sed odio nibh, posuere a pellentesque vitae,
		consequat nec tellus. Nunc interdum lacinia fringilla. Vivamus dui metus, pharetra sed
		sagittis eget, tristique aliquet tortor. Praesent dapibus finibus sagittis. Suspendisse
		elementum lorem a nisl efficitur lobortis scelerisque id neque. Aenean vitae enim ut sapien
		rhoncus euismod sed ac nisl. Nulla ac nulla nec ligula viverra malesuada ut nec eros. Fusce
		interdum orci nec est faucibus, eu aliquam ante egestas.
	</div>
</div>
