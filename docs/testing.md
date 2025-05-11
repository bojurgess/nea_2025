# Testing

## Testing Evidence

## Auth Forms

### Register

- Too short username (erroneous) - Should present error message for username constraints [(Evidence at 0:30)](https://youtu.be/8dXh2on7bUY?t=30)
- Too long username (erroneous) - Should present error message for username constraints [(Evidence at 0:47)](https://youtu.be/8dXh2on7bUY?t=47)
- Username with non alphanumerics (erroneous) - Should present error message for username constraints [(Evidence at 0:54)](https://youtu.be/8dXh2on7bUY?t=54)
- 3 Character username (boundary) - User gets registered and redirected to their page [(Evidence at 0:58)](https://youtu.be/8dXh2on7bUY?t=58)
- 16 Character username (boundary) - User gets registered and redirected to their page [(Evidence at 1:08)](https://youtu.be/8dXh2on7bUY?t=68)
- 8 character password (boundary) - User gets registered and redirected to their page [(Evidence at 1:17)](https://youtu.be/8dXh2on7bUY?t=77)
- 256 character password (boundary) - User gets registered and redirected to their page [(Evidence at 1:33)](https://youtu.be/8dXh2on7bUY?t=93)
- Password with no uppercase (erroneous) - Should present error message for password constraints [(Evidence at 1:40)](https://youtu.be/8dXh2on7bUY?t=100)
- Password with no lowercase (erroneous) - Should present error message for password constraints [(Evidence at 1:46)](https://youtu.be/8dXh2on7bUY?t=106)
- Password with no special (erroneous) - Should present error message for password constraints [(Evidence at 1:49)](https://youtu.be/8dXh2on7bUY?t=109)
- Password with no digit (erroneous) - Should present error message for password constraints [(Evidence at 1:55)](https://youtu.be/8dXh2on7bUY?t=115)
- Password too short (erroneous) - Should present error message for password constraints [(Evidence at 1:59)](https://youtu.be/8dXh2on7bUY?t=119)
- Password too long (erroneous) - Should present error message for password constraints [(Evidence at 2:02)](https://youtu.be/8dXh2on7bUY?t=122)
- Confirm password not equal to password (erroneous) - Should present error message for password not equal to confirm [(Evidence at 2:07)](https://youtu.be/8dXh2on7bUY?t=127)
- Username alrerady taken - Should present error message for username taken (erroneous) [(Evidence at 2:14)](https://youtu.be/8dXh2on7bUY?t=134)
- Valid Username (typical) - No error message, redirects to profile page [(Evidence at 2:22)](https://youtu.be/8dXh2on7bUY?t=142)
- Valid Password (typical) - No error message, redirects to profile page [(Evidence at 2:33)](https://youtu.be/8dXh2on7bUY?t=153)
- User gets registered and redirected to their page (typical) - No error message, redirects to profile page [(Evidence at 2:33)](https://youtu.be/8dXh2on7bUY?t=153)

### Login

- Non existing username doesnt log someone in (typical) - Should present error with "username/password invalid" [(Evidence at 2:52)](https://youtu.be/8dXh2on7bUY?t=172)
- Validate that password wasn't stored plaintext in database (hashing working) (typical) - Database should show hashed password string beginning "argon2id" [(Evidence at 3:13)](https://youtu.be/8dXh2on7bUY?t=193)

## Settings

- Form submits (typical) - No error message should be displayed [(Evidence at 3:31)](https://youtu.be/8dXh2on7bUY?t=211)
- Nothing populated in input on first time (typical) - The input box should be empty [(Evidence at 3:28)](https://youtu.be/8dXh2on7bUY?t=208)
- User gets refresh token (typical) - The input box should be populated with a visible refresh token [(Evidence at 3:34)](https://youtu.be/8dXh2on7bUY?t=214)
- Dialog and buttons change contents when revisiting (gen -> rotate) (typical) - Messages should change from "generate token" to "rotate token" [(Evidence at 3:34)](https://youtu.be/8dXh2on7bUY?t=214)
- Token copies to clipboard (typical) - When trying to paste the token into the desktop app the token is what is pasted [(Evidence at 3:37)](https://youtu.be/8dXh2on7bUY?t=217)
- Toast fires (typical) - Message appears denoting that token has been copied [(Evidence at 3:34)](https://youtu.be/8dXh2on7bUY?t=214)

## Desktop App

- Try invalid refresh token (erroneous) - Should present invalid refresh token message [(Evidence at 3:50)](https://youtu.be/8dXh2on7bUY?t=230)
- Try valid refresh token (typical) - Should login & display username [(Evidence at 3:38)](https://youtu.be/8dXh2on7bUY?t=218)
- Console window validates connection (typical) - Console window should show listening for telemetry, session created messages, lap posted messages [(Evidence at 5:00)](https://youtu.be/8dXh2on7bUY?t=300)

## User page

- Sessions should populate as they get started (typical) - Profile page table should populate with new entry [(Evidence at 5:00)](https://youtu.be/8dXh2on7bUY?t=300)
- Ongoing sessions should be highlighted (typical) - An ongoing session should be pinkish-red in colour in the table [(Evidence at 5:02)](https://youtu.be/8dXh2on7bUY?t=302)
- Sessions should delete if they finish with 0 laps (typical) - When a session ends the table entry should disappear [(Evidence at 1:33 VIDEO 2)](https://youtu.be/yCNnRvSNI5A?t=93)
- New laps should populate automatically (typical) - Lap count in profile page should update [(Evidence at 22:46)](https://youtu.be/8dXh2on7bUY?t=1366)
- User information should be correct (typical) - Username should match what was entered on registration screen [(Evidence at 5:07)](https://youtu.be/8dXh2on7bUY?t=307)

## Users page

- All users should display (typical) - All registered users will have a table entry [(Evidence at 0:00 VIDEO 2)](https://youtu.be/yCNnRvSNI5A)
- Clicking a user should navigate to that user's page (typical) - The page will change to the user's profile page [(Evidence at 0:00 VIDEO 2)](https://youtu.be/yCNnRvSNI5A)

## Navbar

- User search should navigate correctly (typical) - Page will change to the user's page [(Evidence at 30:50)](https://youtu.be/8dXh2on7bUY?t=1850)
- Clicking profile dropdown should present the dropdown (typical) [(Evidence at 30:46)](https://youtu.be/8dXh2on7bUY?t=1846)
- Tracks dropdown should work (typical) - Dropdown should appear on hover and items should be clickable on the top bar [(Evidence at 21:33)](https://youtu.be/8dXh2on7bUY?t=1473)
- Tracks should navigate to tracks (typical) - clicking the tracks button should change the page to the tracks page [(Evidence at 21:33)](https://youtu.be/8dXh2on7bUY?t=1473)

## Tracks page

- All track data should be accurate (typial) - Fastest lap time should be equal to the fastest in the table & Average should be the mean lap time of all table entries [(Evidence at 21:35)](https://youtu.be/8dXh2on7bUY?t=1475)
- Grid should display properly (typical) - All tracks should have a grid item [(Evidence at 21:35)](https://youtu.be/8dXh2on7bUY?t=1475)

## Track page individual

- Should display table correctly (typical) - All users that have a valid lap on the track should display [(Evidence at 24:45)](https://youtu.be/8dXh2on7bUY?t=1485)
- Clicking a user should navigate them to their page (typical) - Page should change to a user's profile page [(Evidence at 0:09 VIDEO 2)](https://youtu.be/yCNnRvSNI5A?t=9)
- Lap times should be correct (typical) - Lap times should match what is displayed on the session page [(Evidence at 24:45)](https://youtu.be/8dXh2on7bUY?t=1485)
- Assists display correctly on session page (typical) - Assists should match what was driven on the lap [(Evidence at 24:45)](https://youtu.be/8dXh2on7bUY?t=1485)

## Session

- Verify that session cookie gets set (typical) - Browser dev tools should display a cookie set [(Evidence at 31:36)](https://youtu.be/8dXh2on7bUY?t=1896)
- Verify expiry time (typical) - Browser dev tools should show an expiry time 30 days in the future [(Evidence at 31:36)](https://youtu.be/8dXh2on7bUY?t=1896)

## Telemetry Session

- Restart the lap (typical) - When the lap completes after being restarted, data should appear normal (no overlapping data points on the graph) [(Evidence at 26:12)](https://youtu.be/8dXh2on7bUY?t=1572)
- Use a flashback (typical)- When the lap completes after using a flashback, data should appear normal (no overlapping data points on the graph) [(Evidence at 26:12)](https://youtu.be/8dXh2on7bUY?t=1572)
- Invalidate the lap (typical) - Lap invalid box should display the invalid lap icon [(Evidence at 26:12)](https://youtu.be/8dXh2on7bUY?t=1572)
- Change assists mid lap (typical) - Assists should match the most assists used in that lap [(Evidence at 26:12)](https://youtu.be/8dXh2on7bUY?t=1572)
- User starts a session before opening desktop app (erroneous) - The console window should show no attempt to end a session, and the session started thereafter should display successful session created message [(Evidence at 4:46)](https://youtu.be/8dXh2on7bUY?t=286)

# Session page

- Graphs only show up when session ends (typical) - The detailed telemetry section of a session should show [(Evidence at 0:25 VIDEO 2)](https://youtu.be/yCNnRvSNI5A?t=25)
- Session page should live update (typical) [(Evidence at 4:29 VIDEO 2)](https://youtu.be/yCNnRvSNI5A?t=269)
- Purple sectors/lap are correct (typical) - The fastest sectors and lap # should all be purple [(Evidence at 26:12)](https://youtu.be/8dXh2on7bUY?t=1572)
- Laps should be sorted in descending order based on lap # - The laps should be sorted in the correct order, with no table rows out of place (e.g. lap 2 coming before lap 1 or otherwise) [(Evidence at 26:12)](https://youtu.be/8dXh2on7bUY?t=1572)
- ALL Graphs display correctly (typical) - Graphs should show up when a comparison lap is selected or another lap is selected. Graphs should not be empty. Lines should draw correctly (should not fail horizontal line test, as in should be one-to-one relationship drawn on the graph) [(Evidence at 26:12)](https://youtu.be/8dXh2on7bUY?t=1572)
- Comparison works - Adding a comparison lap should redraw the graphs with a second line for each graph [(Evidence at 26:30)](https://youtu.be/8dXh2on7bUY?t=1590)
- Assists display correctly on session page (typical) - Assists should match what was driven on the lap [(Evidence at 26:12, 28:35)](https://youtu.be/8dXh2on7bUY?t=1715)
- Fastest lap and theoretical best should match in-game result (typical) [(Evidence at https://youtu.be/8dXh2on7bUY?t=1237)](20:37)

# TEST INPUTS

| **Case**                                       | **Username**           | **Password**                                                                                                                                                                                                                                                         | **Confirm Password** | **Expectation**                                |
| ---------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------- |
| 1. Too short username (erroneous)              | `ab`                   | `Aa1!aaaa`                                                                                                                                                                                                                                                           | same                 | ❌ Invalid username                            |
| 2. Too long username (erroneous)               | `averylongusername123` | `Aa1!aaaa`                                                                                                                                                                                                                                                           | same                 | ❌ Invalid username                            |
| 3. Username with non-alphanumerics (erroneous) | `user!@#`              | `Aa1!aaaa`                                                                                                                                                                                                                                                           | same                 | ❌ Invalid username                            |
| 4. 3 Character username (boundary)             | `abc`                  | `Aa1!aaaa`                                                                                                                                                                                                                                                           | same                 | ✅ Pass                                        |
| 5. 16 Character username (boundary)            | `abcdefghijklmnop`     | `Aa1!aaaa`                                                                                                                                                                                                                                                           | same                 | ✅ Pass                                        |
| 6. 8 character password (boundary)             | `validUser`            | `Aa1!aaaa`                                                                                                                                                                                                                                                           | same                 | ✅ Pass                                        |
| 7. 256 character password (boundary)           | `validUser`            | `Aa1!aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`   | same                 | ✅ Pass                                        |
| 8. Password with no uppercase (erroneous)      | `validUser`            | `aa1!aaaa`                                                                                                                                                                                                                                                           | same                 | ❌ Invalid password                            |
| 9. Password with no lowercase (erroneous)      | `validUser`            | `AA1!AAAA`                                                                                                                                                                                                                                                           | same                 | ❌ Invalid password                            |
| 10. Password with no special (erroneous)       | `validUser`            | `Aa1aaaaa`                                                                                                                                                                                                                                                           | same                 | ❌ Invalid password                            |
| 11. Password with no digit (erroneous)         | `validUser`            | `Aa!aaaaa`                                                                                                                                                                                                                                                           | same                 | ❌ Invalid password                            |
| 12. Password too short (erroneous)             | `validUser`            | `Aa1!a`                                                                                                                                                                                                                                                              | same                 | ❌ Invalid password                            |
| 13. Password too long (erroneous)              | `validUser`            | `Aa1!aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab` | same                 | ❌ Invalid password                            |
| 14. Confirm password not equal (erroneous)     | `validUser`            | `Aa1!aaaa`                                                                                                                                                                                                                                                           | `Aa1!bbbb`           | ❌ Password mismatch                           |
| 15. Username already taken (erroneous)         | `takenName`            | `Aa1!aaaa`                                                                                                                                                                                                                                                           | same                 | ❌ Duplicate username (requires backend check) |
| 16. Valid username (typical)                   | `johndoe12`            | `Aa1!valid`                                                                                                                                                                                                                                                          | same                 | ✅ Pass                                        |
| 17. Valid password (typical)                   | `janedoe34`            | `MyP@ssw0rd123!`                                                                                                                                                                                                                                                     | same                 | ✅ Pass                                        |
