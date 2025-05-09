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
	import SteeringTrace from "$lib/components/telemetry/SteeringTrace.svelte";
	import GearTrace from "$lib/components/telemetry/GearTrace.svelte";

	const { data } = $props();

	let session = $state(new Session(data.session));
	let user = $state(data.user);
	let laps = $derived(session.laps);
	let track = $derived(session.track);

	let currentTelemetrySelection: string | undefined = $state(
		session.laps.length
			? `Lap ${session.laps.toSorted((a, b) => a.lapTimeInMs - b.lapTimeInMs)[0].id}`
			: undefined,
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
</script>

<article class="w-full space-y-8">
	<section>
		<h1>Time Trial</h1>
		<h2 class="text-xl">
			{countryCodeToUnicode(track.country)}
			{track.trackName} | {Session.formatDate(session.endDate) ?? session.state}
		</h2>
	</section>

	<section class="grid grid-cols-2 space-x-1 [&>*]:text-lg">
		<h3 class="flex space-x-2">
			<span>User:</span>
			<a href={`/users/${user.id}`} class="font-normal">
				{#if user.flag}{countryCodeToUnicode(user.flag)}{/if}
				{user.username}
			</a>
		</h3>
		<h3>Theoretical best: <span class="font-normal">{session.theoreticalBestString}</span></h3>
		<h3>Average lap: <span class="font-normal">{session.averageLapString}</span></h3>
		<h3>Fastest lap: <span class="font-normal">{session.bestLapString}</span></h3>
	</section>

	<section class="space-y-2">
		<h3>Lap Times</h3>
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
							<td class="w-fit">
								{#if lap.lapInvalid}
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
			<span class="grid gap-4 place-self-start md:grid-cols-2 md:place-self-end">
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
				{#if telemetry[1]}
					<SpeedTrace
						lap={{
							...laps.find((l) => l.id === telemetry[0]!.id)!,
							carTelemetryData: telemetry[0]!.carTelemetryData,
						}}
						comparison={telemetry[1]
							? {
									...laps.find((l) => l.id === telemetry[1]!.id)!,
									carTelemetryData: telemetry[1].carTelemetryData,
								}
							: undefined}
					/>
				{:else}
					<SpeedTrace
						lap={{
							...laps.find((l) => l.id === telemetry[0]!.id)!,
							carTelemetryData: telemetry[0]!.carTelemetryData,
						}}
					/>
				{/if}

				{#if telemetry[1]}
					<ThrottleTrace
						lap={{
							...laps.find((l) => l.id === telemetry[0]!.id)!,
							carTelemetryData: telemetry[0]!.carTelemetryData,
						}}
						comparison={telemetry[1]
							? {
									...laps.find((l) => l.id === telemetry[1]!.id)!,
									carTelemetryData: telemetry[1].carTelemetryData,
								}
							: undefined}
					/>
				{:else}
					<ThrottleTrace
						lap={{
							...laps.find((l) => l.id === telemetry[0]!.id)!,
							carTelemetryData: telemetry[0]!.carTelemetryData,
						}}
					/>
				{/if}

				{#if telemetry[1]}
					<BrakeTrace
						lap={{
							...laps.find((l) => l.id === telemetry[0]!.id)!,
							carTelemetryData: telemetry[0]!.carTelemetryData,
						}}
						comparison={telemetry[1]
							? {
									...laps.find((l) => l.id === telemetry[1]!.id)!,
									carTelemetryData: telemetry[1].carTelemetryData,
								}
							: undefined}
					/>
				{:else}
					<BrakeTrace
						lap={{
							...laps.find((l) => l.id === telemetry[0]!.id)!,
							carTelemetryData: telemetry[0]!.carTelemetryData,
						}}
					/>
				{/if}

				{#if telemetry[1]}
					<GearTrace
						lap={{
							...laps.find((l) => l.id === telemetry[0]!.id)!,
							carTelemetryData: telemetry[0]!.carTelemetryData,
						}}
						comparison={telemetry[1]
							? {
									...laps.find((l) => l.id === telemetry[1]!.id)!,
									carTelemetryData: telemetry[1].carTelemetryData,
								}
							: undefined}
					/>
				{:else}
					<GearTrace
						lap={{
							...laps.find((l) => l.id === telemetry[0]!.id)!,
							carTelemetryData: telemetry[0]!.carTelemetryData,
						}}
					/>
				{/if}

				{#if telemetry[1]}
					<SteeringTrace
						lap={{
							...laps.find((l) => l.id === telemetry[0]!.id)!,
							carTelemetryData: telemetry[0]!.carTelemetryData,
						}}
						comparison={telemetry[1]
							? {
									...laps.find((l) => l.id === telemetry[1]!.id)!,
									carTelemetryData: telemetry[1].carTelemetryData,
								}
							: undefined}
					/>
				{:else}
					<SteeringTrace
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
</article>
