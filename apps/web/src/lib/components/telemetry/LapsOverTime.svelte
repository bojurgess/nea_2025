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
	import Chart from "./Chart.svelte";

	type Props = {
		laps: Omit<Database.Lap, "carTelemetryData" | "sessionUid">[];
	};
	let { laps = $bindable() }: Props = $props();

	let lapTimes = $derived(laps.map((l) => l.lapTimeInMs));

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

	let bestFit = $derived.by(() => {
		// map data to a form that regression methods expect
		const data: [number, number][] = laps.map((l) => [l.id, l.lapTimeInMs]);
		// collate all regressions
		const allRegressions = [
			regression.linear(data),
			regression.exponential(data),
			regression.logarithmic(data),
			regression.power(data),
		];
		// collate all r2 scores and find the highest one, indicating which regression best fits the data
		const r2Scores = allRegressions.map((r) => r.r2);
		const mostCorrelatedRegression = r2Scores.sort().reverse()[0];

		// find the regression with the same r2 as we just calculated
		return allRegressions.find((r) => r.r2 === mostCorrelatedRegression)!;
	});

	type DataRecord = { x: number; y: number };
	const lineData: DataRecord[] = $derived(
		bestFit.points.map((p) => ({ x: p[0], y: p[1] })).sort((a, b) => a.x - b.x),
	);

	$inspect(lineData);

	const scatterData: DataRecord[] = laps.map((l) => ({ x: l.id, y: l.lapTimeInMs }));
</script>

<Chart title="Laps Over Time">
	<div class="container">
		<VisBulletLegend items={legendItems} />
	</div>
	<div class="container">
		<VisXYContainer>
			<VisLine data={lineData} color="#f54242" x={(d) => d.x} y={(d) => d.y} />
			<VisScatter data={scatterData} x={(d) => d.x} y={(d) => d.y} />
			<VisAxis type="x" numTicks={laps.length} label="Lap Number" />
			<VisAxis type="y" label="Lap Time" {tickFormat} />
			<VisTooltip {triggers} followCursor={false} />
		</VisXYContainer>
	</div>
</Chart>

<style>
	.container {
		--vis-font-family: "Inter Variable", var(--font-sans);
	}
</style>
