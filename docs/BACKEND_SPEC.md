# Backend API spec: auth and profile (cross-device)

To support **user profiles and quiz history across devices**, the backend (e.g. your existing Railway service or a new one) should expose the following. The frontend is built to call these endpoints when `NEXT_PUBLIC_AUTH_API_URL` is set.

---

## Base URL

- Configurable via `NEXT_PUBLIC_AUTH_API_URL` (e.g. `https://your-backend.up.railway.app` or `https://api.examencivica.com`).

---

## Auth

### POST `/api/auth/register`

**Request body:**

```json
{ "email": "user@example.com", "password": "secret" }
```

**Success (201):**

```json
{ "user": { "id": "uuid", "email": "user@example.com" }, "token": "jwt..." }
```

**Error (4xx):** `{ "message": "..." }` (e.g. "Email already in use").

---

### POST `/api/auth/login`

**Request body:**

```json
{ "email": "user@example.com", "password": "secret" }
```

**Success (200):**

```json
{ "user": { "id": "uuid", "email": "user@example.com" }, "token": "jwt..." }
```

**Error (401):** `{ "message": "Invalid credentials" }`.

---

## Profile and quiz history

All profile/history requests must send the JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

### GET `/api/profile`

**Success (200):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "stateCode": "CA",
  "quizHistory": [
    {
      "id": "entry-uuid",
      "date": "2025-02-11T12:00:00.000Z",
      "correct": 18,
      "incorrect": 2,
      "total": 20,
      "scorePercent": 90
    }
  ]
}
```

- `stateCode` can be `null`.
- `quizHistory` is sorted by `date` descending (newest first).

---

### PATCH `/api/profile`

**Request body (all fields optional):**

```json
{ "stateCode": "CA" }
```

**Success (200):** Same shape as GET `/api/profile`, or `{ "ok": true }`.

---

### POST `/api/profile/quiz-history`

**Request body:**

```json
{
  "correct": 18,
  "incorrect": 2,
  "total": 20,
  "date": "2025-02-11T12:00:00.000Z"
}
```

- `date` is optional; server can default to "now".

**Success (201):**

```json
{
  "id": "entry-uuid",
  "date": "2025-02-11T12:00:00.000Z",
  "correct": 18,
  "incorrect": 2,
  "total": 20,
  "scorePercent": 90
}
```

---

## Suggested DB shape

- **users:** `id`, `email`, `password_hash`, `created_at`
- **profiles:** `user_id` (FK), `state_code` (nullable), `updated_at`
- **quiz_history:** `id`, `user_id` (FK), `correct`, `incorrect`, `total`, `score_percent`, `date` (or `created_at`)

You can use a single `users` table with `state_code` and keep `quiz_history` as a separate table.

---

## CORS and preflight (required)

The browser sends an **OPTIONS** request (preflight) before POST/GET to a different origin. The backend **must**:

1. **Respond to OPTIONS** for `/api/auth/*` and `/api/profile/*` with **200 OK** (not 401, 403, or 404).
2. **Do not require authentication** for OPTIONS. Preflight requests do not include `Authorization` or body; if your auth middleware returns 401 for requests without a token, it will block OPTIONS and the browser will show "Preflight response is not successful. Status code: 401".
3. **Include CORS headers** on both OPTIONS and the actual responses:
   - `Access-Control-Allow-Origin`: the frontend origin (e.g. `https://your-frontend.vercel.app`, `http://localhost:3000`) or `*` for public APIs.
   - `Access-Control-Allow-Methods`: `GET, POST, PATCH, OPTIONS` (at least).
   - `Access-Control-Allow-Headers`: `Content-Type, Authorization`.
   - `Access-Control-Max-Age`: optional, e.g. `86400`.

**Example:** For an OPTIONS request to `https://your-backend.vercel.app/api/auth/register`, respond with status **200** and the headers above. Then the browser will send the real POST; that one can return 201 or 4xx as usual.
