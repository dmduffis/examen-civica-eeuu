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

The frontend calls the **backend directly** from the browser. Set in `.env.local` (and in Vercel/host env when deploying):

- **`NEXT_PUBLIC_AUTH_API_URL`** — Full backend base URL only (e.g. `https://your-backend.onrender.com` or `http://localhost:8000`). No path, no trailing slash. Do **not** set this to the frontend domain (e.g. examencivica.com); that causes 404 or connection errors.

The app uses `getBackendBaseUrl()` / `backendUrl(path)` from `src/app/lib/backend-url.ts` to build all request URLs. All API traffic goes to that backend:

- **Auth:** `backendUrl('/api/auth/login')`, `backendUrl('/api/auth/register')`; token stored and sent as `Authorization: Bearer <token>` on protected calls.
- **Profile:** GET/PATCH `backendUrl('/api/profile')`, POST `backendUrl('/api/profile/quiz-history')` (after a quiz).
- **Data:** GET `backendUrl('/api/question')` for questions; GET `backendUrl('/api/state')` and `backendUrl('/api/state/:code')` for states.
- **Voice:** POST `backendUrl('/api/voice/interview/start')`, `backendUrl('/api/voice/interview/respond')` for the practice interview. Questions and officer are in English; review shows `suggestionEn` and `suggestionEs` (and optional `questionTextEs`).

**CORS:** The backend must allow the frontend’s origin (e.g. `https://examencivica.com` or `http://localhost:3000`). Set `FRONTEND_ORIGIN` on the backend.

**Language:** Quiz, Review, and Flashcards offer an **ES | EN** toggle to show questions and answers in Spanish (default) or English using `questionText`/`questionTextEn` and `answerText`/`answerTextEn`. The voice interview uses English; the review screen shows both languages (English column uses `questionText`, Spanish column uses `questionTextEs` when present).

### Troubleshooting: "Error de conexión" / network error / 502

The **browser** calls the backend directly (using `NEXT_PUBLIC_AUTH_API_URL`). A connection error usually means the wrong URL or the backend is unreachable.

1. **`NEXT_PUBLIC_AUTH_API_URL`** must be the **backend** base URL only (where `examen_civica_backend` runs), e.g. `https://your-backend.onrender.com` or `http://localhost:8000`. Do **not** use the frontend URL (e.g. `examencivica.com`); that causes 404 or connection errors.
2. **Backend must be running and reachable** from the user’s browser. Test: `curl -v "https://YOUR_BACKEND_BASE_URL/api/question"`.
3. **CORS:** The backend must allow your frontend origin (e.g. `https://examencivica.com`, `http://localhost:3000`). Set `FRONTEND_ORIGIN` on the backend.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
