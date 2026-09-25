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

## 3. Who Wrote What

### My current contribution

During development, I reviewed and integrated AI-assisted code rather than accepting it blindly. I tested the implementation, checked whether it matched my project requirements, corrected problems, and made decisions about what code to keep or change.

As the project continues, this section will list specific features and files where I personally wrote or substantially modified the implementation.

### AI-assisted code I reviewed and implemented

- **File:** `client/src/components/organisms/ItemForm.jsx`
- **Commit:** https://github.com/jmyspn/CoLogger/commit/9fe75eb
- **My contribution:** I reviewed the generated component, integrated it into my project, checked how its props and state updates worked, tested it with the Add Item and Edit Item pages, and kept the shared-form approach because it avoids duplicate form code.

### The AI-written part I understand best

- **File:** `client/src/components/organisms/ItemForm.jsx`
- **Commit:** https://github.com/jmyspn/CoLogger/commit/9fe75eb
- **What it does and why we kept it:** `ItemForm` provides the shared form used by the Add Item and Edit Item pages. It receives the current item state and a state setter through props, updates individual fields, and uses reusable components such as `Input`, `FormField`, `ImageUploader`, `FavoriteButton`, and `Button`. Reusing the same form prevents the Add and Edit pages from needing separate copies of nearly identical form code.

## Week 1 Note

This file will continue to be updated as the project develops. More AI-use entries and personally written code will be added in later commits.