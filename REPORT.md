# Weekly Increment Report

## Week of: September 28 – October 4, 2026

## What changed this week

- Replaced the Week 1 prototype's hardcoded sample data with one real data flow: React pages → `client/src/api` → Express API → PostgreSQL.
- Built the backend: a PostgreSQL schema with `users`, `sessions`, `collections` and `items` tables, and Express routes for authentication, collections, items and dashboard totals.
- Replaced the localStorage demo login with real authentication: registration, login and logout, bcrypt-hashed passwords, session tokens, and protected routes.
- Collections and items now have full CRUD:
  - create, rename, delete and search collections;
  - add, view, edit, favorite and delete items inside a collection.
- Every page now loads the record named in the URL (`/collections/:id`, `/items/:id`). Invalid IDs show "Collection not found" or "Item not found" instead of falling back to MCHOSE Ace 68.
- The dashboard totals and recent items are calculated from the database.
- Item images are resized in the browser and saved with the item, so they survive a refresh.
- Applied my design system (colours, Arial, 8px spacing) and made the layout responsive for phones.
- Added server-side validation, API tests, and updated the README, screenshots and AI-USAGE.md.

## Why

The biggest Week 1 problem was that every page had its own copy of fake data. Clicking Edit on any item always opened MCHOSE Ace 68, and nothing I added was actually saved. Fixing that properly meant building the real backend and database first, then connecting every page to it, instead of patching one page at a time.

## What broke or what I got stuck on

Most of the code for this increment was generated with AI assistance (Claude), and I reviewed and tested it. My main problems were setting it up on my own computer:

- My first attempt at `npm run db:reset` failed because I had not copied the new files into the project yet, so it was still running the old template.
- PostgreSQL was not installed on my computer at all. `Get-Service postgresql*` showed nothing. I installed it and created the `cologger` database.
- Chrome showed `ERR_CONNECTION_REFUSED` for localhost:5173. The Vite dev server was not running; the app needs two terminals running at the same time, one for the API and one for the client.

## What is left

- Deploy the API and database (e.g. Render and Neon) and switch the GitHub Pages build from demo mode to the real API.
- Features I plan to build myself: collection cover images, a settings page, and a Favorites screen.
- Record my own contributions in AI-USAGE.md as I build them.

## Week of: September 21–27, 2026

## What changed this week

- Set up the CoLogger project from the class final-project template and confirmed the Vite React client runs locally.
- Reorganized the frontend based on my previous wireframes and component plan.
- Created reusable React components for buttons, inputs, favorite controls, search, collection cards, item cards, image uploading, navigation, forms, and grids.
- Created the eight planned screens:
  - Login
  - Register
  - Dashboard
  - Collections
  - Collection Details
  - Add Item
  - Item Details
  - Edit Item
- Installed `react-router-dom` and added routes for the planned CoLogger screens.
- Added temporary demo data so the Dashboard, Collections, Collection Details, and Item Details screens have content to render.
- Added a temporary demo authentication flow using `localStorage`.
  - Register stores a demo user's name and email.
  - Login checks the registered demo email and creates a demo session.
  - Logout clears the demo session and returns to the Login screen.
- Reused the same `ItemForm` component for both Add Item and Edit Item.

## Why

The main goal this week was to turn the planning work from the proposal, wireframes, and design system into an actual React project structure.

I focused on the frontend first so that the routes, page structure, and reusable components are already in place before connecting the application to the Express server and PostgreSQL database.

The temporary demo authentication and sample data allow me to test the main user flow without claiming that the backend is already complete.

## What broke or what I got stuck on

One problem was figuring out how to turn the original class template into the structure I planned for CoLogger. The template originally contained a different sample application, so I had to replace that structure with my own pages and reusable components.

I also changed computers while working on the project, so I had to clone the repository again and reinstall the client dependencies before continuing.

Authentication is still only a demo implementation. Registration and login currently use `localStorage` instead of the real server and database.

Several buttons and navigation actions are also still placeholders, and the Add/Edit Item forms do not persist data yet.

## What is left

- Apply the CoLogger design system and styling from my planning documents.
- Finish navigation between all screens and make the buttons functional.
- Add route protection for logged-in users.
- Replace demo authentication with real authentication.
- Connect the React frontend to the Express API.
- Design and create the PostgreSQL database tables for users, collections, and items.
- Replace placeholder data with data from the database.
- Make creating, editing, deleting, and favoriting items persist correctly.
- Add real collection creation and editing.
- Finish image handling.
- Test responsive layouts and accessibility.
- Add error handling and validation.
