# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the frontend for a RuTracker torrents scraper admin application built with Vue 3 and Quasar Framework. The application allows managing torrent posts that are scraped from RuTracker and can be pushed to Telegram.

## Development Commands

- **Start development server**: `quasar dev` or `npm run dev`
- **Build for production**: `quasar build` or `npm run build`
- **Lint code**: `npm run lint`
- **Format code**: `npm run format`
- **Run unit tests**: `npm run test:unit`
- **Run tests with coverage**: `npm run test:unit:coverage`

## Architecture

### Framework Stack
- **Frontend Framework**: Vue 3 with Composition API
- **UI Framework**: Quasar Framework v2
- **Build Tool**: Vite (via Quasar CLI)
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **Testing**: Vitest with Vue Test Utils

### Project Structure
- `src/api/`: HTTP client and API services
  - `clients/core-http-client.ts`: Axios instance configured with `/api` base URL
  - `services/`: Service layer for API calls (posts-service.ts)
  - `services/types.ts`: TypeScript interfaces for API data
- `src/components/`: Reusable Vue components
- `src/pages/`: Page components for routing
- `src/layouts/`: Layout components (MainLayout.vue)
- `src/router/`: Vue Router configuration
- `src/stores/`: Pinia stores for state management
- `src/boot/`: Quasar boot files (axios.ts)

### Key Data Types
- `TorrentPost`: Main entity with properties:
  - `id`: number
  - `rutracker_id`: string (UUID)
  - `link`: string
  - `title`: string
  - `seeds`: number
  - `leaches`: number
  - `size`: string

### API Services
The `posts-service.ts` provides CRUD operations:
- `getPosts()`: Fetch all posts
- `createPost()`: Create new post
- `updatePost()`: Update existing post
- `deletePost()`: Delete post
- `pushPostToTelegram()`: Send post to Telegram

### Configuration Notes
- Uses hash-based routing (`vueRouterMode: 'hash'`)
- TypeScript strict mode enabled
- ESLint with Vue and TypeScript support
- Development server auto-opens browser
- Production builds target modern browsers (ES2022+)
- Docker deployment configured with nginx

### Testing
- Unit tests with Vitest
- Coverage reports available via `test:unit:coverage`
- Vue Test Utils for component testing