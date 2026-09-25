# Weekly Increment Report

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