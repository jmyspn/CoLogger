# CoLogger

CoLogger (Collection Logger) is a full-stack web application for collectors who want to organize and track personal collections — mechanical keyboards, sneakers, trading cards, watches, games, figures and anything else. Each collection holds items with a name, image, estimated value, currency, purchase price, acquired date, where it was acquired, condition, notes and a favorite flag.

**Stack:** React 18 + Vite + React Router (client) · Express 4 (API) · PostgreSQL (database) · bcrypt-hashed passwords with server-side sessions.

**Live app:** <https://jmyspn.github.io/CoLogger/> · **API:** <https://cologger-api.onrender.com>

> The client runs on GitHub Pages, the API on Render (Singapore) and the database on Supabase. The free Render instance sleeps after about 15 minutes of inactivity, so the first request after a quiet spell can take up to a minute while it wakes. Everything after that responds normally.

## Contents

- [Overview](#overview)
- [Requirements](#requirements)
- [Setup from a fresh clone](#setup-from-a-fresh-clone)
- [Environment variables](#environment-variables)
- [Database setup](#database-setup)
- [How to run](#how-to-run)
- [Features and usage](#features-and-usage)
- [How the data flows](#how-the-data-flows)
- [Project structure](#project-structure)
- [Screenshots](#screenshots)
- [Known issues and next steps](#known-issues-and-next-steps)
- [AI usage](#ai-usage)

## Overview

- Register and log in; every collection and item belongs to the logged-in user.
- Create, search, rename and delete collections, each with its own cover image.
- Add, view, edit, favorite and delete items inside a collection, including an image.
- The dashboard shows totals (collections, items, favorites) and recent items, all counted live from the database.
- Works on desktop and phones (tested at 375, 390 and 412 px wide).
- See every favorited item in one place on the Favorites screen.

## Requirements

- **Node.js 20.6 or newer** (the server uses `node --env-file`)
- **npm** (comes with Node)
- **PostgreSQL 14 or newer**, running locally or hosted (e.g. Neon)
- Git

## Setup from a fresh clone

```bash
git clone https://github.com/jmyspn/CoLogger.git
cd CoLogger
```

### 1. Server

```bash
cd server
npm install
cp .env.example .env        # then edit .env (see below)
npm run db:reset            # creates the tables and loads the sample data
npm run dev                 # API on http://localhost:3000
```

Check it is working: open <http://localhost:3000/readyz>. It should show `{"ok":true,"db":"up"}`.

### 2. Client (in a second terminal)

```bash
cd client
npm install
cp .env.example .env        # the defaults point at http://localhost:3000
npm run dev                 # app on http://localhost:5173
```

Open <http://localhost:5173>. Log in with the sample account below, or register a new one.

| Sample account | |
| --- | --- |
| Email | `demo@cologger.test` |
| Password | `cologger-demo` |

This account is created by `npm run db:seed`, and its password is published on purpose so a grader can log in. It is not a real credential.

On Windows PowerShell, use `copy .env.example .env` instead of `cp`.

## Environment variables

`.env` files are git-ignored. Only the `.env.example` files are committed, and they contain placeholders only.

### `server/.env`

| Variable | Example | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://postgres:YOUR_PASSWORD@localhost:5432/cologger` | PostgreSQL connection string. Hosted databases usually need `?sslmode=require`. |
| `CORS_ORIGINS` | `http://localhost:5173` | Browser origins allowed to call the API, comma-separated, with no trailing slash. |
| `NODE_ENV` | `development` | Set to `production` on a host. |
| `PORT` | *(do not set)* | The host provides it. It defaults to 3000 locally. |

### `client/.env`

| Variable | Example | Purpose |
| --- | --- | --- |
| `VITE_USE_MOCK_API` | `false` | `false` means use the real API. Anything else, including unset, means demo mode. |
| `VITE_API_BASE_URL` | `http://localhost:3000` | Where the API lives, with no trailing slash. |

`VITE_` values are compiled into the public JavaScript. Never put secrets in them.

## Database setup

1. Create an empty database called `cologger`, for example with `createdb cologger` or `CREATE DATABASE cologger;` in psql/pgAdmin.
2. Put its connection string in `server/.env` as `DATABASE_URL`.
3. From `server/`, run:

   | Command | What it does |
   | --- | --- |
   | `npm run db:schema` | Runs `db/schema.sql`. Creates the tables and is safe to run twice. |
   | `npm run db:seed` | Runs `db/seed.js`. **Empties every table**, creates the demo user (password hashed with bcrypt), then loads `db/seed.sql`. |
   | `npm run db:reset` | Runs both of the above. |
   | `npm test` | Runs API integration tests against the database. They use throwaway accounts and delete them afterwards. |

   Never run `db:seed` against a database whose data you want to keep.

### Schema

```
users ──< sessions
users ──< collections ──< items
```

| Table | Key columns |
| --- | --- |
| `users` | `id`, `name`, `email` (unique, case-insensitive), `password_hash` |
| `sessions` | `user_id`, `token_hash` (SHA-256 of the login token), `expires_at` |
| `collections` | `id`, `user_id`, `name` (unique per user, case-insensitive), `description`, `image` |
| `items` | `id`, `collection_id`, `name`, `image`, `estimated_value`, `currency`, `purchase_price`, `acquired_date`, `acquired_from`, `condition`, `notes`, `is_favorite` |

Foreign keys use `ON DELETE CASCADE`: deleting a collection deletes its items. Item counts and dashboard totals are not stored anywhere; they are counted with SQL on every request, so they can't drift out of date.

## How to run

| Task | Where | Command |
| --- | --- | --- |
| API with auto-restart | `server/` | `npm run dev` |
| API, production style | `server/` | `npm start` |
| API tests | `server/` | `npm test` |
| Client dev server | `client/` | `npm run dev` |
| Client production build | `client/` | `npm run build` (output in `client/dist`) |

### Demo mode

If the client is built without `VITE_USE_MOCK_API=false`, it uses `client/src/api/mockApi.js` instead of the API. This is the template's "simulated backend": everything is stored in that browser's `localStorage`, and a yellow **Demo mode** notice is shown on every page. Sample data is written only the first time, when that storage is empty. Demo mode exists so the GitHub Pages link works before the API is deployed. It is not the real application, and the two are never used at the same time.

## Features and usage

| Screen | Route | What you can do |
| --- | --- | --- |
| Login | `/login` | Log in. After logging in you return to the page you originally asked for. |
| Register | `/register` | Create an account. You are logged in straight away. |
| Dashboard | `/dashboard` | Live totals, the 6 most recent items, a search across collection and item names, and "+ New Collection". |
| Favorites | `/favorites` | Every item you have hearted, newest first. Un-hearting leaves the item in place until the next load, so a mis-click is easy to undo. |
| Collections | `/collections` | Search your collections and create a new one (dialog), with an optional cover image. Each card shows its computed item count. |
| Collection Details | `/collections/:id` | Only that collection's items. Search within it, rename the collection or change its cover, delete it, add an item, favorite items. |
| Add Item | `/collections/:id/items/new` | Shared `ItemForm`. The item is saved into the collection named in the URL. |
| Item Details | `/items/:id` | All fields, favorite toggle, Edit, Delete, and "Back to *its* collection". |
| Edit Item | `/items/:id/edit` | The same `ItemForm`, filled with that item's saved values. |

Every app route requires a login. If you're not logged in you are sent to `/login`. An id that does not exist shows **Collection not found** or **Item not found**. It never falls back to other data. Unknown URLs show **Page not found**.

**Validation.** It happens both in the browser (instant messages next to each field) and in the API (so a bypassed browser can't store bad data):
- Collection and item names are required.
- Money values must be numbers, 0 or more, with at most 2 decimals.
- Dates must be real dates and not in the future.
- Currency and condition must come from their lists.
- Lengths are limited.
- Duplicate collection names and duplicate emails are rejected.

**Authentication.**
- Passwords are hashed with bcrypt on the server and are never stored or logged in plain text, and never stored in the browser.
- Logging in creates a random session token. The database keeps only its SHA-256 hash, and it expires after 30 days.
- The browser keeps the token in `localStorage` and sends it as `Authorization: Bearer …`.
- Logout deletes the session on the server.
- Every query checks ownership (`c.user_id = $1`), so one user can never read or change another's collections or items. They get a 404.
- Login and register are rate limited (20 attempts per 15 minutes per IP), and `helmet` sets security headers.
- Trade-off: a token in `localStorage` could be read by injected script if the site ever had an XSS bug. An httpOnly cookie avoids that but breaks when the client (github.io) and API (another domain) are on different sites. This was a deliberate choice for this deployment.

**Images.**
- When you pick a photo, the browser resizes it to at most 800 px and converts it to a JPEG *data URL*, typically 50–200 KB.
- The API stores that text in the `items.image` column. Images are saved in PostgreSQL alongside the item, so they survive refreshes and redeploys, and deleting the item deletes its image.
- Collections have a cover image of their own, stored the same way in `collections.image`. A collection with no cover shows a letter placeholder; it does not borrow a photo from one of its items.
- Accepted formats are JPEG, PNG, WebP and GIF. GIFs become a still JPEG.
- In demo mode the image is stored in the browser's `localStorage`, which holds only a few MB.

**Accessibility.**
- Semantic landmarks, and a skip link.
- Labelled form fields, with errors announced through `aria-describedby`.
- Real links and buttons, with no clickable `div`s.
- A visible focus ring on everything.
- Heart buttons use `aria-pressed` and name their item.
- The dialog traps focus and closes with Escape.
- Images have alt text.
- Colours meet WCAG AA contrast.

## How the data flows

There is one source of truth, the API and its database. There is one path to it:

```
page component ──▶ client/src/api/index.js ──▶ httpApi.js ──▶ Express route ──▶ repos/*.js ──▶ PostgreSQL
                                          └──▶ mockApi.js (demo-mode builds only)
```

- Pages keep no data of their own. `/items/4` calls `getItem(4)` and shows exactly what comes back. Each detail page is keyed by the URL id, so it can never show a previous item.
- The only global state is "who is logged in" (`client/src/auth/AuthContext.jsx`).
- A new item's collection comes from the URL (`POST /api/collections/:id/items`), never from the form.

### API endpoints

All endpoints except register and login require `Authorization: Bearer <token>`.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account. Returns `{ user, token }`. |
| POST | `/api/auth/login` | Log in. Returns `{ user, token }`. |
| POST | `/api/auth/logout` | End this session. |
| GET | `/api/auth/me` | Return the logged-in user. |
| GET / POST | `/api/collections` | List / create collections. |
| GET / PUT / DELETE | `/api/collections/:id` | Read / rename / delete a collection (the delete includes its items). |
| GET / POST | `/api/collections/:id/items` | List / add the items in one collection. |
| GET | `/api/items?search=text` | Search item names. |
| GET / PUT / DELETE | `/api/items/:id` | Read / update / delete an item. |
| GET | `/api/items/favorites` | List every favorited item. |
| PATCH | `/api/items/:id/favorite` | Set `{ isFavorite }`. |
| GET | `/api/dashboard` | Totals and recent items. |
| GET | `/healthz`, `/readyz` | Check the process is alive / the database is reachable. |

## Project structure

```text
CoLogger/
├── client/                         React + Vite
│   ├── .env.example
│   └── src/
│       ├── api/                    the ONLY data access layer
│       │   ├── index.js            picks httpApi or mockApi at build time
│       │   ├── httpApi.js          calls the Express API
│       │   ├── mockApi.js          demo mode (browser storage)
│       │   ├── seedData.js         demo-mode sample data
│       │   ├── tokenStore.js       where the login token is kept
│       │   └── errors.js           ApiError
│       ├── auth/                   AuthContext, route guards
│       ├── hooks/                  useResource, useFavoriteToggle, useFlashNotice, useDebouncedValue
│       ├── lib/                    validation, formatting, image resizing
│       ├── components/
│       │   ├── atoms/              Button, Input, FavoriteButton
│       │   ├── molecules/          SearchBar, FormField, CollectionCard, ItemCard, ImageUploader, StatusMessage
│       │   ├── organisms/          Navbar, Sidebar, ItemForm, CollectionForm, CollectionGrid, ItemGrid
│       │   ├── templates/          AppLayout (sidebar + navbar + main)
│       │   ├── pages/              the 8 screens + NotFoundPage
│       │   └── DemoNotice.jsx
│       ├── App.jsx                 routes
│       └── styles.css              design system + responsive rules
├── server/                         Express + PostgreSQL
│   ├── .env.example
│   ├── server.js                   starts the app
│   ├── app.js                      middleware + route mounting
│   ├── routes/                     auth, collections, items, dashboard
│   ├── repos/                      parameterised SQL (users, sessions, collections, items)
│   ├── middleware/auth.js          Bearer-token check
│   ├── validation.js               server-side validation
│   ├── db/                         pool, schema.sql, seed.sql, seed.js, run.js
│   └── test/api.test.js            integration tests (node:test)
├── docs/                           planning documents and screenshots
├── compose.yml                     optional self-hosting with Docker
├── AI-USAGE.md
├── REPORT.md
└── README.md
```

### Design system

Defined as CSS custom properties at the top of `client/src/styles.css`:

- **Colours:** primary `#1D4ED8`, accent `#0F766E` (favorites, collection labels), background `#F8FAFC`, surface `#FFFFFF`, text `#111827`.
- **Type:** Arial, Helvetica, sans-serif. Headings 28 px bold, body 16 px, small 14 px.
- **Spacing:** 8 px base (8 / 16 / 24 / 32), with 24 px screen-edge padding.
- **Mobile (below 768 px):**
  - the sidebar becomes a top bar
  - every grid, form row and the item details page stack to one column
  - the item image moves above the details
  - cards become compact rows
  - form buttons go full width

## Screenshots

| Login | Dashboard |
| --- | --- |
| ![Login](./docs/screenshots/login.png) | ![Dashboard](./docs/screenshots/dashboard.png) |

| Collections | Collection details |
| --- | --- |
| ![Collections](./docs/screenshots/collections.png) | ![Collection details](./docs/screenshots/collection-details.png) |

| Add item | Item details |
| --- | --- |
| ![Add item](./docs/screenshots/add-item.png) | ![Item details](./docs/screenshots/item-details.png) |

| Edit item | Register |
| --- | --- |
| ![Edit item](./docs/screenshots/edit-item.png) | ![Register](./docs/screenshots/register.png) |

Mobile (375 px):

| Dashboard | Item details | Edit item |
| --- | --- | --- |
| ![Mobile dashboard](./docs/screenshots/mobile-dashboard.png) | ![Mobile item details](./docs/screenshots/mobile-item-details.png) | ![Mobile edit item](./docs/screenshots/mobile-edit-item.png) |

## Known issues and next steps

- **Free-tier cold start.** The Render instance sleeps after roughly 15 minutes idle. The first request then takes up to a minute while the container starts. This is a limit of the free plan, not a fault in the application.
- **One database for development and production.** `server/.env` points at the same Supabase database the deployed site uses, so local testing writes to live data. Running `npm run db:seed` locally would empty it.
- **Images in the database.** This is simple and survives redeploys on free hosts, but list responses include each item's image. It is fine for personal collections of dozens of items. Object storage (S3, Cloudinary) would be the next step for thousands.
- **Demo mode storage** is limited to a few MB per browser, so only a handful of images fit.
- **No password reset or email verification.**
- **No pagination.** Collections and items load in full.
- **Values are per item currency.** There is no currency conversion, so the dashboard shows counts rather than a total value.
- **Items cannot be moved** between collections. The workaround is to delete and re-add.

## AI usage

AI tools were used during development. What was generated, what was reviewed and what was changed is recorded in [AI-USAGE.md](./AI-USAGE.md).
