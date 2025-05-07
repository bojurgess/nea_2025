# Validation

## Accessing API Routes - Try/Catch blocks

**Module:** `apps\web\src\hooks.server.ts`  
**Description:** This code block verifies a JWT access token sent in a request payload by a desktop client, using the jwt package `jose`'s built in jwtVerify algorithm. If the verification fails (i.e. the JWT was not signed by the server) then an exception is thrown. This is handled by the catch block which returns an `401 Unathorized` response to the client which made the request.

```typescript
try {
	const { payload } = await jwtVerify<{ username: string; sub: string }>(
		token,
		JWT_ACCESS_SECRET_KEY,
		{
			algorithms: ["HS256"]
		}
	);
	const [userResult]: [Database.User] =
		await db`SELECT * FROM users WHERE username = ${payload.username}`;
	event.locals.user = {
		id: userResult.id,
		username: payload.username,
		flag: userResult.flag!,
		avatar: userResult.avatar!,
		joinDate: userResult.joinDate
	};
} catch (err) {
	console.warn(`Invalid access token: ${err}`);
	return new Response(null, { status: 401 });
}
```

## Generating an access token - Try/Catch block

**Module:** `apps\web\src\routes\auth\access-token\+server.ts`  
**Description:** This code block verifies that when a desktop client tries to exchange a refresh token for a short lived access token, which authorizes it to make api requests to the backend, that the token they provide is valid. It uses the jwt package `jose`'s built in jwtVerify algorithm to determine whether the refresh token has been signed by the server. If not, it throws an exception. It also throws an exception if the JWT's JTI does not exist in the database (i.e. the token has been rotated and is no longer valid at the time of exchange). The catch statement then forwards a generic error response onto the requesting client. This is to allow for the client to display the error to the user; the exact error message is obfuscated to the client to make it harder for bad actors to determine the cause of the error.

## Assorted Error Recovery Examples

**Module(s):**

1.  `apps\web\src\routes\api\session\[uid]\+server.ts`
2.  `apps\web\src\routes\api\session\[uid]\lap\+server.ts`
3.  `apps\web\src\routes\api\session\[uid]\lap\[id]\telemetry\+server.ts`

**Description:**
The following are examples of try-catch blocks being utilised in api endpoints on the backend, in order to ensure that the client on the other end always recieves a response, and that the server can recover from unexpected edge case errors in processing. By returning a response, we allow the client to gracefully retry the request.

### Example #1: Lap post

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

### Example 2: Session end

```typescript
try {
	const sessionUid = params.uid;
	const req: {
		endDate: string;
		totalLaps: number;
	} = await request.json();

	if (await isSessionEmpty(sessionUid)) {
		await db`DELETE FROM telemetry_sessions WHERE uid = ${sessionUid}`;
		await db.notify(
			`session:${sessionUid}`,
			JSON.stringify({
				type: "session_deleted",
				data: null
			})
		);

		return new Response(null, { status: 200 });
	}

	await db`UPDATE telemetry_sessions SET end_date = ${req.endDate}, total_laps = ${req.totalLaps} WHERE uid = ${sessionUid}`;

	await db.notify(
		`session:${sessionUid}`,
		JSON.stringify({
			type: "session_ended",
			data: {
				endDate: req.endDate,
				totalLaps: req.totalLaps
			}
		})
	);

	return new Response(null, {
		status: 200
	});
} catch (err) {
	console.error(`Error handling PUT request: ${err}`);
	return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
}
```

### Example #3: Fetching detailed telemetry data

```typescript
try {
	// the limit 1 is for extra safety, getting 2 laps worth of results will tank performance
	const [telemetry]: [{ carTelemetryData: Record<string, Telemetry.CarTelemetryData> }] =
		await db`
            SELECT
				'carTelemetryData', car_telemetry_data::json
            FROM laps
            WHERE laps.id = ${id} AND laps.session_uid = ${sessionUid}
            LIMIT 1
        `;
	return new Response(JSON.stringify({ ...telemetry, id }), { status: 200 });
} catch (error) {
	console.error(`ERROR on API endpoint GET /api/session/[uid]/lap/[id]/telemetry: `, error);
	return new Response(null, { status: 500 });
}
```

## User Input Validation - Regex/Equality

**Module:** `apps\web\src\routes\auth\+page.server.ts`  
**Description:** These blocks of code all validate the user's input during registration/login to ensure that the defined constraints are met before authenticating the user.

### Checking the equality of the password and confirm password field on registration

```typescript
if (password !== confirmPassword) {
	console.warn("Registration failed: password and confirm password do not match");
	return fail(400, { message: "Password and Confirm Password must match" });
}
```

This block makes sure that the input in the password and confirm password fields match. This is to prevent the user from accidentally entering a typo or mistake into their password, and being unable to sign in afterwards.

### Validating the username against the constraints defined by the username regex

```typescript
const USERNAME_REGEX = /^([a-z]|[A-Z]|[0-9]){3,16}$/;

if (!USERNAME_REGEX.test(username)) {
	console.warn("Registration failed: Username regex not passing");
	return fail(400, {
		message:
			"Invalid username! Your username must contain only alphanumeric characters, and be between 3 and 16 characters in length."
	});
}
```

This block makes sure that the user's username is only between 3 and 16 characters in length, and only contains alphanumeric characters. This is because the username should be easily readable, but also because it must be easily encoded into base64url format, so that user profiles can be visited through their username (e.g. /users/[username])

### Validating the password against the constraints defined by the password regex

```typescript
const PASSWORD_REGEX =
	/^(?=.[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!#@?&*$\-+=><\\{}[\].^])[a-zA-Z0-9!#@?&*$\-+=><\\{}[\].^]{8,256}$/;

if (!PASSWORD_REGEX.test(password)) {
	console.warn("Registration failed: Password regex failing");
	return fail(400, {
		message:
			"Invalid password! Your password must contain at least one lowercase character, one uppercase character, one number and one special character"
	});
}
```

This block ensures that the password is sufficiently strong to prevent against basic brute force attacks from bad actors. This is accomplished by requiring at least one lowercase character, one uppercase character, one digit and one special character, as well as mandating that the password must be at least 8 characters long. Additionally, a maximum password length is set to protect the service against [long password denial of service](https://www.acunetix.com/vulnerabilities/web/long-password-denial-of-service/), which allows attackers to bring services down by exploiting the hashing process of a password which is excessively long.

### Validating that the entered username does not exist before trying to create the user

```typescript
let [exists]: [{ id: string }] = await db`SELECT id FROM users WHERE username = ${username}`;

if (exists) {
	console.warn("Registration failed: user with this name already exists");
	return fail(400, { message: "User with this name already exists" });
}
```

### Validating the entered password against the stored hash in the database

```typescript
const auth = new Auth(db);
const {
	username,
	password,
	sessionIp,
	sessionCountry,
	sessionCity,
	sessionRegion,
	deviceType,
	userAgent
} = Object.fromEntries<string>(
	(await event.request.formData()).entries() as FormDataIterator<[string, string]>
);

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

When a user tries to authenticate with a username and password, this block ensures that the password entered is identical to the password entered at registration. This is accomplished by extracting the hashed password from the database, which was created at registration, and then verifying it against the hash of the entered password. The hashing of the entered password is automatically handled by the `Bun.password.verify()` function, using the same parameters as `Bun.password.hash()`

## Gathering Session/User Metadata - Try-Catch / Regexes

**Module:** `apps\web\src\routes\auth\+page.svelte`  
**Description:** This block of code uses a try-catch block to ensure that when we try to gather session metadata before uploading the registration/login form to the server, if we cannot get any of the data (e.g. if external api is down) then we catch the error and make sure that we can still submit the form without metadata (which can be collected on subsequent logins). We also use a specific regex to pattern match the user's device type from their user agent, in order to determine whether they are on mobile or desktop.

```typescript
try {
	const res = await fetch("https://ipapi.co/json/");
	const json = await res.json();
	sessionMetadata = {
		sessionIp: json.ip,
		sessionCountry: json.country_code,
		sessionCity: json.city,
		sessionRegion: json.region,
		deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
		userAgent: navigator.userAgent
	};
} catch (e) {
	console.error(`Failed to gather session metadata: ${e}`);
}
```
