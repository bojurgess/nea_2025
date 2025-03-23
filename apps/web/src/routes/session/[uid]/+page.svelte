<script lang="ts">
	import { Session } from "$lib/telemetry/session.svelte.js";
	import { countryCodeToUnicode } from "$lib/util.js";
	import { Select } from "@repo/components";

	import { LayerCake, ScaledSvg, Html } from "layercake";
	import { Line, Area, AxisX, AxisY } from "@repo/components";

	const { data } = $props();

	let session = $state(new Session(data.session));
	let user = $state(data.user);
	let laps = $derived(session.laps);
	let track = $derived(session.track);

	let selectedTelemetryLap: string | undefined = $state(`Lap ${data.firstTelemetryLap.id}`);
	let selectOptions = $derived(laps.map((l) => `Lap ${l.id}`));

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
		selectedTelemetryLap = v;
	}

	$inspect(data);
	$inspect(selectOptions);
	$inspect(
		Object.entries(data.firstTelemetryLap.carTelemetryData).map(([_, value]) => {
			return value.brake;
		}),
	);
</script>

<main class="mx-auto flex h-full max-w-4xl flex-col justify-center space-y-8">
	<section>
		<h1>Time Trial</h1>
		<h2 class="text-xl">
			{countryCodeToUnicode(track.country)}
			{track.trackName} | {Session.formatDate(session.endDate) ?? session.state}
		</h2>
	</section>

	<section class="grid grid-cols-2 space-x-2 [&>*]:text-lg">
		<h3>
			<strong class="pr-1">User:</strong>
			{#if user.flag}{countryCodeToUnicode(user.flag)}{/if}
			{user.username}
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

	<section class="flex flex-col space-y-2">
		<h1>Telemetry Data</h1>
		{#if session.state === "Ongoing"}
			<div class="">
				Detailed telemetry data for this session is still being collected. come back later
				when the session is finished.
			</div>
		{:else}
			<div class="place-self-end">
				<Select
					title="Lap"
					bind:value={selectedTelemetryLap}
					onChange={onSelectedLapChange}
					options={selectOptions}
				/>
			</div>

			<div id="brake-chart" class="h-[250px] w-full">
				<LayerCake
					ssr
					percentRange
					padding={{ top: 25, right: 10, bottom: 20, left: 25 }}
					x="frame"
					y={(d: Record<string, any>) => d["brake"]}
					xDomain={[
						0,
						Math.max(
							...Object.entries(data.firstTelemetryLap.carTelemetryData).map(
								([frame, _]) => parseInt(frame),
							),
						),
					]}
					yDomain={[0, 100]}
					data={Object.entries(data.firstTelemetryLap.carTelemetryData).map(
						([frame, telemetry]) => {
							return { frame: frame, brake: telemetry.brake * 100 };
						},
					)}
				>
					<Html>
						<AxisX />
						<AxisY ticks={4} />
					</Html>
					<ScaledSvg>
						<Line stroke="#b51414" />
					</ScaledSvg>
				</LayerCake>
			</div>
		{/if}
	</section>
</main>
