# Ban Sagar - Myanmar Slang Dictionary

A community-driven dictionary for Myanmar slang words with a moderator dashboard. Browse, contribute, and vote on Myanmar street slang and internet culture terminology.

## Features

- **Browse & Search** — Explore slangs with search, sort by trending/latest/most voted
- **Contribute** — Submit new slang entries with Burmese + English definitions
- **Vote** — Upvote/downvote to surface the best definitions
- **Moderation** — Dashboard for moderators to review, approve, and manage submissions
- **Authentication** — Google Sign-In with role-based access (user/moderator/admin)

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Motion (Framer Motion)
- **Backend:** Firebase (Firestore, Authentication)
- **Build:** Vite 6

## Getting Started

### Prerequisites

- Node.js 18+

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/swhn/Ban-Sagar.git
   cd Ban-Sagar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file from the example:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your Firebase credentials in `.env.local`.

5. Start the dev server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | TypeScript type checking |

## Deployment

This is a standard Vite + React SPA. Deploy to any static hosting provider:

- **Vercel / Netlify:** Connect the repo and set the `VITE_FIREBASE_*` environment variables in the dashboard.
- **Firebase Hosting:** Run `npm run build` and deploy the `dist/` folder.

### Firestore Rules

Deploy security rules separately:
```bash
firebase deploy --only firestore:rules
```
