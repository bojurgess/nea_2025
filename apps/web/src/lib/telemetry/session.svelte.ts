import type { Database } from "$lib/types";
import { source } from "sveltekit-sse";

type TelemetrySession = Omit<Database.TelemetrySession, "userId" | "playerCarIndex" | "trackId">;
type Laps = Omit<Database.Lap, "carTelemetryData" | "sessionUid">[];
type Track = Omit<Database.Track, "firstGp" | "realLapRecord" | "location" | "trackLength">;

type TelemetrySessionObject = TelemetrySession & { laps: Laps; track: Track };

export class Session {
	uid: string = $state()!;
	state: "Ongoing" | "Ended" = $state("Ongoing");

	startDate: Date = $state()!;
	endDate?: Date = $state();

	endDateString?: string = $derived(Session.formatDate(this.endDate));

	weather: number = $state()!;
	timeOfDay: number = $state()!;
	totalDistance: number = $state()!;
	totalLaps: number = $state()!;

	track: Track = $state()!;
	laps: Laps = $state()!;
	validLaps: Laps = $derived(this.laps.filter((lap) => lap.lapValidBitFlags === 15));

	averageLapMs: number = $derived.by(() => {
		if (this.validLaps[0] === null || this.validLaps.length === 0) return NaN;
		const sum = this.validLaps.reduce((acc, lap) => acc + lap.lapTimeInMs, 0);
		return sum / this.validLaps.length;
	});
	bestLapMs: number = $derived.by(() => {
		if (this.laps[0] === null || this.laps.length === 0) return NaN;
		const times = this.validLaps.map((lap) => lap.lapTimeInMs);
		const min = Math.min(...times);
		return min;
	});
	theoreticalBestMs: number = $derived.by(() => {
		if (this.laps[0] === null || this.laps.length === 0) return NaN;
		return this.bestS1Ms + this.bestS2Ms + this.bestS3Ms;
	});

	bestS1Ms: number = $derived(
		Math.min(
			...this.laps
				.filter((lap) => lap.lapValidBitFlags === 15)
				.map((lap) => lap.sector1TimeInMs),
		),
	);
	bestS2Ms: number = $derived(Math.min(...this.validLaps.map((lap) => lap.sector2TimeInMs)));
	bestS3Ms: number = $derived(Math.min(...this.validLaps.map((lap) => lap.sector3TimeInMs)));

	bestS1String: string = $derived(Session.formatSectorTime(this.bestS1Ms));
	bestS2String: string = $derived(Session.formatSectorTime(this.bestS2Ms));
	bestS3String: string = $derived(Session.formatSectorTime(this.bestS3Ms));

	averageLapString: string = $derived(Session.formatLapTime(this.averageLapMs));
	bestLapString: string = $derived(Session.formatLapTime(this.bestLapMs));
	theoreticalBestString: string = $derived(Session.formatLapTime(this.theoreticalBestMs));

	cellClass: string = $derived(this.state === "Ongoing" ? "bg-red-300" : "bg-white");

	eventListener;

	constructor(session: TelemetrySessionObject) {
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

	static formatLapTime(ms: number) {
		if (isNaN(ms) || ms === Infinity) return "N/A";

		const minutes = Math.floor(ms / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		const millis = Math.floor(ms % 1000);

		return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${millis.toString().padStart(3, "0")}`;
	}

	static formatSectorTime(ms: number) {
		if (isNaN(ms) || ms === Infinity) return "N/A";

		const seconds = Math.floor((ms % 60000) / 1000);
		const millis = Math.floor(ms % 1000);

		return `${seconds.toString().padStart(2, "0")}.${millis.toString().padStart(3, "0")}`;
	}

	static formatDate(date?: Date) {
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
			const callback = (sessions: Database.SimpleJoinedTelemetrySession[]) => {
				sessions.splice(
					sessions.findIndex((s) => s.uid === this.uid),
					1,
				);
			};
			return callback;
		}
	}
}
