# Class Design

## Encapsulation of logic in Javascript classes

### Explaining Svelte rune syntax:

Throughout my user-defined classes, there are noticeable differences between my implementation and that which would be seen in a typical Object Oriented Language should as C#. The key reason for this is the usage of the Svelte UI framework's 'Runes' syntax, which wraps deeply reactive state proxies in more easy to use syntax which produces more readable code.

I chose to use the `$state()` and `$derived()`/`$derived.by()` runes often because of the fact that state defined by these runes automatically reacts to changes and updates accordingly. In a more traditional Object-Oriented approach to class definition, accessors and mutators are typically used to create fields which are derived from other state. However, in my case, most changes in the state of the program's UI are not caused by explicit user input on the page (which could be simply triggered by an accessor) but rather are more indirectly caused by the user when they for example, complete a lap in an in-game session and this is uploaded to the web API. In this case, there is no action on the frontend that will trigger the update in state, so I instead use runes to automatically track the change in state when it happens on the backend, and the event is forwarded to the frontend using Server Sent Events.

### Session Class:

In my technical solution I decided to use classes to encapsulate the logic behind a telemetry session. I chose to do this because each individual telemetry session needed to handle more complex management of state than a plain object would permit. For example, each telemetry session on creation opens a connection with an API endpoint which returns server sent events, allowing the session class object to listen for updates to its own state e.g. a new lap being completed, a session ending etc. Additionally, lots of additional fields needed to be tracked which were derived from other fields on the session, such as the average, theoretical and best lap times. By encapsulating all of this logic in a single class object I was able to make the code much simpler as everything needed to display session data to a user was contained within one object. I used static helper methods on my class in order to transform the raw data into a more human readable format, while maintaining the raw data in their own fields such that other classes can use these values if needed.

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

### Track class:

Similarly to the telemetry session class, I decided to create a class for a Track that I could instantiate on a per user basis in order to track their particular stats for a track. This meant that I could take advantage of encapsulation and keep my data and statistics processing logic in one place, without having to define keep track of lots of different lists for different pieces of related of information, which would all use the same helper functions. This also made extending the logic with additional functionality as I continued to design the program and add features much easier as everything relating to a user's track performance was encapsulated in one class.

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

### Authentication Helper Class

For similar reasons as mentioned previously, I defined an Authentication helper class which would be able to accept a database connection and encapsulate all of the logic required to manage user sessions between the browser and the database.

The class is responsible for creating session objects (using the `createSession()` helper) which are then inserted into the database, and returned back to the caller to be exchanged for a session cookie. By storing the session in the database we can examine the session cookie also set by the class on the user's browser per-request, and if there is a session id matching in the database that is not expired, the user must be authenticated and can access protected routes such as their settings page, and the frontend can access API routes on their behalf, using their session cookie. The auth class also contains the `validateSessionToken()` helper required to validate the user's session cookie against the database, the `invalidateSession()` helper required to delete sessions from the database and revoke a user's login session, and the `setSessionTokenCookie()` and `deleteSessionTokenCookie()` helpers required to set and delete the cookie from the user's browser.

A key benefit of choosing to create the encapsulate the logic in a class object over a more procedural approach is that this reduced the need for global variables across my program, and meant that I could instead scope each instance of authentication logic closer to where it was being used.

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

## Examples of Polymorphism & Encapsulation: Rust structs

While the Rust programming language does not strictly have classes, and does not support inheritance, choosing to encourage the use of composition and sharing of behaviour through its `trait` system, numerous object-oriented concepts such as polymorphism and encapsulation are still evident. The two structs defined below encapsulate all of the data fields that a specific packet contains, which allows it to be easily decoded from the game's binary UDP output.

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

The following struct and enum highlight the usage of parametric polymorphism, using Rust's `trait` feature. A trait defines a common set of functionality which can be implemented with different logic for different types, which can be likened to an interface or abstract base class in traditional Object-Oriented languages such as C#. The same trait can define a function which returns a different output type for a different type for which it is implemented on.

In this example, the TryFrom trait is implemented differently based on two different types.

The PacketID enum implements the TryFrom trait for an input byte paramter, and returns a PacketID enum depending on the value of the byte.

Conversely, the TryFrom implementation seen on the JSONTelemetrySession type takes a pointer to a Session struct, and constructs a JSONTelemetrySession from the necessary values in the Session struct. It returns an error, however, if some of the expected values on the session have an empty value (in this case if the Option enum that wraps the values are None instead of Some(value)).

```rust
#[derive(Debug, PartialEq, Clone, Serialize, Deserialize)]
pub enum PacketID {
    Motion,
    Session,
    Lap,
    Event,
    Participants,
    CarSetups,
    CarTelemetry,
    CarStatus,
    FinalClassification,
    LobbyInfo,
    CarDamage,
    SessionHistory,
    TyreSets,
    MotionEx,
}

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
#[derive(Default, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct JSONTelemetrySession {
    pub uid: Option<String>,
    pub player_car_index: u8,
    pub start_date: chrono::DateTime<Utc>,
    pub end_date: Option<DateTime<Utc>>,
    pub total_distance: f32,
    pub weather: u8,
    pub time_of_day: u32,
    pub total_laps: u8,
    pub track_id: i8,
}

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
