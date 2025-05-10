# SQL Statements

All runtime parameters are marked by positional parameter syntax e.g. `($1, $2)` where necesary. All insertions of static values embedded in the statement as plaintext and are [in their own section of this document](#static-data).

# Table of Contents

1. [Users Table](#users-table)

    - [Inserting a new user](#inserting-a-new-user)
    - [Selecting user details](#selecting-user-details)
    - [Updating user flag](#updating-user-flag)
    - [Selecting user ID](#selecting-user-id)
    - [Selecting hashed password, ID, and flag](#selecting-hashed-password-id-and-flag)

2. [Sessions Table](#sessions-table)

    - [Inserting a new session](#inserting-a-new-session)
    - [Selecting a session with user details](#selecting-session-with-user-details)
    - [Updating session expiry time](#updating-session-expiry-time)
    - [Deleting a session](#deleting-a-session)

3. [Telemetry Sessions Table](#telemetry-sessions-table)

    - [Inserting a telemetry session](#inserting-a-telemetry-session)
    - [Deleting a telemetry session](#deleting-a-telemetry-session)
    - [Finalising a telemetry session (session end)](#finalising-a-telemetry-session-session-end)
    - [Get count of laps for a given telemetry session](#get-count-of-laps-for-a-given-telemetry-session)
    - [Updating the total distance in a session](#updating-the-total-distance-in-a-session)
    - [Selecting detailed telemetry data for a lap](#selecting-detailed-telemetry-data-for-a-lap)
    - [Selecting the first telemetry lap of a given session](#selecting-the-first-telemetry-lap-of-a-given-session)

4. [Laps Table](#laps-table)

    - [Inserting a new lap](#inserting-a-new-lap)
    - [Selecting a user's best lap for each track](#selecting-a-users-best-lap-for-each-track)
    - [Selecting all laps for a given session](#selecting-all-laps-for-a-given-session)

5. [Tracks Table](#tracks-table)

    - [Selecting a track](#selecting-a-track)
    - [Selecting the sum of total distances of telemetry sessions for each track](#selecting-the-sum-of-total-distances-of-telemetry-sessions-for-each-track)
    - [Selecting the amount of laps driven for each track in the database](#selecting-the-amount-of-laps-driven-for-each-track-in-the-database)
    - [Selecting each user's best lap for a given track](#selecting-each-users-best-lap-for-a-given-track)

6. [Refresh Tokens Table](#refresh-tokens-table)

    - [Inserting a refresh token (rotating)](#inserting-a-refresh-token-rotating)
    - [Deleting a refresh token (rotating)](#deleting-a-refresh-token-rotating)
    - [Selecting a refresh token](#selecting-a-refresh-token)

7. [Static Data Insertions](#static-data-insertions)

    - [Inserting static track list into database](#inserting-static-track-list-into-database)

## Users Table

### Inserting a new user

**Module(s):**

- `apps\web\src\routes\auth\+page.server.ts`

```postgresql
INSERT INTO users (id, username, hashed_password, flag) VALUES ($1, $2, $3, $4);
```

### Selecting user details

**Module(s):**

- `apps\web\src\routes\auth\+page.server.ts`

#### 1. Selecting user ID only

```postgresql
SELECT id FROM users WHERE username = $1;
```

#### 2. Selecting hashed password, ID, and flag

```postgresql
SELECT hashed_password, id, flag FROM users WHERE username = $1;
```

### Updating user flag

**Module(s):**

- `apps\web\src\routes\auth\+page.server.ts`

```postgresql
UPDATE users SET flag = $1 WHERE users.id = $2;
```

## Sessions Table

### Inserting a new session

**Module(s):**

- `apps\web\src\lib\server\auth.ts`

```postgresql
INSERT INTO sessions (
    id, user_id, expires_at, session_ip, session_country, session_city, session_region, device_type, user_agent
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
);
```

### Selecting a session with user details

**Module(s):**

- `apps\web\src\lib\server\auth.ts`

```postgresql
SELECT
    sessions.*, users.username, users.flag, users.avatar, users.join_date
FROM sessions INNER JOIN users ON users.id = sessions.user_id WHERE sessions.id = $1;
```

### Updating session expiry time

**Module(s):**

- `apps\web\src\lib\server\auth.ts`

```postgresql
UPDATE sessions SET expires_at = $1 WHERE id = $2;
```

### Deleting a session

**Module(s):**

- `apps\web\src\lib\server\auth.ts`

```postgresql
DELETE FROM sessions WHERE id = $1;
```

## Telemetry Sessions Table

### Inserting a telemetry session

**Module(s):**

- `apps\web\src\routes\api\session\+server.ts`

```postgresql
INSERT INTO telemetry_sessions (
    uid, user_id, player_car_index, start_date, total_distance, weather, time_of_day, total_laps, track_id
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
);
```

### Deleting a telemetry session

**Module(s):**

- `apps\web\src\routes\api\session\[uid]\+server.ts`

```postgresql
DELETE FROM telemetry_sessions WHERE uid = $1;
```

### Finalising a telemetry session (session end)

**Module(s):**

- `apps\web\src\routes\api\session\[uid]\+server.ts`

```postgresql
UPDATE telemetry_sessions SET end_date = $1, total_laps = $2 WHERE uid = $3;
```

### Get count of laps for a given telemetry session

**Module(s):**

- `apps\web\src\routes\api\session\[uid]\+server.ts`

```postgresql
SELECT COUNT(*) FROM laps WHERE laps.session_uid = $1;
```

### Updating the total distance in a session

**Module(s):**

- `apps\web\src\routes\api\session\[uid]\lap\+server.ts`

```postgresql
UPDATE telemetry_sessions SET total_distance = $1 WHERE telemetry_sessions.uid = $2;
```

### Selecting detailed telemetry data for a lap

**Module(s):**

1. `apps\web\src\routes\api\session\[uid]\lap\[id]\telemetry\+server.ts`
2. `apps\web\src\routes\session\[uid]\+page.server.ts`

#### 1. Selecting from a given session with a lap ID

```postgresql
SELECT 'carTelemetryData', car_telemetry_data::json FROM laps WHERE laps.id = $1 AND laps.session_uid = $2 LIMIT 1;
```

#### 2. Selecting the first telemetry lap of a given session

```postgresql
SELECT
	'id', laps.id,
	'carTelemetryData', car_telemetry_data::json
FROM laps
WHERE laps.session_uid = $1
ORDER BY laps.lap_time_in_ms ASC
LIMIT 1;
```

## Laps Table

### Inserting a new lap

**Module(s):**

- `apps\web\src\routes\api\session\[uid]\lap\+server.ts`

```postgresql
INSERT INTO laps (id, session_uid, lap_time_in_ms, sector1_time_in_ms, sector2_time_in_ms, sector3_time_in_ms, lap_invalid, assists, car_telemetry_data) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
);
```

### Selecting a user's best lap for each track

**Module(s):**

- `apps\web\src\routes\me\+page.server.ts`

```postgresql
SELECT DISTINCT ON (telemetry_sessions.track_id)
    lap.lap_time_in_ms,
    to_json(tracks) AS track
FROM laps lap
JOIN telemetry_sessions ON lap.session_uid = telemetry_sessions.uid
JOIN tracks ON telemetry_sessions.track_id = tracks.id
WHERE telemetry_sessions.user_id = $1
ORDER BY telemetry_sessions.track_id, lap.lap_time_in_ms;
```

### Selecting all user's best lap for a given track, total distance driven for a track, all users who have driven a track, and amount of laps driven for a given track

**Module(s):**

- `apps\web\src\routes\tracks\[id]\+page.server.ts`

```postgresql
WITH best_laps AS (
    SELECT DISTINCT ON (users.id)
        laps.session_uid,
        laps.lap_time_in_ms,
        laps.sector1_time_in_ms,
        laps.sector2_time_in_ms,
        laps.sector3_time_in_ms,
        laps.assists,
        users.id AS user_id,
        users.username,
        users.flag AS user_flag,
        telemetry_sessions.total_distance,
        telemetry_sessions.track_id
    FROM laps
    JOIN telemetry_sessions ON telemetry_sessions.uid = laps.session_uid
    JOIN users ON users.id = telemetry_sessions.user_id
    WHERE telemetry_sessions.track_id = ${id}
    ORDER BY users.id, laps.lap_time_in_ms ASC
),
lap_counts AS (
    SELECT COUNT(*) AS lap_count
    FROM laps
    JOIN telemetry_sessions ON telemetry_sessions.uid = laps.session_uid
    WHERE telemetry_sessions.track_id = ${id}
),
total_track_distance AS (
    SELECT SUM(telemetry_sessions.total_distance) AS total_distance
    FROM telemetry_sessions
    WHERE telemetry_sessions.track_id = ${id}
)
SELECT
    (SELECT lap_count FROM lap_counts) AS lap_count,
    (SELECT total_distance FROM total_track_distance) AS total_distance,
    json_agg(
        json_build_object(
            'sessionUid', best_laps.session_uid,
            'lapTimeInMs', best_laps.lap_time_in_ms,
            'sector1TimeInMs', best_laps.sector1_time_in_ms,
            'sector2TimeInMs', best_laps.sector2_time_in_ms,
            'sector3TimeInMs', best_laps.sector3_time_in_ms,
            'assists', best_laps.assists,
            'user', json_build_object(
                'id', best_laps.user_id,
                'username', best_laps.username,
                'flag', best_laps.user_flag
            )
        ) ORDER BY best_laps.lap_time_in_ms
    ) AS laps,
    best_laps.track_id
FROM best_laps
GROUP BY best_laps.track_id;
```

### Selecting all laps for a given session

**Module(s):**

- `apps\web\src\routes\me\+page.server.ts`

```postgresql
SELECT
	telemetry_sessions.uid,
	telemetry_sessions.start_date,
	telemetry_sessions.end_date,
	telemetry_sessions.total_distance,
	telemetry_sessions.weather,
	telemetry_sessions.time_of_day,
	telemetry_sessions.total_laps,
	json_agg(
		json_build_object(
			'id', laps.id,
			'lapTimeInMs', laps.lap_time_in_ms,
			'sector1TimeInMs', laps.sector1_time_in_ms,
			'sector2TimeInMs', laps.sector2_time_in_ms,
			'sector3TimeInMs', laps.sector3_time_in_ms,
			'lapInvalid',
```

laps.lap_invalid
)
) AS laps
FROM telemetry_sessions
LEFT JOIN laps ON laps.session_uid = telemetry_sessions.uid
WHERE telemetry_sessions.uid = \$1
GROUP BY telemetry_sessions.uid;

````

## Tracks Table

### Selecting a track

**Module(s):**

- `apps\web\src\routes\me\+page.server.ts`

```postgresql
SELECT * FROM tracks WHERE tracks.id = $1;
````

### Selecting the sum of total distances of telemetry sessions for each track

**Module(s):**

- `apps\web\src\routes\me\+page.server.ts`

```postgresql
SELECT
	track_id, SUM(total_distance)
FROM telemetry_sessions
GROUP BY track_id;
```

### Selecting the amount of laps driven for each track in the database

**Module(s):**

- `apps\web\src\routes\me\+page.server.ts`

```postgresql
SELECT
	track_id, COUNT(*)
FROM telemetry_sessions
LEFT JOIN laps ON laps.session_uid = telemetry_sessions.uid
GROUP BY track_id;
```

### Selecting each user's best lap for a given track

**Module(s):**

- `apps\web\src\routes\me\+page.server.ts`

```postgresql
SELECT
	telemetry_sessions.track_id,
	MIN(lap.lap_time_in_ms) AS best_lap_time
FROM laps lap
JOIN telemetry_sessions ON lap.session_uid = telemetry_sessions.uid
WHERE telemetry_sessions.user_id = $1
GROUP BY telemetry_sessions.track_id;
```

## Refresh Tokens Table

### Inserting a refresh token (rotating)

**Module(s):**

- `apps\web\src\routes\auth\+page.server.ts`

```postgresql
INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3);
```

### Deleting a refresh token (rotating)

**Module(s):**

- `apps\web\src\routes\auth\+page.server.ts`

```postgresql
DELETE FROM refresh_tokens WHERE token = $1;
```

### Selecting a refresh token

**Module(s):**

- `apps\web\src\routes\auth\+page.server.ts`

```postgresql
SELECT * FROM refresh_tokens WHERE token = $1;
```

## Static Data

### Inserting static track list into database

**Module(s):**

- `apps\web\src\lib\server\auth.ts`

```postgresql
INSERT INTO tracks (id, name, image_url, location, track_length, num_laps) VALUES
    ($1, $2, $3, $4, $5, $6);
```
