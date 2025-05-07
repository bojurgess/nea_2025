# Processes and tasks

My program's main tasks can be divided into three key categories.

- Collecting data from the user's game
- Providing an interface for comparison, analysis and review of basic & detailed telemetry data
- User management

## User Management

For the process of user management, my app maintains a set of tasks for registering users, logging users in, maintaining state of authenticaton sessions & authorisation of requests made both by the user and on the user's behalf.

The user management process allows a user to register for an account on the web app of my solution, which will maintain a record of all of their recorded data.

When creating a user, the user's input details are validated against three key checks

1. Regex validation
2. Password and password confirmation equality check
3. Username existence check

### Regex validation

When a user tries to create an account, we validate their input username, and their input password against these two regexes respectively

`^([a-z]|[A-Z]|[0-9]){3,16}$`

- Requires that the username must:
    - Contain only alphanumeric characters
    - Be between 3 and 16 characters in length

`^(?=.[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!#@?&*$\-+=><\\{}\[\].^])[a-zA-Z0-9!#@?&*$\-+=><\\{}\[\].^]{8,256}$`

- Requires that the password must:
    - Contain at least one lowercase letter
    - Contain at least one uppercase letter
    - Contain at least one number
    - Contain at least one special character
    - Be at least 8 characters in length

### Password and Confirmation Password equality check

When a user tries to create an account, we require that the password has to be entered two seperate times, in order to ensure that the user doesn't accidentally enter a password which they did not intend to enter. We use a simple equality `===` check in order to ensure that both these form fields are the same before proceeding with registration.

### Username existence check

When a user tries to create an account, we perform a simple database query to check if there are any rows in the users table with the same username that the new user is trying to claim. If any rows are returned, we fail the registration process and return an error to the user, because usernames must be unique.

When a user is either created or logs in to the web app, an authentication session is created which keeps track of metadata regarding the session (e.g. location), alongside a unique identifier for that session and an expiry time. This expiry time is prolonged if a user logs in within 15 days of the expiry time, but if otherwise allowed to expire will delete the user's session.

When a session is created, a cookie is also stored in the user's browser which allows the session to be validated and restored on subsequent requests. This allows for authorisation checks on protected routes, such as the /settings route, which will reject any requests from users without a valid session cookie.

Another component of the user management process are the token system. This subprocess allows a user to create a long-lived, private token which they can input into the desktop app in order to authenticate their account, without needing to enter user information.

The primary benefit of implementing a token based system over a traditional password based authentication system is that because sessions cannot be created on a desktop app such as that which exists on the web app, if a password based system were to be implemented on the desktop side, the user would not be able to later revoke that client's access to upload to their account. By implementing a token based system, the user is able to control access to uploading to their account, by rotating their token in the settings page.

An additional measure taken to ensure that user access control to the desktop app is respected, is that instead of using the refresh token to directly authenticate the desktop app with the web api, we instead exchange it for a short-lived access token, which lasts only for an hour. We then loop this process every hour. This is to ensure that the refresh token is still valid on a regular basis, as otherwise a connection between the desktop app and web api could persist as long as the desktop app remains open.

## Collecting User Data

When the user has downloaded the desktop app, and has an account with a valid refresh token. They can input this into the desktop app and authenticate to start listening for telemetry data from the game.

Internally, the program opens a socket for UDP communication on port 20777 for the game to send data, and waits for a session start packet. Once recieved, it loops through each packet and determines the type of each packet based on its size. It then uses a branching statement to use different logic for each possible packet. When laps are completed or sessions start/finish, the desktop app makes POST/PUT requests to the web api in order to commit the telemetry to the database.

The main purpose of this process is to aggregate telemetry data for each game session the user starts, and then push this data up to the web api where it can be displayed to the user through the web app. There is minimal input required of the user other than to start the app and input a valid refresh token.

## Providing an interface for comparison, analysis and review of basic & detailed telemetry data

This interface is solely contained within the web app portion of the solution. Within it, it allows the user to inspect historical data from previously recorded and ongoing telemetry (game) sessions.

### Aggregate / Theoretical data

The interface provides the user an average lap time on a session by session and track by track basis, alongside the user's fastest lap. This allows a user to examine their consistency in short term stints and over extended periods. Larger discrepancies in a user's average lap time will tell them that they are less consistent and encourage them to improve it

### Laps

The interface allows the user to examine their lap time series over a session, on a sector by sector basis with colour highlighting to show on which lap they were the fastest in each sector. This allows users to figure out where they are losing the most time between their laps, and offers a more granular analysis of each lap time.

The interface also presents the user with a regression analysis graph of their lap time series, which can be used by the user in order to gauge the level of the improvement over the course of a session. For example, a linear line of regression suggests the user is making fairly consistent improvements and that they may not yet be at the limit of their pace. A logarithmic regression could otherwise suggest that the user yielded high gains in lap time during earlier laps, when they were less familiar with the track, compared to later in the session when they were more experienced.

### Detailed traces

Also offered to the user through the web interface is a set of detailed trace graphs speed, throttle, gear, braking and steering, over the course of a lap. This allows a user to more closely examine their performance and where they are losing time. For example, a user may lock the brakes before a turn and can use the brake trace to understand that they were applying too high of a brake pressure for too long, to cause this. This can then be compared against their other laps using the comparison drop down system, to measure the difference between inputs from lap to lap. One one lap the user may lock the brakes and on another may have achieved the perfect level of braking for turn in. They can examine the difference and use it to construct a more strategy for braking in the future.
