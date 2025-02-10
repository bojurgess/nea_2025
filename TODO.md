# 📌 Current Todo List

## Immediate Tasks

- [x] Implement basic session auth on apps/web
- [x] Implement JWT auth token management on apps/web
- [x] Implement JWT access token generation on apps/desktop
- [x] Port previous telemetry serialisation logic to apps/desktop  
       ~~- [ ] Get a local database connection working in apps/desktop~~
- [x] Measure the start and end point of a session
- [x] Create a struct to store the state of a session (necessary data only)
- [ ] Serialise GameSession struct to blob and write storage endpoint on apps/web

## Future Tasks

~~- [ ] Get sqlite to blob seralisation/deserialisation working between apps/desktop & apps/web~~

- [ ] Implement other game modes (Grand Prix)
- [ ] Get user displayed graphs working on apps/web

## Design Tasks

- [x] Decide on a schema for local session database
- [ ] Decide on a schema for remote storage of session data
- [ ] Decide on a shape for session API endpoints
- [ ] Decide on structure of main user-facing endpoints in apps/web (session display, metrics, profile etc.)
- [ ] Decide on storage solution for final session data (S3?)

## Bugs

- [ ] auth?/login form action throws if user doesn't exist

---
