# Security checklist

CoLogger — filled in 2026-10-11, before final submission.

## Secrets and credentials

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 1 | `.env` is gitignored and is not in the repository | Yes | `.gitignore` lists `.env` and `.env.*` with an exception for `!.env.example`. `git ls-files server/` returns `.env.example` only. |
| 2 | A `.env.example` with placeholder values only is committed | Yes | `server/.env.example` ships `DATABASE_URL=postgresql://postgres:change-me@localhost:5432/cologger`; `client/.env.example` points at `http://localhost:3000`. Both are placeholders with no real host or password. |
| 3 | No connection string, key, token or password is hardcoded in source, comments or commented-out code | Yes | I searched the tree for `postgres://`, `postgresql://`, `api key` and `secret`. The only matches are `compose.yml`, which reads `${POSTGRES_PASSWORD}` from the environment, and `client/src/api/seedData.js`, which holds the demo account password `cologger-demo`. That one is published deliberately in the README so a grader can log in, and it unlocks only sample data. |
| 4 | Git history is clean: I searched `git log -p` for password, secret, api key and `postgres://` | Yes | I searched the full history with `git log -p \| Select-String` for `postgresql://`, `postgres://`, `api key` and `secret`. Every match is documentation or a placeholder: `compose.yml` reads `${POSTGRES_PASSWORD}` from the environment, `.env.example` carries `change-me` and `devpassword` placeholders inherited from the class template, README and workflow comments only mention the words, and a test fixture is named "Secret item". No real credential has ever been committed. |
| 5 | Any credential that was ever committed has been rotated | Yes | No credential was ever committed. I did reset my Supabase database password during setup, after the original was exposed outside the repository; the replacement exists only in my local `.env` and in Render's environment settings. |
| 6 | Production credentials live only in my hosting provider's environment settings | Yes | `DATABASE_URL`, `NODE_ENV` and `CORS_ORIGINS` are set in Render's Environment tab. The repository contains none of them. |

## GitHub Actions

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 7 | No secret value is written literally in any workflow YAML file | Yes | `.github/workflows/deploy-pages.yml` is the only workflow. It reads `vars.VITE_USE_MOCK_API` and `vars.VITE_API_BASE_URL` and contains no literal values. |
| 8 | Secrets are stored in repository Actions secrets and read with `${{ secrets.NAME }}` | N/A | This workflow needs no secrets. The two values it uses are compiled into public JavaScript, so they are deliberately repository *variables* rather than secrets; the workflow's own comments explain the reasoning. No database URL or key is used at build time. |
| 9 | No workflow step echoes, dumps or debug-prints a secret, and I opened a recent run's log to confirm | Yes | The only `echo` writes `ready=true` to `$GITHUB_OUTPUT`. I opened the most recent run's log and found no credential printed. |
| 10 | Uploaded build artifacts contain no `.env`, key file or generated config | Yes | The artifact is `client/dist`, built by `npm run build` from `client/src`. `.env` is gitignored, so it is never checked out onto the runner in the first place. |
| 11 | Third-party actions are pinned to a commit SHA, not a moveable tag | No | All four are pinned to major tags: `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`. They are first-party GitHub actions, which is lower risk than a third-party one, but a tag can still be moved. Pinning to SHAs is a change I would make before relying on this workflow for anything real. |
| 12 | Secret scanning and push protection are enabled on the repository | Yes | Checked at Settings → Advanced Security. Both Secret Protection and Push protection are enabled for this public repository, so GitHub monitors commits for exposed credentials and blocks pushes containing recognised secret patterns. |

## Database

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 13 | Every query taking user input uses parameters, never string concatenation | Yes | Every query in `server/repos/` uses `$1`, `$2` placeholders. Search text is matched with `position(lower($2) in lower(i.name))` instead of `ILIKE`, so `%` and `_` typed by a user are treated literally rather than as wildcards. Route ids pass through `parseId` in `server/validation.js`, which rejects anything that is not a positive whole number before it reaches the database. |
| 14 | The database is not open to the whole internet, or is reachable only by the app | Yes | The database is hosted on Supabase and reached over its session pooler with a password held only in my local `.env` and in Render's environment settings. Supabase's public REST API is no longer a second way in either, now that Row Level Security is enabled on all four tables — see row 19. |
| 15 | The database user the app connects as has only the permissions it needs | No | The app connects as the Supabase project's default database owner, which has more rights than it needs. A dedicated role limited to SELECT, INSERT, UPDATE and DELETE on the four application tables would be better, and is a change I would make for a real deployment. |
| 16 | Seed and sample data is invented, not real people's data | Yes | `server/db/seed.sql` and `client/src/api/seedData.js` contain one invented account, `demo@cologger.test`, on a reserved `.test` domain, with made-up collections and items. No real person's data appears anywhere. |
| 17 | Debug, seed and reset routes are removed before going public | Yes | There are no debug or seed HTTP routes. Seeding is an npm script, `npm run db:seed`, run from a terminal with a local `.env`; it is not reachable over the network. The only additional endpoints are `/healthz` and `/readyz`, which return `{"ok":true,"db":"up"}` and expose no data. |

## Access control

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 18 | The app has an access layer: Cloudflare Zero Trust, an app-level password, or a real login | Yes | A real login. Passwords are hashed with bcrypt in `server/routes/auth.js`. Logging in creates a random token whose SHA-256 hash alone is stored in the `sessions` table, expiring after 30 days; logout deletes the row. |
| 19 | If Supabase or Firebase: Row Level Security or security rules are on, and I tested it signed out | Yes | RLS was **disabled** on all four tables when I checked — the Table Editor showed `users`, `sessions`, `collections` and `items` each marked UNRESTRICTED. This mattered because Supabase exposes a public REST API with an anon key alongside the Postgres connection my app uses, so with RLS off that API could read `users` (emails and bcrypt hashes) and `sessions` (session token hashes) without passing through the login I wrote. I enabled RLS on all four tables with no policies attached, which blocks the anon API while leaving my app working, since it connects as the table owner and owners bypass RLS. I then reloaded the deployed site, logged in and opened a collection to confirm nothing broke. |
| 20 | If Zero Trust: tjakoen.s@gmail.com is on the access policy. If an app password: the credentials are in my private workspace `project/README.md` | N/A | Neither is used. The app has its own account system with per-user registration and login, so there is no shared gate or app password to record. |
| 21 | The gate covers every route, including the ones that only change data | Yes | `requireAuth` in `server/middleware/auth.js` is mounted on every `/api` route except register and login. Beyond that, each SQL query carries its own ownership check — `c.user_id = $1` — so a user asking for another user's collection or item receives a 404 rather than their data. I tested this by logging in as a second account and typing a first account's `/collections/:id` URL directly into the address bar. |
| 22 | The credentials for the gate are environment variables, not in source | Yes | There are no gate credentials. Each user's own password is bcrypt-hashed in the database, is never stored in the browser, and never appears in source. |

## Input and output

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 23 | Input from the user is validated on the server, not only in the browser | Yes | `server/validation.js` revalidates everything the browser checked: required fields, lengths, money format and range, real dates not in the future, currency and condition against fixed lists, and images against a data-URL pattern and size cap. The browser checks the same rules first for instant feedback, but the server's are the ones that protect the database. `CHECK` constraints in `schema.sql` add a third layer. |
| 24 | User-supplied text is escaped when rendered, so it cannot inject markup or script | Yes | The client is React, which escapes text in JSX by default. There is no `dangerouslySetInnerHTML` anywhere in `client/src`. |
| 25 | Error responses do not expose stack traces, file paths or connection details | Yes | `NODE_ENV=production` is set on Render, which disables Express's stack traces. The error handler returns a plain message, and validation failures return a field-by-field object with no internal detail. |
| 26 | CORS is not a wildcard on routes that change data | Yes | `CORS_ORIGINS` on Render is set to `https://jmyspn.github.io` exactly, which the deploy log confirms: `CORS allows: https://jmyspn.github.io`. Locally it is `http://localhost:5173`. No wildcard is used anywhere. `helmet` also sets security headers, and login and register are rate limited to 20 attempts per 15 minutes per IP. |

## Repository and privacy

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 27 | No student number, personal email, phone number or home address in the repository or in commit messages | No | No file in the repository contains my student number, email, phone number or address, and no commit message does. However, my real name and personal email appear in the git author metadata of every commit, because I had not set a GitHub no-reply address when I started the project. I have not rewritten the history: every commit link in `AI-USAGE.md`, which is graded, points at these hashes, and rewriting would break all of them. I would rather record this accurately than hide it. |
| 28 | No classmate's personal data in the repository | Yes | I worked alone on this project. The only account in the repository is the invented `demo@cologger.test`. |
| 29 | Dependencies come from official registries, and `node_modules` is gitignored | Yes | Every dependency in `server/package.json` and `client/package.json` comes from npm, with both lockfiles committed. `.gitignore` excludes `node_modules/`, and `git ls-files` lists none. |
| 30 | Images, fonts and other assets are mine, licensed, or credited | Yes | The only images in the repository are my own screenshots of the running app, in `docs/screenshots/`. Item and collection photos are uploaded by each user and stored in the database as data URLs, so none are committed. The app uses system fonts only. |
| 31 | Repository visibility is deliberate, and I checked it after my last push | Yes | The repository is public on purpose: the unit requires it, and GitHub Pages will not serve a private repository on a free account. I confirmed the setting after my final push. |

## Anything I found and fixed

Two things, neither of which I knew about before working through this list.

The first was Row Level Security. Row 19 made me look at a part of Supabase I had never opened, and all four of my tables were marked UNRESTRICTED. I had been thinking of the database as something only my Express API could reach, but Supabase also exposes a REST API with an anon key that is meant to be public, and with RLS off that API could have read `users` and `sessions` directly — emails, bcrypt hashes and the session token hashes that authenticate every logged-in browser — without touching the login I wrote. The ownership checks in my SQL only protect requests that come through my own API. I enabled RLS on all four tables with no policies, which blocks the anon API while leaving my app working, because it connects as the table owner and owners bypass RLS. I reloaded the deployed site and confirmed login and collections still work. This was the most useful thing the checklist caught.

The second was my own name and personal email in the author metadata of every commit, on a public repository. I had checked file contents for identifying details and never thought about commit metadata. I decided against rewriting history: every commit link in `AI-USAGE.md` would break, and that file is graded, so I have recorded the problem honestly in row 27 instead and set a no-reply address for future work.

The rest were already in reasonable shape. Two I answered No rather than fixing tonight: the GitHub Actions are pinned to major tags rather than commit SHAs, and the app connects to the database as the project owner rather than a restricted role. Both are real weaknesses, both are things I would change before treating this as a production deployment, and I would rather say so than mark them Yes.
