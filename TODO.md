# 📌 Current Todo List

## Immediate Tasks

- [x] Implement basic session auth on apps/web
- [x] Implement JWT auth token management on apps/web
- [x] Implement JWT access token generation on apps/desktop
- [x] Port previous telemetry serialisation logic to apps/desktop
- [x] Measure the start and end point of a session
- [x] Create a struct to store the state of a session (necessary data only)
- [x] Move definition of telemetry (formerly GameSession) session to telemetry package
- [ ] Write api endpoint for session creation
- [ ] Write api endpoint for session update (new lap)
- [ ] Write api endpoint for session end (blob upload motion data)

## Future Tasks

- [ ] Implement other game modes (Grand Prix)
- [ ] Get user displayed graphs working on apps/web

## Design Tasks

- [x] Decide on a schema for local session database
- [x] Decide on a schema for remote storage of session data
- [ ] Decide on a shape for session API endpoints
- [ ] Decide on structure of main user-facing endpoints in apps/web (session display, metrics, profile etc.)
- [ ] Decide on storage solution for final session data (S3?)

## Bugs

- [ ] auth?/login form action throws if user doesn't exist
- [ ] if a session doesnt exist in db and the user has a session cookie, apps/web throws

---
