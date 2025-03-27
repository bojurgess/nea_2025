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

	type DataRecord = { x: number; y?: number; y1?: number };
	let data: DataRecord[] = $derived.by(() => {
		let mainBrakeMap: Map<number, number> = new Map(
			Object.entries(carTelemetryData).map(([_, telemetry], i) => [i, telemetry.brake * 100]),
		);
		let comparisonBrakeMap: Map<number, number> = new Map(
			comparisonTelemetryData
				? Object.entries(comparisonTelemetryData).map(([_, telemetry], i) => [
						i,
						telemetry.brake * 100,
					])
				: [],
		);

		let allFrames = new Set([...mainBrakeMap.keys(), ...comparisonBrakeMap.keys()]);
		return Array.from(allFrames).map((x) => ({
			x,
			y: mainBrakeMap.get(x) ?? undefined,
			y1: comparisonBrakeMap.get(x) ?? undefined,
		}));
	});

	let container: HTMLDivElement | undefined = $state();

	let minFrame = 0;
	let maxFrame = $derived(
		Math.max(
			Object.keys(carTelemetryData).length,
			comparisonTelemetryData ? Object.keys(comparisonTelemetryData).length : 0,
		),
	);
	// ignoring here because im just using minFrame and maxFrame as initial values, not to update
	/* svelte-ignore state_referenced_locally */
	let xDomain: [number, number] = $state([minFrame, maxFrame]);
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
		xDomain = [minFrame, maxFrame];
		yDomain = [0, 100];
	};

	const template = (d: DataRecord) => [d.x, d.y?.toFixed(2), d.y1?.toFixed(2)].join(", ");

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
			<VisAxis type="x" label="Frame Number" />
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
