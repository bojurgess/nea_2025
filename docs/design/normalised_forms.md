# Normalised Forms

## Column Names

id, username, avatar, flag, hashedPassword, joinDate, expiresAt, sessionIp, sessionCountry, sessionCity, sessionRegion, deviceType, userAgent, jti, gpName, firstGp, realLapRecord, country, location, trackName, trackLength, uid, playerCarIndex, startDate, endDate, totalDistance, weather, timeOfDay, totalLaps, id, lapTimeInMs, sector1TimeInMs, sector2TimeInMs, sector3TimeInMs, lapInvalid, assists, carTelemetryData

## 3NF Form

| Table                 | Columns                                                                                                               |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Users**             | id, username, avatar, flag, hashedPassword, joinDate                                                                  |
| **Sessions**          | id, userId, expiresAt, sessionIp, sessionCountry, sessionCity, sessionRegion, deviceType, userAgent                   |
| **RefreshTokens**     | jti, userId                                                                                                           |
| **Tracks**            | id, gpName, firstGp, realLapRecord, country, location, trackName, trackLength                                         |
| **TelemetrySessions** | uid, userId, playerCarIndex, startDate, endDate, totalDistance, weather, timeOfDay, totalLaps, trackId                |
| **Laps**              | id, sessionUid, lapTimeInMs, sector1TimeInMs, sector2TimeInMs, sector3TimeInMs, lapInvalid, assists, carTelemetryData |
