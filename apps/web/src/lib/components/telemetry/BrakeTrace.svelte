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
	import { onMount } from "svelte";
	import { BulletShape, type FreeBrushSelection } from "@unovis/ts";
	import type { D3BrushEvent } from "d3";
	import Chart from "./Chart.svelte";
	import { Session } from "$lib/telemetry/session.svelte";

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
	let data: DataRecord[] = $derived.by(() => {
		let data: DataRecord[] = [];
		let yValues = processTelemetryData(carTelemetryData);
		let y1Values: [number, number][] | undefined;

		if (comparisonTelemetryData) {
			y1Values = processTelemetryData(comparisonTelemetryData);
		}

		const length = Math.max(y1Values?.length ?? 0, yValues.length);
		// non null assertion here because y1Values can only ever be the longest if it exists (duh)
		const longestValues = yValues.length === length ? yValues : y1Values!;
		for (let i = 0; i < length; i++) {
			data.push({
				x: longestValues[i][0],
				y: yValues[i][1] * 100,
				y1: y1Values ? y1Values[i][1] * 100 : undefined,
			});
		}
		return data;
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

	onMount(() => {
		if (container) container.addEventListener("dblclick", resetZoom);
	});

	function processTelemetryData(
		data: Record<string, Telemetry.CarTelemetryData>,
	): [number, number][] {
		const sortedTelemetryData = Object.entries(data)
			.map(
				([frame, telemetry]) =>
					[Number(frame), telemetry] as [number, Telemetry.CarTelemetryData],
			)
			.sort(([a], [b]) => a - b);

		const brakeMap = new Map<number, number>();

		for (const [, telemetry] of sortedTelemetryData) {
			const { currentLapTimeInMs, brake } = telemetry;

			if (!brakeMap.has(currentLapTimeInMs)) {
				brakeMap.set(currentLapTimeInMs, brake);
			}
		}
		return [...brakeMap.entries()];
	}

	console.log("hello, world!");
</script>

<Chart title="Brake Trace">
	<div class="container flex w-full">
		{#if comparison}
			<VisBulletLegend items={legendItems} />
		{/if}
	</div>
	<div class="container" bind:this={container}>
		<VisXYContainer {data} {xDomain} {yDomain}>
			<VisLine {data} {color} {x} {y} />
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
