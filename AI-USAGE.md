# AI Usage

This project was built with AI assistance. This file records how AI was used during development, what suggestions were kept or changed, and where AI-generated guidance needed correction.

## 1. How I Used AI

### 2026-09-25 - React component and page scaffolding

- **Tool:** ChatGPT
- **What I asked for:** Help turning my approved CoLogger wireframes and component plan into a React frontend structure.
- **What it gave back:** Suggested React components organized into atoms, molecules, organisms, and pages, along with starter code for the planned CoLogger screens.
- **What I kept, what I changed, and why:** I used the suggested structure and component scaffolding as the starting point for the frontend. I integrated the components into my project and tested them locally. The frontend is still unfinished and will be changed further as the design and backend are implemented.
- **Commit:** https://github.com/jmyspn/CoLogger/commit/9fe75eb

### 2026-09-25 - Routing and temporary authentication flow

- **Tool:** ChatGPT
- **What I asked for:** Help connecting the planned CoLogger pages with React Router and creating a temporary authentication flow for the Week 1 frontend.
- **What it gave back:** React Router route setup and a demo registration, login, and logout flow using browser `localStorage`.
- **What I kept, what I changed, and why:** I kept the routing structure and temporary localStorage demo so I could test the frontend flow before the Express and PostgreSQL backend is implemented. It is intentionally not the final authentication system.
- **Commit:** https://github.com/jmyspn/CoLogger/commit/9fe75eb

### 2026-09-25 - Week 1 project increment report

- **Tool:** ChatGPT
- **What I asked for:** Help organizing my actual Week 1 progress into the required project increment report format.
- **What it gave back:** A draft describing the frontend work, reasons for the implementation order, blockers, and remaining tasks.
- **What I kept, what I changed, and why:** I used the draft as a guide and made sure the report only described work that was actually completed or still unfinished. I did not claim that the backend, database, or final styling were complete.
- **Commit:** https://github.com/jmyspn/CoLogger/commit/f29788e

### 2026-09-25 - README documentation and screenshots

- **Tool:** ChatGPT
- **What I asked for:** Help updating the project README for the Week 1 documentation requirement and adding screenshots of the running application.
- **What it gave back:** Suggested README sections for setup, running the application, current features, project structure, screenshots, known issues, and AI usage.
- **What I kept, what I changed, and why:** I used the suggested documentation structure but corrected formatting and screenshot paths while testing the Markdown preview in VS Code. I also kept the README clear that the frontend is still a Week 1 work in progress.
- **Commit:** https://github.com/jmyspn/CoLogger/commit/16ce559

### 2026-09-28 - Full-stack rebuild: shared data layer, Express API, PostgreSQL, authentication, styling

- **Tool:** Claude (Anthropic), model configured as `claude-opus-5-5`, working as an agent on a copy of the repository.
- **What I asked for:** Take the Week 1 frontend prototype and turn it into a working full-stack application. That meant one source of truth for data, real CRUD by ID, working routing and navigation, a live dashboard, the design system and responsive layout, the Express + PostgreSQL backend, proper authentication, testing and accurate documentation.
- **What it gave back:**
  - **Backend:** a new PostgreSQL schema (users, sessions, collections, items) and seed script, and an Express API split into `routes/`, `repos/`, `middleware/` and `validation.js`, with bcrypt passwords, hashed session tokens, ownership checks in every query, helmet and rate limiting, plus `server/test/api.test.js`.
  - **Client data:** a rewritten `client/src/api/` layer (HTTP and demo-mode implementations with the same functions), `AuthContext` and route guards.
  - **Pages and components:** all eight pages rebuilt to load data by the ID in the URL, the reusable components updated, and new `CollectionForm`, `StatusMessage`, `AppLayout` and `NotFoundPage` components.
  - **Styling:** a new `styles.css` implementing the design system and the mobile layout.
  - **Docs:** new screenshots and this README.
  - **Testing:** the AI tested the database queries against a real PostgreSQL 16 server and ran a browser test of the whole checklist at desktop and phone widths. Its workspace could not download npm packages, so during its testing the Express, pg, bcryptjs and React Router libraries were replaced by small test-only stand-ins. Those stand-ins are not part of the repository.
- **What I kept, what I changed, and why:** I kept the architecture. The single `client/src/api/` data layer, the `routes` / `repos` / `validation` split on the server, and loading every page from the id in the URL together fixed the main defect in my Week 1 build, where each page carried its own copy of the data and a details page could show the wrong item. I set up and ran the whole stack myself: PostgreSQL locally first, then Supabase for the deployed database, Render for the API and GitHub Pages for the client. I corrected the connection string when `?sslmode=require` turned out to conflict with the SSL options already set in `db/pool.js`, and traced a `getaddrinfo ENOTFOUND` on Render to a malformed environment variable. I have since added the Favorites feature myself and fixed a CSS defect in the collection cards (Case 7 above).
- **Commit:** https://github.com/jmyspn/CoLogger/commit/232dc07

### 2026-10-09 - Deployment, and guidance for building the Favorites screen myself

- **Tool:** Claude (Anthropic), model configured as `claude-opus-5`.
- **What I asked for:** Two things. First, help getting the app off my laptop: a hosted database, a hosted API, and the GitHub Pages build pointed at them. Second, for the Favorites screen, I asked it to tell me where each layer belongs and what to model it on, rather than writing the feature for me.
- **What it gave back:** A deployment plan using Supabase for the database, Render for the API, and two repository variables (`VITE_USE_MOCK_API`, `VITE_API_BASE_URL`) for the Pages build. For Favorites, it listed the eight files involved and pointed me at the existing `recent()` function as the model for my SQL, but did not write the code.
- **What I kept, what I changed, and why:** I followed the deployment plan and fixed three things it did not anticipate: `?sslmode=require` in the connection string conflicted with the SSL options already in `db/pool.js`, Render's `DATABASE_URL` had been pasted malformed and failed with `getaddrinfo ENOTFOUND base`, and Render's auto-deploy never fired so the API kept running an older commit while the client was up to date. The Favorites feature itself I wrote (see "Code I wrote myself" below).
- **Commit:** https://github.com/jmyspn/CoLogger/commit/6b4e5d4

### 2026-10-11 - Collection cover images

- **Tool:** Claude (Anthropic), model configured as `claude-opus-5`.
- **What I asked for:** Guidance for giving collections a cover image of their own, instead of the card borrowing a photo from the newest item in the collection.
- **What it gave back:** The layers to change and the order to do them in — database column first, then the repository queries, then validation, then demo mode, then the form — plus a review of the code I wrote at each step.
- **What I kept, what I changed, and why:** I wrote each layer myself first and then compared it with Claude's version, keeping whichever read better; in a few places that was Claude's. I decided a collection with no cover should show a letter placeholder rather than borrowing an item photo, because a cover should be something the owner picked. I also caught that Claude was wrong about image validation (Case 8 below) and added the missing check.
- **Commit:** https://github.com/jmyspn/CoLogger/commit/3dc9bb3

## 2. Where the AI Got It Wrong

### Case 1 - Incorrect screenshot path

- **What it gave me:** AI initially told me to reference the screenshots using a path that did not match their actual location in my repository.
- **What was wrong with it:** My screenshots were actually stored in `docs/screenshots/`, so the images did not appear in the README preview when the wrong path was used.
- **What I did instead:** I checked the actual PNG locations using PowerShell and changed the README paths to `./docs/screenshots/login.png`, `./docs/screenshots/dashboard.png`, and `./docs/screenshots/collections.png`.
- **Commit:** https://github.com/jmyspn/CoLogger/commit/16ce559

### Case 2 - Routing code required a missing dependency

- **What it gave me:** AI provided routing code that imported `BrowserRouter`, `Routes`, `Route`, and `Navigate` from `react-router-dom`.
- **What was wrong with it:** The original project dependencies did not yet include `react-router-dom`, so the routing code depended on a package that was not installed in the template.
- **What I did instead:** I checked the project dependencies and installed `react-router-dom` with `npm install react-router-dom` before continuing with the routing implementation.
- **Commit:** https://github.com/jmyspn/CoLogger/commit/9fe75eb

### Case 3 - Demo login did not validate the password

- **What it gave me:** AI suggested a temporary localStorage authentication flow where registration accepted a password, but the login logic only checked the saved email.
- **What was wrong with it:** The password field looked like part of authentication even though it was not actually being validated. This would not be acceptable as a real authentication system.
- **What I did instead:** I kept the feature only as a temporary frontend demo, avoided storing passwords in localStorage, and documented the limitation. The demo authentication will be replaced later with proper server-side authentication and database-backed user accounts.
- **Commit:** https://github.com/jmyspn/CoLogger/commit/9fe75eb

### Case 4 - Dashboard search crashed on the first keystroke (found and fixed during the AI's own testing)

- **What it gave me:** A dashboard search that rendered the results component as soon as the search text changed.
- **What was wrong with it:** For one render, before the new request started, the results were still `null`, so the page crashed with "Cannot destructure property 'items' of 'results.data'".
- **What was done instead:** The results component now shows the loading state until data for the new search exists. The browser test "dashboard search finds real item" covers this.
- **Commit:** https://github.com/jmyspn/CoLogger/commit/232dc07

### Case 5 - Hidden file input caused horizontal scrolling (found and fixed during testing)

- **What it gave me:** A visually hidden `<input type="file">` behind a styled "Choose image" label.
- **What was wrong with it:** The input was still wider than the screen, so the Add Item and Edit Item pages scrolled sideways at every width.
- **What was done instead:** The hidden input is now clipped properly inside a positioned container. The horizontal-scroll check passes at 375, 390, 412, 768, 1024 and 1440 px.
- **Commit:** https://github.com/jmyspn/CoLogger/commit/232dc07

### Case 6 - Favorite button lost keyboard focus (found and fixed during testing)

- **What it gave me:** A favorite button that was `disabled` while the change was being saved.
- **What was wrong with it:** Disabling a focused button moves keyboard focus back to the page, so a keyboard user could not press Enter twice.
- **What was done instead:** The button stays enabled and extra presses are ignored while saving.
- **Commit:** https://github.com/jmyspn/CoLogger/commit/232dc07

### Case 7 - Collection cards did not line up (found by me, in the running app)

- **What it gave me:** `.collection-card-image` in `client/src/styles.css` carried `aspect-ratio: 4 / 3`, with the `<img>` inside set to `width: 100%; height: 100%; object-fit: cover`.
- **What was wrong with it:** The aspect ratio never took effect. That box is a flex item inside a column flex container, and flex items default to `min-height: auto`, so the box would not shrink below its content's natural height. The `height: 100%` on the image had no definite height to resolve against while the box was being sized, so it fell back to the photo's real pixel height. A portrait photo made one card's image far taller than its neighbour's, and the titles, item counts and "View Collection" buttons no longer lined up across a row.
- **What I did instead:** I spotted it looking at my Keyboards and Sneakers collections side by side. The image is now `position: absolute; inset: 0` inside a `position: relative` box, so it contributes no height to its parent and `aspect-ratio` decides the shape. I also added `min-height: 0` to remove the flex floor and `overflow: hidden` to keep the crop inside the rounded corners.
- **Commit:** https://github.com/jmyspn/CoLogger/commit/6b4e5d4

### Case 8 - AI said item images were not validated, when they were

- **What it gave me:** While I was adding cover images to collections, Claude told me that `validateItem` in `server/validation.js` does not check image size or format, and that leaving the same check out of `validateCollection` would keep the two consistent.
- **What was wrong with it:** It had only read the first part of the function. `validateItem` does check images, against `IMAGE_PATTERN` and `MAX_IMAGE_LENGTH`, both defined at the top of that same file. Following the advice would have left collection images unchecked, so anyone posting straight to the API could have stored arbitrary text, or a very large string, in the new column. The file's own header says these server-side checks are the ones that actually protect the database, so the gap would have mattered.
- **What I did instead:** The mistake came to light when I pasted the whole file for review and the existing check was spotted a few lines further down. I applied the same rule to `validateCollection`, reusing both constants.
- **Commit:** https://github.com/jmyspn/CoLogger/commit/3dc9bb3

## 3. Who Wrote What

### My current contribution

During development, I reviewed and integrated AI-assisted code rather than accepting it blindly. I tested the implementation, checked whether it matched my project requirements, corrected problems, and made decisions about what code to keep or change.

As the project continues, this section will list specific features and files where I personally wrote or substantially modified the implementation.

Week 2 rebuild (AI-generated, reviewed and tested by me). I used Claude to generate the code in the 2026-09-28 commit. My part was deciding what the app needed to do and how it should look, since the requirements, wireframes and design system came from my own planning. I also pointed out the problems I ran into in Week 1, like every page having its own sample data and Edit always opening MCHOSE Ace 68. After the code was generated, I installed PostgreSQL on my computer, set up the database and .env files, and ran the app locally. I went through the main flows myself (logging in, creating collections, adding, editing, favoriting and deleting items, and refreshing to make sure everything stayed saved), and I reviewed the changes before committing them.

### AI-assisted code I reviewed and implemented

- **File:** `client/src/components/organisms/ItemForm.jsx`
- **Commit:** https://github.com/jmyspn/CoLogger/commit/9fe75eb
- **My contribution:** I reviewed the generated component, integrated it into my project, checked how its props and state updates worked, tested it with the Add Item and Edit Item pages, and kept the shared-form approach because it avoids duplicate form code.

### The AI-written part I understand best

- **File:** `client/src/components/organisms/ItemForm.jsx`
- **Commit:** https://github.com/jmyspn/CoLogger/commit/9fe75eb
- **What it does and why we kept it:** `ItemForm` provides the shared form used by the Add Item and Edit Item pages. It receives the current item state and a state setter through props, updates individual fields, and uses reusable components such as `Input`, `FormField`, `ImageUploader`, `FavoriteButton`, and `Button`. Reusing the same form prevents the Add and Edit pages from needing separate copies of nearly identical form code.

### Code I wrote myself

**Favorites screen (`/favorites`)**

- **Files:** `server/repos/items.js` (`listFavorites`), `server/routes/items.js` (the `GET /favorites` route), `client/src/api/httpApi.js`, `client/src/api/mockApi.js`, `client/src/api/index.js`, `client/src/components/pages/FavoritesPage.jsx`, `client/src/App.jsx`, `client/src/components/organisms/Sidebar.jsx`
- **Commit:** https://github.com/jmyspn/CoLogger/commit/6b4e5d4
- **How this differs from the rest:** I wrote this feature. Claude told me which files each layer lives in and which existing function to model each part on, and I wrote the code. I based the SQL on the existing `recent()` function, which gave me the `SELECT_ITEM` constant with its `c.user_id = $1` ownership check already built in, and added `AND i.is_favorite` to it.
- **Decisions I made:** I used a named endpoint, `GET /api/items/favorites`, rather than adding a `?favorites=true` flag to the existing list route, because the path says what it returns. That meant declaring it above `GET /:id`, since Express matches routes in the order they are defined and would otherwise read "favorites" as an id. I also decided that un-hearting an item on this page leaves it on screen until the next load, rather than vanishing immediately, so an accidental click can be undone without hunting for the item again.
- **Debugging I did:** The page first rendered white. The console said `Identifier 'searchItems' has already been declared`. I reasoned that a duplicate declaration could only come from the destructured export list, found a repeated `searchItems` in `client/src/api/index.js`, removed it, then found `getDashboard` duplicated as well — the parser only reports the first one it reaches. Later the feature worked locally but returned "Item not found" on the live site; that turned out to be Render still running the previous commit, which I fixed with a manual deploy.

- **Collection cover images**

- **Files:** `server/db/schema.sql`, `server/repos/collections.js`, `server/validation.js`, `client/src/api/mockApi.js`, `client/src/components/organisms/CollectionForm.jsx`, `client/src/components/molecules/ImageUploader.jsx`
- **Commit:** https://github.com/jmyspn/CoLogger/commit/3dc9bb3
- **How I worked on this one:** I wrote each layer myself first, then compared it against Claude's version before deciding what to keep. Several parts matched. Where they differed I took whichever read better, and in a few places that was Claude's. This is less entirely my own work than the Favorites screen, and I am recording that rather than overstating it.
- **Decisions I made:** A collection with no cover now shows a letter placeholder instead of borrowing a photo from one of its items, which is what the previous SQL did with a subquery. I chose that because a cover should be something the owner picked, not something that changes silently when an item is added or deleted. I added the new column with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` as well as editing the `CREATE TABLE` section, because my Supabase database already existed and `CREATE TABLE IF NOT EXISTS` does nothing to a table that is already there. I also removed the "Optional." hint under the Description field, since the required marker on Collection Name already shows which fields are needed.
- **What I had to understand:** that `toCollection` exposes the saved value as `coverImage` rather than `image`, so the edit dialog must read `initialValues?.coverImage` — reading `image` would open it blank and wipe the cover on save; and that `ImageUploader` had its label hardcoded to "Item Image", so it needed a `label` prop before it could be reused outside items.

### Week 2 rebuild: AI-generated code I still need to review


The Week 2 rebuild (see the 2026-09-28 entry above) was generated by Claude, not written by me. Before claiming any part of it as my own work I will review it, run it, and record here which files I changed and what I understand about them. The files I plan to study first are:

- `client/src/api/index.js` and `client/src/api/httpApi.js`: how every page gets its data through one layer
- `client/src/components/pages/ItemDetailsPage.jsx` and `EditItemPage.jsx`: how the `:id` in the URL decides which item loads
- `server/repos/items.js`: the SQL, and how the `c.user_id = $1` ownership check works
- `server/routes/auth.js` and `server/repos/sessions.js`: bcrypt hashing and session tokens

## Week 1 Note

This file will continue to be updated as the project develops. More AI-use entries and personally written code will be added in later commits.

## Week 2 Note

With the core features now working (collections, items, login and the database), I can focus on the smaller features that complete my vision for the app. I plan to build some of these myself, such as collection cover functions, settings features, favorite tab / screen, and I'll record which parts are my own work here as I go.
