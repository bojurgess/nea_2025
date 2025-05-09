<script lang="ts">
	import { formatMetresToKm, iso3166ToCountryName, countryCodeToUnicode } from "$lib/util";
	import type { PageData } from "./$types";
	import { Session } from "$lib/telemetry/session.svelte";

	type Props = { data: PageData };
	let { data }: Props = $props();

	const formatDate = (date: Date | number) => {
		if (typeof date === "number") {
			date = new Date(date);
		}

		const day = date.getDate();
		const month = date.getMonth() + 1; // getMonth() returns 0-indexed, so add 1
		const year = date.getFullYear();

		return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`;
	};

	let { track, lapCount, totalDistance, laps } = $derived(data);

	$inspect(data);
</script>

<div class="flex flex-col gap-8">
	<header class="flex flex-col items-center justify-center text-center">
		<h1 class="flex justify-center">
			{track.trackName}
		</h1>
		<!--
			for some inexplicable reason countryCodeToUnicode is bugged
			and doesnt update on page change
			so its not included in this section (for now) 
		-->
		<h2 class="flex gap-x-2">
			{countryCodeToUnicode(track.country)}{iso3166ToCountryName(track.country, track.id)}
		</h2>
	</header>

	<section class="grid grid-cols-2 place-self-center">
		<h3 class="col-span-2">Track Stats</h3>
		<p><strong>Length:</strong> {formatMetresToKm(track.trackLength)}</p>
		<p><strong>First Grand Prix:</strong> {formatDate(track.firstGp)}</p>
		<p><strong>Real Lap Record:</strong> {Session.formatLapTime(track.realLapRecord)}</p>

		<p><strong>Laps Driven by users:</strong> {lapCount}</p>
		<p><strong>Total Distance driven by users: </strong> {formatMetresToKm(totalDistance)}</p>
	</section>

	{#if laps.length}
		<section>
			<h3>Leaderboard</h3>
			<table class="container-box w-full border-collapse">
				<thead>
					<tr class="[&>*]:border [&>*]:p-2 [&>*]:font-bold">
						<th>#</th>
						<th>User</th>
						<th>Lap Time</th>
						<th>S1</th>
						<th>S2</th>
						<th>S3</th>
						<th class="hidden md:table-cell">Assists</th>
					</tr>
				</thead>
				<tbody>
					{#each laps as lap, i (lap.sessionUid)}
						<tr class="[&>*]:border [&>*]:p-2 [&>*]:text-center">
							<td>
								{i + 1}
							</td>
							<td>
								<a
									class="flex items-center justify-center gap-x-0.5"
									href={`/users/${lap.user.id}`}
								>
									<span>
										{countryCodeToUnicode(lap.user.flag!)}
									</span>
									<span>
										{lap.user.username}
									</span>
								</a>
							</td>
							<td>
								{Session.formatLapTime(lap.lapTimeInMs)}
							</td>
							<td>{Session.formatSectorTime(lap.sector1TimeInMs)}</td>
							<td>{Session.formatSectorTime(lap.sector2TimeInMs)}</td>
							<td>{Session.formatSectorTime(lap.sector3TimeInMs)}</td>
							<td class="hidden md:table-cell">
								{Session.formatAssists(lap)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>
	{/if}
</div>
