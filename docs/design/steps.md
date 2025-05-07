# Steps

## Registering

1. The user enters a username
    - This username is checked against the database, to make sure that the username entered by the user is unique. Presents an error to the user if it is not unique.
    - This username is validated against a regex which requires the username to contain only alphanumeric characters, and be between 3 and 16 characters in length.
2. The user enters a password
    - This password is validated against a regex which requires the password to contain at least one lowercase character, one uppercase character, one number, one special character and be at least 8 characters in length.
3. The user enters their password again
    - This is validated against the other password input with an equality check, to ensure that the user didn't make a mistake
4. The user submits the form
    - The server processes the request for registration. If successful, the server will create a session, and redirect the user to their profile page.

## Logging in

1. The user enters a username
    - This username is used to search for a user in the database. If no username is provided, the user is presented with an error.
2. The user enters a password
    - This password is hashed and then verified against the stored password hash in the database. If the hashes do not match the user is presented with an error.
3. The user submits the form
    - Sends the form input to the user to process the request. Creates a new session and redirects the user to their profile on success.

## Generating/Rotating a Refresh Token

1. The user navigates to the settings page
    - This is accomplished by clicking the "My Profile" dropdown button on the navbar, and selecting "Settings"
2. The user clicks the generate/rotate token button
3. The user confirms their intent through the modal dialog
    - This is done to ensure that the user is made aware that when they rotate the token, any desktop client still using the old token will no longer be able to authenticate.
    - This sends the request to the server which then generates a new token and deletes the old one from the database.
4. The token is presented in a disabled input field to the user, and copied to their clipboard

## Using the desktop app

1. User downloads desktop app
2. User opens desktop app
3. User pastes refresh token from settings page into input field
4. User confirms login attempt
5. If successful, user is presented with a message containing their username, to alert them of the sign in.
6. User plays the game
    - From this point onward, the desktop app will automatically listen for communications from the game, and automatically forward events (new laps, new session, session end etc.) to the web api as required, without user input.

## Comparing telemetry data

1. User opens profile page
2. User navigates to a completed telemetry session
    - A session must be complete before telemetry data can be inspected, to prevent users from examining outdated data without the full history of the session first. (Telemetry graphs do not live update)
3. User scrolls down to telemetry data section
4. User selects comparison lap through dropdown
    - After selecting a comparison lap, the graph components redraw with the comparison data plotted alongside the initial lap
5. User inspects graphs
