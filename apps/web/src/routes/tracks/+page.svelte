<script lang="ts">
	import { tracks } from "$lib/tracks";
	import { countryCodeToUnicode } from "$lib/util";
	import type { PageData } from "./$types";

	type Props = { data: PageData };
	let { data }: Props = $props();

	$inspect(data);
</script>

<section class="grid grid-cols-1 gap-6 place-self-center md:grid-cols-2 lg:grid-cols-3">
	{#each tracks as track}
		<a href={`/track/${track.id}`} class="no-underline">
			<article class="button-box flex w-xs flex-col justify-around gap-6">
				<header class="flex flex-col items-center justify-center text-center">
					<h2 class="flex text-xl">
						{countryCodeToUnicode(track.country)}
						{track.gpName}
					</h2>
					<h3 class="flex text-sm font-normal">
						{track.trackName}
					</h3>
				</header>

				<section>
					<div class="flex items-center gap-2">
						<h3 class="text-lg">Total Distance:</h3>
						<p class="font-display text-lg font-black">
							{((data.trackDistances.get(track.id) ?? 0) / 1000).toFixed(2)}km
						</p>
					</div>

					<div class="flex items-center gap-2">
						<h3 class="text-lg">Laps Driven:</h3>
						<p class="font-display text-lg font-black">
							{data.lapCounts.get(track.id) ?? 0}
						</p>
					</div>
				</section>
			</article>
		</a>
	{/each}
</section>
