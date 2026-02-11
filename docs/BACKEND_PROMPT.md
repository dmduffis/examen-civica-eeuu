# Backend implementation prompt

Copy the text below and use it as a prompt to implement the backend (e.g. with an AI assistant or for a developer).

---

## Prompt

Build a backend API for a civic exam study app. The frontend will call this API when the user wants to sync their profile and quiz history across devices. Implement the following.

### Tech and constraints

- Use any stack you prefer (Node/Express, Python/FastAPI, etc.) and a SQL database (e.g. SQLite for dev, PostgreSQL for production).
- Hash passwords (e.g. bcrypt) and never return the password or hash in responses.
- Issue JWTs for authenticated sessions. The frontend sends `Authorization: Bearer <token>` on protected routes.
- **CORS and preflight (critical):** The browser sends **OPTIONS** (preflight) before POST/GET to your API. You **must** respond to OPTIONS for `/api/auth/*` and `/api/profile/*` with **200 OK** and CORS headers. **Do not require authentication for OPTIONS** — preflight requests have no `Authorization` header; if your auth middleware returns 401 for OPTIONS, the frontend will fail with "Preflight response is not successful. Status code: 401". Handle OPTIONS before auth middleware, or skip auth for OPTIONS. Include: `Access-Control-Allow-Origin` (frontend origin, e.g. `http://localhost:3000` or `https://your-app.vercel.app`), `Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS`, `Access-Control-Allow-Headers: Content-Type, Authorization`.
- Return JSON. On errors, use appropriate HTTP status codes and a body like `{ "message": "Error description" }`.

---

### 1. Auth

**POST `/api/auth/register`**

- Body: `{ "email": "string", "password": "string" }`.
- Validate email format and password length (e.g. minimum 6 characters).
- If email already exists, respond with **409** (or **400**) and `{ "message": "Email already in use" }`.
- Create user, hash password, then respond **201** with:
  `{ "user": { "id": "<uuid>", "email": "<email>" }, "token": "<jwt>" }`.
- The JWT should include at least the user id (sub or userId) and a reasonable expiry (e.g. 7 or 30 days).

**POST `/api/auth/login`**

- Body: `{ "email": "string", "password": "string" }`.
- If credentials are invalid, respond **401** with `{ "message": "Invalid credentials" }`.
- On success, respond **200** with the same shape as register: `{ "user": { "id", "email" }, "token": "<jwt>" }`.

---

### 2. Profile and quiz history (all require valid JWT)

Extract the user id from the JWT for all requests below. If the token is missing or invalid, respond **401** with `{ "message": "Unauthorized" }`.

**GET `/api/profile`**

- Return the current user’s profile and quiz history.
- Response **200**:
```json
{
  "id": "<user-uuid>",
  "email": "<email>",
  "stateCode": "<string or null>",
  "quizHistory": [
    {
      "id": "<entry-uuid>",
      "date": "<ISO 8601>",
      "correct": 18,
      "incorrect": 2,
      "total": 20,
      "scorePercent": 90
    }
  ]
}
```
- `stateCode` is the user’s selected US state (e.g. "CA", "NY") or `null`.
- `quizHistory` is sorted by `date` descending (newest first).

**PATCH `/api/profile`**

- Body: `{ "stateCode": "<string | null>" }` (only this field; all fields optional).
- Update the user’s stored state code. Respond **200** with the same shape as GET `/api/profile` (or `{ "ok": true }`).

**POST `/api/profile/quiz-history`**

- Body: `{ "correct": number, "incorrect": number, "total": number, "date": "<ISO 8601 optional>" }`.
- If `date` is omitted, use the current server time.
- Compute `scorePercent` as `Math.round((correct / total) * 100)` (guard against division by zero).
- Create a quiz history entry for the current user. Respond **201** with:
```json
{
  "id": "<entry-uuid>",
  "date": "<ISO 8601>",
  "correct": 18,
  "incorrect": 2,
  "total": 20,
  "scorePercent": 90
}
```

---

### 3. Database

- **users:** `id` (UUID primary key), `email` (unique), `password_hash`, `created_at`.
- **quiz_history:** `id` (UUID primary key), `user_id` (FK to users), `correct`, `incorrect`, `total`, `score_percent`, `date` (or `created_at`).
- You can either:
  - Add `state_code` (nullable) to **users**, or
  - Add a **profiles** table: `user_id` (FK, unique), `state_code` (nullable), `updated_at`.

Ensure indexes on `users.email` and `quiz_history.user_id` (and optionally `quiz_history.date` for sorted history).

---

### 4. Summary checklist

- [ ] POST `/api/auth/register` — create user, return user + JWT.
- [ ] POST `/api/auth/login` — validate credentials, return user + JWT.
- [ ] GET `/api/profile` — JWT required; return profile with `stateCode` and `quizHistory` (newest first).
- [ ] PATCH `/api/profile` — JWT required; update `stateCode`.
- [ ] POST `/api/profile/quiz-history` — JWT required; append one quiz result, return created entry.
- [ ] **OPTIONS** for `/api/auth/*` and `/api/profile/*` — return **200** with CORS headers; do not require auth for OPTIONS.
- [ ] Passwords hashed; JWT in `Authorization: Bearer <token>`; CORS enabled for the frontend.

---

Implement this API so the frontend can use it as the “auth backend” for cross-device sync (see BACKEND_SPEC.md for the exact contract).
