# AGENTS.md

## Project Overview
**CDL: Werkstattphase 1** is an Astro-based content site for CorrelAid's CDL (Civic Data Lab) project. It focuses on survey design, tools, and statistics. The project uses MDX for content, Svelte for interactive components, and Bun as the package manager/runtime.

## Setup Commands
- `bun install`: Install dependencies.
- `bun run dev`: Start the development server.
- `cp .env.example .env`: Create a local environment file (requires Zotero API credentials).

## Build and Test Commands
- `bun run build`: Build the project for production.
- `bun run preview`: Preview the production build locally.
- `astro check`: (If configured) Run type checking on Astro files.

## Code Style
- **Components**: Use Svelte for interactive UI components and Astro for layouts and static components.
- **Content**: Use MDX for all page content. MDX files are located in `src/content/pages/`.
- **Styling**: Design tokens are managed in `tokens.json` and compiled via a custom Vite plugin using `@terrazzo`. Do not edit `src/lib/styles/gen_tokens.css` directly; update `tokens.json` instead.
- **TypeScript**: Use TypeScript for all logic.

## Dev Environment Tips
- **Live Reload**: The project uses Astro's experimental `liveContentCollections`, allowing content changes to reflect immediately.
- **Design Tokens**: Saving changes to `tokens.json` will trigger a recompilation of CSS tokens and a full page reload.

