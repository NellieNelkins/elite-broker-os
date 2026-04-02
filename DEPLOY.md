# Elite Broker OS — Deployment Guide

## Option A: Deploy to Vercel (Recommended)

### 1. Connect Repository
- Go to [vercel.com/new](https://vercel.com/new)
- Import your `NellieNelkins/elite-broker-os` GitHub repo
- Select the `claude/broker-platform-tech-assessment-FqCLR` branch

### 2. Add Environment Variables
In the Vercel dashboard, add these env vars:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres:7aSkXttH5YmzuGqA@db.lcaygxzimwninjqyvcpz.supabase.co:5432/postgres` |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` and paste the result |
| `NEXTAUTH_URL` | Your Vercel URL (e.g. `https://elite-broker-os.vercel.app`) |
| `ANTHROPIC_API_KEY` | Your `sk-ant-...` key (optional, for AI features) |

### 3. Deploy
Click **Deploy**. Vercel auto-detects Next.js and runs the build.

### 4. Verify
Visit your deployed URL → should redirect to `/dashboard` showing your 25 contacts and 5 listings.

---

## Option B: Deploy to Netlify

### 1. Connect Repository
- Go to [app.netlify.com/start](https://app.netlify.com/start)
- Import the same repo/branch

### 2. Add Environment Variables
Same variables as Vercel above, in **Site Settings → Environment Variables**.

### 3. Install Next.js Plugin
Netlify needs `@netlify/plugin-nextjs` (already configured in `netlify.toml`).

### 4. Deploy
Netlify runs: `pnpm exec prisma generate && pnpm build`

---

## Google OAuth Setup (Step 4)

To enable login with Google:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or use existing)
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorized redirect URIs: add `https://YOUR-DOMAIN.vercel.app/api/auth/callback/google`
6. Copy the **Client ID** and **Client Secret**
7. Add them as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel/Netlify env vars

---

## Post-Deploy Checklist

- [ ] Dashboard loads with real data from Supabase
- [ ] Contacts table shows 25 contacts
- [ ] Pipeline kanban shows 25 deals in "Qualified"
- [ ] Listings shows 5 properties
- [ ] Login page renders
- [ ] API routes return 401 for unauthenticated requests
- [ ] Security headers present (check at securityheaders.com)
