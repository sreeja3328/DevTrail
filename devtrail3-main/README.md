# DevTrail

DevTrail is an AI-driven productivity and learning platform designed for developers to organize, monitor, and improve their development journey.

Developers often explore multiple tutorials, technical documentation, and educational resources every day, making it difficult to keep track of what they have learned and applied. DevTrail addresses this challenge by offering a unified space where users can document progress, manage projects, and maintain a structured learning path.

The platform enables developers to record project activities, log learning achievements, and receive intelligent support through Large Language Models (LLMs). By combining productivity tools with AI capabilities, DevTrail helps users remain focused, consistent, and growth-oriented throughout their development experience.

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* TanStack Query
* Wouter

### Backend

* Node.js
* Express
* TypeScript

### Database

* PostgreSQL with Drizzle ORM

### Authentication

* Clerk

### AI Integration

* OpenRouter (OpenAI-compatible API)

## Core Features

* Secure user authentication powered by Clerk
* Development journal system with fields such as:

  * Content
  * Bugs encountered
  * Solutions implemented
  * Time invested
  * Confidence level
  * Additional notes
* Tagging functionality and project association for entries
* Project creation and management capabilities
* AI-generated weekly performance reports
* AI-powered skill heatmap visualization
* Bug trend and pattern analysis
* Automated learning summaries
* Personalized next-step recommendations

## Project Organization

```text
client/                Frontend application
server/                Backend API, authentication, and AI services
shared/                Shared schemas and route definitions
script/build.ts        Production build configuration
drizzle.config.ts      Database configuration
```

## Requirements

Before running the project, ensure the following are installed and configured:

* Node.js
* npm
* PostgreSQL (local or cloud-hosted)
* Clerk credentials
* OpenRouter API key

## Environment Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
OPENROUTER_API_KEY=your_openrouter_key

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Optional (`client/.env`):

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## Installation & Setup

### Install dependencies

```bash
npm install
```

### Apply database schema

```bash
npm run db:push
```

### Start development server

```bash
npm run dev
```

Application URL:

```text
http://localhost:5000
```

## Scripts

* `npm run dev` → Launch development server
* `npm run build` → Generate production build in `dist/`
* `npm run start` → Run production version
* `npm run check` → Execute TypeScript validation
* `npm run db:push` → Sync Drizzle schema with PostgreSQL

## API Endpoints

Protected endpoints (authentication required):

### Entries

* GET `/api/entries`
* POST `/api/entries`
* GET `/api/entries/:id`
* PUT `/api/entries/:id`
* DELETE `/api/entries/:id`

### Projects

* GET `/api/projects`
* POST `/api/projects`
* GET `/api/projects/:id`
* DELETE `/api/projects/:id`

### AI Services

* GET `/api/tags`
* POST `/api/ai/summary`
* POST `/api/ai/next-steps`
* GET `/api/ai/weekly-report`
* GET `/api/ai/skill-heatmap`
* GET `/api/ai/bug-patterns`

## Author

**Sreeja Pitla**
LinkedIn: linkedin.com/in/sreeja-pitla-4278a8312
