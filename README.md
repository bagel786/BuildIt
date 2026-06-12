# BuildIt 🔧

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
npm run dev
```

Get a Groq API key at [console.groq.com/keys](https://console.groq.com/keys).

### Optional: Supabase community backend

Without Supabase the community gallery persists to localStorage. To enable a shared gallery, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` and create:

- a `community_posts` table (`student_name`, `project_title`, `category`, `caption`, `photo_url`, `likes`, `approved`, `created_at`)
- a public storage bucket named `community-photos`

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint over `src/` |

## Stack

React 18 · Vite · Tailwind CSS · Groq (Llama 3.3 70B text, Llama 4 Scout vision) · Supabase (optional)

## ⚠️ Before deploying publicly

The Groq client runs in the browser (`dangerouslyAllowBrowser`), which means the API key is embedded in the shipped JS bundle and visible to anyone. That's fine for local use and demos, but for a public deployment, move the Groq calls behind a small server or serverless function that holds the key. The same applies to content moderation — it currently runs client-side and should be enforced server-side for a real student community.
