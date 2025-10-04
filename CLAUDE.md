# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an aviation planner chat application built with React + TypeScript + Vite. The application uses the `@n8n/chat` widget to provide a fullscreen chat interface that connects to an n8n webhook for processing aviation planning queries (departure airport, destination, and route points to generate pre-flight briefings).

## Development Commands

**Start development server:**
```bash
npm run dev
```
Runs Vite dev server on port 8080 (configured in vite.config.ts)

**Build for production:**
```bash
npm run build
```
Compiles TypeScript and builds the application

**Lint code:**
```bash
npm run lint
```

**Preview production build:**
```bash
npm run preview
```
Serves the production build on port 8080

## Architecture

### Core Setup
- **Framework:** React 19.1.1 with TypeScript
- **Build Tool:** Vite 7.1.2
- **Styling:** Tailwind CSS 4.1.13 with PostCSS (@tailwindcss/postcss)
- **Chat Interface:** @n8n/chat widget (v0.56.0)

### Tailwind Configuration
- Using Tailwind CSS v4 with the new PostCSS plugin architecture
- Configuration in `tailwind.config.js` and `postcss.config.js`
- Tailwind directives imported in `src/index.css`

### Application Structure
The app is minimal with a single-purpose architecture:
- `src/main.tsx` - Standard React entry point
- `src/App.tsx` - Creates fullscreen n8n chat widget on mount using `createChat()` from @n8n/chat
- The chat widget configuration is in App.tsx with custom i18n strings for aviation context

### Environment Configuration
- `VITE_N8N_WEBHOOK_URL` - Required environment variable pointing to the n8n webhook endpoint
- Configured via `.env` file (not committed to git)
- Accessed in code via `import.meta.env.VITE_N8N_WEBHOOK_URL`

### Server Configuration
Vite is configured for Docker deployment:
- Server runs on port 8080
- `host: true` enables external access
- `allowedHosts: true` allows any host (for containerized environments)
- Origin set to `http://0.0.0.0:8080`

## Docker Deployment

The application is containerized using a multi-stage approach:

```bash
docker build -t aviation-planner-chat .
docker run -p 3000:3000 aviation-planner-chat
```

The Dockerfile:
1. Uses Node 22 Alpine
2. Installs dependencies
3. Builds the application
4. Serves the static `dist` folder using `serve` on port 3000

## API Integration

Example API call for demos endpoint:

```bash
curl -X 'GET' \
  'https://hackyeah2025be.oczadly.com/demos' \
  -H 'accept: */*'
```
