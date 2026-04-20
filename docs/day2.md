# Day 2 — API + web integration

## What we added

1. **Prisma seed** (`apps/api/prisma/seed.ts`): creates a demo user so you can test without the web form. Run after migrate: `npm run db:seed -w @mindtrack/api`.
2. **`POST /users`**: register with `email` and `fullName`; duplicate email returns **409**.
3. **CORS** on the API so the Next.js app on another port can call the API from the browser.
4. **Web `TodayPlanner`**: registers a user (stores `userId` in `localStorage`), loads `GET /plans/daily`, can `POST` a sample plan.

## Commands

```bash
# From repo root — ensure apps/api/.env has DATABASE_URL, then:
npm run db:migrate -w @mindtrack/api
npm run db:seed -w @mindtrack/api

# Two terminals:
npm run dev:api
npm run dev:web
```

Open `http://localhost:3000`, register, then create sample plan.
