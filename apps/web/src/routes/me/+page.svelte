<script lang="ts">
	import type { Database } from "$lib/types";

	const countryCodeToUnicode = (code: string) => {
		return code
			.toUpperCase()
			.replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
	};

	const getSessionCount = (
		lap: { lapTimeInMs: number; track: Database.Track },
		sessions: ({
			totalLaps: number;
			startDate: Date;
			endDate: Date;
			assists: number;
			weather: number;
		} & { track: Database.Track })[],
	) => {
		return sessions.filter((s) => s.track.id === lap.track.id).length;
	};

	const formatLapTime = (ms: number) => {
		const minutes = Math.floor(ms / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		const millis = Math.floor(ms % 1000);

		return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${millis.toString().padStart(3, "0")}`;
	};

	const calculateAvgLapTime = (laps: Database.Lap[]) => {
		if (laps.length === 0) return;

		const times = laps.map((l) => l.lapTimeInMs);
		let sum = 0;

		times.forEach((t) => (sum += t));
		return sum / times.length;
	};

	const calculateBestLapTime = (laps: Database.Lap[]) => {
		if (laps.length === 0) return;

		const times = laps.map((l) => l.lapTimeInMs);
		return Math.min(...times);
	};

	const formatDate = (date?: Date) => {
		if (!date) return "ONGOING";

		const day = date.getDay();
		const month = date.getMonth();
		const year = date.getFullYear();

		const hours = date.getHours();
		const minutes = date.getMinutes();

		return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`;
	};

	const { data } = $props();
	$inspect(data);
</script>

<section>
	<h1 class="font-bold">Tracks</h1>
	<div class="container-box flex w-full max-w-4xl space-x-4 overflow-scroll p-4">
		{#if data.bestLaps.length === 0}
			<span>No data found! Start driving to collect data.</span>
		{:else}
			{#each data.bestLaps as lap}
				<article
					class="container-box flex w-full max-w-md min-w-fit flex-col space-y-4 text-center"
				>
					<header class="flex flex-col items-center justify-center">
						<h2 class="flex text-lg font-bold">
							{countryCodeToUnicode(lap.track.country)}
							{lap.track.gpName}
						</h2>
						<p class="text-xs">{lap.track.trackName}</p>
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
								{formatLapTime(lap.lapTimeInMs)}
							</p>
						</div>
					</section>
				</article>
			{/each}
		{/if}
	</div>
</section>

<section>
	<h1 class="font-bold">Sessions</h1>
	{#if data.sessions.length === 0}
		<span class="container-box flex p-4">No data found! Start driving to collect data.</span>
	{:else}
		<article class="container-box grid max-w-4xl grid-cols-5">
			<span class="font-bold">Track</span>
			<span class="font-bold">Date</span>
			<span class="font-bold">Laps</span>
			<span class="font-bold">Fastest Lap</span>
			<span class="font-bold">Avg. Lap Time</span>
			{#each data.sessions as session}
				<span>{session.track.trackName}</span>
				<span>{formatDate(session.endDate)}</span>
				<span>{session.totalLaps}</span>
				<span>{formatLapTime(calculateBestLapTime(session.laps)!)}</span>
				<span>{formatLapTime(calculateAvgLapTime(session.laps)!)}</span>
			{/each}
		</article>
	{/if}
</section>
