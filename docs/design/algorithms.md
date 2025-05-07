# Algorithms

## Binary Masking

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
async fn post_new_lap(&self, lap: Lap, store: &Arc<Store<Wry>>) ->Result<ApiLapResponse, RequestError> {
    let client = reqwest::Client::ne();
    match &self.session_uid {
        Some(uid) => {
            let url = format!("http:/localhost:5173/api/session{}/lap", uid);
            let raw_token = store.ge("access_token").expec("Failed to get value fromstore");
            let access_token: String =serde_json::from_valu(raw_token).unwrap();
            let payload =ApiLapRequest::new(lapclone());
            let res = client.post(url)
                .bearer_aut(access_token)
                .json(&payload)
                .send()
                .await;
            match res {
                Ok(res) => {
                    match res.status(){
                        StatusCode::OK=> {
                            Ok(resjson::<ApiapResponse().awaitunwrap())
                        },
                        _ => {
                            Er(RequestEror::HttpEror(resstatus()))
                        }
                    }
                },
                Err(e) => {
                    Er(RequestError::ReqestError(e))
                }
            }
        },
        None => {
            Err(RequestError::HttpErro(StatusCode::BAD_REQUEST))
        }
    }
}
```

## Realtime Event Handling

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
