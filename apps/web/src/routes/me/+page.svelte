<script lang="ts">
	import type { Telemetry, Track } from "$lib/types";

	const countryCodeToUnicode = (code: string) => {
		return code
			.toUpperCase()
			.replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
	};

	const getSessionCount = (
		lap: Track & { lapTimeInMs: number },
		sessions: Telemetry.Session[],
	) => {
		return sessions.filter((s) => s.trackId === lap.id).length;
	};

	const { data } = $props();
	$inspect(data);
</script>

<section>
	<h1 class="font-bold">Tracks</h1>
	<div class="flex max-w-4xl space-x-4 overflow-scroll border p-4">
		{#each data.bestLaps as lap}
			<article
				class="container-box flex w-full max-w-md min-w-fit flex-col space-y-4 text-center"
			>
				<header class="flex flex-col items-center">
					<h2 class="flex text-lg font-bold">
						{countryCodeToUnicode(lap.country)}
						{lap.gpName}
					</h2>
					<p class="text-xs">{lap.trackName}</p>
				</header>

				<section class="flex justify-between">
					<div class="flex flex-col">
						<h3 class="text-lg">Sessions</h3>
						<p class="font-display text-xl font-black">
							{getSessionCount(lap, data.sessions)}
						</p>
					</div>
					<div class="flex flex-col">
						<h3 class="text-lg">Best Time</h3>
						<p class="font-display text-xl font-black">
							{new Date(lap.lapTimeInMs).toISOString().slice(14, -1)}
						</p>
					</div>
				</section>
			</article>
		{/each}
	</div>
</section>
