# Sparkle — Dating Web App

Full-stack dating app starter:

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** .NET 8 Web API (C#)
- **Database:** PostgreSQL (via EF Core / Npgsql)
- **Cache:** Redis (login rate-limiting, ready for feed caching / presence)
- **Auth:** JWT (email + password, BCrypt hashing)
- **Admin panel:** stats dashboard + user management (ban/unban/delete)

## Features included

- Sign up / sign in with JWT
- Profile create & edit (photo, bio, city, interests)
- Discover feed (swipe-style like/pass)
- Mutual-like matching
- Per-match messaging (polling-based; swap for SignalR/WebSockets for true real-time)
- Admin dashboard: total users/matches/messages, new users, banned users
- Admin user management: search, ban/unban, delete

## Project structure

```
dating-app/
├── backend/DatingApp.Api/       # .NET 8 Web API
│   ├── Controllers/             # Auth, Profiles, Matches, Messages, Admin
│   ├── Models/                  # EF Core entities
│   ├── DTOs/                    # Request/response contracts
│   ├── Services/                # Password hashing, JWT, Redis
│   ├── Data/AppDbContext.cs
│   └── Program.cs               # DI, JWT config, CORS, Swagger
├── frontend/                    # Next.js + Tailwind app
│   ├── app/                     # login, signup, discover, matches, messages, profile, admin
│   ├── components/              # Navbar, ProfileCard, RequireAuth
│   └── lib/                     # api.ts (axios client), auth-context.tsx
└── docker-compose.yml            # Postgres + Redis + API + Web
```

## Running with Docker (recommended)

Requires Docker + Docker Compose only.

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- API + Swagger: http://localhost:5000/swagger
- Postgres: localhost:5432 (user/pass: postgres/postgres)
- Redis: localhost:6379

The API auto-applies EF Core migrations on startup — but you must generate the
initial migration once, from your machine (see below), since it needs to be
committed to the repo.

## Running locally without Docker

### 1. Database & Redis

```bash
docker run -d --name pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=datingapp -p 5432:5432 postgres:16-alpine
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### 2. Backend

```bash
cd backend/DatingApp.Api
dotnet restore

# Generate the initial migration (only needed once, or after model changes)
dotnet tool install --global dotnet-ef   # if you don't have it yet
dotnet ef migrations add InitialCreate

dotnet run
```

API runs at `http://localhost:5000` (Swagger at `/swagger`).

Update `appsettings.json` (or environment variables) with your own strong
`Jwt:Key` before deploying anywhere beyond local dev.

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Creating your first Admin user

There's no public "become admin" endpoint by design. After signing up normally
through the UI, promote yourself directly in the database:

```sql
UPDATE "Users" SET "Role" = 1 WHERE "Email" = 'you@example.com';
```

(`Role = 1` is `Admin`, `Role = 0` is `User` — see `Models/User.cs`.)

Then log out and back in so a fresh JWT is issued containing the Admin role
claim. The **Admin** link will appear in the navbar, and `/admin` will now be
reachable.

## Auth flow summary

1. `POST /api/auth/signup` — creates `User` + `Profile`, returns a JWT.
2. `POST /api/auth/login` — verifies password (BCrypt), rate-limited via Redis
   (max 10 attempts / 15 min per email), returns a JWT.
3. Frontend stores the JWT in a cookie (`token`) and attaches it as
   `Authorization: Bearer <token>` on every request via an axios interceptor
   (`frontend/lib/api.ts`).
4. Protected API routes use `[Authorize]`; admin-only routes use
   `[Authorize(Roles = "Admin")]`.
5. `frontend/components/RequireAuth.tsx` guards pages client-side and
   redirects unauthenticated/unauthorized users.

## Extending this further

- **Real-time chat:** replace the polling in `app/messages/[matchId]/page.tsx`
  with SignalR (add `Microsoft.AspNetCore.SignalR` on the backend and
  `@microsoft/signalr` on the frontend).
- **Photo uploads:** add an endpoint using S3/Azure Blob/Cloudinary instead of
  the plain `photoUrl` string field.
- **Refresh tokens:** currently only short-lived access tokens are issued;
  add a refresh-token table + rotation for longer sessions.
- **Geolocation-based discovery:** add lat/lng to `Profile` and filter/sort
  `discover` by distance (PostGIS or simple haversine formula).
- **Email verification / password reset:** add token-based email flows.
