<script lang="ts">
	import { decodeTimestampFromID } from "$lib/id.js";
	import type { Database } from "$lib/types";
	import { source } from "sveltekit-sse";

	const countryCodeToUnicode = (code: string) => {
		return code
			.toUpperCase()
			.replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
	};

	// This class is scoped to the user only
	// We use it to track the user's current fastest lap on that track
	class Track {
		id: number;
		gpName: string;
		firstGp: string;
		realLapRecord: number;
		country: string;
		location: string;
		trackName: string;
		trackLength: number;

		sessionsForThisTrack: Session[] = $derived(
			sessions.filter((session) => session.track.id === this.id),
		);

		userBestLapMs: number = $derived.by(() => {
			// we have to filter out sessions with no laps at this point,
			// because otherwise we're going to just get NaN best time.
			const bestSessionTimes = this.sessionsForThisTrack
				.filter((session) => session.laps && session.laps.length > 0)
				.map((session) => session.bestLapMs);
			return Math.min(...bestSessionTimes);
		});

		userAverageLapMs: number = $derived.by(() => {
			const allSessionLaps = this.sessionsForThisTrack.map((session) => session.laps).flat();
			const sum = allSessionLaps.reduce((acc, lap) => acc + lap.lapTimeInMs, 0);
			return sum / allSessionLaps.length;
		});

		userBestLapString: string = $derived(Track.#formatLapTime(this.userBestLapMs));
		userAverageLapString: string = $derived(Track.#formatLapTime(this.userAverageLapMs));

		constructor(track: Database.Track) {
			this.id = track.id;
			this.gpName = track.gpName;
			this.firstGp = track.firstGp;
			this.realLapRecord = track.realLapRecord;
			this.country = track.country;
			this.location = track.location;
			this.trackName = track.trackName;
			this.trackLength = track.trackLength;
		}

		static #formatLapTime(ms: number) {
			if (isNaN(ms)) return "N/A";

			const minutes = Math.floor(ms / 60000);
			const seconds = Math.floor((ms % 60000) / 1000);
			const millis = Math.floor(ms % 1000);

			return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${millis.toString().padStart(3, "0")}`;
		}
	}

	class Session {
		uid: string = $state()!;
		state: "Ongoing" | "Ended" = $state("Ongoing");

		startDate: Date = $state()!;
		endDate?: Date = $state();

		endDateString?: string = $derived(Session.#formatDate(this.endDate));

		weather: number = $state()!;
		timeOfDay: number = $state()!;
		totalDistance: number = $state()!;
		totalLaps: number = $state()!;

		track: Database.Track = $state()!;
		laps: Database.Lap[] = $state()!;

		averageLapMs: number = $derived.by(() => {
			if (this.laps[0] === null || this.laps.length === 0) return NaN;
			const sum = this.laps.reduce((acc, lap) => acc + lap.lapTimeInMs, 0);
			return sum / this.laps.length;
		});
		bestLapMs: number = $derived.by(() => {
			if (this.laps[0] === null || this.laps.length === 0) return NaN;
			const times = this.laps.map((lap) => lap.lapTimeInMs);
			const min = Math.min(...times);
			return min;
		});

		averageLapString = $derived(Session.#formatLapTime(this.averageLapMs));
		bestLapString: string = $derived(Session.#formatLapTime(this.bestLapMs));

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

		static #formatLapTime(ms: number) {
			if (isNaN(ms)) return "N/A";

			const minutes = Math.floor(ms / 60000);
			const seconds = Math.floor((ms % 60000) / 1000);
			const millis = Math.floor(ms % 1000);

			return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${millis.toString().padStart(3, "0")}`;
		}

		static #formatDate(date?: Date) {
			if (!date) return;

			const day = date.getDay();
			const month = date.getMonth();
			const year = date.getFullYear();

			const hours = date.getHours();
			const minutes = date.getMinutes();

			return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year} ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
		}

		#endSession(endDate: string | Date, totalLaps: number) {
			this.endDate = new Date(endDate);
			this.totalLaps = totalLaps;

			this.state = "Ended";

			if (this.laps.length === 0) {
				sessions.splice(
					sessions.findIndex((s) => s.uid === this.uid),
					1,
				);
			}
		}
	}

	const { data } = $props();

	let sessions: Session[] = $state([]);
	sessions = data.sessions.map((s) => new Session(s));
	let tracks = $state(data.tracks.map((t) => new Track(t)));

	let userDrivenTracks = $derived(tracks.filter((t) => t.sessionsForThisTrack.length > 0));

	const userEventListener = source(`/api/sse/user/${data.user.id}`);
	userEventListener
		.select("new_session")
		.json<Database.SimpleTelemetrySession>()
		.subscribe((dbSession) => {
			if (!dbSession) return;
			sessions.push(new Session(dbSession));
			sessions.sort((a, b) => decodeTimestampFromID(b.uid) - decodeTimestampFromID(a.uid));
		});
</script>

<main class="mx-auto max-w-4xl space-y-8">
	<section></section>

	<section class="space-y-2">
		<h1>Tracks</h1>
		<div class="flex gap-4 overflow-scroll pr-2 pb-8">
			{#if userDrivenTracks.length === 0}
				<span class="col-span-full">No data found! Start driving to collect data.</span>
			{:else}
				{#each userDrivenTracks as track}
					<article
						class="container-box flex min-w-2xs flex-col justify-around space-y-4 text-center"
					>
						<header class="flex flex-col items-center justify-center">
							<h2 class="flex text-xl font-bold">
								{countryCodeToUnicode(track.country)}
								{track.gpName}
							</h2>
							<p class="text-xs">{track.trackName}</p>
						</header>

						<section class="flex flex-col justify-between">
							<div class="flex flex-col">
								<h3 class="text-lg">Sessions</h3>
								<p class="font-display text-xl font-black">
									{track.sessionsForThisTrack
										? track.sessionsForThisTrack.length
										: 0}
								</p>
							</div>
							<div class="flex flex-col">
								<h3 class="text-lg">Average Time</h3>
								<p class="font-display text-xl font-black">
									{track.userAverageLapString}
								</p>
							</div>
							<div class="flex flex-col">
								<h3 class="text-lg">Best Time</h3>
								<p class="font-display text-xl font-black">
									{track.userBestLapString}
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
		<div class="overflow-x-scroll pr-2 pb-2">
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
								{session.endDateString ?? session.state}
							</td>
							<td class={session.cellClass}>
								{#if session.laps[0] === null}
									{session.laps.length - 1}
								{:else}
									{session.laps.length}
								{/if}
							</td>
							<td class={session.cellClass}>
								{session.bestLapString}
							</td>
							<td class={session.cellClass}>
								{session.averageLapString}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</main>
