<script lang="ts">
	import {
		VisLine,
		VisAxis,
		VisXYContainer,
		VisFreeBrush,
		VisTooltip,
		VisCrosshair,
		VisBulletLegend,
	} from "@unovis/svelte";
	import type { Database, Telemetry } from "$lib/types";
	import { onMount, tick } from "svelte";
	import { type FreeBrushSelection, BulletShape } from "@unovis/ts";
	import type { D3BrushEvent } from "d3";
	import Chart from "./Chart.svelte";
	import { Session } from "$lib/telemetry/session.svelte";
	import { numberInterval } from "@observablehq/plot";

	type Props = {
		lap: Omit<Database.Lap, "carTelemetryData" | "sessionUid"> & {
			carTelemetryData: Record<string, Telemetry.CarTelemetryData>;
		};
		comparison?:
			| (Omit<Database.Lap, "carTelemetryData" | "sessionUid"> & {
					carTelemetryData: Record<string, Telemetry.CarTelemetryData>;
			  })
			| undefined;
	};
	let { lap = $bindable(), comparison }: Props = $props();

	let carTelemetryData = $derived(lap.carTelemetryData);
	let comparisonTelemetryData = $derived(comparison?.carTelemetryData);

	let container: HTMLDivElement | undefined = $state();

	type DataRecord = { x: number; y?: number; y1?: number };

	let data = $derived.by(() => {
		let result: { x: number; y: number; y1?: number }[] = [];

		const mainKeys = new Set(Object.keys(carTelemetryData));
		const comparisonKeys = new Set(Object.keys(comparisonTelemetryData || {}));

		const intersection = comparisonTelemetryData
			? [...mainKeys].filter((key) => comparisonKeys.has(key))
			: [...mainKeys];

		for (const key of intersection) {
			const mainData = carTelemetryData[key];
			if (!mainData || mainData.brake === undefined) continue;

			const y = mainData.brake * 100;

			if (comparisonTelemetryData) {
				const compData = comparisonTelemetryData[key];
				if (!compData || compData.brake === undefined) continue;

				const y1 = compData.brake * 100;
				result.push({ x: Number(key), y, y1 });
			} else {
				result.push({ x: Number(key), y, y1: undefined });
			}
		}

		result.quickSort((a, b) => a.x - b.x);
		return result;
	});

	let minX = $derived(0);
	let maxX = $derived.by(() => {
		const xValues = data.map((dataRecord) => dataRecord.x);
		return Math.max(...xValues);
	});

	// ignoring here because im just using minFrame and maxFrame as initial values, not to track state
	/* svelte-ignore state_referenced_locally */
	let xDomain: [number, number] = $state([
		Math.min(...data.map((d) => d.x)),
		Math.max(...data.map((d) => d.x)),
	]);
	let yDomain: [number, number] = $state([0, 100]);

	let onBrushEnd = (
		selection: FreeBrushSelection,
		event: D3BrushEvent<unknown>,
		userDriven: boolean,
	) => {
		if (!selection) {
			return;
		}

		let xRange: [number, number], yRange: [number, number];
		if (Array.isArray(selection[0])) {
			[xRange, yRange] = selection as [[number, number], [number, number]];
		} else {
			return;
		}

		xDomain = xRange;
		yDomain = yRange;
	};

	let resetZoom = () => {
		xDomain = [minX, maxX];
		yDomain = [0, 100];
	};

	const template = (d: DataRecord) =>
		[Session.formatLapTime(d.x), d.y?.toFixed(2), d.y1?.toFixed(2)].join(", ");

	let x = (d: DataRecord) => d.x;
	let y = [(d: DataRecord) => d.y, (d: DataRecord) => d.y1];

	const color = (d: DataRecord | null, i: number) => ["#f54242", "#326da8"][i];

	const legendLabels = ["Lap", "Comparison"];
	const legendItems = legendLabels.map((label, i) => ({
		name: label,
		color: color(null, i),
		shape: BulletShape.Line,
	}));

	onMount(async () => {
		if (container) container.addEventListener("dblclick", resetZoom);
	});
</script>

<Chart title="Brake Trace">
	<div class="container flex w-full">
		{#if comparison}
			<VisBulletLegend items={legendItems} />
		{/if}
	</div>
	<div class="container" bind:this={container}>
		<VisXYContainer {xDomain} {yDomain}>
			<VisLine {data} {x} {y} {color} />
			<VisAxis
				type="x"
				label="Lap Time (mm:ss:ms)"
				tickFormat={(x: number) => Session.formatLapTime(x)}
			/>
			<VisAxis type="y" label="Brake Percentage (%)" />
			<VisTooltip />
			<VisCrosshair {data} {color} {x} {y} {template} />
			<VisFreeBrush mode="xy" {onBrushEnd} />
		</VisXYContainer>
	</div>
</Chart>

<style>
	.container {
		--vis-font-family: "Inter Variable", var(--font-sans);
	}
</style>
