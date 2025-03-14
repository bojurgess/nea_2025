<script lang="ts">
	import { decodeTimestampFromID } from "$lib/id.js";
	import type { Database } from "$lib/types";
	import { source } from "sveltekit-sse";

	const countryCodeToUnicode = (code: string) => {
		return code
			.toUpperCase()
			.replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
	};

	class Session {
		uid: string = $state()!;
		state: "Ongoing" | "Ended" = $state("Ongoing");

		startDate: Date = $state()!;
		endDate?: Date = $state();

		weather: number = $state()!;
		timeOfDay: number = $state()!;
		totalDistance: number = $state()!;
		totalLaps: number = $state()!;

		track: Database.Track = $state()!;
		laps: Database.Lap[] = $state()!;

		averageLap: string = $derived.by(() => {
			if (this.laps[0] === null || this.laps.length === 0) return "N/A";
			const sum = this.laps.reduce((acc, lap) => acc + lap.lapTimeInMs, 0);
			const avg = sum / this.laps.length;
			return this.#formatLapTime(avg);
		});
		bestLap: string = $derived.by(() => {
			if (this.laps[0] === null || this.laps.length === 0) return "N/A";
			const times = this.laps.map((lap) => lap.lapTimeInMs);
			const best = Math.min(...times);
			return this.#formatLapTime(best);
		});

		cellClass: string = $derived(this.state === "Ongoing" ? "bg-red-300" : "bg-white");

		eventListener;

		constructor(session: Database.SimpleTelemetrySession) {
			this.uid = session.uid;
			this.startDate = session.startDate;

			this.weather = session.weather;
			this.timeOfDay = session.timeOfDay;
			this.totalDistance = session.totalDistance;
			this.totalLaps = session.totalLaps;

			this.laps = session.laps;
			this.track = session.track;

			if (session.endDate) this.#endSession(session.endDate, session.totalLaps);

			if (this.state === "Ongoing") {
				this.eventListener = source(`/api/sse/session/${this.uid}`);
				this.eventListener
					.select("new_lap")
					.json<Database.Lap>()
					.subscribe((lap) => {
						if (!lap) return;
						this.laps.push(lap);
					});
				this.eventListener
					.select("session_ended")
					.json<{
						endDate: string;
						totalLaps: number;
					}>()
					.subscribe((payload) => {
						if (!payload) return;
						this.#endSession(payload.endDate, payload.totalLaps);
					});
			}
		}

		#formatLapTime(ms: number) {
			const minutes = Math.floor(ms / 60000);
			const seconds = Math.floor((ms % 60000) / 1000);
			const millis = Math.floor(ms % 1000);

			return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${millis.toString().padStart(3, "0")}`;
		}

		#endSession(endDate: string | Date, totalLaps: number) {
			this.endDate = new Date(endDate);
			this.totalLaps = totalLaps;

			this.state = "Ended";
		}
	}

	const getSessionCount = (
		lap: { lapTimeInMs: number; track: Database.Track },
		sessions: Session[],
	) => {
		return sessions.filter((s) => s.track.id === lap.track.id).length;
	};

	const formatLapTime = (ms: number) => {
		const minutes = Math.floor(ms / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		const millis = Math.floor(ms % 1000);

		return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${millis.toString().padStart(3, "0")}`;
	};

	const formatDate = (date?: Date) => {
		if (!date) return;

		const day = date.getDay();
		const month = date.getMonth();
		const year = date.getFullYear();

		const hours = date.getHours();
		const minutes = date.getMinutes();

		return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`;
	};

	const { data } = $props();

	let bestLaps = $state(data.bestLaps);
	let sessions = $state(data.sessions.map((s) => new Session(s)));

	const userEventListener = source(`/api/sse/user/${data.user.id}`);
	userEventListener
		.select("new_session")
		.json<Database.SimpleTelemetrySession>()
		.subscribe((dbSession) => {
			if (!dbSession) return;
			console.log(dbSession);
			sessions.push(new Session(dbSession));
			sessions.sort((a, b) => decodeTimestampFromID(b.uid) - decodeTimestampFromID(a.uid));
		});
</script>

<main class="mx-auto max-w-4xl space-y-8">
	<section class="space-y-2">
		<h1>Tracks</h1>
		<div class="grid grid-cols-1 gap-4 pr-2 pb-8 sm:grid-cols-2 lg:grid-cols-3">
			{#if bestLaps.length === 0}
				<span class="col-span-full">No data found! Start driving to collect data.</span>
			{:else}
				{#each bestLaps as lap}
					<article class="container-box flex flex-col space-y-4 text-center">
						<header class="flex flex-col items-center justify-center">
							<h2 class="flex text-xl font-bold">
								{countryCodeToUnicode(lap.track.country)}
								{lap.track.gpName}
							</h2>
							<p class="text-xs">{lap.track.trackName}</p>
						</header>

						<section class="flex justify-around">
							<div class="flex flex-col">
								<h3 class="text-lg">Sessions</h3>
								<p class="font-display text-xl font-black">
									{getSessionCount(lap, sessions)}
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

	<section class="space-y-2">
		<h1>Sessions</h1>
		<div class="overflow-x-auto pr-2 pb-2">
			<table class="container-box w-full border-collapse">
				<thead>
					<tr class="[&>*]:border [&>*]:p-2 [&>*]:font-bold">
						<th>Track</th>
						<th>Date</th>
						<th>Laps</th>
						<th>Fastest Lap</th>
						<th>Avg. Lap Time</th>
					</tr>
				</thead>
				<tbody>
					{#each sessions as session (session.uid)}
						<tr class="[&>*]:border [&>*]:p-2">
							<td class={`${session.cellClass}`}>
								{countryCodeToUnicode(session.track.country)}
								{session.track.trackName}
							</td>
							<td class={session.cellClass}>
								{session.endDate ?? session.state}
							</td>
							<td class={session.cellClass}>
								{#if session.laps[0] === null}
									{session.laps.length - 1}
								{:else}
									{session.laps.length}
								{/if}
							</td>
							<td class={session.cellClass}>
								{session.bestLap}
							</td>
							<td class={session.cellClass}>
								{session.averageLap}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</main>
