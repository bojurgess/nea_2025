<script lang="ts">
	import { goto, preloadData } from "$app/navigation";
	import { decodeTimestampFromID } from "$lib/id.js";
	import { Session } from "$lib/telemetry/session.svelte.js";
	import { Track } from "$lib/telemetry/track.svelte.js";
	import type { Database } from "$lib/types";
	import { countryCodeToUnicode } from "$lib/util.js";
	import { source } from "sveltekit-sse";

	const { data } = $props();

	let sessions: Session[] = $state([]);
	sessions = data.sessions.map((s) => new Session(s));
	let tracks = $derived(
		data.tracks.map(
			(t) =>
				new Track(
					t,
					sessions.filter((s) => s.track.id === t.id),
				),
		),
	);
	$effect(() => {
		sessions.forEach((s) => {
			s.addEventListener("session_empty", () => {
				sessions = sessions.filter((session) => session.uid !== s.uid);
			});
		});
	});
	let userDrivenTracks = $derived(tracks.filter((t) => t.sessionsForThisTrack.length > 0));

	const formatDate = (date?: Date, includeTime: boolean = true) => {
		if (!date) return;

		const day = date.getDay();
		const month = date.getMonth();
		const year = date.getFullYear();

		const hours = date.getHours();
		const minutes = date.getMinutes();

		if (includeTime) {
			return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year} ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
		} else {
			return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`;
		}
	};

	const userEventListener = source(`/api/sse/user/${data.user.id}`);
	userEventListener
		.select("new_session")
		// kind of a hacky type but im lazy
		.json<(typeof data.sessions)[0]>()
		.subscribe((dbSession) => {
			if (!dbSession) return;
			console.log("new session", new Session(dbSession));

			sessions.push(new Session(dbSession));
			sessions.sort((a, b) => decodeTimestampFromID(b.uid) - decodeTimestampFromID(a.uid));
		});
</script>

<main class="mx-auto flex h-full max-w-4xl flex-col justify-center space-y-8">
	<section class="flex space-x-2">
		<div class="flex flex-col">
			<div id="flag-header" class="flex items-center justify-start gap-2">
				{countryCodeToUnicode(data.user.flag)}
				<h1 class="leading-none">{data.user.username}</h1>
			</div>
			<h2 class="text-lg">Member Since {formatDate(data.user.joinDate, false)}</h2>
		</div>
	</section>

	<section class="space-y-2">
		<h1>Tracks</h1>
		<div class="flex gap-4 overflow-scroll pr-2 pb-8">
			{#if userDrivenTracks.length === 0}
				<article class="container-box">
					No data found! Start driving to collect data.
				</article>
			{:else}
				{#each userDrivenTracks as track}
					<button
						onclick={() => goto(`tracks/${track.id}`)}
						role="link"
						class="container-box button-box flex min-w-2xs flex-col justify-around space-y-4 text-center"
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
					</button>
				{/each}
			{/if}
		</div>
	</section>

	<section class="space-y-2">
		<h1>Sessions</h1>
		<div class="overflow-x-scroll pr-2 pb-2">
			{#if userDrivenTracks.length === 0}
				<article class="container-box">
					No data found! Start driving to collect data.
				</article>
			{:else}
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
							<tr
								class="cursor-pointer [&>*]:border [&>*]:p-2"
								role="link"
								onclick={() => {
									goto(`/session/${session.uid}`);
								}}
								onmouseenter={async () => preloadData(`/session/${session.uid}`)}
							>
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
			{/if}
		</div>
	</section>
</main>

<style>
	:global(#flag-header > img.emoji) {
		height: 4em;
		width: 4em;
		margin: 0 0.05em 0 0.1em;
		vertical-align: -0.1em;
	}
</style>
