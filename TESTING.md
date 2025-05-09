# What to test

## Auth Forms

### Register

- Too short username
- Too long username
- Username with non alphanumerics
- Password with no uppercase
- Password with no lowercase
- Password with no special
- Password with no digit
- Password too short
- Password too long
- Confirm password not equal to password
- User gets registered and redirected to their page

### Login

- Non existing username doesnt log someone in
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

- Restart the lap
- Use a flashback
- Invalidate the lap
- Change assists mid lap
- Complete a clean lap
- Complete at least 5 (good regression)

# Session page

- Graphs only show up when session ends
- Session page should live update
- Purple sectors/lap are correct
- ALL Graphs display correctly
- Comparison works

- ASSISTS DISPLAY CORRECTLY ON SITE IN ALL PLACES
