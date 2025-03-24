<script lang="ts">
	import {
		VisLine,
		VisAxis,
		VisXYContainer,
		VisFreeBrush,
		VisTooltip,
		VisCrosshair,
	} from "@unovis/svelte";
	import type { Database, Telemetry } from "$lib/types";
	import { onMount } from "svelte";
	import type { FreeBrushSelection } from "@unovis/ts";
	import type { D3BrushEvent } from "d3";

	type Props = {
		lap: Omit<Database.Lap, "carTelemetryData" | "sessionUid"> & {
			carTelemetryData: Record<string, Telemetry.CarTelemetryData>;
		};
	};
	let { lap = $bindable() }: Props = $props();

	let carTelemetryData = $derived(lap.carTelemetryData);
	let frames = $derived(Object.entries(carTelemetryData).map(([frame, _]) => parseInt(frame)));

	type DataRecord = { x: number; y: number };
	let data: DataRecord[] = $derived(
		Object.entries(carTelemetryData).map(([frame, telemetry]) => {
			return {
				x: parseInt(frame),
				y: telemetry.brake * 100,
			};
		}),
	);

	let container: HTMLDivElement | undefined = $state();

	let minFrame = $derived(Math.min(...frames));
	let maxFrame = $derived(Math.max(...frames));
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

	const template = (d: DataRecord) => [d.x, d.y].join(", ");

	let x = (d: DataRecord) => d.x;
	let y = (d: DataRecord) => d.y;

	onMount(() => {
		if (container) container.addEventListener("dblclick", resetZoom);
	});
</script>

<div id="brake-trace" class="container-box relative h-96 w-full pt-6 pb-10">
	<h2 class="text-center">Brake Trace</h2>
	<div class="container" bind:this={container}>
		<VisXYContainer {data} {xDomain} {yDomain}>
			<VisLine {data} color="#f54242" x={(d) => d.x} y={(d) => d.y} />
			<VisAxis type="x" label="Frame Number" />
			<VisAxis type="y" label="Brake Percentage (%)" />
			<VisTooltip />
			<VisCrosshair {data} {x} {y} {template} />
			<VisFreeBrush mode="xy" {onBrushEnd} />
		</VisXYContainer>
	</div>
</div>

<style>
	.container {
		--vis-font-family: "Inter Variable", var(--font-sans);
	}
</style>
