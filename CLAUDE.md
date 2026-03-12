# urba-prode — Claude Code Instructions

## Git & Deployment
- After every task, **commit, push to `origin main`, and let Vercel auto-redeploy**.
- No need to ask for confirmation — just do it.
- Use conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, etc.
- Vercel is connected to this repo and deploys automatically on push to `main`.

## Stack
- Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- Prisma + PostgreSQL
- NextAuth.js (credentials provider, JWT)
- Deployed on Vercel

## Project Context
- Rugby prediction game (prode) for the URBA league
- Users register, pick a club, and predict match results each "fecha"
- Scoring: 5pts (correct pick + margin), 4pts (correct pick), 0pts (wrong)
- Divisions are called "tiras": PRIMERA, INTERMEDIA, PRE_A, PRE_B, PRE_C, PRE_D
