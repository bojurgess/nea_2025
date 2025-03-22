// This class is scoped to the user only

import type { Database } from "$lib/types";
import type { Session } from "./session.svelte";

// We use it to track the user's current fastest lap on that track
export class Track {
	id: number;
	gpName: string;
	firstGp: string;
	realLapRecord: number;
	country: string;
	location: string;
	trackName: string;
	trackLength: number;

	sessionsForThisTrack: Session[];

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

	constructor(track: Database.Track, sessionsForThisTrack: Session[]) {
		this.id = track.id;
		this.gpName = track.gpName;
		this.firstGp = track.firstGp.toISOString();
		this.realLapRecord = track.realLapRecord;
		this.country = track.country;
		this.location = track.location;
		this.trackName = track.trackName;
		this.trackLength = track.trackLength;

		this.sessionsForThisTrack = sessionsForThisTrack;
	}

	static #formatLapTime(ms: number) {
		if (isNaN(ms) || ms === Infinity) return "N/A";

		const minutes = Math.floor(ms / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		const millis = Math.floor(ms % 1000);

		return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${millis.toString().padStart(3, "0")}`;
	}
}
