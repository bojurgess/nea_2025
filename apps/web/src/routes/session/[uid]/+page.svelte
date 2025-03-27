<script lang="ts">
	import { Session } from "$lib/telemetry/session.svelte.js";
	import { countryCodeToUnicode } from "$lib/util.js";
	import { Select } from "@repo/components";

	import BrakeTrace from "$lib/components/telemetry/BrakeTrace.svelte";
	import LapsOverTime from "$lib/components/telemetry/LapsOverTime.svelte";
	import ThrottleTrace from "$lib/components/telemetry/ThrottleTrace.svelte";
	import SpeedTrace from "$lib/components/telemetry/SpeedTrace.svelte";
	import type { Telemetry } from "$lib/types.js";
	import { browser } from "$app/environment";

	const { data } = $props();

	let session = $state(new Session(data.session));
	let user = $state(data.user);
	let laps = $derived(session.laps);
	let track = $derived(session.track);

	let currentTelemetrySelection: string | undefined = $state(
		`Lap ${session.laps.toSorted((a, b) => a.lapTimeInMs - b.lapTimeInMs)[0].id}`,
	);
	let currentTelemetryComparisonSelection: string | undefined = $state();
	let currentTelemetryData = $derived(fetchTelemetryData(currentTelemetrySelection));
	let currentTelemetryComparisonData = $derived(
		fetchTelemetryData(currentTelemetryComparisonSelection),
	);
	let telemetrySelectOptions: [string, string][] = $derived(
		laps.map((l) => [`Lap ${l.id}`, Session.formatLapTime(l.lapTimeInMs)]),
	);
	let comparisonSelectOptions: [string, string][] = $derived(
		telemetrySelectOptions.filter((o) => o[0] != currentTelemetrySelection),
	);

	let telemetryData = $derived(
		Promise.all([currentTelemetryData, currentTelemetryComparisonData]),
	);

	async function fetchTelemetryData(
		selection: string | undefined,
	): Promise<
		{ id: number; carTelemetryData: Record<string, Telemetry.CarTelemetryData> } | undefined
	> {
		const id = extractIdFromSelection(selection);
		if (!browser) return;
		if (isNaN(id)) return undefined;
		const res = await fetch(`/api/session/${session.uid}/lap/${id}/telemetry`);

		if (!res.ok) {
			throw new Error(res.statusText);
		}

		const json: {
			id: number;
			carTelemetryData: Record<string, Telemetry.CarTelemetryData>;
		} = await res.json();

		return json;
	}

	function extractIdFromSelection(selection: string | undefined): number {
		if (!selection) return NaN;
		const id = parseInt(selection.slice(4, selection.length));
		console.log(id);
		return id;
	}

	function lapNumberClass(id: number) {
		return session.laps[id - 1].lapTimeInMs === session.bestLapMs
			? "bg-violet-500"
			: "bg-white";
	}

	function sectorClass(sector: 1 | 2 | 3, ms: number) {
		switch (sector) {
			case 1:
				return ms === session.bestS1Ms ? "bg-violet-500" : "bg-white";
			case 2:
				return ms === session.bestS2Ms ? "bg-violet-500" : "bg-white";
			case 3:
				return ms === session.bestS3Ms ? "bg-violet-500" : "bg-white";
		}
	}

	function lapClass(ms: number) {
		return ms === session.bestLapMs ? "bg-violet-500" : "bg-white";
	}

	function onSelectedLapChange(v: string | undefined): void {
		currentTelemetrySelection = v;
	}

	function onComparisonLapChange(v: string | undefined): void {
		currentTelemetryComparisonSelection = v;
	}

	$inspect(data);
</script>

<main class="mx-auto flex h-full max-w-4xl flex-col space-y-8 py-8">
	<section>
		<h1>Time Trial</h1>
		<h2 class="text-xl">
			{countryCodeToUnicode(track.country)}
			{track.trackName} | {Session.formatDate(session.endDate) ?? session.state}
		</h2>
	</section>

	<section class="grid grid-cols-2 space-x-2 [&>*]:text-lg">
		<h3 class="flex space-x-1">
			<strong>User:</strong>
			<a href={`/users/${user.id}`} class="flex items-center"
				>{#if user.flag}{countryCodeToUnicode(user.flag)}{/if}
				{user.username}
			</a>
		</h3>
		<h3><strong>Theoretical best:</strong> {session.theoreticalBestString}</h3>
		<h3><strong>Average lap:</strong> {session.averageLapString}</h3>
		<h3><strong>Fastest lap:</strong> {session.bestLapString}</h3>
	</section>

	<section class="space-y-2">
		<h1>Lap Times</h1>
		<div class="w-full overflow-x-scroll pr-2 pb-2">
			<table class="container-box w-full border-collapse">
				<thead>
					<tr class="[&>*]:border [&>*]:p-2 [&>*]:font-bold">
						<th>#</th>
						<th>Lap Time</th>
						<th>S1</th>
						<th>S2</th>
						<th>S3</th>
						<th>Invalid?<sup>*</sup></th>
					</tr>
				</thead>
				<tbody>
					{#each laps as lap (lap.id)}
						<tr class="[&>*]:border [&>*]:p-2">
							<td class={lapNumberClass(lap.id)}>
								{lap.id}
							</td>
							<td class={lapClass(lap.lapTimeInMs)}>
								{Session.formatLapTime(lap.lapTimeInMs)}
							</td>
							<td class={sectorClass(1, lap.sector1TimeInMs)}
								>{Session.formatSectorTime(lap.sector1TimeInMs)}</td
							>
							<td class={sectorClass(2, lap.sector2TimeInMs)}
								>{Session.formatSectorTime(lap.sector2TimeInMs)}</td
							>
							<td class={sectorClass(3, lap.sector3TimeInMs)}
								>{Session.formatSectorTime(lap.sector3TimeInMs)}</td
							>
							<td>
								{#if lap.lapValidBitFlags !== 15}
									<img
										class="mx-auto rounded-md"
										width="32px"
										src="/black_white_flag.svg"
										alt="Invalid lap flag"
									/>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<span class="text-center text-xs"
			><sup>*</sup>Invalid laps are not counted in any calculations.</span
		>
	</section>

	<section class="flex flex-col space-y-8">
		<h1>Telemetry Data</h1>
		{#if session.state === "Ongoing"}
			<div class="">
				Detailed telemetry data for this session is still being collected. come back later
				when the session is finished.
			</div>
		{:else}
			<span class="flex space-x-4 place-self-end">
				<div class="place-self-end">
					<Select
						title="Lap"
						bind:value={currentTelemetrySelection}
						onChange={onSelectedLapChange}
						options={telemetrySelectOptions}
					/>
				</div>

				<div class="place-self-end">
					<Select
						title="Lap to compare to"
						bind:value={currentTelemetryComparisonSelection}
						onChange={onComparisonLapChange}
						options={comparisonSelectOptions}
					/>
				</div>
			</span>

			{#if session.laps.length > 1}
				<LapsOverTime {laps} />
			{/if}

			<!-- Asserting non-null on lap telemetry values because the id selection can never be NaN, any error on lap telemetry will throw instead -->
			{#await telemetryData then telemetry}
				<SpeedTrace
					lap={{
						...laps.find((l) => l.id === telemetry[0]!.id)!,
						carTelemetryData: telemetry[0]!.carTelemetryData,
					}}
				/>

				<ThrottleTrace
					lap={{
						...laps.find((l) => l.id === telemetry[0]!.id)!,
						carTelemetryData: telemetry[0]!.carTelemetryData,
					}}
				/>

				{#if telemetry[1]}
					<BrakeTrace
						lap={{
							...laps.find((l) => l.id === telemetry[0]!.id)!,
							carTelemetryData: telemetry[0]!.carTelemetryData,
						}}
						comparison={{
							...laps.find((l) => l.id === telemetry[1]!.id)!,
							carTelemetryData: telemetry[1]!.carTelemetryData,
						}}
					/>
				{:else}
					<BrakeTrace
						lap={{
							...laps.find((l) => l.id === telemetry[0]!.id)!,
							carTelemetryData: telemetry[0]!.carTelemetryData,
						}}
					/>
				{/if}
			{:catch reason}
				<span
					>An error was encountered while fetching telemetry data :( Reason: {reason}</span
				>
			{/await}
		{/if}
	</section>
</main>
