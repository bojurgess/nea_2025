<script lang="ts">
	import {
		VisXYContainer,
		VisLine,
		VisAxis,
		VisScatter,
		VisBulletLegend,
		VisTooltip,
	} from "@unovis/svelte";
	import { BulletShape, Scatter } from "@unovis/ts"; // ~1.3x larger
	import type { Database } from "$lib/types";
	import { Session } from "$lib/telemetry/session.svelte";
	import regression from "regression";

	type Props = {
		laps: Omit<Database.Lap, "carTelemetryData" | "sessionUid">[];
	};
	let { laps = $bindable() }: Props = $props();

	let lapTimes = $derived(laps.map((l) => l.lapTimeInMs));
	let minTime = $derived(Math.min(...lapTimes) / 1000);
	let maxTime = $derived(Math.max(...lapTimes) / 1000);

	let tickFormat = (y: number) => {
		return Session.formatLapTime(y);
	};

	const legendItems = [
		{ name: "Lap" },
		{ name: "Line of best fit", color: "#f54242", shape: BulletShape.Line },
	];

	const triggers = {
		[Scatter.selectors.point]: (d: DataRecord) => `
			<span>${Session.formatLapTime(d.y)}</span>
		`,
	};

	type DataRecord = { x: number; y: number };
	const points = regression.linear(laps.map((l) => [l.id, l.lapTimeInMs])).points;
	const lineData: DataRecord[] = points.map((p) => ({ x: p[0], y: p[1] }));
	const scatterData: DataRecord[] = laps.map((l) => ({ x: l.id, y: l.lapTimeInMs }));
</script>

<div id="laps-over-time" class="container-box w-full py-6">
	<h2 class="pb-2 text-center">Laps Over Time</h2>
	<div class="container flex flex-col space-y-2">
		<div class="flex w-full justify-center">
			<VisBulletLegend items={legendItems} />
		</div>
		<VisXYContainer>
			<VisLine data={lineData} color="#f54242" x={(d) => d.x} y={(d) => d.y} />
			<VisScatter data={scatterData} x={(d) => d.x} y={(d) => d.y} />
			<VisAxis type="x" numTicks={laps.length} label="Lap Number" />
			<VisAxis type="y" label="Lap Time" {tickFormat} />
			<VisTooltip {triggers} followCursor={false} />
		</VisXYContainer>
	</div>
</div>

<style>
	.container {
		--vis-font-family: "Inter Variable", var(--font-sans);
	}
</style>
