# 📌 Current Todo List

## Immediate Tasks

- [x] Implement basic session auth on apps/web
- [x] Implement JWT auth token management on apps/web
- [x] Implement JWT access token generation on apps/desktop
- [x] Port previous telemetry serialisation logic to apps/desktop
- [x] Measure the start and end point of a session
- [x] Create a struct to store the state of a session (necessary data only)
- [x] Move definition of telemetry (formerly GameSession) session to telemetry package
- [x] Write api endpoint for session creation
- [x] Write api endpoint for session update (new lap)
- [x] Write api endpoint for session end (blob upload motion data) **\*replaced with presigned s3 url for upload instead**
- [x] Move documentation (Analysis, Doc. Design) into repo
- [ ] Create pages for user-facing endpoints
- [ ] Implement regex into auth flow (password strength, username validation)
- [ ] Implement a validation library on all inputs (api routes, auth logic)
- [ ] Create new database tables according to design docs

## Future Tasks

- [ ] Implement other game modes (Grand Prix)
- [ ] Get user displayed graphs working on apps/web
- [ ] Unify UI elements into common package
- [ ] Clean up comments
- [ ] **(LOW PRIORITY)** clean up / refactor logic into more sensible units
- [ ] Add wrangler (cloudflare) for session data purposes
- [ ] Try to tag completion of tasks with date (potentially also to specific commit)

## Design Tasks

- [x] Decide on a schema for local session database
- [x] Decide on a schema for remote storage of session data
- [x] Decide on a shape for session API endpoints
- [x] Decide on structure of main user-facing endpoints in apps/web (session display, metrics, profile etc.)
- [x] Decide on storage solution for final session data (S3?)
- [ ] Do I need a component framework (daisyUI, shadcn-svelte etc.)
- [ ] Choose a validation library (valibot, zod, yup etc.)
- [ ] Consider moving from MinIO (self-hosted S3) to cloudflare R2 (hosted solution)
- [ ] Create a better solution for database management (drizzle-orm?)
- [ ] Evaluate a switch to PostgreSQL on the backend (likely a no)

## Bugs

- [ ] auth?/login form action throws if user doesn't exist
- [ ] if a session doesnt exist in db and the user has a session cookie, apps/web throws
- [ ] serialisation error if a lap is invalidated (why?)
- [ ] error messages are not presented to the user if something goes wrong (/auth endpoint) (VERY CONFUSING BEHAVIOUR!!!)
