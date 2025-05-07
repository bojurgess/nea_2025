# Class Design

```typescript
export class Session {
	uid: string = $state()!;

	startDate: Date = $state()!;
	endDate: Date | null = $state(null);

	endDateString?: string = $derived(Session.formatDate(this.endDate));
	state: "Ongoing" | "Ended" = $derived(this.endDate ? "Ended" : "Ongoing");

	weather: number = $state()!;
	timeOfDay: number = $state()!;
	totalDistance: number = $state()!;
	totalLaps: number = $state()!;

	track: Track = $state()!;
	laps: Laps = $state()!;
	validLaps: Laps = $derived(this.laps.filter((lap) => lap.lapInvalid === false));

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

	bestS1Ms: number = $derived(Math.min(...this.validLaps.map((lap) => lap.sector1TimeInMs)));
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
		$inspect(session);

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

	static formatDate(date: Date | null) {
		if (!date) return;

		const day = date.getDate();
		const month = date.getMonth() + 1; // getMonth() returns 0-indexed, so add 1
		const year = date.getFullYear();

		const hours = date.getHours();
		const minutes = date.getMinutes();

		return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year} ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
	}

	#endSession(endDate: string | Date, totalLaps: number) {
		this.endDate = new Date(endDate);
		this.totalLaps = totalLaps;

		$inspect(`ending session ${this.uid}`);

		if (this.laps.length === 0) {
			const callback = (sessions: TelemetrySessionObject[]) => {
				sessions.splice(
					sessions.findIndex((s) => s.uid === this.uid),
					1
				);
			};
			return callback;
		}
	}
}
```

```typescript
// This class is scoped to the user only
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
```

```typescript
export class Auth {
	static DAY_IN_MS = 1000 * 60 * 60 * 24;
	static SESSION_COOKIE_NAME = "auth_session";

	#db: typeof db;

	constructor(conn: typeof db) {
		this.#db = conn;
	}

	generateSessionToken(): string {
		const bytes = new Uint8Array(18);
		crypto.getRandomValues(bytes);
		return encodeBase32LowerCaseNoPadding(bytes);
	}

	async createSession(
		token: string,
		userId: string,
		metadata: SessionMetadata
	): Promise<Session> {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
		const session: Session = {
			id: sessionId,
			userId,
			expiresAt: new Date(Date.now() + Auth.DAY_IN_MS * 30),
			...metadata
		};
		await this
			.#db`INSERT INTO sessions ${db({ ...session, expiresAt: Math.floor(session.expiresAt.getTime() / 1000) })}`;
		return session;
	}

	async validateSessionToken(token: string): Promise<SessionValidationResult> {
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
		let [result]: [
			{
				id: string;
				username: string;
				userId: string;
				expiresAt: number;
				flag: string;
				avatar: string;
				joinDate: Date;
			}
		] = await this
			.#db`SELECT sessions.*, users.username, users.flag, users.avatar, users.join_date FROM sessions INNER JOIN users ON users.id = sessions.user_id WHERE sessions.id = ${sessionId}`;
		const session: Session = {
			id: result.id,
			userId: result.userId,
			expiresAt: new Date(result.expiresAt * 1000)
		};
		const user: User = {
			id: result.userId,
			username: result.username,
			flag: result.flag,
			joinDate: result.joinDate,
			avatar: result.avatar
		};
		if (Date.now() >= session.expiresAt.getTime()) {
			await this.#db`DELETE FROM sessions WHERE id = ${session.id}`;
			return { session: null, user: null };
		}
		if (Date.now() >= session.expiresAt.getTime() - Auth.DAY_IN_MS * 15) {
			session.expiresAt = new Date(Date.now() + Auth.DAY_IN_MS * 30);
			await this
				.#db`UPDATE sessions SET expires_at = ${Math.floor(session.expiresAt.getTime() / 1000)} WHERE id = ${session.id}`;
		}
		return { session, user };
	}

	async invalidateSession(sessionId: string): Promise<void> {
		await this.#db`DELETE FROM sessions WHERE id = ${sessionId}`;
	}

	setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
		event.cookies.set(Auth.SESSION_COOKIE_NAME, token, {
			path: "/",
			expires: expiresAt,
			secure: !dev,
			sameSite: "lax",
			httpOnly: true
		});
	}

	deleteSessionTokenCookie(event: RequestEvent): void {
		event.cookies.set(Auth.SESSION_COOKIE_NAME, "", {
			httpOnly: true,
			sameSite: "lax",
			maxAge: 0,
			path: "/"
		});
	}
}

export type Session = {
	id: string;
	userId: string;
	expiresAt: Date;
	sessionIp?: string;
	sessionCountry?: string;
	sessionCity?: string;
	sessionRegion?: string;
	deviceType?: string;
	userAgent?: string;
};
```

Example of polymorphism:

```rust
/// Event Packet
///
/// This packet gives details of events that happen during the course of a session.
///
/// Frequency: When the event occurs
/// Size: 45 bytes
/// Version: 1
#[derive(Debug, Clone, Copy, PartialEq, serde::Deserialize, serde::Serialize)]
#[repr(C, packed)]
pub struct PacketEventData {
    pub header: PacketHeader,
    pub event_string_code: [u8; 4],
    pub event_details: EventDataDetails,
}

impl PacketAttributes for PacketEventData {
    fn header(&self) -> PacketHeader {
        self.header.clone()
    }

    fn packet_id(&self) -> Result<super::PacketID, PacketError> {
        self.header.packet_id()
    }
}

impl FromBytes for PacketEventData {
    fn from_bytes(buf: &[u8]) -> Result<Self, super::PacketError> {
        let mut cursor = std::io::Cursor::new(buf);

        let header = bincode::deserialize_from::<_, PacketHeader>(&mut cursor)?;
        let header_size = std::mem::size_of::<PacketHeader>();

        let string_code_buf = &buf[header_size..header_size + 4];
        let event_string_code: [u8; 4] = string_code_buf
            .try_into()
            .map_err(|_| PacketError::EventDecodeError())?;

        let string_code =
            std::str::from_utf8(&event_string_code).map_err(|_| PacketError::EventDecodeError())?;

        let event_details = match string_code {
            "FTLP" => EventDataDetails::FastestLap(deserialize_from::<_, FastestLap>(&mut cursor)?),
            "RTMT" => EventDataDetails::Retirement(deserialize_from::<_, Retirement>(&mut cursor)?),
            "TMPT" => EventDataDetails::TeamMateInPits(deserialize_from::<_, TeamMateInPits>(
                &mut cursor,
            )?),
            "RCWN" => EventDataDetails::RaceWinner(deserialize_from::<_, RaceWinner>(&mut cursor)?),
            "PENL" => EventDataDetails::Penalty(deserialize_from::<_, Penalty>(&mut cursor)?),
            "SPTP" => EventDataDetails::SpeedTrap(deserialize_from::<_, SpeedTrap>(&mut cursor)?),
            "STLG" => {
                EventDataDetails::StartLights(deserialize_from::<_, StartLights>(&mut cursor)?)
            }
            "DTPN" => EventDataDetails::DriveThroughPenaltyServed(deserialize_from::<
                _,
                DriveThroughPenaltyServed,
            >(&mut cursor)?),
            "SGPN" => EventDataDetails::StopGoPenaltyServed(deserialize_from::<
                _,
                StopGoPenaltyServed,
            >(&mut cursor)?),
            "FLBK" => EventDataDetails::Flashback(deserialize_from::<_, Flashback>(&mut cursor)?),
            "BUTN" => EventDataDetails::Buttons(deserialize_from::<_, Buttons>(&mut cursor)?),
            "OVTK" => EventDataDetails::Overtake(deserialize_from::<_, Overtake>(&mut cursor)?),
            "SSTA" => EventDataDetails::SessionStarted,
            "SEND" => EventDataDetails::SessionEnded,
            "DRSE" => EventDataDetails::DRSEnabled,
            "DRSD" => EventDataDetails::DRSDisabled,
            "CHQF" => EventDataDetails::ChequeredFlag,
            "LGOT" => EventDataDetails::LightsOut,
            "REDL" => EventDataDetails::RedFlag,
            _ => return Err(PacketError::EventCodeOutOfBounds(string_code.len())),
        };

        Ok(PacketEventData {
            header,
            event_string_code,
            event_details,
        })
    }
}
```

```rust
/// # Car Damage Packet
///
/// This packet details car damage parameters for all the cars in the race.
///
/// Frequency: 10 per second
/// Size: 953 bytes
/// Version: 1
#[derive(Debug, Clone, Copy, PartialEq, serde::Serialize, serde::Deserialize)]
#[repr(C, packed)]
pub struct PacketCarDamageData {
    /// Header
    pub header: super::header::PacketHeader,
    /// Damage data for all cars
    pub car_damage_data: [CarDamageData; 22],
}

impl FromBytes for PacketCarDamageData {
    fn from_bytes(buf: &[u8]) -> Result<Self, super::PacketError> {
        let cursor = std::io::Cursor::new(buf);
        match bincode::deserialize_from(cursor) {
            Ok(packet) => Ok(packet),
            Err(e) => Err(e.into()),
        }
    }
}
```

```rust
impl TryFrom<u8> for PacketID {
    type Error = PacketError;

    fn try_from(val: u8) -> Result<Self, Self::Error> {
        match val {
            0 => Ok(PacketID::Motion),
            1 => Ok(PacketID::Session),
            2 => Ok(PacketID::Lap),
            3 => Ok(PacketID::Event),
            4 => Ok(PacketID::Participants),
            5 => Ok(PacketID::CarSetups),
            6 => Ok(PacketID::CarTelemetry),
            7 => Ok(PacketID::CarStatus),
            8 => Ok(PacketID::FinalClassification),
            9 => Ok(PacketID::LobbyInfo),
            10 => Ok(PacketID::CarDamage),
            11 => Ok(PacketID::SessionHistory),
            12 => Ok(PacketID::TyreSets),
            13 => Ok(PacketID::MotionEx),
            // Something catastrophic has gone wrong if this panics
            // (just saying)
            _ => Err(PacketError::InvalidPacketID(val)),
        }
    }
}
```

```rust
impl TryFrom<&Session> for JSONTelemetrySession {
    type Error = &'static str;

    fn try_from(value: &Session) -> Result<Self, Self::Error> {
        if !value.is_initialised() { Err("Session is not initialised!") }
        else {
            Ok(Self {
                uid: value.session_uid.clone(),
                player_car_index: value.player_car_index,
                start_date: value.start_date,
                end_date: value.end_date,
                total_distance: value.total_distance.unwrap(),
                weather: value.weather.unwrap(),
                time_of_day: value.time_of_day.unwrap(),
                total_laps: value.total_laps.unwrap(),
                track_id: value.track_id.unwrap(),
            })
        }
    }
}
```

