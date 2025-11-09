## GearUp Frontend (Next.js)

High-performance automobile service platform frontend built with Next.js App Router, TypeScript, Tailwind (v4), Framer Motion, and Firebase Authentication.

### 🔧 Tech Stack
- Next.js 15 (App Router, Turbopack)
- React 19
- TypeScript (strict)
- Tailwind CSS 4
- Firebase Authentication (email/password)
- Framer Motion + lucide-react icons

### 🚀 Getting Started
1. Install dependencies:
	```bash
	npm install
	```
2. Create environment file:
	```bash
	cp .env.example .env.local
	# Fill in real Firebase + backend values
	```
3. Run development server:
	```bash
	npm run dev
	```
4. Open `http://localhost:3000`

### 🔐 Authentication Flow
The login modal supports Sign Up and Log In using Firebase email/password. After successful login the user is redirected to `/dashboard`. The dashboard:
- Greets the user by email
- Calls a public backend endpoint: `GET /api/public/hello`
- Calls a secure backend endpoint: `GET /api/secure/hello` with `Authorization: Bearer <Firebase ID Token>`

Ensure your Spring Boot backend validates Firebase tokens (e.g. Admin SDK / JWKS) and has CORS configured to allow the frontend origin.

### 🧩 Environment Variables
All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser (required for Firebase). Never put true secrets (admin keys) here.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain from Firebase console |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket name |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Web app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | (Optional) Analytics measurement ID |
| `NEXT_PUBLIC_GATEWAY_BASE` | Base URL of unified API Gateway (port 8080) |
| `NEXT_PUBLIC_API_BASE_URL` | (Legacy) Base URL of backend – fallback if gateway not set |
| `NEXT_PUBLIC_LOG_LEVEL` | Optional logging verbosity (e.g. `debug`, `info`) |

Validation: `src/lib/firebase.ts` throws early if any required Firebase variable is missing—failing fast during build.

### 🛡️ Security & Configuration Best Practices
- Keep only non-secret Firebase client config in public vars (this is expected by Firebase; security is enforced by rules + token verification).
- Never commit `.env.local` (gitignored). Provide `.env.example` for onboarding.
- Strip trailing slash from `NEXT_PUBLIC_API_BASE_URL` programmatically to avoid double slashes in fetch paths.
- Centralize fetch base usage (`process.env.NEXT_PUBLIC_API_BASE_URL`).
- Fail fast on missing env values (see `req()` helper in `firebase.ts`).

### 📂 Key Files
| File | Purpose |
|------|---------|
| `src/lib/firebase.ts` | Initializes Firebase using env variables with validation |
| `src/context/AuthContext.tsx` | Provides authenticated user + loading state |
| `src/app/components/login/LoginModal.tsx` | Signup / login modal UI + auth actions |
| `src/app/dashboard/page.tsx` | Protected page fetching public + secure backend endpoints |

### 🧪 Build & Lint
Production build (type-check + lint):
```bash
npm run build
```

### 🔄 Future Enhancements (Optional)
- Add `signOut` button in header when authenticated.
- Persist display name (via `updateProfile`) after signup.
- Error boundary & toast notifications.
- API abstraction layer for backend calls.
- Consolidate any remaining direct service calls behind the gateway.

### 🆘 Troubleshooting
| Issue | Fix |
|-------|-----|
| 401 on secure endpoint | Confirm backend validates Firebase ID token and CORS allows `Authorization` header |
| Missing env error at build | Ensure `.env.local` matches `.env.example` |
| Infinite loading state | Inspect network tab for blocked Firebase calls (ad blockers, network issues) |
| Next.js inferred workspace root warning | We've pinned `outputFileTracingRoot` in `next.config.ts`. If you still see the warning, remove stray lockfiles in parent dirs (e.g., a `package-lock.json` in `C:\Users\<you>`) or run `npm run dev` from the project folder. |

---
Maintained with senior-level practices: clear env separation, early validation, least coupling, and explicit documentation.
