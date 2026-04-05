# Ban Sagar - Myanmar Slang Dictionary

A community-driven dictionary for Myanmar slang words with a moderator dashboard. Browse, contribute, and vote on Myanmar street slang and internet culture terminology.

## Features

- **Browse & Search** — Explore slangs with search, sort by trending/latest/most voted/random
- **Contribute** — Submit new slang entries with Burmese + English definitions
- **Vote** — Upvote/downvote to surface the best definitions
- **Moderation** — Dashboard for moderators to review, approve, and manage submissions
- **Authentication** — Google Sign-In with role-based access (user/moderator/admin)
- **Realtime** — Live updates across all connected clients

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Motion (Framer Motion)
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Build:** Vite 6

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with Google OAuth enabled

### Database Setup

1. Go to your Supabase Dashboard > SQL Editor
2. Run the contents of `supabase-schema.sql` to create all tables, functions, triggers, and RLS policies
3. Enable Google OAuth in Authentication > Providers > Google

### Local Setup

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

4. Fill in your Supabase credentials in `.env.local`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

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

- **Vercel / Netlify:** Connect the repo and set the `VITE_SUPABASE_*` environment variables in the dashboard.
- Build command: `npm run build`
- Output directory: `dist`
