# BuildIt 🔧

**Live at [buildit-production-0e15.up.railway.app](https://buildit-production-0e15.up.railway.app)**

AI-powered K-12 STEM project generator. Students enter their grade, interests, budget, and available time, and BuildIt generates personalized, safe, hands-on maker projects — complete with step-by-step teaching instructions, a shopping list, an AI build mentor, and a community gallery.

## Features

- **Project generator** — 3 personalized projects per request, tied to the student's hobbies, with strict feasibility and safety rules baked into the prompt
- **Materials scanner** — snap a photo of what you have at home and get projects that use only those materials (vision model)
- **AI build mentor** — chat (with photo support) while building, plus focused "I'm stuck" help per step
- **Concept explainer** — grade-level explanations of any STEM concept with a 60-second try-it activity
- **Reflection & badges** — guided reflection after finishing, with an AI-generated summary and achievement badge
- **Community gallery** — share builds with moderation; uses Supabase when configured, localStorage otherwise
- **Bilingual** — full UI and content translation (English/Spanish out of the box, other languages via free-text input)

## Setup

```bash
npm install
cp .env.example .env   # then add your Groq API key
npm run server         # Express server: Groq proxy on :8787
npm run dev            # Vite dev server (proxies /api to :8787) — in a second terminal
```

Get a Groq API key at [console.groq.com/keys](https://console.groq.com/keys). The key lives in `GROQ_API_KEY` (server-side only) — all Groq calls go through `server.js`, so the key never reaches the browser.

### Optional: Supabase community backend

Without Supabase the community gallery persists to localStorage. To enable a shared gallery, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` and create:

- a `community_posts` table (`student_name`, `project_title`, `category`, `caption`, `photo_url`, `likes`, `approved`, `created_at`)
- a public storage bucket named `community-photos`

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server (frontend) |
| `npm run server` | Start the Express server (Groq proxy) with watch mode |
| `npm run build` | Production build to `dist/` |
| `npm run start` | Serve `dist/` + API proxy (production / Railway) |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint over `src/` |

## Stack

React 18 · Vite · Tailwind CSS · Express · Groq (Llama 3.3 70B text, Llama 4 Scout vision) · Supabase (optional)

## Deploying (Railway)

The repo deploys as a single Node service: `npm run build` then `npm run start` serves the built frontend and the `/api/chat` Groq proxy from one process.

1. Create a new Railway service from this GitHub repo
2. Add `GROQ_API_KEY` in the service's **Variables** tab (plus the `VITE_SUPABASE_*` vars if you use the shared gallery)
3. Railway auto-detects Node, runs the build, and starts via `npm run start` — generate a public domain under **Settings → Networking**

Note: content moderation for the community gallery still runs client-side; enforce it server-side before opening the gallery to a real student community.
