# Fulling Auth Fix - Vercel Deployment Guide

## Summary of Fixes

This guide documents the authentication fixes applied to enable credentials login and GitHub OAuth on Vercel.

### What Was Fixed

1. **Credentials Login Issue**: "Invalid username or password" always returned
   - **Root Cause**: No database schema (missing Prisma migrations)
   - **Fix**: Created initial migration with complete schema

2. **GitHub OAuth Issue**: "Continue with GitHub" button did nothing
   - **Root Cause**: GitHub provider not properly configured; missing error handling
   - **Fix**: Improved provider configuration and added error detection

3. **Build Failure**: Missing migration directory would cause Vercel build to fail
   - **Root Cause**: No migrations folder in repository
   - **Fix**: Created `prisma/migrations/0_init/migration.sql` with full schema

### Code Changes

All changes are in the main branch commit: `fix: implement auth fixes for credentials login and GitHub OAuth`

Key files modified:
- `lib/auth.ts` - Added debug logging and improved error handling
- `app/login/page.tsx` - Enhanced error display and fixed Suspense warnings
- `prisma/migrations/0_init/` - Created with complete database schema

## Vercel Deployment Steps

### Step 1: Create GitHub OAuth Application

1. Go to https://github.com/settings/developers
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in:
   - **Application name**: `Fulling`
   - **Homepage URL**: `https://fulling.vercel.app` (use your Vercel domain)
   - **Authorization callback URL**: `https://fulling.vercel.app/api/auth/callback/github`
4. Click "Register application"
5. Copy **Client ID** and generate **Client Secret**

⚠️ **Important**: This is an OAuth App, NOT a GitHub App. Do not set up webhooks.

### Step 2: Create PostgreSQL Database

Use one of these options:

**Option A: Neon (Recommended)**
1. Go to https://neon.tech
2. Sign up and create a new project
3. Copy the connection string (looks like: `postgresql://user:password@neon.tech:5432/dbname`)
4. Note: Keep this secret; it contains your database password

**Option B: Other Managed PostgreSQL**
- Railway, Supabase, Vercel Postgres, or your own PostgreSQL server
- Must be publicly accessible from Vercel (no local SQLite)

### Step 3: Generate NEXTAUTH_SECRET

Run in your terminal:
```bash
openssl rand -base64 32
```

Example output: `ZXjK9+qW8vL2mNxP4hRqA1bC3dEfGhIjKlMnOpQrStU=`

Copy this value for Step 4.

### Step 4: Add Environment Variables to Vercel

1. Go to https://vercel.com/dashboard
2. Select the **Fulling** project
3. Click "Settings" → "Environment Variables"
4. Add each variable below for **Production**:

| Variable | Value | Source |
|----------|-------|--------|
| `NEXTAUTH_URL` | `https://fulling.vercel.app` | Your Vercel domain (no trailing slash) |
| `NEXTAUTH_SECRET` | `ZXjK9+qW8vL2mNxP4hRqA1bC3dEfGhIjKlMnOpQrStU=` | From Step 3 |
| `DATABASE_URL` | `postgresql://user:password@host/dbname` | From Step 2 |
| `ENABLE_PASSWORD_AUTH` | `true` | Fixed value |
| `ENABLE_GITHUB_AUTH` | `true` | Fixed value |
| `GITHUB_CLIENT_ID` | `abc123def456` | From Step 1 (Client ID) |
| `GITHUB_CLIENT_SECRET` | `ghp_xxxxxxxxxxxx` | From Step 1 (Client Secret) |
| `NODE_ENV` | `production` | Fixed value |

**For each variable:**
1. Click "Add New"
2. Enter the **Key** and **Value**
3. Leave "Environments" as "Production" 
4. Click "Save"

⚠️ **Do NOT add these to Preview environment** - databases should not be shared between deployments

### Step 5: Trigger Deployment

Option A: Automatic (recommended)
1. Push any commit to the `main` branch
2. Vercel will automatically redeploy
3. Check Deployments tab for build progress

Option B: Manual
1. Click "Deployments" in Vercel dashboard
2. Click the three dots on the latest deployment
3. Select "Redeploy"

### Step 6: Verify Build & Deployment

Check Vercel Deployments tab:
1. Look for "Building..." then "Ready"
2. If build fails, click deployment to see logs
3. Look for lines like: `✔ Generated Prisma Client`
4. If error contains "migrations", DATABASE_URL may be invalid

### Step 7: Test in Production

1. Visit https://fulling.vercel.app/login
2. **Test Credentials Login**:
   - Username: `testuser`
   - Password: `password123`
   - Click "Sign in / Register"
   - Should auto-create account and redirect to /projects
   - Login again with same credentials should work

3. **Test GitHub Login**:
   - Click "Continue with GitHub"
   - Authorize the app
   - Should redirect back to /projects with GitHub user logged in

4. **Check Logs**:
   - Go to Vercel dashboard → Logs → Function Logs
   - Should see auth debug messages like `[Credentials] Attempting login`

## Troubleshooting

### "Invalid username or password" persists
1. Check Vercel logs for `[Auth Error]` messages
2. Verify DATABASE_URL is set and valid
3. Check that Prisma migration ran (logs should show `✔ Prisma migration`)
4. Try clearing browser cookies for fulling.vercel.app

### GitHub login does nothing / redirects to /login
1. Check that `ENABLE_GITHUB_AUTH=true` in Vercel env vars
2. Check GitHub OAuth app settings:
   - Homepage URL matches `NEXTAUTH_URL` exactly
   - Callback URL is `${NEXTAUTH_URL}/api/auth/callback/github`
3. Check Vercel logs for `[GitHub]` debug messages

### Build fails with "Prisma migration" error
1. Verify `DATABASE_URL` is set and correct
2. Check that database server is running and accessible
3. In Vercel logs, look for specific migration error
4. May need to manually run: `prisma migrate deploy` locally with DATABASE_URL

### "NEXTAUTH_SECRET not set" error
1. Verify `NEXTAUTH_SECRET` env var is in Vercel
2. If just added, redeploy to pick up the variable
3. Generate new secret with `openssl rand -base64 32`

## Local Development (Optional)

To test locally before deploying:

1. Create `.env.local`:
```bash
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test-secret-at-least-32-characters-long-12345"
DATABASE_URL="postgresql://postgres:password@localhost:5432/fulling"
ENABLE_PASSWORD_AUTH="true"
ENABLE_GITHUB_AUTH="false"
```

2. Set up local PostgreSQL (using Docker):
```bash
docker run -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15
```

3. Run migrations:
```bash
npx prisma migrate deploy
```

4. Start dev server:
```bash
npm run dev
```

5. Visit http://localhost:3000/login

## After Deployment

- Credentials and GitHub auth should work immediately
- Users can create accounts or login with GitHub
- Sessions persist across page refreshes
- Debug logs disabled in production (safe to view in Vercel logs)

---

**Questions?** Check the detailed analysis in [AUTH_FIX_GUIDE.md](./AUTH_FIX_GUIDE.md)
