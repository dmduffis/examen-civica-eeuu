This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Backend integration (examen_civica_backend)

The frontend talks to a single backend. Set in `.env.local`:

- **`NEXT_PUBLIC_AUTH_API_URL`** — Full backend base URL (e.g. `https://your-backend.herokuapp.com` or `http://localhost:8000`). Do **not** set this to the frontend domain.

All API traffic is proxied through Next.js API routes to this backend:

- **Auth:** `/api/auth/login`, `/api/auth/register` → backend auth; token stored and sent as `Authorization: Bearer <token>` on protected calls.
- **Profile:** GET/PATCH `/api/profile`, POST `/api/profile/quiz-history` (after a quiz).
- **Data:** GET `/api/questions` → backend `/api/question` (returns `questionText` Spanish, optional `questionTextEn` English; answers with `answerText` and optional `answerTextEn`). GET `/api/state` and `/api/state/[code]` for states.
- **Voice:** POST `/api/voice/interview/start`, `/api/voice/interview/respond` for the practice interview. The officer speaks in **English**; greeting and questions are in English. On the last answer, the backend returns a **review** with `suggestionEn`, `suggestionEs`, and optional `questionTextEs` for the Spanish column.

**Language:** Quiz, Review, and Flashcards offer an **ES | EN** toggle to show questions and answers in Spanish (default) or English using `questionText`/`questionTextEn` and `answerText`/`answerTextEn`. The voice interview uses English; the review screen shows both languages (English column uses `questionText`, Spanish column uses `questionTextEs` when present).

### Troubleshooting: "Error de conexión" / network error / 502

The browser calls **this app** (e.g. `examencivica.com` or `localhost:3000`); the **Next.js server** then calls the backend. A network error usually means the server cannot reach the backend.

1. **`NEXT_PUBLIC_AUTH_API_URL`** must be the **backend** base URL only (where `examen_civica_backend` runs), e.g. `https://your-backend.onrender.com` or `http://localhost:8000`. Do **not** use the frontend URL (e.g. `examencivica.com` or a Vercel frontend deployment).
2. **Backend must be running and reachable** from wherever Next.js runs. If the frontend is on Vercel, the backend must be a **public** URL (Render, Railway, Fly.io, etc.). Test from your machine: `curl -v "https://YOUR_BACKEND_BASE_URL/api/question"`.
3. **Voice** can take 10–60 seconds; the proxy waits up to 60s. If you see "El backend no respondió a tiempo", the backend is too slow or not responding at that URL.
4. **CORS** is not involved for these errors: the browser only talks to the frontend; the frontend server talks to the backend server-to-server.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
