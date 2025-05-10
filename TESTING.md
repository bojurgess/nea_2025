# What to test

## Auth Forms

### Register

- Too short username (erroneous)
- Too long username (erroneous)
- Username with non alphanumerics (erroneous)
- 3 Character username (boundary)
- 16 Character username (boundary)
- 8 character password (boundary)
- 256 character password (boundary)
- Password with no uppercase (erroneous)
- Password with no lowercase (erroneous)
- Password with no special (erroneous)
- Password with no digit (erroneous)
- Password too short (erroneous)
- Password too long (erroneous)
- Confirm password not equal to password (erroneous)
- Username alrerady taken (erroneous)
- Valid Username (typical)
- Valid Password (typical)
- User gets registered and redirected to their page (typical)

### Login

- Non existing username doesnt log someone in (typical)
- Validate that password wasn't stored plaintext in database (hashing working)

## Settings

- Form submits
- Nothing populated in input on first time
- User gets refresh token
- Dialog and buttons change contents when revisiting (gen -> rotate)
- Token copies to clipboard
- Toast fires

## Desktop App

- Try invalid refresh token
- Error message should display
- Try valid refresh token
- Should login
- Specifying custom addr should change the addr
- Use console to show things working

## User page

- Sessions should populate as they get started
- Sessions should delete if they finish with 0 laps
- New laps should populate automatically
- User information should be correct
- Historical sessions should be there

## Users page

- All users should display
- Clicking a user should navigate to that user's page

## Navbar

- User search should navigate correctly
- Clicking profile dropdown should present the dropdown
- All nav dropdowns should work
- Tracks should navigate to tracks

## Tracks page

- All track data should be accurate
- Grid should display properly

## Track page individual

- Should display table correctly
- Clicking a user should navigate them to their page
- Lap times should be correct

## Session

- Verify that session cookie gets set
- Verify expiry time

## Telemetry Session

- Restart the lap (typical)
- Use a flashback (typical)
- Invalidate the lap (typical)
- Change assists mid lap (typical)
- Complete a clean lap (typical)
- Complete at least 5 (good regression) (typical)
- User starts a session before opening desktop app (erroneous)

# Session page

- Graphs only show up when session ends
- Session page should live update
- Purple sectors/lap are correct
- ALL Graphs display correctly
- Comparison works

- ASSISTS DISPLAY CORRECTLY ON SITE IN ALL PLACES

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
