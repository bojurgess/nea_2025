# Algorithms & Data Structures

## Binary Masking

By using a bit mask to encode the assists data for a particular lap, not only do I save on the amount of space which needs to be saved per lap (which can add up to large sums when lots of users are driving lots of laps), it also allows me to more easily validate the assists used during a lap. For example, if a user were to start and finish a lap with all assists turned off, but halfway through the lap turn all of the assists on to make driving easier, I can easily detect this as the assists are a 16-bit integer, the new value of assists will simply increase compared to its previous value. I can then always take the highest assists value used on each lap to ensure fairness across competitors

```rust
impl Assists {
    // ...rest of impl

    pub fn get_mask(&self) -> Result<u16, &'static str> {
        match self.is_initialised() {
            true => {
                let mut mask: u16 = 0b0000_0000_0000_0000_0000;
                mask |= (self.steering_assist.expect("Assists are not initialised!")) as u16;
                mask |= (self.braking_assist.expect("Assists are not initialised!") as u16) << 1;
                mask |= (self.gearbox_assist.expect("Assists are not initialised!") as u16) << 3;
                mask |= (self.pit_assist.expect("Assists are not initialised!") as u16) << 5;
                mask |= (self.pit_release_assist.expect("Assists are not initialised!") as u16) <<  6;
                mask |= (self.ers_assist.expect("Assists are not initialised!") as u16) << 7;
                mask |= (self.drs_assist.expect("Assists are not initialised!") as u16) << 8;
                mask |= (self.dynamic_racing_line.expect("Assists are not initialised!") as u16)    << 10;
                mask |= (self.traction_control.expect("Assists are not initialised!") as u16) <<    12;
                mask |= (self.anti_lock_brakes.expect("Assists are not initialised!") as u16) <<    13;

                Ok(mask)
            },
            false => { Err("Assists are not initialised!") }
        }
    }

    pub fn decode_assist(&self, assist: &str) -> Result<u8, &str> {
        let mask = self.get_mask()?;
        match assist {
            "steering_assist" => Ok((mask & 0b0000_0000_0000_0001) as u8),
            "braking_assist" => Ok((mask & 0b0000_0000_0000_0110) as u8),
            "gearbox_assist" => Ok((mask & 0b0000_0000_0001_1000) as u8),
            "pit_assist" => Ok((mask & 0b0000_0000_0010_0000) as u8),
            "pit_release_assist" => Ok((mask & 0b0000_0000_0100_0000) as u8),
            "ers_assist" => Ok((mask & 0b0000_0000_1000_0000) as u8),
            "drs_assist" => Ok((mask & 0b0000_0001_0000_0000) as u8),
            "racing_line" => Ok((mask & 0b0000_0110_0000_0000) as u8),
            "traction_control" => Ok((mask & 0b0001_1000_0000_0000) as u8),
            "anti_lock_brakes" => Ok((mask & 0b0010_0000_0000_0000) as u8),
            _ => Err("Unknown assist was supplied")
        }
    }
}
```

## Client-Server Communication

I have used REST architecture throughout my solution in order to facilitate the transmission of in-game detailed telemetry data to a web API from a desktop app.

Every REST API route is protected by Bearer authentication which first requires the desktop app to exchange a long-lasting JWT refresh token for a short-term JWT access token which is refreshed through another REST route `POST:/auth/access-token`.

The architecture of my API routes is as follows:

- `POST:/api/session`
    - Creates a new telemetry session in the database
- `PUT:/api/session/:uid`
    - Uploads finalised data for a telemetry session and ends the session
    - If there were no laps when the session ended, the session is deleted from the database
- `POST:/api/session/:uid/lap`
    - Creates a new lap for a given telemetry session in the database
- `GET:/api/session/:uid/lap/:id/telemetry`
    - Returns the detailed car_telemetry data for a given lap
    - Used to display graphs on the frontend UI (in this case no authentication is required as unauthenticated clients should be able to view public telemetry data)

```typescript
export const POST: RequestHandler = async ({ request, params }) => {
	let sessionUid = params.uid;
	const json: {
		lapNumber: number;
		totalDistance: number;
		lapTimeInMs: number;
		sector1TimeInMs: number;
		sector2TimeInMs: number;
		sector3TimeInMs: number;
		lapInvalid: boolean;
		assists: number;
		carTelemetry: Record<string, Telemetry.CarTelemetryData>;
	} = await request.json();

	const lap: Database.InsertLap = {
		id: json.lapNumber,
		sessionUid,
		lapTimeInMs: json.lapTimeInMs,
		sector1TimeInMs: json.sector1TimeInMs,
		sector2TimeInMs: json.sector2TimeInMs,
		sector3TimeInMs: json.sector3TimeInMs,
		lapInvalid: json.lapInvalid,
		assists: json.assists,
		carTelemetryData: json.carTelemetry
	};

	try {
		// The database library doesnt like the type of carTelemetryData, but it works so it doesnt matter
		// @ts-expect-error
		await db`INSERT INTO laps ${db(lap)}`;
		await db`UPDATE telemetry_sessions SET total_distance = ${json.totalDistance} WHERE telemetry_sessions.uid = ${sessionUid}`;
		await db.notify(
			`session:${sessionUid}`,
			JSON.stringify({
				type: "new_lap",
				data: camelcaseKeys({ ...lap, carTelemetryData: null }, { deep: true })
			})
		);
		await db.notify(
			`session:${sessionUid}`,
			JSON.stringify({
				type: "update_total_distance",
				data: json.totalDistance
			})
		);

		return new Response(JSON.stringify({ status: "success" }), { status: 200 });
	} catch (e) {
		console.log({ ...json, carTelemetryData: null });
		console.error(e);

		return new Response(null, { status: 500 });
	}
};
```

```rust
async fn post_new_lap(&self, lap: &Lap, store: &Arc<Store<Wry>>) ->Result<ApiLapResponse, RequestError> {
    let client = reqwest::Client::new();
    match &self.session_uid {
        Some(uid) => {
            let url = format!("http://localhost:5173/api/session/{}/lap", uid);
            let raw_token = store.get("access_token").expect("Failed to get value from store");
            let access_token: String = serde_json::from_value(raw_token).unwrap();
            let payload = ApiLapRequest::new(lap.clone());
            let res = client.post(url)
                .bearer_auth(access_token)
                .json(&payload)
                .send()
                .await;
            match res {
                Ok(res) => {
                    match res.status() {
                        StatusCode::OK => {
                            Ok(res.json::<ApiLapResponse>().await.unwrap())
                        },
                        _ => {
                            Err(RequestError::HttpError(res.status()))
                        }
                    }
                },
                Err(e) => {
                    Err(RequestError::ReqwestError(e))
                }
            }
        },
        None => {
            Err(RequestError::HttpError(StatusCode::BAD_REQUEST))
        }
    }
}
```

## Realtime Event Streaming

Server Sent Events (SSE), which is a protocol which sits on top of HTTP, and uses a long living HTTP request in order to continuously stream data down to a client.

I have used SSE in my solution in combination with PostgreSQL's NOTIFY builtin in order to push realtime updates of session states to a user's page, such that the results of a new lap or a new session starting can be immediately viewed on the web app.

This is accomplished by using a library specific to the SvelteKit frontend library, which wraps the client-server connection in a more developer friendly API, in conjunction with my database library's `notify()` helper to subscribe to changes on the database. To produce an event on the backend, there are two components: the SSE handler and the event producing logic. Where an event needs to be produced, I use the `notify()` function of my database library to push a new event on a channel, in the case below the channel name is `session:${sessionUid}`. Then, the SSE endpoint on the web api detects this change by using the database library's `listen()` function which returns a callback function to process the event payload (data). The SSE handler then parses this payload and emits it as a Server Sent Event, where it can be picked up by a client.

On the client side, the SSE library's `source()` function is used to listen for all types of events on a particular channel. These specific events are then handled by "selecting" the event from the eventListener produced by the `source()` function, where UI state can then be updated as needed from the payload.

The reason why I chose to wrap the database's `NOTIFY` and `LISTEN` logic with Server Sent Events is that it is insecure to allow the frontend client to make its own database connection, as this means that sensitive database credentials have to be passed down to the browser where they can be read by bad actors. By instead notifying the event on the server, and then listening to events on a backend api endpoint which passes the data to a client via SSE, no sensitive credentials are leaked and the database simply needs valid authentication credentaials (i.e. a JWT Access Token or Browser Session Cookie).

```typescript
import { produce } from "sveltekit-sse";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";

export const POST: RequestHandler = async ({ params }) => {
	const sessionUid = params.id;

	return produce(async function start({ emit }) {
		await db.listen(`session:${sessionUid}`, (payload) => {
			const decoded: { type: string; data: Record<string, unknown> } = JSON.parse(payload);
			emit(decoded.type, JSON.stringify(decoded.data));
		});
	});
};
```

```typescript
try {
	// The database library doesnt like the type of carTelemetryData, but it works so it doesnt matter
	// @ts-expect-error
	await db`INSERT INTO laps ${db(lap)}`;
	await db`UPDATE telemetry_sessions SET total_distance = ${json.totalDistance} WHERE telemetry_sessions.uid = ${sessionUid}`;
	await db.notify(
		`session:${sessionUid}`,
		JSON.stringify({
			type: "new_lap",
			data: camelcaseKeys({ ...lap, carTelemetryData: null }, { deep: true })
		})
	);
	await db.notify(
		`session:${sessionUid}`,
		JSON.stringify({
			type: "update_total_distance",
			data: json.totalDistance
		})
	);

	return new Response(JSON.stringify({ status: "success" }), { status: 200 });
} catch (e) {
	console.log({ ...json, carTelemetryData: null });
	console.error(e);

	return new Response(null, { status: 500 });
}
```

```typescript
export class Session {
	// ... rest of session class

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
		if (session.endDate) this.#endSession(sessionendDate, session.totalLaps);
		if (this.state === "Ongoing") {
			// event subscription logic here -->
			this.eventListener = source(`/api/sse/session/{this.uid}`);
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
					this.#endSession(payload.endDate, payloadtotalLaps);
				});
		}
	}
}
```

## Hashing

The two functions demonstrate how I have used hashing algorithms in my solution. The Bun runtime's builtin `password` api by default uses the argon2id hashing algorithm to generate a hash. I generate the argon2id hash of this password using the api, and then store it in the database to be compared against during login attempts.

During a login attempt, I retrieve the password hash from the database and use the bun `password` api's `verify()` function, which determines the algorithm used to hash an input `hash` parameter, and then recomputes the input password using the same algorithm and compares the two values.

Password hashing is a best practice for security as it prevents attackers from being able to steal user passwords in the event that access to the database is compromised.

```typescript
export const actions: Actions = {
	register: async (event) => {
		// ...rest of register method

		const hash = await Bun.password.hash(password);
		const userId = generateID();
		await db`INSERT INTO users ${db({ id: userId, username, hashedPassword: hash, flag: sessionCountry })}`;

		// ...rest of register method
	}
};
```

```typescript
let [result] = await db`SELECT hashed_password, id, flag FROM users WHERE username = ${username}`;

if (!result) {
	return fail(400, { message: "Invalid username or password" });
}

const { id: userId, hashedPassword, flag } = result;

const isPasswordValid = await Bun.password.verify(password, hashedPassword);
if (!isPasswordValid) {
	return fail(400, { message: "Invalid username or password" });
}
```

## BTreeMap

In my solution, I use a map structure which uses a generalised implementation of a Binary Tree data structure which allows for multiple nodes as children, called a B-Tree. I chose to use this implementation of a map because the underlying data structure is self balancing and always stores each key in sorted order. This is crucial for my use case of storing detailed telemetry data for each frame, as they need to be inserted chronologically.

### Definition

```rust
#[derive(Debug, Default, Clone)]
pub struct Lap {
    pub lap_number: u8,
    pub lap_time_in_ms: u32,
    pub driver_status: u8,
    pub sector1_time_in_ms: u16,
    pub sector2_time_in_ms: u16,
    pub lap_invalid: bool,
    pub assists: Option<Assists>,
    pub total_distance: f32,
    pub car_telemetry: BTreeMap<u32, JSONCarTelemetryData>
}

impl Lap {
    pub fn new(lap_data: LapData, assists: Option<Assists>) -> Self {
        Lap {
            // Removing one from the lap number is basically just a bandage fix to other problems
            // Specifically, the lap number gets updated between starting to post the lap and
            // actually making the request, but I don't have the time for a proper fix.
            lap_number: lap_data.current_lap_num - 1,
            lap_time_in_ms: lap_data.current_lap_time_in_ms,
            driver_status: lap_data.driver_status,
            sector1_time_in_ms: lap_data.sector1_time_in_ms,
            sector2_time_in_ms: lap_data.sector2_time_in_ms,
            lap_invalid: lap_data.current_lap_invalid,
            assists,
            total_distance: lap_data.total_distance,
            car_telemetry: BTreeMap::new()
        }
    }
}
```

### Inserting Data

```rust
            Packet::CarTelemetry(p) => {
                if let Some(lap) = &mut self.current_lap {
                    if lap.driver_status == 1 {
                        lap.car_telemetry.insert(p.header.overall_frame_identifier, JSONCarTelemetryData::new(p.car_telemetry_data[self.player_car_index as usize], lap.lap_time_in_ms));
                    }
                }
            }
```

### Querying Data

When the data is queried on the frontend, technically the data structure is no longer a BTreeMap as by this point it has been serialised to JSON to transmit through a HTTP REST endpoint; this is irrelevant as the order of the keys is still preserved and hence the benefits of using a BTreeMap are maintained, because we do not do any data insertion on the frontend (it is only a data display layer for the purposes of the telemetry data).

```rust
	let carTelemetryData = $derived(lap.carTelemetryData);
	let frames = $derived(Object.entries(carTelemetryData).map(([frame, _]) => parseInt(frame)));

	type DataRecord = { x: number; y: number };
	let data: DataRecord[] = $derived(
		Object.entries(carTelemetryData).map(([frame, telemetry]) => {
			return {
				x: parseInt(frame),
				y: telemetry.throttle * 100,
			};
		}),
	);
```
